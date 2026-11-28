<?php

namespace App\Http\Resources\Storefront;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Product */
class ProductResource extends JsonResource
{
    /**
     * The storefront payload uses camelCase keys and never exposes numeric IDs.
     * Discounted prices are calculated once by the model accessor.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Product $product */
        $product = $this->resource;

        return [
            'uuid' => $product->uuid,
            'title' => $product->title,
            'description' => $product->description,
            'category' => $this->whenLoaded('category', fn (): array => [
                'uuid' => $product->category?->uuid,
                'name' => $product->category?->name,
            ]),
            'categoryName' => $product->category?->name ?? 'Uncategorised',
            'price' => $product->price,
            'originalPrice' => $product->price,
            'discountPercentage' => $product->discount_percentage,
            'discountedPrice' => $product->discounted_price,
            'savings' => $product->price - $product->discounted_price,
            'rating' => $product->rating,
            'stock' => $product->stock,
            'brand' => $product->brand,
            'sku' => $product->sku,
            'thumbnailUrl' => $product->thumbnail_url,
            'images' => $this->whenLoaded('images', fn (): array => $product->images
                ->map(fn ($image): array => [
                    'uuid' => $image->uuid,
                    'url' => $image->url,
                    'alt' => $image->alt,
                ])
                ->values()
                ->all()),
            'minimumOrderQuantity' => $product->minimum_order_quantity,
            'stockStatus' => $product->storefront_stock_status->value,
            'shippingInformation' => $product->shipping_information,
            'returnPolicy' => $product->return_policy,
            'warrantyInformation' => $product->warranty_information,
            'reviews' => $product->reviews ?? [],
            'isFeatured' => $product->is_featured,
            'createdAt' => $product->created_at?->toDateString(),
        ];
    }
}
