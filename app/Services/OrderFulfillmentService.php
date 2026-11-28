<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\InvalidOrderStateException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

/**
 * Manual-confirmation workflow for phone-confirmed orders.
 *
 * Every unit deducted is recorded on the order item, so confirming twice and
 * cancelling twice can never move the same stock twice.
 */
class OrderFulfillmentService
{
    /**
     * Confirm a pending order and deduct the units that are actually available.
     *
     * @return array{deductedUnits: int, deductedValue: int, shortfalls: list<array{title: string, ordered: int, available: int, short: int}>}
     */
    public function confirm(Order $order, bool $allowPartial, ?int $userId): array
    {
        return DB::transaction(function () use ($order, $allowPartial, $userId): array {
            $locked = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== OrderStatus::Pending) {
                throw new InvalidOrderStateException(
                    'Only pending orders can be confirmed. Reload the order to see its current status.'
                );
            }

            $items = $locked->items()->orderBy('id')->lockForUpdate()->get();
            $products = Product::query()
                ->whereIn('id', $items->pluck('product_id')->filter()->unique()->all())
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            /** @var array<int, int> $deductions */
            $deductions = [];
            /** @var list<array{title: string, ordered: int, available: int, short: int}> $shortfalls */
            $shortfalls = [];
            $deductedUnits = 0;
            $deductedValue = 0;

            foreach ($items as $item) {
                $remaining = max(0, (int) $item->quantity - (int) $item->confirmed_quantity);

                if ($remaining === 0) {
                    continue;
                }

                /** @var Product|null $product */
                $product = $item->product_id !== null ? $products->get($item->product_id) : null;
                $available = $product !== null ? max(0, (int) $product->stock) : 0;
                $take = min($remaining, $available);

                if ($take > 0) {
                    $deductions[$item->id] = $take;
                    $deductedUnits += $take;
                    $deductedValue += (int) $item->price * $take;
                }

                if ($take < $remaining) {
                    $shortfalls[] = [
                        'title' => (string) $item->title,
                        'ordered' => $remaining,
                        'available' => $available,
                        'short' => $remaining - $take,
                    ];
                }
            }

            // A strict confirmation writes nothing when stock is short; the
            // transaction has only taken locks at this point.
            if ($shortfalls !== [] && ! $allowPartial) {
                throw new InsufficientStockException($shortfalls);
            }

            foreach ($deductions as $itemId => $quantity) {
                $item = $items->firstWhere('id', $itemId);
                $product = $item !== null && $item->product_id !== null
                    ? $products->get($item->product_id)
                    : null;

                if ($item === null || $product === null) {
                    continue;
                }

                $product->decrement('stock', $quantity);
                $item->increment('confirmed_quantity', $quantity);
            }

            $locked->update([
                'status' => OrderStatus::Processed,
                'processed_by' => $userId,
                'confirmed_at' => now(),
            ]);

            return [
                'deductedUnits' => $deductedUnits,
                'deductedValue' => $deductedValue,
                'shortfalls' => $shortfalls,
            ];
        });
    }

    /**
     * Cancel an order. Pending orders never touched stock; processed orders
     * return precisely the units recorded as deducted.
     */
    public function cancel(Order $order, ?int $userId, ?string $reason = null): void
    {
        DB::transaction(function () use ($order, $userId, $reason): void {
            $locked = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if (! in_array($locked->status, [OrderStatus::Pending, OrderStatus::Processed], true)) {
                throw new InvalidOrderStateException(
                    'Only pending or processed orders can be cancelled. Reload the order to see its current status.'
                );
            }

            if ($locked->status === OrderStatus::Processed) {
                $this->restoreDeductedStock($locked);
            }

            $locked->update([
                'status' => OrderStatus::Cancelled,
                'cancelled_by' => $userId,
                'cancelled_at' => now(),
                'cancellation_reason' => $reason !== null && trim($reason) !== ''
                    ? trim($reason)
                    : null,
            ]);
        });
    }

    /**
     * Permanently clear an order and its details without touching stock.
     * Restoring stock is only done by cancel(), never by clearing.
     */
    public function delete(Order $order): void
    {
        DB::transaction(function () use ($order): void {
            $locked = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            $locked->delete();
        });
    }

    /** Return exactly the units recorded on processed order items. */
    private function restoreDeductedStock(Order $order): void
    {
        $items = $order->items()->orderBy('id')->lockForUpdate()->get();
        $restoredItems = $items->filter(fn (OrderItem $item): bool => (int) $item->confirmed_quantity > 0);

        if ($restoredItems->isEmpty()) {
            return;
        }

        $products = Product::query()
            ->whereIn('id', $restoredItems->pluck('product_id')->filter()->unique()->all())
            ->orderBy('id')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($restoredItems as $item) {
            $product = $item->product_id !== null ? $products->get($item->product_id) : null;
            $quantity = (int) $item->confirmed_quantity;

            if ($product === null) {
                continue;
            }

            $product->increment('stock', $quantity);
            $item->update(['confirmed_quantity' => 0]);
        }
    }
}
