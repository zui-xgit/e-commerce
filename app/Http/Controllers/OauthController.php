<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Socialite\Socialite;
use Spatie\Permission\Models\Role;
use Throwable;

class OauthController extends Controller
{
    
    public function googleCallback() {
         try{
            $googleUser = Socialite::driver('google')->user();
         }catch(Throwable $e){
            report($e);
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Unable to authenticate with Google. Please try again.')]);
            return redirect()->route('home');
         }

        $email = $googleUser->getEmail();
        if (! $email) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Google account did not provide an email address.')]);
            return redirect()->route('home');
        }


        $user = User::query()->where('google_id', $googleUser->getId())->first();
        if (! $user) {
            $user = User::query()->where('email', $email)->first();
        }


        if ($user && $user->hasRole('admin')) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Admins must sign in via the admin portal')]);
            return redirect()->route('admin.show');
        }


        DB::beginTransaction();     
        try{
            if (!$user) {
                $user = User::query()->create([
                    'name' => $googleUser->getName(),
                    'email' => $email,
                    'password' => Str::random(32),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                ]);
            } else {
                $user->forceFill([
                    'google_id' => $user->google_id ?: $googleUser->getId(),
                    'avatar' =>$user->avatar ?:  $googleUser->getAvatar(),
                    'email_verified_at' => $user->email_verified_at ?: now(),
                ])->save();
            }

            if (class_exists(Role::class) && !$user->hasRole('customer')) {
                $user->assignRole('customer');
            }

            DB::commit(); 

       

        }catch(Throwable  $e){
            DB::rollBack(); 
            report($e) ;
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Unable to complete sign-in. Please try again.')]);

            return redirect()->route('home');
        }


        Auth::login($user, true);
        request()->session()->regenerate();
        
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Logged in successfully')]);
        return redirect()->back();
       
    }
}
