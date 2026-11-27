<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\InvalidOrderStateException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CancelOrderRequest;
use App\Http\Requests\Admin\ConfirmOrderRequest;
use App\Models\Order;
use App\Models\OrderDeliveryInformation;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(private readonly OrderFulfillmentService $fulfillment)
    {
        //
    }

    /** The admin order book: phone queues, status filters and search. */
    public function index(Request $request): Response
    {
        $status = (string) $request->input('status', 'all');
        $sort = (string) $request->input('sort', 'newest');

        $filters = [
            'search' => trim((string) $request->input('search', '')),
            'status' => in_array($status, OrderStatus::values(), true) ? $status : 'all',
            'customer' => (string) $request->input('customer', ''),
            'sort' => in_array($sort, ['newest', 'oldest', 'total_desc', 'total_asc'], true)
                ? $sort
                : 'newest',
        ];

        $query = Order::query()->with([
            'items:id,order_id,quantity,confirmed_quantity',
            'deliveryInformation:id,order_id,name,phone,email',
            'user:id,uuid,name,email',
        ]);

        if ($filters['search'] !== '') {
            $like = '%'.addcslashes($filters['search'], '%_\\').'%';

            $query->where(function ($query) use ($like): void {
                $query->where('order_number', 'like', $like)
                    ->orWhereHas('deliveryInformation', fn ($info) => $info
                        ->where('name', 'like', $like)
                        ->orWhere('phone', 'like', $like)
                        ->orWhere('email', 'like', $like))
                    ->orWhereHas('user', fn ($user) => $user
                        ->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like))
                    ->orWhereHas('items', fn ($items) => $items->where('title', 'like', $like));
            });
        }

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if ($filters['customer'] === 'guest') {
            $query->whereNull('user_id');
        } elseif ($filters['customer'] !== '') {
            $userId = User::query()->where('uuid', $filters['customer'])->value('id');

            if (! is_numeric($userId)) {
                $query->whereRaw('1 = 0');
            } else {
                $query->where('user_id', (int) $userId);
            }
        }

        match ($filters['sort']) {
            'oldest' => $query->orderBy('created_at'),
            'total_desc' => $query->orderByDesc('total'),
            'total_asc' => $query->orderBy('total'),
            default => $query->latest('created_at'),
        };

        $orders = $query->paginate(10)
            ->withQueryString()
            ->through(function (Order $order): array {
                $user = $this->relatedUser($order, 'user');
                $delivery = $this->relatedDelivery($order);

                return [
                    'uuid' => (string) $order->uuid,
                    'orderNumber' => (string) $order->order_number,
                    'status' => $order->status->value,
                    'customerName' => (string) ($user !== null
                        ? $user->name
                        : ($delivery !== null ? $delivery->name : 'Guest checkout')),
                    'customerEmail' => (string) ($user !== null
                        ? $user->email
                        : ($delivery !== null ? $delivery->email : '')),
                    'phone' => (string) ($delivery !== null ? $delivery->phone : ''),
                    'isGuest' => $order->user_id === null,
                    'itemCount' => $order->items->count(),
                    'totalQuantity' => (int) $order->items->sum('quantity'),
                    'total' => (int) $order->total,
                    'shortfallUnits' => $order->status === OrderStatus::Processed
                        ? (int) $order->items->sum(fn (OrderItem $item): int => max(
                            0,
                            (int) $item->quantity - (int) $item->confirmed_quantity
                        ))
                        : 0,
                    'placedAt' => $order->created_at?->toISOString() ?? '',
                ];
            });

        $statusCounts = Order::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $customerIds = Order::query()
            ->whereNotNull('user_id')
            ->distinct()
            ->pluck('user_id');

        return Inertia::render('admin/store/orders/index', [
            'orders' => $orders,
            'customers' => User::query()
                ->whereIn('id', $customerIds)
                ->orderBy('name')
                ->get(['uuid', 'name', 'email'])
                ->map(fn (User $user): array => [
                    'uuid' => (string) $user->uuid,
                    'name' => (string) $user->name,
                    'email' => (string) $user->email,
                ])
                ->values()
                ->all(),
            'filters' => $filters,
            'counts' => [
                'all' => (int) $statusCounts->sum(),
                'pending' => (int) ($statusCounts[OrderStatus::Pending->value] ?? 0),
                'processed' => (int) ($statusCounts[OrderStatus::Processed->value] ?? 0),
                'cancelled' => (int) ($statusCounts[OrderStatus::Cancelled->value] ?? 0),
            ],
        ]);
    }

    /** One order, its customer, live stock position and status history. */
    public function show(Order $order): Response
    {
        $order->load([
            'items.product:id,uuid,title,stock',
            'deliveryInformation',
            'user:id,uuid,name,email',
            'processor:id,name',
            'canceller:id,name',
        ]);

        $items = $order->items->map(function (OrderItem $item) use ($order): array {
            $product = $item->getRelation('product');
            $quantity = (int) $item->quantity;
            $confirmedQuantity = (int) $item->confirmed_quantity;
            $availableStock = $product?->stock !== null ? (int) $product->stock : null;

            $shortfall = $order->status === OrderStatus::Processed
                ? max(0, $quantity - $confirmedQuantity)
                : max(0, $quantity - ($availableStock ?? 0));

            return [
                'uuid' => (string) $item->uuid,
                'title' => (string) $item->title,
                'brand' => $item->brand,
                'price' => (int) $item->price,
                'quantity' => $quantity,
                'confirmedQuantity' => $confirmedQuantity,
                'shortfall' => $shortfall,
                'availableStock' => $availableStock,
                'lineTotal' => (int) $item->price * $quantity,
            ];
        })->values()->all();

        $delivery = $this->relatedDelivery($order);
        $user = $this->relatedUser($order, 'user');
        $processor = $this->relatedUser($order, 'processor');
        $canceller = $this->relatedUser($order, 'canceller');

        return Inertia::render('admin/store/orders/show', [
            'order' => [
                'uuid' => (string) $order->uuid,
                'orderNumber' => (string) $order->order_number,
                'status' => $order->status->value,
                'placedAt' => $order->created_at?->toISOString() ?? '',
                'total' => (int) $order->total,
                'fulfilledTotal' => (int) $order->items->sum(
                    fn (OrderItem $item): int => (int) $item->price * (int) $item->confirmed_quantity
                ),
                'shortfallUnits' => array_sum(array_map(
                    fn (array $item): int => $item['shortfall'],
                    $items,
                )),
                'items' => $items,
                'customer' => [
                    'name' => (string) ($user !== null
                        ? $user->name
                        : ($delivery !== null ? $delivery->name : 'Guest checkout')),
                    'email' => (string) ($user !== null
                        ? $user->email
                        : ($delivery !== null ? $delivery->email : '')),
                    'phone' => (string) ($delivery !== null ? $delivery->phone : ''),
                    'isGuest' => $order->user_id === null,
                ],
                'delivery' => $delivery === null ? null : [
                    'name' => (string) $delivery->name,
                    'company' => (string) ($delivery->company ?? ''),
                    'address' => (string) $delivery->address,
                    'city' => (string) $delivery->city,
                    'postalCode' => (string) $delivery->postal_code,
                    'country' => (string) $delivery->country,
                    'phone' => (string) $delivery->phone,
                    'email' => (string) $delivery->email,
                ],
                'confirmedAt' => $order->confirmed_at?->toISOString() ?? null,
                'confirmedBy' => $processor !== null ? $processor->name : null,
                'cancelledAt' => $order->cancelled_at?->toISOString() ?? null,
                'cancelledBy' => $canceller !== null ? $canceller->name : null,
                'cancellationReason' => $order->cancellation_reason,
            ],
        ]);
    }

    /** Phone confirmation: deduct what is available and move to processed. */
    public function confirm(ConfirmOrderRequest $request, Order $order): RedirectResponse
    {
        try {
            $result = $this->fulfillment->confirm(
                $order,
                $request->boolean('allowPartial'),
                (int) $request->user()->id
            );
        } catch (InsufficientStockException $exception) {
            return back()->withErrors(['confirmation' => $exception->getMessage()]);
        } catch (InvalidOrderStateException $exception) {
            return back()->withErrors(['order' => $exception->getMessage()]);
        }

        $shortUnits = array_sum(array_column($result['shortfalls'], 'short'));
        $message = $shortUnits > 0
            ? __('Order confirmed. :deducted unit(s) deducted; :short unit(s) short — call the customer.', [
                'deducted' => $result['deductedUnits'],
                'short' => $shortUnits,
            ])
            : __('Order confirmed. :deducted unit(s) deducted from stock.', [
                'deducted' => $result['deductedUnits'],
            ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }

    /** Cancel a pending order, or a processed order with stock restoration. */
    public function cancel(CancelOrderRequest $request, Order $order): RedirectResponse
    {
        $wasProcessed = $order->status === OrderStatus::Processed;

        try {
            $this->fulfillment->cancel(
                $order,
                (int) $request->user()->id,
                $request->input('reason')
            );
        } catch (InvalidOrderStateException $exception) {
            return back()->withErrors(['order' => $exception->getMessage()]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $wasProcessed
                ? __('Order cancelled. Deducted stock has been restored.')
                : __('Order cancelled. No stock was deducted.'),
        ]);

        return back();
    }

    /** Clear any order. Stock is never changed by clearing. */
    public function destroy(Order $order): RedirectResponse
    {
        $orderNumber = $order->order_number;
        $wasCleared = in_array($order->status, [OrderStatus::Processed, OrderStatus::Cancelled], true);

        $this->fulfillment->delete($order);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $wasCleared
                ? __('Order :number cleared. Stock was not changed.', ['number' => $orderNumber])
                : __('Order :number deleted.', ['number' => $orderNumber]),
        ]);

        return redirect()->route('admin.orders.index');
    }

    /** Clear every processed or cancelled order in one confirmed sweep, without changing stock. */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $status = (string) $request->input('status');

        if (! in_array($status, [OrderStatus::Processed->value, OrderStatus::Cancelled->value], true)) {
            return back()->withErrors([
                'error' => 'Only processed or cancelled orders can be cleared in bulk.',
            ]);
        }

        $orders = Order::query()->where('status', $status)->get();

        foreach ($orders as $order) {
            $this->fulfillment->delete($order);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __(':count :status orders cleared. Stock was not changed.', [
                'count' => $orders->count(),
                'status' => $status,
            ]),
        ]);

        return back();
    }

    /** Resolve an eager-loaded relation without assuming a nullable FK is present. */
    private function relatedUser(Order $order, string $relation): ?User
    {
        $related = $order->getRelationValue($relation);

        return $related instanceof User ? $related : null;
    }

    private function relatedDelivery(Order $order): ?OrderDeliveryInformation
    {
        $related = $order->getRelationValue('deliveryInformation');

        return $related instanceof OrderDeliveryInformation ? $related : null;
    }
}
