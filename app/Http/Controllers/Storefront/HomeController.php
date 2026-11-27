<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\Storefront\ProductResource;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * The storefront landing page: real banners, active categories, featured
     * picks and the newest products. Filtering and pagination happen here so
     * the browser never downloads the whole catalogue.
     */
    public function home(Request $request): Response
    {
        $filters = [
            'category' => (string) $request->input('category', ''),
            'sort' => (string) $request->input('sort', 'newest'),
        ];

        $request->validate([
            'category' => ['sometimes', 'string', 'max:36'],
            'sort' => ['sometimes', 'string', 'in:newest,recommended,price-asc,price-desc,rating'],
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
            ->all();

        $featured = Product::query()
            ->where('is_active', true)
            ->where('is_featured', true)
            ->with(['category:id,uuid,name', 'images'])
            ->orderByDesc('rating')
            ->orderBy('uuid')
            ->limit(5)
            ->get();

        $products = Product::query()
            ->where('is_active', true)
            ->with(['category:id,uuid,name', 'images']);

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
            'recommended' => $products
                ->orderByDesc('is_featured')
                ->orderByDesc('rating'),
            default => $products->orderByDesc('created_at'),
        };

        $products->orderBy('uuid');

        $banners = Banner::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['uuid', 'title', 'image_path', 'sort_order'])
            ->map(fn (Banner $banner): array => [
                'uuid' => $banner->uuid,
                'title' => $banner->title,
                'image_url' => $banner->image_url,
                'sort_order' => $banner->sort_order,
            ]);

        return Inertia::render('storefront/home', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'banners' => $banners,
            'categories' => $categories,
            'featured' => $featured
                ->map(fn (Product $product): array => ProductResource::make($product)->resolve($request))
                ->all(),
            'products' => ProductResource::collection(
                $products->paginate(12)->withQueryString()
            ),
            'filters' => $filters,
            'counts' => [
                'products' => Product::query()->where('is_active', true)->count(),
                'categories' => count($categories),
                'featured' => $featured->count(),
            ],
        ]);
    }
}
