<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\Storefront\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Browse the active catalogue. Search, filters, sorting and pagination are
     * all resolved on the server; the browser only receives one page of data.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->input('search', '')),
            'category' => (string) $request->input('category', ''),
            'sort' => (string) $request->input('sort', 'recommended'),
        ];

        $request->validate([
            'search' => ['sometimes', 'string', 'max:100'],
            'category' => ['sometimes', 'string', 'max:36'],
            'sort' => ['sometimes', 'string', 'in:recommended,price-asc,price-desc,rating'],
        ]);

        $categoryCounts = Product::query()
            ->where('is_active', true)
            ->selectRaw('category_id, COUNT(*) as total')
            ->groupBy('category_id')
            ->pluck('total', 'category_id')
            ->all();

        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'uuid', 'name', 'thumbnail', 'sort_order'])
            ->map(fn (Category $category): array => [
                'uuid' => $category->uuid,
                'name' => $category->name,
                'thumbnailUrl' => $category->thumbnail_url,
                'productCount' => (int) ($categoryCounts[$category->id] ?? 0),
            ])
            ->filter(fn (array $category): bool => $category['productCount'] > 0)
            ->sortByDesc('productCount')
            ->values()
            ->all();

        $products = Product::query()
            ->where('is_active', true)
            ->with(['category:id,uuid,name', 'images']);

        if ($filters['search'] !== '') {
            $term = '%'.$filters['search'].'%';

            $products->where(function ($query) use ($term): void {
                $query->where('title', 'like', $term)
                    ->orWhere('brand', 'like', $term)
                    ->orWhere('sku', 'like', $term)
                    ->orWhere('description', 'like', $term)
                    ->orWhereHas('category', fn ($category) => $category->where('name', 'like', $term));
            });
        }

        if ($filters['category'] !== '') {
            // The browser only sends a category UUID; the numeric key stays here.
            $categoryId = Category::query()
                ->where('uuid', $filters['category'])
                ->value('id');

            $products->where('category_id', is_numeric($categoryId) ? (int) $categoryId : 0);
        }

        match ($filters['sort']) {
            'price-asc' => $products->orderBy('price'),
            'price-desc' => $products->orderByDesc('price'),
            'rating' => $products->orderByDesc('rating'),
            default => $products
                ->orderByDesc('is_featured')
                ->orderByDesc('rating'),
        };

        $products->orderBy('uuid');

        $featured = Product::query()
            ->where('is_active', true)
            ->where('is_featured', true)
            ->with(['category:id,uuid,name', 'images'])
            ->orderByDesc('rating')
            ->orderBy('uuid')
            ->first();

        return Inertia::render('storefront/products/index', [
            'products' => ProductResource::collection(
                $products->paginate(12)->withQueryString()
            ),
            'categories' => $categories,
            'featured' => $featured ? ProductResource::make($featured)->resolve($request) : null,
            'filters' => $filters,
            'counts' => [
                'products' => Product::query()->where('is_active', true)->count(),
                'categories' => count($categories),
            ],
        ]);
    }

    /**
     * Route model binding resolves the public UUID; the numeric key is only
     * used inside this query for related products.
     */
    public function show(Request $request, Product $product): Response
    {
        abort_unless($product->is_active, 404);

        $product->load(['category:id,uuid,name', 'images']);

        $related = Product::query()
            ->where('is_active', true)
            ->where('uuid', '!=', $product->uuid)
            ->with(['category:id,uuid,name', 'images'])
            ->orderByRaw('category_id = ? desc', [$product->category_id])
            ->orderByDesc('rating')
            ->orderBy('uuid')
            ->limit(4)
            ->get();

        return Inertia::render('storefront/products/show', [
            'product' => ProductResource::make($product)->resolve($request),
            'related' => $related
                ->map(fn (Product $item): array => ProductResource::make($item)->resolve($request))
                ->all(),
        ]);
    }

    /**
     * Small server-side suggestion list for the header search dialog.
     */
    public function suggest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['sometimes', 'string', 'max:100'],
        ]);

        $term = trim((string) ($validated['query'] ?? ''));
        $products = Product::query()
            ->where('is_active', true)
            ->with(['category:id,uuid,name', 'images']);

        if ($term !== '') {
            $like = '%'.$term.'%';

            $products->where(function ($query) use ($like): void {
                $query->where('title', 'like', $like)
                    ->orWhere('brand', 'like', $like)
                    ->orWhereHas('category', fn ($category) => $category->where('name', 'like', $like));
            });
        }

        $products->orderByDesc('rating')->orderBy('uuid')->limit(8);

        return ProductResource::collection($products->get())->response();
    }


    
}
