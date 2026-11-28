<?php

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderFulfillmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OrderDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_clear_any_order_without_changing_stock(): void
    {
        $admin = $this->admin();
        $product = $this->product(10, 'DELETE-ANY');
        $service = $this->app->make(OrderFulfillmentService::class);

        $processed = $this->order($product, 3);
        $service->confirm($processed, false, $admin->id);
        $this->assertSame(7, $product->fresh()->stock);

        $this->actingAs($admin)
            ->delete(route('admin.orders.destroy', $processed->uuid))
            ->assertRedirect();

        $this->assertDatabaseMissing('orders', ['id' => $processed->id]);
        $this->assertDatabaseMissing('order_items', ['order_id' => $processed->id]);
        $this->assertSame(7, $product->fresh()->stock);

        foreach ([OrderStatus::Pending, OrderStatus::Cancelled] as $status) {
            $order = $this->order($product, 1, $status);

            $this->actingAs($admin)
                ->delete(route('admin.orders.destroy', $order->uuid))
                ->assertRedirect();

            $this->assertDatabaseMissing('orders', ['id' => $order->id]);
        }
    }

    public function test_bulk_delete_only_removes_the_requested_status(): void
    {
        $admin = $this->admin();
        $product = $this->product(20, 'DELETE-BULK');
        $service = $this->app->make(OrderFulfillmentService::class);

        $first = $this->order($product, 2);
        $second = $this->order($product, 3);
        $service->confirm($first, false, $admin->id);
        $service->confirm($second, false, $admin->id);
        $this->assertSame(15, $product->fresh()->stock);

        $cancelled = $this->order($product, 1, OrderStatus::Cancelled);
        $pending = $this->order($product, 4);

        $this->actingAs($admin)
            ->post(route('admin.orders.bulk-destroy'), ['status' => 'processed'])
            ->assertRedirect();

        $this->assertDatabaseMissing('orders', ['id' => $first->id]);
        $this->assertDatabaseMissing('orders', ['id' => $second->id]);
        $this->assertDatabaseHas('orders', ['id' => $cancelled->id]);
        $this->assertDatabaseHas('orders', ['id' => $pending->id]);
        $this->assertSame(15, $product->fresh()->stock);

        $this->actingAs($admin)
            ->post(route('admin.orders.bulk-destroy'), ['status' => 'cancelled'])
            ->assertRedirect();

        $this->assertDatabaseMissing('orders', ['id' => $cancelled->id]);
        $this->assertDatabaseHas('orders', ['id' => $pending->id]);
    }

    public function test_bulk_delete_rejects_other_statuses_and_customers(): void
    {
        $admin = $this->admin();
        $product = $this->product(5, 'DELETE-GUARD');
        $pending = $this->order($product, 1);

        $this->actingAs($admin)
            ->post(route('admin.orders.bulk-destroy'), ['status' => 'pending'])
            ->assertSessionHasErrors('error');

        $this->assertDatabaseHas('orders', ['id' => $pending->id]);

        $customer = User::factory()->create();
        $customer->assignRole(Role::findOrCreate('customer', 'web'));

        $this->actingAs($customer)
            ->delete(route('admin.orders.destroy', $pending->uuid))
            ->assertForbidden();

        $this->actingAs($customer)
            ->post(route('admin.orders.bulk-destroy'), ['status' => 'cancelled'])
            ->assertForbidden();

        $this->assertDatabaseHas('orders', ['id' => $pending->id]);
    }

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole(Role::findOrCreate('admin', 'web'));

        return $admin;
    }

    private function product(int $stock, string $sku): Product
    {
        $category = Category::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Order deletion',
        ]);

        return Product::create([
            'category_id' => $category->id,
            'title' => 'Deletion test '.$sku,
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
