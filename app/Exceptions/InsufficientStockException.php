<?php

namespace App\Exceptions;

use RuntimeException;

class InsufficientStockException extends RuntimeException
{
    /**
     * @param  list<array{title: string, ordered: int, available: int, short: int}>  $shortfalls
     */
    public function __construct(public readonly array $shortfalls)
    {
        $details = collect($shortfalls)
            ->map(fn (array $item): string => sprintf(
                '%s (ordered %d, available %d)',
                $item['title'],
                $item['ordered'],
                $item['available'],
            ))
            ->implode(', ');

        parent::__construct('Not enough stock to confirm this order: '.$details.'. Confirm the available stock instead or update the product stock.');
    }
}
