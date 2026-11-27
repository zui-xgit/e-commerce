<?php

namespace Tests\Feature\Storefront;

use App\Models\Banner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomeBannersTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_receives_active_banners_in_sort_order(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('banners/second.png', 'second');
        Storage::disk('public')->put('banners/first.png', 'first');

        Banner::create([
            'title' => 'Second banner',
            'image_path' => 'banners/second.png',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $first = Banner::create([
            'title' => 'First banner',
            'image_path' => 'banners/first.png',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Banner::create([
            'title' => 'Inactive banner',
            'image_path' => 'banners/first.png',
            'sort_order' => 0,
            'is_active' => false,
        ]);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('storefront/home')
                ->has('banners', 2)
                ->where('banners.0.uuid', $first->uuid)
                ->where('banners.0.title', 'First banner')
                ->where('banners.0.image_url', Storage::disk('public')->url('banners/first.png'))
                ->where('banners.1.title', 'Second banner'));
    }

    public function test_home_receives_an_empty_banner_list_when_none_are_active(): void
    {
        Banner::create([
            'title' => 'Inactive banner',
            'image_path' => 'banners/missing.png',
            'sort_order' => 0,
            'is_active' => false,
        ]);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('storefront/home')
                ->has('banners', 0));
    }
}
