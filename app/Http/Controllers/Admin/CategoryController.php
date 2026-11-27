<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategorySaveRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Public identifiers are always UUIDs. Every numeric ID is resolved from
     * those UUIDs here and stays on the server for database operations.
     */

    /**
     * Show the category catalogue.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->input('search', '')),
            'status' => (string) $request->input('status', 'all'),
            'sort' => (string) $request->input('sort', 'newest'),
        ];

        $query = Category::query()->withCount('products');

        if ($filters['search'] !== '') {
            $term = '%'.$filters['search'].'%';
            $query->where('name', 'like', $term);
        }

        match ($filters['status']) {
            'active' => $query->where('is_active', true),
            'inactive' => $query->where('is_active', false),
            default => null,
        };

        match ($filters['sort']) {
            'name' => $query->orderBy('name'),
            'sort_order' => $query->orderBy('sort_order')->orderBy('name'),
            'products' => $query->orderByDesc('products_count')->orderBy('name'),
            default => $query->latest('created_at'),
        };

        $categories = $query->paginate(10)
            ->withQueryString()
            ->through(fn (Category $category): array => [
                'uuid' => $category->uuid,
                'name' => $category->name,
                'thumbnail_url' => $category->thumbnail_url,
                'sort_order' => $category->sort_order,
                'is_active' => $category->is_active,
                'products_count' => $category->products_count,
                'created_at' => $category->created_at?->toDateString(),
            ]);

        return Inertia::render('admin/store/categories/index', [
            'categories' => $categories,
            'filters' => $filters,
            'counts' => [
                'all' => Category::count(),
                'active' => Category::where('is_active', true)->count(),
                'inactive' => Category::where('is_active', false)->count(),
            ],
        ]);
    }

    /**
     * Show a single category.
     */
    public function show(Category $category): Response
    {
        $category->loadCount('products');
        $category->load(['products' => fn ($query) => $query
            ->latest('created_at')
            ->limit(12)
            ->select(['uuid', 'category_id', 'title', 'sku', 'thumbnail', 'price', 'stock', 'is_active'])]);

        return Inertia::render('admin/store/categories/show', [
            'category' => [
                'uuid' => $category->uuid,
                'name' => $category->name,
                'thumbnail_url' => $category->thumbnail_url,
                'sort_order' => $category->sort_order,
                'is_active' => $category->is_active,
                'products_count' => $category->products_count,
                'created_at' => $category->created_at?->toDateString(),
                'products' => $category->products->map(fn (Product $product): array => [
                    'uuid' => $product->uuid,
                    'title' => $product->title,
                    'sku' => $product->sku,
                    'thumbnail_url' => $product->thumbnail_url,
                    'price' => $product->price,
                    'stock' => $product->stock,
                    'is_active' => $product->is_active,
                ])->all(),
            ],
        ]);
    }

    /**
     * Create a category.
     */
    public function store(CategorySaveRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $thumbnail = null;

        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $thumbnail = $file instanceof UploadedFile
                ? $this->storeFile($file, 'categories')
                : null;
        }

        $category = Category::create([
            'name' => $validated['name'],
            'thumbnail' => $thumbnail,
            'sort_order' => $validated['sort_order'],
            'is_active' => $validated['is_active'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Category ":name" created.', ['name' => $category->name]),
        ]);

        return redirect()->back();
    }

    /**
     * Update a category.
     */
    public function update(CategorySaveRequest $request, Category $category): RedirectResponse
    {
        $validated = $request->validated();
        $thumbnail = $category->thumbnail;

        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $thumbnail = $file instanceof UploadedFile
                ? $this->storeFile($file, 'categories')
                : null;
            $this->deleteFile($category->thumbnail);
        } elseif ($request->boolean('clear_thumbnail')) {
            $this->deleteFile($category->thumbnail);
            $thumbnail = null;
        }

        $category->update([
            'name' => $validated['name'],
            'thumbnail' => $thumbnail,
            'sort_order' => $validated['sort_order'],
            'is_active' => $validated['is_active'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Category ":name" updated.', ['name' => $category->name]),
        ]);

        return redirect()->back();
    }

    /**
     * Permanently delete a category.
     */
    public function destroy(Category $category): RedirectResponse
    {
        // Products are hard-deleted too, so this guard covers every product.
        if ($category->products()->exists()) {
            return back()->withErrors([
                'error' => __('Cannot remove ":name" because it still has products. Move or remove those products first.', ['name' => $category->name]),
            ]);
        }

        $this->deleteFile($category->thumbnail);
        $category->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Category ":name" removed.', ['name' => $category->name]),
        ]);

        return to_route('admin.categories-index');
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
