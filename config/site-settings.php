<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Site setting groups
    |--------------------------------------------------------------------------
    |
    | The groups below drive the admin settings screen. Each setting in the
    | `settings` array belongs to one of these groups.
    |
    */

    'groups' => [
        'identity' => [
            'label' => 'Store identity',
            'description' => 'The name, marks and short description used across the store.',
        ],
        'contact' => [
            'label' => 'Contact details',
            'description' => 'How customers can reach the store and when it is open.',
        ],
        'localization' => [
            'label' => 'Locale & currency',
            'description' => 'Default language, time zone and display currency.',
        ],
        'seo' => [
            'label' => 'Search & sharing',
            'description' => 'Metadata used by search engines and social previews.',
        ],
        'social' => [
            'label' => 'Social links',
            'description' => 'Profiles and messaging channels shown in the storefront.',
        ],
        'maintenance' => [
            'label' => 'Maintenance',
            'description' => 'Control planned downtime and the message visitors see.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Site setting definitions
    |--------------------------------------------------------------------------
    |
    | Every site-wide value has one definition here. `type` controls both the
    | admin control and how the stored value is cast when read back.
    |
    */

    'settings' => [
        'site_name' => [
            'group' => 'identity',
            'label' => 'Site name',
            'type' => 'string',
            'default' => 'ShopHub',
            'help' => 'Shown in the header, emails and the browser title.',
            'placeholder' => 'ShopHub',
            'rules' => ['required', 'string', 'max:120'],
        ],
        'site_tagline' => [
            'group' => 'identity',
            'label' => 'Tagline',
            'type' => 'string',
            'default' => 'Everyday essentials, delivered simply.',
            'help' => 'A short line about the store. Keep it under 180 characters.',
            'placeholder' => 'Everyday essentials, delivered simply.',
            'rules' => ['nullable', 'string', 'max:180'],
        ],
        'site_logo' => [
            'group' => 'identity',
            'label' => 'Logo',
            'type' => 'file',
            'default' => null,
            'help' => 'PNG, JPG, WebP or SVG. Up to 2 MB. Transparent backgrounds recommended.',
            'accept' => '.png,.jpg,.jpeg,.webp,.svg',
            'rules' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,svg', 'max:2048'],
        ],
        'site_favicon' => [
            'group' => 'identity',
            'label' => 'Favicon',
            'type' => 'file',
            'default' => null,
            'help' => 'Square PNG, ICO or SVG. Up to 1 MB.',
            'accept' => '.png,.ico,.svg',
            'rules' => ['nullable', 'file', 'mimes:png,ico,svg', 'max:1024'],
        ],

        'contact_email' => [
            'group' => 'contact',
            'label' => 'Contact email',
            'type' => 'email',
            'default' => 'hello@shophub.test',
            'help' => 'Customer messages and order notifications use this address.',
            'placeholder' => 'hello@shophub.test',
            'rules' => ['required', 'email', 'max:180'],
        ],
        'contact_phone' => [
            'group' => 'contact',
            'label' => 'Phone number',
            'type' => 'string',
            'default' => '',
            'help' => 'Include the country code, for example +255 700 000 000.',
            'placeholder' => '+255 700 000 000',
            'rules' => ['nullable', 'string', 'max:40'],
        ],
        'contact_address' => [
            'group' => 'contact',
            'label' => 'Physical address',
            'type' => 'text',
            'default' => '',
            'help' => 'Shown on the contact page and store policies.',
            'placeholder' => 'Street, city, country',
            'rules' => ['nullable', 'string', 'max:500'],
        ],
        'business_hours' => [
            'group' => 'contact',
            'label' => 'Business hours',
            'type' => 'string',
            'default' => 'Mon–Fri, 9:00–18:00',
            'help' => 'A short human-readable schedule.',
            'placeholder' => 'Mon–Fri, 9:00–18:00',
            'rules' => ['nullable', 'string', 'max:120'],
        ],

        // 'locale' => [
    //     'group' => 'localization',
        //     'label' => 'Default language',
        //     'type' => 'select',
        //     'default' => 'en',
        //     'help' => 'The language used for new storefront sessions.',
        //     'options' => [
        //         'en' => 'English',
        //         'sw' => 'Swahili',
        //     ],
        //     'rules' => ['required', 'string'],
        // ],
        'timezone' => [
            'group' => 'localization',
            'label' => 'Time zone',
            'type' => 'select',
            'default' => 'Africa/Dar_es_Salaam',
            'help' => 'Used for order timestamps and scheduled reports.',
            'options' => 'timezones',
            'rules' => ['required', 'string'],
        ],
        'currency' => [
            'group' => 'localization',
            'label' => 'Display currency',
            'type' => 'select',
            'default' => 'TZS',
            'help' => 'The currency used when prices are shown.',
            'options' => [
                'TZS' => 'TZS — Tanzanian shilling',
                'KES' => 'KES — Kenyan shilling',
                'UGX' => 'UGX — Ugandan shilling',
                'USD' => 'USD — US dollar',
                // 'EUR' => 'EUR — Euro',
                // 'GBP' => 'GBP — British pound',
            ],
            'rules' => ['required', 'string'],
        ],

        'meta_title' => [
            'group' => 'seo',
            'label' => 'Default page title',
            'type' => 'string',
            'default' => 'ShopHub — Online store',
            'help' => 'Used when a page does not set its own title.',
            'placeholder' => 'ShopHub — Online store',
            'rules' => ['nullable', 'string', 'max:120'],
        ],
        'meta_description' => [
            'group' => 'seo',
            'label' => 'Meta description',
            'type' => 'text',
            'default' => 'Shop everyday essentials from ShopHub, with simple checkout and local delivery.',
            'help' => 'Aim for 150–160 characters. Search engines may truncate longer text.',
            'placeholder' => 'A short description of the store',
            'rules' => ['nullable', 'string', 'max:320'],
        ],
        'meta_keywords' => [
            'group' => 'seo',
            'label' => 'Keywords',
            'type' => 'string',
            'default' => '',
            'help' => 'Comma-separated phrases. Search engines may ignore these.',
            'placeholder' => 'online shop, groceries, delivery',
            'rules' => ['nullable', 'string', 'max:255'],
        ],
        'og_image' => [
            'group' => 'seo',
            'label' => 'Social preview image',
            'type' => 'file',
            'default' => null,
            'help' => 'A wide image used when links are shared. Up to 2 MB.',
            'accept' => '.png,.jpg,.jpeg,.webp',
            'rules' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
        ],

        'facebook_url' => [
            'group' => 'social',
            'label' => 'Facebook',
            'type' => 'url',
            'default' => '',
            'help' => 'Full profile or page URL.',
            'placeholder' => 'https://facebook.com/shophub',
            'rules' => ['nullable', 'url', 'max:255'],
        ],
        'instagram_url' => [
            'group' => 'social',
            'label' => 'Instagram',
            'type' => 'url',
            'default' => '',
            'help' => 'Full profile URL.',
            'placeholder' => 'https://instagram.com/shophub',
            'rules' => ['nullable', 'url', 'max:255'],
        ],
        'twitter_url' => [
            'group' => 'social',
            'label' => 'X / Twitter',
            'type' => 'url',
            'default' => '',
            'help' => 'Full profile URL.',
            'placeholder' => 'https://x.com/shophub',
            'rules' => ['nullable', 'url', 'max:255'],
        ],
        'youtube_url' => [
            'group' => 'social',
            'label' => 'YouTube',
            'type' => 'url',
            'default' => '',
            'help' => 'Full channel URL.',
            'placeholder' => 'https://youtube.com/@shophub',
            'rules' => ['nullable', 'url', 'max:255'],
        ],
        'tiktok_url' => [
            'group' => 'social',
            'label' => 'TikTok',
            'type' => 'url',
            'default' => '',
            'help' => 'Full profile URL.',
            'placeholder' => 'https://tiktok.com/@shophub',
            'rules' => ['nullable', 'url', 'max:255'],
        ],
        'whatsapp_number' => [
            'group' => 'social',
            'label' => 'WhatsApp number',
            'type' => 'string',
            'default' => '',
            'help' => 'Include the country code without spaces or a leading plus.',
            'placeholder' => '255700000000',
            'rules' => ['nullable', 'string', 'max:30'],
        ],

        'maintenance_mode' => [
            'group' => 'maintenance',
            'label' => 'Maintenance mode',
            'type' => 'boolean',
            'default' => false,
            'help' => 'Temporarily show a holding page to storefront visitors.',
            'rules' => ['nullable', 'boolean'],
        ],
        'maintenance_message' => [
            'group' => 'maintenance',
            'label' => 'Maintenance message',
            'type' => 'text',
            'default' => 'We are making a few improvements. We will be back shortly.',
            'help' => 'Shown to visitors while maintenance mode is on.',
            'placeholder' => 'We are making a few improvements.',
            'rules' => ['nullable', 'string', 'max:500'],
        ],
    ],
];
