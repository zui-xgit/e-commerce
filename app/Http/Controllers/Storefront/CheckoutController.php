<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Support\DeliveryFields;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CheckoutController extends Controller
{
    /**
     * Preload the signed-in user's saved address so checkout starts filled in.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('storefront/checkout', [
            'savedAddress' => DeliveryFields::payload(
                $request->user()?->deliveryInformation
            ),
        ]);
    }

    /**
     * Validate a checkout submission and freeze it as a real order.
     */
    public function store(Request $request): RedirectResponse
    {

        $user = Auth::user(); 


        
        $items = $request->input('items', []);

        $stockByUuid = is_array($items)
            ? Product::query()
                ->whereIn('uuid', collect($items)->pluck('uuid')->filter()->all())
                ->pluck('stock', 'uuid')
            : collect();

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:120'],

            // Guests must not submit a user UUID; signed-in users must submit
            // their own UUID so a client cannot attach an order to someone else.
            'userUuid' => $request->user()
                ? ['required', 'uuid', Rule::in([$request->user()->uuid])]
                : ['prohibited'],

            // Cart lines are always required and are checked against the
            // current catalogue before an order preview is accepted.
            'items' => ['required', 'array', 'min:1'],
            'items.*.uuid' => [
                'required',
                'uuid',
                'distinct',
                Rule::exists('products', 'uuid'),
            ],
            'items.*.quantity' => [
                'required',
                'integer',
                'min:1',
                function (string $attribute, mixed $value, Closure $fail) use ($request, $stockByUuid): void {
                    $index = explode('.', $attribute)[1] ?? null;
                    $uuid = $request->input("items.{$index}.uuid");
                    $stock = $stockByUuid->get($uuid);

                    if ($stock !== null && (int) $value > (int) $stock) {
                        $fail("Only {$stock} unit(s) of this product are available.");
                    }
                },
            ],

            ...DeliveryFields::checkoutRules(),

            'policies' => ['accepted'],
        ]);

        DB::beginTransaction();

        try {
            $products = Product::query()
                ->whereIn('uuid', collect($validated['items'])->pluck('uuid'))
                ->get()
                ->keyBy('uuid');

            $total = 0;
            $lines = [];

            foreach ($validated['items'] as $line) {
                $product = $products->get($line['uuid']);

                // The exists rule ran before the transaction; a concurrent
                // deletion here must not create a half-written order.
                if (! $product) {
                    abort(422, 'A product in your cart is no longer available.');
                }

                $quantity = (int) $line['quantity'];
                $price = (int) $product->discounted_price;
                $total += $price * $quantity;

                $lines[] = [
                    'product_id' => $product->id,
                    'title' => $product->title,
                    'price' => $price,
                    'quantity' => $quantity,
                    'discount_percentage' => $product->discount_percentage,
                    'rating' => $product->rating,
                    'brand' => $product->brand,
                    'thumbnail' => $product->thumbnail,
                ];
            }

            $order = Order::create([
                'user_id' => $request->user()?->id,
                'order_number' => self::newOrderNumber(),
                'total' => $total,
            ]);

            $order->items()->createMany($lines);

            // A snapshot: later edits to the user's saved address cannot alter
            // the information this order was placed with.
            $order->deliveryInformation()->create(
                DeliveryFields::columns($validated, 'delivery')
            );

            DB::commit();

            $this->flash('success', 'Your order has been placed successfully!');
  
            
        } catch (Throwable $exception) {
            DB::rollBack();

            report($exception);

            $this->flash('error', 'Something went wrong while placing your order. Please try again.');
            return back(); 
        }

        if($user){
             return redirect()->route('account.orders.show', ['order' => $order->uuid]);
        }
        
        return redirect()->route('order-completed');
    }

    private static function newOrderNumber(): string
    {
        do {
            $number = 'SH-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }

    private function flash(string $type, string $message): void
    {
        Inertia::flash('toast', [
            'type' => $type,
            'message' => __($message),
        ]);
    }
}
