<?php

use App\Http\Controllers\OauthController;
use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Socialite;

Route::get('/auth/google/redirect', function () {
    return Socialite::driver('google')->redirect();
})->name('oauth.google');

Route::get('/auth/google/callback', [OauthController::class, 'googleCallback']);