<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
// use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Contracts\LogoutResponse;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Contracts\RegisterResponse;
// use Override;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Laravel only sends the verification email at registration, not on login.
        // So for unverified users, we send it again here and take them to the verify page
        $this->app->instance(LoginResponse::class, new class implements LoginResponse {
            public function toResponse($request)
            {
               $user = $request->user(); 
               if($user instanceof MustVerifyEmail  && ! $user->hasVerifiedEmail()){
                    try {
                        $user->sendEmailVerificationNotification();
                    } catch (\Throwable $e) {
                        // Log the error, but still let the user reach the verify page
                        // where they can use the "Resend" button.
                        report($e);
                    }
                    Inertia::flash('toast', ['type' => 'success', 'message' => __('Please verify your email')]);
                    return redirect()->route('verification.notice');
               }
               Inertia::flash('toast', ['type' => 'success', 'message' => __('Logged in successfully.')]);
               
               return $user->hasRole('admin')
                        ? redirect()->route('admin.overview')
                        : redirect()->back();
            }
        });


        // The verification email is already sent on registration by Laravel's
        // Registered event listener, so we don't send it here, only redirect. 
        $this->app->instance(RegisterResponse::class, new class implements RegisterResponse {
              public function toResponse($request)
              {
                    $user = $request->user(); 
                    if($user instanceof MustVerifyEmail  && ! $user->hasVerifiedEmail()){
                        Inertia::flash('toast', ['type' => 'success', 'message' => __('Please verify your email')]);
                        return redirect()->route('verification.notice');
                    }
                    Inertia::flash('toast', ['type' => 'success', 'message' => __('Registered and logged in successfully.')]);
                    return redirect('/'); 
              }
        });



        $this->app->instance(LogoutResponse::class, new class implements LogoutResponse {
            public function toResponse($request)
            {
                Inertia::flash('toast', ['type' => 'success', 'message' => __('Log out successfully.')]);


                return $request->input('from') === 'admin' 
                        ? redirect()->route('admin.show')   
                        : redirect()->back();
            }
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();


        $this->configureAuthenticateUsing(); 
    }


    private function configureAuthenticateUsing(): void
    {
         Fortify::authenticateUsing(function (Request $request) {
            $user = User::where('email', $request->email)->first();

            if (! $user || ! Hash::check($request->password, $user->password)) {
                return null;
            }

            $portal = $request->input('portal');

            if ($portal === 'customer' && $user->hasRole('customer')) {
                return $user;
            }

            if ($portal === 'admin' && $user->hasRole('admin')) {
                return $user;
            }

            return null;
        });
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        // Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
        //     'canResetPassword' => Features::enabled(Features::resetPasswords()),
        //     'status' => $request->session()->get('status'),
        // ]));

         // Fortify::registerView(fn () => Inertia::render('auth/register', [
        //     'passwordRules' => Password::defaults()->toPasswordRulesString(),
        // ]));


        Fortify::loginView(fn () => redirect('/'));
        Fortify::registerView(fn () => redirect('/'));


        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));    

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

       

    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

    }
}
