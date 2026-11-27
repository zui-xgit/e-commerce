<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProductUpdateMediaTest extends TestCase
{
    use RefreshDatabase;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $admin = User::factory()->create();
        $admin->assignRole(Role::create(['name' => 'admin']));

        $this->actingAs($admin);

        $this->category = Category::create([
            'name' => 'Bags',
            'is_active' => true,
        ]);
    }

    public function test_updating_can_keep_existing_thumbnail_and_gallery_images(): void
    {
        $product = $this->product();
        $image = $product->images()->create([
            'path' => 'products/gallery/existing.png',
            'sort_order' => 0,
        ]);

        $response = $this->put(route('admin.products-update', $product->uuid), $this->payload($product, [
            'title' => 'Renamed product',
            'image_order' => [$image->uuid],
        ]));

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('products', [
            'uuid' => $product->uuid,
            'title' => 'Renamed product',
            'thumbnail' => 'products/thumbnails/existing.png',
        ]);
        $this->assertDatabaseHas('product_images', [
            'uuid' => $image->uuid,
            'path' => 'products/gallery/existing.png',
        ]);
    }

    public function test_removing_all_gallery_images_requires_a_replacement(): void
    {
        $product = $this->product();
        $image = $product->images()->create([
            'path' => 'products/gallery/existing.png',
            'sort_order' => 0,
        ]);

        $response = $this->put(route('admin.products-update', $product->uuid), $this->payload($product, [
            'removed_images' => [$image->uuid],
            'image_order' => [],
        ]));

        $response->assertSessionHasErrors('images');
        $this->assertDatabaseHas('product_images', ['uuid' => $image->uuid]);
    }

    public function test_a_replacement_image_allows_removing_the_last_gallery_image(): void
    {
        $product = $this->product();
        $image = $product->images()->create([
            'path' => 'products/gallery/existing.png',
            'sort_order' => 0,
        ]);

        $response = $this->put(route('admin.products-update', $product->uuid), $this->payload($product, [
            'removed_images' => [$image->uuid],
            'images' => [UploadedFile::fake()->image('replacement.png')],
        ]));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('product_images', ['uuid' => $image->uuid]);
        $this->assertSame(1, $product->images()->count());
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(Product $product, array $overrides = []): array
    {
        return array_merge([
            'category_uuid' => $this->category->uuid,
            'title' => $product->title,
            'price' => 15000,
            'sku' => $product->sku,
            'thumbnail' => null,
            'minimum_order_quantity' => 1,
            'stock' => 5,
            'is_active' => true,
            'is_featured' => false,
            'images' => [],
            'removed_images' => [],
            'image_order' => [],
        ], $overrides);
    }

    private function product(): Product
    {
        return Product::create([
            'category_id' => $this->category->id,
            'title' => 'Canvas tote',
            'price' => 15000,
            'sku' => 'TOTE-'.uniqid(),
            'thumbnail' => 'products/thumbnails/existing.png',
            'minimum_order_quantity' => 1,
            'stock' => 5,
            'is_active' => true,
            'is_featured' => false,
        ]);
    }
}
