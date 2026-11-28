<?php

namespace App\Http\Resources\Storefront;

use App\Models\Order;
use App\Models\OrderItem;
use App\Support\DeliveryFields;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin Order */
class OrderResource extends JsonResource
{
    /**
     * The storefront payload uses camelCase keys and snapshots the figures at
     * checkout time, so later catalogue edits cannot change past orders.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Order $order */
        $order = $this->resource;

        $items = $order->relationLoaded('items')
            ? $order->items
            : collect();
        $originalTotal = (int) $items->sum(
            fn (OrderItem $item): int => self::originalUnitPrice($item) * (int) $item->quantity
        );
        $total = (int) $order->total;

        return [
            'uuid' => (string) $order->uuid,
            'orderNumber' => (string) $order->order_number,
            'placedOn' => $order->created_at?->toDateString() ?? '',
            'status' => $order->status->value,
            'items' => $this->whenLoaded('items', fn (): array => $items
                ->map(fn (OrderItem $item): array => [
                    'uuid' => (string) $item->uuid,
                    'title' => (string) $item->title,
                    'price' => (int) $item->price,
                    'originalPrice' => self::originalUnitPrice($item),
                    'quantity' => (int) $item->quantity,
                    'discountPercentage' => (float) $item->discount_percentage,
                    'discountedTotal' => (int) $item->price * (int) $item->quantity,
                    'thumbnailUrl' => self::thumbnailUrl($item->thumbnail),
                ])
                ->values()
                ->all()),
            'total' => $total,
            'originalTotal' => $originalTotal,
            'savings' => max(0, $originalTotal - $total),
            'totalProducts' => $items->count(),
            'totalQuantity' => (int) $items->sum('quantity'),
            'deliveryAddress' => $this->whenLoaded(
                'deliveryInformation',
                fn (): ?array => DeliveryFields::payload($order->deliveryInformation)
            ),
        ];
    }

    /**
     * Checkout stores the price actually paid. Recover the pre-discount price
     * from the snapshot so the summary can show what the customer saved.
     */
    private static function originalUnitPrice(OrderItem $item): int
    {
        $discount = (float) $item->discount_percentage;

        if ($discount <= 0 || $discount >= 100) {
            return (int) $item->price;
        }

        return (int) round((int) $item->price / (1 - $discount / 100));
    }

    private static function thumbnailUrl(mixed $thumbnail): ?string
    {
        if (! is_string($thumbnail) || trim($thumbnail) === '') {
            return null;
        }

        return Storage::disk('public')->exists($thumbnail)
            ? Storage::url($thumbnail)
            : null;
    }
}
