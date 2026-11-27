<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\OverviewController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SiteSettingsController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/admin', [AdminController::class, 'show'])->name('admin.show');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    // OVERVIEW
    Route::get('/dashboard', [OverviewController::class, 'dashboard'])->name('admin.dashboard');

    // STORE
    Route::get('admin/products/index', [ProductController::class, 'index'])->name('admin.products-index');
    Route::get('admin/products/show/{product:uuid}', [ProductController::class, 'show'])->name('admin.products-show');
    Route::post('admin/products', [ProductController::class, 'store'])->name('admin.products-store');
    Route::put('admin/products/{product:uuid}', [ProductController::class, 'update'])->name('admin.products-update');
    Route::delete('admin/products/{product:uuid}', [ProductController::class, 'destroy'])->name('admin.products-destroy');

    Route::get('admin/categories/index', [CategoryController::class, 'index'])->name('admin.categories-index');
    Route::get('admin/categories/show/{category:uuid}', [CategoryController::class, 'show'])->name('admin.categories-show');
    Route::post('admin/categories', [CategoryController::class, 'store'])->name('admin.categories-store');
    Route::put('admin/categories/{category:uuid}', [CategoryController::class, 'update'])->name('admin.categories-update');
    Route::delete('admin/categories/{category:uuid}', [CategoryController::class, 'destroy'])->name('admin.categories-destroy');

    // CONTENT
    Route::get('admin/content/banners/index', [BannerController::class, 'index'])->name('admin.banners-index');
    Route::get('admin/content/banners/show/{banner:uuid}', [BannerController::class, 'show'])->name('admin.banners-show');
    Route::post('admin/content/banners', [BannerController::class, 'store'])->name('admin.banners-store');
    Route::put('admin/content/banners/{banner:uuid}', [BannerController::class, 'update'])->name('admin.banners-update');
    Route::delete('admin/content/banners/{banner:uuid}', [BannerController::class, 'destroy'])->name('admin.banners-destroy');

    // SETTINGS
    Route::get('/admin/site-settings', [SiteSettingsController::class, 'edit'])
        ->name('admin.site-settings.edit');
    Route::put('/admin/site-settings', [SiteSettingsController::class, 'update'])
        ->name('admin.site-settings.update');
});
