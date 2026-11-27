<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\Storefront\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * List the signed-in customer's orders with server-side search and status
     * filtering. The browser never receives another customer's orders.
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['sometimes', 'string', 'max:100'],
            'status' => ['sometimes', 'string', 'in:all,pending,processed,cancelled'],
        ]);

        $filters = [
            'search' => trim((string) ($validated['search'] ?? '')),
            'status' => (string) ($validated['status'] ?? 'all'),
        ];

        $userId = (int) $request->user()->id;

        $orders = Order::query()
            ->where('user_id', $userId)
            ->with([
                'items:id,order_id,uuid,title,price,quantity,discount_percentage,thumbnail',
            ])
            ->when(
                $filters['status'] !== 'all',
                fn ($query) => $query->where('status', $filters['status'])
            )
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $like = '%'.addcslashes($filters['search'], '%_\\').'%';

                $query->where(function ($query) use ($like): void {
                    $query->where('order_number', 'like', $like)
                        ->orWhereHas(
                            'items',
                            fn ($items) => $items->where('title', 'like', $like)
                        );
                });
            })
            ->latest()
            ->get();

        $statusCounts = Order::query()
            ->where('user_id', $userId)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('storefront/account/orders/index', [
            'orders' => OrderResource::collection($orders)->resolve($request),
            'filters' => $filters,
            'counts' => [
                'all' => (int) $statusCounts->sum(),
                'pending' => (int) ($statusCounts['pending'] ?? 0),
                'processed' => (int) ($statusCounts['processed'] ?? 0),
                'cancelled' => (int) ($statusCounts['cancelled'] ?? 0),
            ],
        ]);
    }

    /**
     * Show one order belonging to the signed-in customer. A UUID from another
     * account is indistinguishable from an order that does not exist.
     */
    public function show(Request $request, Order $order): Response
    {
        abort_unless((int) $order->user_id === (int) $request->user()->id, 404);

        $order->load([
            'items:id,order_id,uuid,title,price,quantity,discount_percentage,thumbnail',
            'deliveryInformation',
        ]);

        return Inertia::render('storefront/account/orders/show', [
            'order' => OrderResource::make($order)->resolve($request),
        ]);
    }
}
