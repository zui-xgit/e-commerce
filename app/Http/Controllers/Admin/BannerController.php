<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BannerSaveRequest;
use App\Models\Banner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class BannerController extends Controller
{
    /**
     * Public identifiers are always UUIDs. Numeric IDs stay server-side.
     */

    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->input('search', '')),
            'status' => (string) $request->input('status', 'all'),
            'sort' => (string) $request->input('sort', 'newest'),
        ];

        $query = Banner::query();

        if ($filters['search'] !== '') {
            $query->where('title', 'like', '%'.$filters['search'].'%');
        }

        match ($filters['status']) {
            'active' => $query->where('is_active', true),
            'inactive' => $query->where('is_active', false),
            default => null,
        };

        match ($filters['sort']) {
            'title' => $query->orderBy('title'),
            'sort_order' => $query->orderBy('sort_order')->orderByDesc('created_at'),
            'oldest' => $query->oldest('created_at'),
            default => $query->latest('created_at'),
        };

        $banners = $query->paginate(10)
            ->withQueryString()
            ->through(fn (Banner $banner): array => [
                'uuid' => $banner->uuid,
                'title' => $banner->title,
                'image_url' => $banner->image_url,
                'sort_order' => $banner->sort_order,
                'is_active' => $banner->is_active,
                'created_at' => $banner->created_at?->toDateString(),
            ]);

        return Inertia::render('admin/content/banners/index', [
            'banners' => $banners,
            'filters' => $filters,
            'counts' => [
                'all' => Banner::count(),
                'active' => Banner::where('is_active', true)->count(),
                'inactive' => Banner::where('is_active', false)->count(),
            ],
        ]);
    }

    public function show(Banner $banner): Response
    {
        return Inertia::render('admin/content/banners/show', [
            'banner' => [
                'uuid' => $banner->uuid,
                'title' => $banner->title,
                'image_url' => $banner->image_url,
                'sort_order' => $banner->sort_order,
                'is_active' => $banner->is_active,
                'created_at' => $banner->created_at?->toDateString(),
                'updated_at' => $banner->updated_at?->toDateString(),
            ],
        ]);
    }

    public function store(BannerSaveRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $newImagePath = null;

        DB::beginTransaction();

        try {
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $newImagePath = $file instanceof UploadedFile
                    ? $this->storeFile($file, 'banners')
                    : null;
            }

            $banner = Banner::create([
                'title' => $validated['title'],
                'image_path' => $newImagePath,
                'sort_order' => $validated['sort_order'],
                'is_active' => $validated['is_active'],
            ]);

            DB::commit();


            Inertia::flash('toast', [
                'type' => 'success',
                'message' => __('Banner ":title" created.', ['title' => $banner->title]),
            ]);

        } catch (Throwable $e) {
            DB::rollBack();
            report($e);

            if ($newImagePath) {
                $this->deleteFile($newImagePath);
            }

            return back()->with('error', 'Failed to create banner. Please try again.');
        }

      

        return to_route('admin.banners-index');
    }

  

    public function update(BannerSaveRequest $request, Banner $banner): RedirectResponse
    {
        $validated = $request->validated();
        $oldImagePath = $banner->image_path;
        $newImagePath = null;

        DB::beginTransaction();

        try {
            $imagePath = $oldImagePath;

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $newImagePath = $file instanceof UploadedFile
                    ? $this->storeFile($file, 'banners')
                    : null;
                $imagePath = $newImagePath;
            }

            $banner->update([
                'title' => $validated['title'],
                'image_path' => $imagePath,
                'sort_order' => $validated['sort_order'],
                'is_active' => $validated['is_active'],
            ]);

            DB::commit();



            Inertia::flash('toast', [
                'type' => 'success',
                'message' => __('Banner ":title" updated.', ['title' => $banner->title]),
            ]);
        } catch (Throwable $e) {
            DB::rollBack();
            report($e);
            
            
            if ($newImagePath) {
                $this->deleteFile($newImagePath);
            }
            

            return back()->with('error', 'Failed to update banner. Please try again.');
        }

        if ($newImagePath !== null) {
            $this->deleteFile($oldImagePath);
        }

      

        return redirect()->back();
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        $this->deleteFile($banner->image_path);
        $banner->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Banner ":title" removed.', ['title' => $banner->title]),
        ]);

        return to_route('admin.banners-index');
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
