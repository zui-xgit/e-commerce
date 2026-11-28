<?php

namespace Tests\Unit;

use App\Enums\StockStatus;
use App\Http\Resources\Storefront\ProductResource;
use App\Models\Product;
use App\Models\SiteSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockStatusTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        SiteSetting::set('low_stock_threshold', '5', 'string', 'inventory');
    }

    public function test_it_derives_status_from_stock_and_the_configured_threshold(): void
    {
        $this->assertSame(StockStatus::OutOfStock, StockStatus::fromStock(-1, 5));
        $this->assertSame(StockStatus::OutOfStock, StockStatus::fromStock(0, 5));
        $this->assertSame(StockStatus::LowStock, StockStatus::fromStock(1, 5));
        $this->assertSame(StockStatus::LowStock, StockStatus::fromStock(4, 5));
        $this->assertSame(StockStatus::InStock, StockStatus::fromStock(5, 5));
        $this->assertSame(StockStatus::InStock, StockStatus::fromStock(25, 5));
    }

    public function test_the_admin_accessor_uses_the_threshold_from_the_database(): void
    {
        $this->assertSame(StockStatus::LowStock, (new Product(['stock' => 3]))->stock_status);

        SiteSetting::set('low_stock_threshold', '3', 'string', 'inventory');

        $this->assertSame(StockStatus::InStock, (new Product(['stock' => 3]))->stock_status);
    }

    public function test_the_storefront_accessor_only_exposes_in_stock_or_out_of_stock(): void
    {
        $this->assertSame(StockStatus::InStock, (new Product(['stock' => 1]))->storefront_stock_status);
        $this->assertSame(StockStatus::InStock, (new Product(['stock' => 4]))->storefront_stock_status);
        $this->assertSame(StockStatus::OutOfStock, (new Product(['stock' => 0]))->storefront_stock_status);
    }

    public function test_the_storefront_resource_never_exposes_low_stock(): void
    {
        $product = new Product(['stock' => 3]);

        $this->assertSame(StockStatus::LowStock, $product->stock_status);
        $this->assertSame(
            'in_stock',
            ProductResource::make($product)->resolve()['stockStatus'],
        );
    }

    public function test_it_exposes_only_three_values_and_labels(): void
    {
        $this->assertSame(
            ['in_stock', 'low_stock', 'out_of_stock'],
            StockStatus::values(),
        );
        $this->assertSame([1, 4], StockStatus::lowStockRange(5));
        $this->assertSame('In Stock', StockStatus::InStock->label());
        $this->assertSame('Low Stock', StockStatus::LowStock->label());
        $this->assertSame('Out of Stock', StockStatus::OutOfStock->label());
    }
}
