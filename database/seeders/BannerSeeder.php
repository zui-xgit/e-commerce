<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class BannerSeeder extends Seeder
{
    /**
     * Seed the bundled storefront banners into the public disk and banners table.
     */
    public function run(): void
    {
        $seeded = 0;

        foreach ($this->bannerFiles() as $index => $path) {
            $fileName = pathinfo($path, PATHINFO_FILENAME);
            $title = Str::title(str_replace('-', ' ', $fileName));

            // Re-runs should not replace an image an admin has already chosen.
            $banner = Banner::query()->firstOrNew(['title' => $title]);

            if ($banner->exists && filled($banner->image_path)) {
                continue;
            }

            $stored = $this->storeFile($path, 'banners');

            if ($stored === null) {
                continue;
            }

            if (! $banner->exists) {
                $banner->uuid = (string) Str::uuid();
            }

            $banner->fill([
                'title' => $title,
                'image_path' => $stored,
                'sort_order' => $this->sortOrder($fileName, $index + 1),
                'is_active' => true,
            ])->save();

            $seeded++;
        }

        $this->command?->getOutput()->writeln(sprintf('  Banners: %d seeded.', $seeded));
    }

    /**
     * @return array<int, string>j
     */
    private function bannerFiles(): array
    {
        $directory = database_path('seeders/data/banners');

        if (! is_dir($directory)) {
            return [];
        }

        $files = array_values(array_filter(
            glob($directory.'/banner-*') ?: [],
            fn (string $path): bool => in_array(
                strtolower((string) pathinfo($path, PATHINFO_EXTENSION)),
                ['jpg', 'jpeg', 'png', 'webp'],
                true,
            ),
        ));

        usort($files, fn (string $left, string $right): int => strnatcmp($left, $right));

        return $files;
    }

    private function sortOrder(string $fileName, int $fallback): int
    {
        return preg_match('/(\d+)$/', $fileName, $matches) === 1
            ? max(1, (int) $matches[1])
            : $fallback;
    }

    /**
     * Store a bundled image on the public disk using the same layout as
     * BannerController::storeFile() (hashed names under banners/).
     */
    private function storeFile(string $path, string $directory): ?string
    {
        if (! is_file($path)) {
            return null;
        }

        $file = new UploadedFile($path, basename($path), null, null, true);
        $stored = $file->store($directory, 'public');

        return is_string($stored) ? $stored : null;
    }
}
