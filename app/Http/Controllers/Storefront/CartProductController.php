<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\Storefront\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartProductController extends Controller
{
    /**
     * Resolve the current storefront data for the UUIDs held in the client cart.
     * UUIDs the catalogue no longer serves are simply left out of the response.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'uuids' => ['sometimes', 'array'],
            'uuids.*' => ['string'],
        ]);

        $uuids = $validated['uuids'] ?? [];

        if ($uuids === []) {
            return response()->json([]);
        }

        $products = Product::query()
            ->whereIn('uuid', $uuids)
            ->where('is_active', true)
            ->with(['category:id,uuid,name', 'images'])
            ->get();

        return response()->json(
            ProductResource::collection($products)->resolve($request),
        );
    }
}
