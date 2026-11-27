<?php

use App\Http\Controllers\Storefront\AccountAddressController;
use App\Http\Controllers\Storefront\CartProductController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Models\User;
use App\Http\Controllers\Storefront\HomeController;
use App\Http\Controllers\Storefront\OrderController;
use App\Http\Controllers\Storefront\ProductController;
use Illuminate\Support\Facades\Route;


Route::inertia('/test', 'maintenance_mode'); 

Route::get('/', [HomeController::class, 'home'])->name('home');


Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/suggest', [ProductController::class, 'suggest'])->name('products.suggest');

Route::get('/products/{product:uuid}', [ProductController::class, 'show'])
    ->whereUuid('product')
    ->name('products.show');
    
Route::get('/cart/products', CartProductController::class)->name('cart.products');
Route::inertia('/cart', 'storefront/cart')->name('cart');

Route::middleware('can:checkout,'.User::class)->group(function () {
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
});

Route::inertia('/order-completed', 'storefront/order-completed')->name('order-completed');

Route::inertia('/about', 'storefront/about')->name('about');
Route::inertia('/contact', 'storefront/contact')->name('contact');
Route::inertia('/faq', 'storefront/faq')->name('faq');
Route::inertia('/maintenance', 'maintenance_mode')->name('maintenance');

Route::prefix('policies')->name('policies.')->group(function () {
    Route::inertia('/privacy', 'storefront/policies/privacy')->name('privacy');
    Route::inertia('/refund', 'storefront/policies/refund')->name('refund');
    Route::inertia('/shipping', 'storefront/policies/shipping')->name('shipping');
    Route::inertia('/terms', 'storefront/policies/terms')->name('terms');
});

Route::middleware(['auth', 'verified',  'role:customer'])->group(function () {
    
    Route::get('/account/orders', [OrderController::class, 'index'])
        ->name('account.orders.index');
    Route::get('/account/orders/{order:uuid}', [OrderController::class, 'show'])
        ->whereUuid('order')
        ->name('account.orders.show');
    Route::inertia('/account/profile', 'storefront/account/profile')
        ->name('account.profile');


    Route::get('/account/addresses', [AccountAddressController::class, 'index'])
        ->name('account.addresses.index');
    Route::post('/account/addresses', [AccountAddressController::class, 'store'])
        ->name('account.addresses.store');
    Route::put('/account/addresses', [AccountAddressController::class, 'update'])
        ->name('account.addresses.update');
    Route::delete('/account/addresses', [AccountAddressController::class, 'destroy'])
        ->name('account.addresses.destroy');
});


require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/oauth.php';   
