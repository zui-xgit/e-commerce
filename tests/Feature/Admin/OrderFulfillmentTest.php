<?php

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\InvalidOrderStateException;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderDeliveryInformation;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderFulfillmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OrderFulfillmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_confirm_deducts_stock_exactly_once(): void
    {
        $admin = $this->admin();
        $product = $this->product(10, 'CONFIRM-ONCE');
        $order = $this->order($product, 3);
        $service = $this->app->make(OrderFulfillmentService::class);

        $result = $service->confirm($order, false, $admin->id);

        $this->assertSame(3, $result['deductedUnits']);
        $this->assertSame([], $result['shortfalls']);
        $this->assertSame(7, $product->fresh()->stock);
        $this->assertSame(3, $order->items()->first()->confirmed_quantity);
        $this->assertSame(OrderStatus::Processed, $order->fresh()->status);

        try {
            $service->confirm($order, false, $admin->id);
            $this->fail('A second confirmation should be rejected.');
        } catch (InvalidOrderStateException) {
            // Expected: the status guard protects stock from a second deduction.
        }

        $this->assertSame(7, $product->fresh()->stock);
        $this->assertSame(3, $order->items()->first()->confirmed_quantity);
    }

    public function test_strict_confirm_rejects_shortfall_without_touching_stock(): void
    {
        $admin = $this->admin();
        $product = $this->product(2, 'STRICT-SHORT');
        $order = $this->order($product, 3);

        try {
            $this->app->make(OrderFulfillmentService::class)->confirm($order, false, $admin->id);
            $this->fail('A short order should be rejected in strict mode.');
        } catch (InsufficientStockException $exception) {
            $this->assertSame(1, $exception->shortfalls[0]['short']);
        }

        $this->assertSame(2, $product->fresh()->stock);
        $this->assertSame(0, $order->items()->first()->confirmed_quantity);
        $this->assertSame(OrderStatus::Pending, $order->fresh()->status);
    }

    public function test_partial_confirm_deducts_available_stock_and_records_shortfall(): void
    {
        $admin = $this->admin();
        $product = $this->product(2, 'PARTIAL-SHORT');
        $order = $this->order($product, 5);

        $result = $this->app->make(OrderFulfillmentService::class)->confirm($order, true, $admin->id);

        $this->assertSame(2, $result['deductedUnits']);
        $this->assertSame(3, $result['shortfalls'][0]['short']);
        $this->assertSame(0, $product->fresh()->stock);
        $this->assertSame(2, $order->items()->first()->confirmed_quantity);
        $this->assertSame(OrderStatus::Processed, $order->fresh()->status);
    }

    public function test_cancelling_a_pending_order_moves_no_stock(): void
    {
        $admin = $this->admin();
        $product = $this->product(10, 'PENDING-CANCEL');
        $order = $this->order($product, 4);

        $this->app->make(OrderFulfillmentService::class)->cancel($order, $admin->id);

        $this->assertSame(10, $product->fresh()->stock);
        $this->assertSame(0, $order->items()->first()->confirmed_quantity);
        $this->assertSame(OrderStatus::Cancelled, $order->fresh()->status);
    }

    public function test_cancelling_a_processed_order_restores_deducted_stock_once(): void
    {
        $admin = $this->admin();
        $product = $this->product(10, 'PROCESSED-CANCEL');
        $order = $this->order($product, 4);
        $service = $this->app->make(OrderFulfillmentService::class);

        $service->confirm($order, false, $admin->id);
        $this->assertSame(6, $product->fresh()->stock);

        $service->cancel($order, $admin->id, 'Customer changed mind');

        $this->assertSame(10, $product->fresh()->stock);
        $this->assertSame(0, $order->items()->first()->confirmed_quantity);
        $this->assertSame(OrderStatus::Cancelled, $order->fresh()->status);
        $this->assertSame('Customer changed mind', $order->fresh()->cancellation_reason);

        try {
            $service->cancel($order, $admin->id);
            $this->fail('A second cancellation should be rejected.');
        } catch (InvalidOrderStateException) {
            // Expected: cancelled is terminal.
        }

        $this->assertSame(10, $product->fresh()->stock);
    }

    public function test_admin_pages_render_and_customers_cannot_confirm(): void
    {
        $admin = $this->admin();
        $product = $this->product(8, 'PAGES');
        $order = $this->order($product, 2);

        $delivery = new OrderDeliveryInformation([
            'country' => 'TZ',
            'name' => 'Call Me',
            'address' => '1 Sample Street',
            'city' => 'Dar es Salaam',
            'postal_code' => '10000',
            'phone' => '+255700000000',
            'email' => 'caller@example.test',
        ]);
        $order->deliveryInformation()->save($delivery);

        $this->actingAs($admin)
            ->get(route('admin.orders.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/store/orders/index')
                ->where('counts.pending', 1)
                ->where('orders.data.0.orderNumber', $order->order_number));

        $this->actingAs($admin)
            ->get(route('admin.orders.show', $order))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/store/orders/show')
                ->where('order.uuid', $order->uuid)
                ->where('order.customer.phone', '+255700000000')
                ->where('order.shortfallUnits', 0)
                ->where('order.items.0.shortfall', 0));

        $customer = User::factory()->create();
        $customer->assignRole(Role::findOrCreate('customer', 'web'));

        $this->actingAs($customer)
            ->post(route('admin.orders.confirm', $order), ['allowPartial' => false])
            ->assertForbidden();

        $this->assertSame(8, $product->fresh()->stock);
        $this->assertSame(OrderStatus::Pending, $order->fresh()->status);
    }

    public function test_order_detail_reports_only_units_that_cannot_be_fulfilled(): void
    {
        $admin = $this->admin();
        $product = $this->product(2, 'DETAIL-SHORT');
        $order = $this->order($product, 5);

        $this->actingAs($admin)
            ->get(route('admin.orders.show', $order))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/store/orders/show')
                ->where('order.shortfallUnits', 3)
                ->where('order.items.0.shortfall', 3)
                ->where('order.items.0.availableStock', 2)
                ->where('order.items.0.confirmedQuantity', 0));

        $this->app->make(OrderFulfillmentService::class)
            ->confirm($order, true, $admin->id);

        $this->actingAs($admin)
            ->get(route('admin.orders.show', $order))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('order.shortfallUnits', 3)
                ->where('order.items.0.shortfall', 3)
                ->where('order.items.0.confirmedQuantity', 2));
    }

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole(Role::create(['name' => 'admin']));

        return $admin;
    }

    private function product(int $stock, string $sku): Product
    {
        $category = Category::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Orders',
        ]);

        return Product::create([
            'category_id' => $category->id,
            'title' => 'Test Product '.$sku,
            'price' => 1000,
            'sku' => $sku,
            'stock' => $stock,
        ]);
    }

    private function order(Product $product, int $quantity, OrderStatus $status = OrderStatus::Pending): Order
    {
        $order = Order::create([
            'uuid' => (string) Str::uuid(),
            'order_number' => 'ORD-'.Str::upper(Str::random(10)),
            'status' => $status,
            'total' => $product->price * $quantity,
        ]);

        $order->items()->create([
            'uuid' => (string) Str::uuid(),
            'product_id' => $product->id,
            'title' => $product->title,
            'price' => $product->price,
            'quantity' => $quantity,
        ]);

        return $order;
    }
}
