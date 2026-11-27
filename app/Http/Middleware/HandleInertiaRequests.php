<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Storage;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? [
                    'uuid' => $request->user()->uuid, 
                    'name' => $request->user()->name, 
                    'email' => $request->user()->email, 
                    'roles' => $request->user()->getRoleNames()->values() ,
                    'permissions' => $request->user()->getAllPermissions()->pluck('name')->values() ,
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'settings' => fn () => [
                // identity
                'site_name'    => SiteSetting::get('site_name', config('app.name')),
                'site_tagline' => SiteSetting::get('site_tagline'),
                'site_logo'    => ($logo = SiteSetting::get('site_logo')) ? Storage::url($logo) : null,
                'site_favicon' => ($favicon = SiteSetting::get('site_favicon')) ? Storage::url($favicon) : null,

                // contact
                'contact_email'   => SiteSetting::get('contact_email', 'hello@shophub.test'),
                'contact_phone'   => SiteSetting::get('contact_phone'),
                'contact_address' => SiteSetting::get('contact_address'),
                'business_hours'  => SiteSetting::get('business_hours', 'Mon–Fri, 9:00–18:00'),

                // localization
                'timezone' => SiteSetting::get('timezone', 'Africa/Dar_es_Salaam'),
                'currency' => SiteSetting::get('currency', 'TZS'),

                // seo
                'meta_title'       => SiteSetting::get('meta_title', 'ShopHub — Online store'),
                'meta_description' => SiteSetting::get('meta_description'),
                'meta_keywords'    => SiteSetting::get('meta_keywords'),
                'og_image'         => ($og = SiteSetting::get('og_image')) ? Storage::url($og) : null,

                // social
                'facebook_url'    => SiteSetting::get('facebook_url'),
                'instagram_url'   => SiteSetting::get('instagram_url'),
                'twitter_url'     => SiteSetting::get('twitter_url'),
                'youtube_url'     => SiteSetting::get('youtube_url'),
                'tiktok_url'      => SiteSetting::get('tiktok_url'),
                'whatsapp_number' => SiteSetting::get('whatsapp_number'),

            ],
        ];
    }
}
