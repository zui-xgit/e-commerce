<?php

namespace Tests\Feature\Storefront;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DeliveryInformationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_create_update_and_delete_one_saved_address(): void
    {
        $customer = $this->customer();

        $this->actingAs($customer)
            ->post(route('account.addresses.store'), $this->address(['name' => 'Ada Lovelace']))
            ->assertRedirect();

        $this->assertDatabaseHas('user_delivery_information', [
            'user_id' => $customer->id,
            'name' => 'Ada Lovelace',
            'postal_code' => null,
        ]);
        $this->assertSame(1, $customer->deliveryInformation()->count());

        $this->actingAs($customer)
            ->put(route('account.addresses.update'), $this->address([
                'name' => 'Ada Byron',
                'company' => 'Analytical Engines',
                'postalCode' => '10001',
            ]))
            ->assertRedirect();

        $this->assertDatabaseHas('user_delivery_information', [
            'user_id' => $customer->id,
            'name' => 'Ada Byron',
            'company' => 'Analytical Engines',
            'postal_code' => '10001',
        ]);
        $this->assertSame(1, $customer->deliveryInformation()->count());

        $this->actingAs($customer)
            ->delete(route('account.addresses.destroy'))
            ->assertRedirect();

        $this->assertDatabaseMissing('user_delivery_information', [
            'user_id' => $customer->id,
        ]);
    }

    public function test_checkout_receives_the_saved_address_as_a_starting_point(): void
    {
        $customer = $this->customer();
        $customer->deliveryInformation()->create(
            $this->columns(['postalCode' => '10002'])
        );

        $this->actingAs($customer)
            ->get(route('checkout'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('storefront/checkout')
                ->where('savedAddress.name', 'Ada Lovelace')
                ->where('savedAddress.postalCode', '10002')
                ->where('savedAddress.email', 'ada@example.com'));
    }

    public function test_checkout_freezes_delivery_details_on_a_new_order(): void
    {
        $product = $this->product();
        $customer = $this->customer();
        $customer->deliveryInformation()->create(
            $this->columns(['name' => 'Saved Name'])
        );

        // A guest has no saved address; checkout values are used as-is.
        $this->post(route('checkout.store'), $this->checkoutPayload($product, [
            'name' => 'Guest Name',
            'company' => '',
        ]))->assertRedirect();

        $guestOrder = Order::query()->firstOrFail();

        $this->assertNull($guestOrder->user_id);
        $this->assertSame(180, $guestOrder->total);
        $this->assertSame('SH-'.$guestOrder->created_at->format('Ymd').'-'.substr($guestOrder->order_number, -6), $guestOrder->order_number);
        $this->assertDatabaseHas('order_items', [
            'order_id' => $guestOrder->id,
            'product_id' => $product->id,
            'price' => 90,
            'quantity' => 2,
        ]);
        $this->assertDatabaseHas('order_delivery_information', [
            'order_id' => $guestOrder->id,
            'name' => 'Guest Name',
            'company' => null,
        ]);

        // Signed-in edits go to the order snapshot only, not the saved address.
        $this->actingAs($customer)
            ->post(route('checkout.store'), [
                ...$this->checkoutPayload($product, ['name' => 'Edited For Order']),
                'userUuid' => $customer->uuid,
            ])
            ->assertRedirect();

        $customerOrder = Order::query()->whereNotNull('user_id')->firstOrFail();

        $this->assertSame($customer->id, $customerOrder->user_id);
        $this->assertSame('Edited For Order', $customerOrder->deliveryInformation->name);
        $this->assertSame('Saved Name', $customer->deliveryInformation->name);
    }

    /**
     * @return array<string, string>
     */
    private function address(array $overrides = []): array
    {
        return array_merge([
            'country' => 'Tanzania',
            'name' => 'Ada Lovelace',
            'company' => '',
            'address' => '12 Bay Street',
            'city' => 'Dar es Salaam',
            'postalCode' => '',
            'phone' => '+255 712 345 678',
            'email' => 'ada@example.com',
        ], $overrides);
    }

    /**
     * @return array<string, string|null>
     */
    private function columns(array $overrides = []): array
    {
        $values = $this->address($overrides);

        return [
            'country' => $values['country'],
            'name' => $values['name'],
            'company' => $values['company'] !== '' ? $values['company'] : null,
            'address' => $values['address'],
            'city' => $values['city'],
            'postal_code' => $values['postalCode'] !== '' ? $values['postalCode'] : null,
            'phone' => $values['phone'],
            'email' => $values['email'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function checkoutPayload(Product $product, array $overrides = []): array
    {
        $values = $this->address($overrides);

        return [
            'email' => $values['email'],
            'deliveryCountry' => $values['country'],
            'deliveryName' => $values['name'],
            'deliveryCompany' => $values['company'],
            'deliveryAddress' => $values['address'],
            'deliveryCity' => $values['city'],
            'deliveryPostalCode' => $values['postalCode'],
            'deliveryPhone' => $values['phone'],
            'items' => [['uuid' => $product->uuid, 'quantity' => 2]],
            'policies' => '1',
        ];
    }

    private function customer(): User
    {
        $customer = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $customer->assignRole(Role::findOrCreate('customer', 'web'));

        return $customer;
    }

    private function product(): Product
    {
        $category = Category::create([
            'name' => 'Watches',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        return Product::create([
            'category_id' => $category->id,
            'title' => 'Nova Watch',
            'description' => 'A watch for the test.',
            'price' => 100,
            'discount_percentage' => 10,
            'rating' => 4,
            'sku' => 'DELIVERY-TEST',
            'minimum_order_quantity' => 1,
            'availability_status' => 'In stock',
            'stock' => 5,
            'is_active' => true,
            'is_featured' => false,
        ]);
    }
}
