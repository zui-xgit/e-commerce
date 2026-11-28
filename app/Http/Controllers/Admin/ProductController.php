<?php

namespace App\Http\Controllers\Admin;

use App\Enums\StockStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductSaveRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Support\SiteSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Public identifiers are always UUIDs. Every numeric ID is resolved from
     * those UUIDs here and stays on the server for database operations.
     */

    /**
     * Show the catalogue workbench.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->input('search', '')),
            'category' => (string) $request->input('category', ''),
            'status' => (string) $request->input('status', 'all'),
            'sort' => (string) $request->input('sort', 'newest'),
        ];

        $lowStockRange = StockStatus::lowStockRange(SiteSettings::lowStockThreshold());

        $query = Product::query()
            ->with(['category:id,uuid,name', 'images']);

        if ($filters['search'] !== '') {
            $term = '%'.$filters['search'].'%';

            $query->where(function ($query) use ($term): void {
                $query->where('title', 'like', $term)
                    ->orWhere('sku', 'like', $term)
                    ->orWhere('brand', 'like', $term)
                    ->orWhere('description', 'like', $term);
            });
        }

        if ($filters['category'] !== '') {
            // The browser only ever sends a category UUID; filter by its ID.
            $categoryIds = Category::query()
                ->where('uuid', $filters['category'])
                ->pluck('id');

            $query->whereIn('category_id', $categoryIds);
        }

        match ($filters['status']) {
            'active' => $query->where('is_active', true),
            'inactive' => $query->where('is_active', false),
            'featured' => $query->where('is_featured', true),
            'out_of_stock' => $query->where('stock', '<', 1),
            'low_stock' => $query->whereBetween('stock', $lowStockRange),
            default => null,
        };

        match ($filters['sort']) {
            'title' => $query->orderBy('title'),
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'stock' => $query->orderBy('stock'),
            default => $query->latest('created_at'),
        };

        $products = $query->paginate(10)
            ->withQueryString()
            ->through(fn (Product $product): array => [
                'uuid' => $product->uuid,
                'title' => $product->title,
                'sku' => $product->sku,
                'brand' => $product->brand,
                'description' => $product->description,
                'category' => $product->category?->only(['uuid', 'name']),
                'thumbnail_url' => $product->thumbnail_url,
                'price' => $product->price,
                'discount_percentage' => $product->discount_percentage,
                'discounted_price' => $product->discounted_price,
                'rating' => $product->rating,
                'stock' => $product->stock,
                'minimum_order_quantity' => $product->minimum_order_quantity,
                'stock_status' => $product->stock_status->value,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'shipping_information' => $product->shipping_information,
                'return_policy' => $product->return_policy,
                'warranty_information' => $product->warranty_information,
                'images_count' => $product->images->count(),
                'images' => $product->images->map(fn (ProductImage $image): array => [
                    'uuid' => $image->uuid,
                    'url' => $image->url,
                    'alt' => $image->alt,
                    'sort_order' => $image->sort_order,
                ])->all(),
                'created_at' => $product->created_at?->toDateString(),
            ]);

        return Inertia::render('admin/store/products/index', [
            'products' => $products,
            'categories' => Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['uuid', 'name']),
            'filters' => $filters,
            'counts' => [
                'all' => Product::count(),
                'active' => Product::where('is_active', true)->count(),
                'out_of_stock' => Product::where('stock', '<', 1)->count(),
                'low_stock' => Product::whereBetween('stock', $lowStockRange)->count(),
            ],
        ]);
    }

    /**
     * Show a single product and its gallery.
     */
    public function show(Product $product): Response
    {
        $product->load(['category:id,uuid,name', 'images']);

        return Inertia::render('admin/store/products/show', [
            'product' => [
                'uuid' => $product->uuid,
                'title' => $product->title,
                'sku' => $product->sku,
                'brand' => $product->brand,
                'description' => $product->description,
                'category' => $product->category?->only(['uuid', 'name']),
                'thumbnail_url' => $product->thumbnail_url,
                'price' => $product->price,
                'discount_percentage' => $product->discount_percentage,
                'discounted_price' => $product->discounted_price,
                'rating' => $product->rating,
                'stock' => $product->stock,
                'minimum_order_quantity' => $product->minimum_order_quantity,
                'stock_status' => $product->stock_status->value,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'shipping_information' => $product->shipping_information,
                'return_policy' => $product->return_policy,
                'warranty_information' => $product->warranty_information,
                'created_at' => $product->created_at?->toDateString(),
                'images' => $product->images->map(fn (ProductImage $image): array => [
                    'uuid' => $image->uuid,
                    'url' => $image->url,
                    'alt' => $image->alt,
                    'sort_order' => $image->sort_order,
                ])->all(),
            ],
            'categories' => Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['uuid', 'name']),
        ]);
    }

    /**
     * Create a product and its gallery.
     */
    public function store(ProductSaveRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $thumbnail = null;

        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $thumbnail = $file instanceof UploadedFile
                ? $this->storeFile($file, 'products/thumbnails')
                : null;
        }

        $product = Product::create($this->productAttributes($validated, $thumbnail));

        $this->syncGallery($product, $validated, $request->file('images') ?? []);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Product ":title" created.', ['title' => $product->title]),
        ]);

        return to_route('admin.products.index');
    }

    /**
     * Update a product and its gallery.
     */
    public function update(ProductSaveRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();

        $thumbnail = $product->thumbnail;

        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $thumbnail = $file instanceof UploadedFile
                ? $this->storeFile($file, 'products/thumbnails')
                : null;
            $this->deleteFile($product->thumbnail);
        } elseif ($request->boolean('clear_thumbnail')) {
            $this->deleteFile($product->thumbnail);
            $thumbnail = null;
        }

        $product->update($this->productAttributes($validated, $thumbnail));

        $this->syncGallery($product, $validated, $request->file('images') ?? []);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Product ":title" updated.', ['title' => $product->title]),
        ]);

        return redirect()->back();
    }

    /**
     * Permanently delete the product row and its stored media.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $galleryPaths = $product->images()->pluck('path')->all();
        $thumbnailPath = $product->thumbnail;

        $product->images()->delete();
        $product->delete();

        foreach ($galleryPaths as $path) {
            $this->deleteFile($path);
        }

        $this->deleteFile($thumbnailPath);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Product ":title" removed.', ['title' => $product->title]),
        ]);

        return redirect()->back();
    }

    /**
     * Resolve a public category UUID to its internal primary key.
     */
    private function categoryId(string $uuid): int
    {
        $id = Category::query()->where('uuid', $uuid)->value('id');

        return is_numeric($id) ? (int) $id : 0;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function productAttributes(array $validated, ?string $thumbnail): array
    {
        return [
            'category_id' => $this->categoryId((string) $validated['category_uuid']),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'discount_percentage' => $validated['discount_percentage'] ?? 0,
            'rating' => $validated['rating'] ?? 0,
            'brand' => $validated['brand'] ?? null,
            'sku' => $validated['sku'],
            'thumbnail' => $thumbnail,
            'minimum_order_quantity' => $validated['minimum_order_quantity'],
            'shipping_information' => $validated['shipping_information'] ?? null,
            'return_policy' => $validated['return_policy'] ?? null,
            'warranty_information' => $validated['warranty_information'] ?? null,
            'stock' => $validated['stock'],
            'is_active' => $validated['is_active'],
            'is_featured' => $validated['is_featured'],
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  array<int, UploadedFile>  $files
     */
    private function syncGallery(Product $product, array $validated, array $files): void
    {
        $removed = is_array($validated['removed_images'] ?? null)
            ? $validated['removed_images']
            : [];

        if ($removed !== []) {
            // Only images belonging to this product can be removed.
            $images = $product->images()->whereIn('uuid', $removed)->get();

            foreach ($images as $image) {
                $this->deleteFile($image->path);
                $image->delete();
            }
        }

        $nextOrder = (int) $product->images()->max('sort_order') + 1;

        foreach ($files as $file) {
            $path = $this->storeFile($file, 'products/gallery');

            if ($path === null) {
                continue;
            }

            $product->images()->create([
                'path' => $path,
                'alt' => $product->title,
                'sort_order' => $nextOrder++,
            ]);
        }

        $order = is_array($validated['image_order'] ?? null)
            ? $validated['image_order']
            : [];

        if ($order === []) {
            return;
        }

        // Translate the client-side UUIDs back to IDs scoped to this product.
        $imageIds = $product->images()
            ->whereIn('uuid', $order)
            ->pluck('id', 'uuid')
            ->all();

        foreach (array_values($order) as $index => $imageUuid) {
            if (! is_string($imageUuid) || ! isset($imageIds[$imageUuid])) {
                continue;
            }

            $product->images()
                ->where('id', $imageIds[$imageUuid])
                ->update(['sort_order' => $index]);
        }
    }

    private function storeFile(UploadedFile $file, string $directory): ?string
    {
        $path = $file->store($directory, 'public');

        return is_string($path) ? $path : null;
    }

    private function deleteFile(?string $path): void
    {
        if (is_string($path) && $path !== '' && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
