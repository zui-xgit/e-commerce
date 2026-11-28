<?php

namespace Tests\Feature\Storefront;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_index_filters_searches_sorts_and_paginates_on_the_server(): void
    {
        $watches = Category::create([
            'name' => 'Watches',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $shoes = Category::create([
            'name' => 'Shoes',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $cheapWatch = $this->product($watches, [
            'title' => 'Blue Watch',
            'sku' => 'WATCH-CHEAP',
            'brand' => 'Nova',
            'price' => 90,
            'discount_percentage' => 10,
            'rating' => 4.5,
        ]);
        $this->product($watches, [
            'title' => 'Blue Watch Deluxe',
            'sku' => 'WATCH-DELUXE',
            'price' => 150,
            'discount_percentage' => 0,
            'rating' => 4.1,
        ]);
        $this->product($shoes, [
            'title' => 'Blue Trainers',
            'sku' => 'SHOES-BLUE',
            'price' => 60,
            'discount_percentage' => 0,
            'rating' => 3.9,
        ]);
        $this->product($watches, [
            'title' => 'Hidden Blue Watch',
            'sku' => 'WATCH-HIDDEN',
            'price' => 50,
            'rating' => 5,
            'is_active' => false,
        ]);

        $this->get(route('products.index', [
            'search' => 'blue',
            'category' => $watches->uuid,
            'sort' => 'price-asc',
        ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('storefront/products/index')
                ->where('filters.search', 'blue')
                ->where('filters.category', $watches->uuid)
                ->where('filters.sort', 'price-asc')
                ->has('products.data', 2)
                ->where('products.data.0.uuid', $cheapWatch->uuid)
                ->where('products.data.0.discountedPrice', 81)
                ->where('products.data.0.category.uuid', $watches->uuid)
                ->where('products.meta.total', 2)
                ->has('products.links')
                ->where('featured', null)
                ->where('counts.products', 3)
                ->where('counts.categories', 2));
    }

    public function test_product_detail_is_bound_by_uuid_and_eager_loads_images(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('products/gallery/watch.png', 'image');

        $category = Category::create([
            'name' => 'Watches',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $product = $this->product($category, [
            'title' => 'Nova Watch',
            'sku' => 'WATCH-NOVA',
            'price' => 100,
            'discount_percentage' => 10,
        ]);
        $related = $this->product($category, [
            'title' => 'Nova Watch Second',
            'sku' => 'WATCH-NOVA-2',
            'price' => 80,
        ]);

        ProductImage::create([
            'product_id' => $product->id,
            'path' => 'products/gallery/watch.png',
            'alt' => 'Nova Watch',
            'sort_order' => 1,
        ]);

        $this->get(route('products.show', ['product' => $product->uuid]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('storefront/products/show')
                ->where('product.uuid', $product->uuid)
                ->where('product.categoryName', 'Watches')
                ->where('product.price', 100)
                ->where('product.discountedPrice', 90)
                ->where('product.savings', 10)
                ->has('product.images', 1)
                ->has('related', 1)
                ->where('related.0.uuid', $related->uuid)
                ->missing('product.id'));

        $this->get('/products/'.$product->id)->assertNotFound();
    }

    public function test_inactive_product_cannot_be_viewed(): void
    {
        $category = Category::create([
            'name' => 'Watches',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $product = $this->product($category, [
            'title' => 'Hidden Watch',
            'sku' => 'WATCH-HIDDEN',
            'price' => 100,
            'is_active' => false,
        ]);

        $this->get(route('products.show', ['product' => $product->uuid]))
            ->assertNotFound();
    }

    public function test_home_exposes_featured_and_newest_products(): void
    {
        $category = Category::create([
            'name' => 'Watches',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $featured = $this->product($category, [
            'title' => 'Featured Watch',
            'sku' => 'WATCH-FEATURED',
            'price' => 100,
            'is_featured' => true,
            'rating' => 5,
        ]);
        $newest = $this->product($category, [
            'title' => 'Newest Watch',
            'sku' => 'WATCH-NEWEST',
            'price' => 80,
            'rating' => 3,
        ]);

        foreach ([$featured, $newest] as $index => $item) {
            $item->timestamps = false;
            $item->created_at = now()->subDay()->addMinutes($index);
            $item->save();
        }

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('storefront/home')
                ->where('counts.products', 2)
                ->where('counts.categories', 1)
                ->where('counts.featured', 1)
                ->has('featured', 1)
                ->where('featured.0.uuid', $featured->uuid)
                ->has('products.data', 2)
                ->where('products.data.0.uuid', $newest->uuid)
                ->missing('products.data.0.id'));
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function product(Category $category, array $attributes): Product
    {
        return Product::create(array_merge([
            'category_id' => $category->id,
            'title' => 'Catalogue product',
            'description' => 'A product from the store catalogue.',
            'price' => 50,
            'discount_percentage' => 0,
            'rating' => 4,
            'sku' => 'CAT-DEFAULT',
            'minimum_order_quantity' => 1,
            'stock' => 5,
            'is_active' => true,
            'is_featured' => false,
        ], $attributes));
    }
}
