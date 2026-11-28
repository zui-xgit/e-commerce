<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OverviewController extends Controller
{
    private const WINDOW_DAYS = 30;

    /** The admin's first look: a dense status strip and three honest charts. */
    public function overview(): Response
    {
        $today = CarbonImmutable::now('UTC')->startOfDay();
        $start = $today->subDays(self::WINDOW_DAYS - 1);
        $end = $today->endOfDay();

        $dates = collect(range(0, self::WINDOW_DAYS - 1))
            ->map(fn (int $offset): string => $start->addDays($offset)->toDateString());

        $ordersByDay = DB::table('orders')
            ->selectRaw('DATE(created_at) as day, COUNT(*) as orders, COALESCE(SUM(total), 0) as value')
            ->whereBetween('created_at', [$start, $end])
            ->groupByRaw('DATE(created_at)')
            ->get()
            ->keyBy('day');

        $confirmedByDay = DB::table('orders')
            ->selectRaw('DATE(confirmed_at) as day, COUNT(*) as total')
            ->whereNotNull('confirmed_at')
            ->whereBetween('confirmed_at', [$start, $end])
            ->groupByRaw('DATE(confirmed_at)')
            ->pluck('total', 'day');

        $cancelledByDay = DB::table('orders')
            ->selectRaw('DATE(cancelled_at) as day, COUNT(*) as total')
            ->whereNotNull('cancelled_at')
            ->whereBetween('cancelled_at', [$start, $end])
            ->groupByRaw('DATE(cancelled_at)')
            ->pluck('total', 'day');

        $series = $dates
            ->map(function (string $date) use ($ordersByDay, $confirmedByDay, $cancelledByDay): array {
                $order = $ordersByDay->get($date);

                return [
                    'date' => $date,
                    'label' => CarbonImmutable::parse($date)->format('j M'),
                    'orders' => (int) ($order?->orders ?? 0),
                    'value' => (int) ($order?->value ?? 0),
                    'placed' => (int) ($order?->orders ?? 0),
                    'confirmed' => (int) ($confirmedByDay->get($date, 0)),
                    'cancelled' => (int) ($cancelledByDay->get($date, 0)),
                ];
            })
            ->all();

        $range = DB::table('orders')
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('
                COUNT(*) as orders,
                COALESCE(SUM(total), 0) as order_value,
                COALESCE(AVG(total), 0) as average_order_value
            ')
            ->first();

        $processed = DB::table('orders')
            ->where('status', 'processed')
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $cancelled = DB::table('orders')
            ->where('status', 'cancelled')
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $topProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->selectRaw('
                order_items.product_id,
                order_items.title,
                SUM(order_items.quantity) as units,
                SUM(order_items.price * order_items.quantity) as value
            ')
            ->groupBy('order_items.product_id', 'order_items.title')
            ->orderByDesc('units')
            ->limit(6)
            ->get()
            ->map(fn ($item): array => [
                'title' => Str::limit((string) $item->title, 26),
                'units' => (int) $item->units,
                'value' => (int) $item->value,
            ])
            ->all();

        return Inertia::render('admin/overview', [
            'window' => [
                'days' => self::WINDOW_DAYS,
                'from' => $start->toDateString(),
                'to' => $today->toDateString(),
            ],
            'stats' => [
                'orders' => (int) ($range?->orders ?? 0),
                'pending' => (int) DB::table('orders')->where('status', 'pending')->count(),
                'processed' => (int) $processed,
                'cancelled' => (int) $cancelled,
                'orderValue' => (int) ($range?->order_value ?? 0),
                'averageOrderValue' => (int) round((float) ($range?->average_order_value ?? 0)),
            ],
            'series' => $series,
            'topProducts' => $topProducts,
        ]);
    }
}
