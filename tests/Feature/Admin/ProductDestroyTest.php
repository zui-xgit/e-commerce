<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProductDestroyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $admin = User::factory()->create();
        $admin->assignRole(Role::create(['name' => 'admin']));

        $this->actingAs($admin);
    }

    public function test_deleting_a_product_removes_its_stored_images(): void
    {
        $category = Category::create(['name' => 'Bags']);
        $product = Product::create([
            'category_id' => $category->id,
            'title' => 'Canvas tote',
            'price' => 15000,
            'sku' => 'TOTE-DELETE',
            'thumbnail' => 'products/thumbnails/tote.png',
            'minimum_order_quantity' => 1,
            'stock' => 5,
        ]);

        $firstImage = $product->images()->create([
            'path' => 'products/gallery/tote-1.png',
            'sort_order' => 0,
        ]);
        $secondImage = $product->images()->create([
            'path' => 'products/gallery/tote-2.png',
            'sort_order' => 1,
        ]);

        Storage::disk('public')->put($product->thumbnail, 'thumbnail');
        Storage::disk('public')->put($firstImage->path, 'first');
        Storage::disk('public')->put($secondImage->path, 'second');

        $response = $this->delete(route('admin.products.destroy', $product->uuid));

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('products', ['uuid' => $product->uuid]);
        $this->assertDatabaseMissing('product_images', ['id' => $firstImage->id]);
        $this->assertDatabaseMissing('product_images', ['id' => $secondImage->id]);

        Storage::disk('public')->assertMissing($product->thumbnail);
        Storage::disk('public')->assertMissing($firstImage->path);
        Storage::disk('public')->assertMissing($secondImage->path);
    }

    public function test_deleting_a_product_leaves_other_products_images_alone(): void
    {
        $category = Category::create(['name' => 'Bags']);

        $deleted = Product::create([
            'category_id' => $category->id,
            'title' => 'Deleted tote',
            'price' => 15000,
            'sku' => 'TOTE-DELETE-2',
            'thumbnail' => 'products/thumbnails/deleted.png',
            'minimum_order_quantity' => 1,
        ]);
        $kept = Product::create([
            'category_id' => $category->id,
            'title' => 'Kept tote',
            'price' => 15000,
            'sku' => 'TOTE-KEEP',
            'thumbnail' => 'products/thumbnails/kept.png',
            'minimum_order_quantity' => 1,
        ]);

        $deletedImage = $deleted->images()->create(['path' => 'products/gallery/deleted.png']);
        $keptImage = $kept->images()->create(['path' => 'products/gallery/kept.png']);

        Storage::disk('public')->put($deleted->thumbnail, 'deleted');
        Storage::disk('public')->put($deletedImage->path, 'deleted');
        Storage::disk('public')->put($kept->thumbnail, 'kept');
        Storage::disk('public')->put($keptImage->path, 'kept');

        $this->delete(route('admin.products.destroy', $deleted->uuid));

        Storage::disk('public')->assertMissing($deleted->thumbnail);
        Storage::disk('public')->assertMissing($deletedImage->path);
        Storage::disk('public')->assertExists($kept->thumbnail);
        Storage::disk('public')->assertExists($keptImage->path);
    }
}
