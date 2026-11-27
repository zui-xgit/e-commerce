<?php

namespace Tests\Feature\Admin;

use App\Models\Banner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BannerImageValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $admin = User::factory()->create();
        $admin->assignRole(Role::create(['name' => 'admin']));

        $this->actingAs($admin);
    }

    public function test_creating_requires_an_image(): void
    {
        $response = $this->post(route('admin.banners-store'), [
            'title' => 'No image',
            'sort_order' => 0,
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors('image');
        $this->assertDatabaseMissing('banners', ['title' => 'No image']);
    }

    public function test_minimum_banner_dimensions_are_accepted(): void
    {
        $response = $this->post(route('admin.banners-store'), [
            'title' => 'Summer sale hero',
            'sort_order' => 0,
            'is_active' => true,
            'image' => UploadedFile::fake()->image('hero.png', 1280, 560),
        ]);

        $response->assertRedirect(route('admin.banners-index'));
        $this->assertDatabaseHas('banners', ['title' => 'Summer sale hero']);
    }

    public function test_images_smaller_than_the_minimum_are_rejected(): void
    {
        $response = $this->post(route('admin.banners-store'), [
            'title' => 'Too small',
            'sort_order' => 0,
            'is_active' => true,
            'image' => UploadedFile::fake()->image('small.png', 1200, 500),
        ]);

        $response->assertSessionHasErrors('image');
        $this->assertDatabaseMissing('banners', ['title' => 'Too small']);
    }

    public function test_images_outside_the_banner_aspect_range_are_rejected(): void
    {
        $response = $this->post(route('admin.banners-store'), [
            'title' => 'Too tall',
            'sort_order' => 0,
            'is_active' => true,
            'image' => UploadedFile::fake()->image('portrait.png', 1280, 800),
        ]);

        $response->assertSessionHasErrors('image');
        $this->assertDatabaseMissing('banners', ['title' => 'Too tall']);
    }

    public function test_updating_can_keep_the_existing_image(): void
    {
        $banner = Banner::create([
            'title' => 'Existing banner',
            'image_path' => 'banners/existing.png',
            'sort_order' => 0,
            'is_active' => true,
        ]);

        $response = $this->post(route('admin.banners-update', $banner->uuid), [
            '_method' => 'put',
            'title' => 'Renamed banner',
            'sort_order' => 0,
            'is_active' => true,
            'image' => null,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('banners', [
            'uuid' => $banner->uuid,
            'title' => 'Renamed banner',
            'image_path' => 'banners/existing.png',
        ]);
    }
}
    