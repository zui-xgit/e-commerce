<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use App\Support\SiteSettings;
use Illuminate\Database\Seeder;

class SiteSettingsSeeder extends Seeder
{
    /**
     * Seed the default site settings without overwriting saved values.
     */
    public function run(): void
    {
        foreach (SiteSettings::definitions() as $key => $definition) {
            $type = $definition['type'] ?? 'string';

            SiteSetting::seed(
                $key,
                $definition['default'] ?? null,
                $type === 'file' ? 'string' : $type,
                $definition['group'] ?? 'general',
            );
        }
    }
}
