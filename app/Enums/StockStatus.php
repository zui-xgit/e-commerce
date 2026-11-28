<?php

namespace App\Enums;

enum StockStatus: string
{
    case InStock = 'in_stock';
    case LowStock = 'low_stock';
    case OutOfStock = 'out_of_stock';

    /** @return array{int, int} */
    public static function lowStockRange(int $threshold): array
    {
        return [1, $threshold - 1];
    }

    public static function fromStock(int $stock, int $lowStockThreshold): self
    {
        if ($stock < 1) {
            return self::OutOfStock;
        }

        if ($stock < $lowStockThreshold) {
            return self::LowStock;
        }

        return self::InStock;
    }

    /**
     * Shoppers only need to know whether the product can be bought.
     */
    public static function fromAvailability(int $stock): self
    {
        return $stock > 0 ? self::InStock : self::OutOfStock;
    }

    public function label(): string
    {
        return match ($this) {
            self::InStock => 'In Stock',
            self::LowStock => 'Low Stock',
            self::OutOfStock => 'Out of Stock',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(static fn (self $status): string => $status->value, self::cases());
    }
}
