<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SiteSettingsUpdateRequest;
use App\Support\SiteSettings;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingsController extends Controller
{
    /**
     * Show the site settings form.
     */
    public function edit(): Response
    {
        return Inertia::render('admin/settings/site-settings', SiteSettings::payload());
    }

    /**
     * Persist the site settings.
     */
    public function update(SiteSettingsUpdateRequest $request): RedirectResponse
    {
        SiteSettings::save($request);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Site settings saved.')]);

        return to_route('admin.site-settings.edit');
    }
}
