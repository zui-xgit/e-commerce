<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use RuntimeException;

class SampleCatalogSeeder extends Seeder
{
    /**
     * Seed the bundled sample catalogue into the store tables.
     */
    public function run(): void
    {
        $categories = $this->readJson('categories/categories.json');
        $products = $this->readJson('products/products.json');

        $seededCategories = $this->seedCategories($categories);

        // Products reference the bundled JSON slug; categories are keyed by
        // name now that slug is no longer stored in the database.
        $categoryIds = [];
        $categoryNamesBySlug = [];

        foreach ($categories as $category) {
            $categoryNamesBySlug[(string) ($category['slug'] ?? '')] = (string) ($category['name'] ?? '');
        }

        $idsByName = Category::query()
            ->whereIn('name', array_values($categoryNamesBySlug))
            ->pluck('id', 'name')
            ->all();

        foreach ($categoryNamesBySlug as $slug => $name) {
            if (isset($idsByName[$name])) {
                $categoryIds[$slug] = $idsByName[$name];
            }
        }

        $seededProducts = 0;
        $seededImages = 0;

        foreach ($products as $item) {
            $sku = trim((string) ($item['sku'] ?? ''));
            $categorySlug = (string) ($item['category'] ?? '');

            if ($sku === '' || ! isset($categoryIds[$categorySlug])) {
                continue;
            }

            $product = Product::query()->firstOrNew(['sku' => $sku]);
            $isNew = ! $product->exists;

            if ($isNew) {
                $product->uuid = (string) Str::uuid();
            }

            $discount = round(max(0.0, min(100.0, (float) ($item['discountPercentage'] ?? 0))), 2);
            $rawPrice = max(0.0, (float) ($item['price'] ?? 0));
            $price = (int) round($rawPrice);

            $product->fill([
                'category_id' => (int) $categoryIds[$categorySlug],
                'title' => (string) ($item['title'] ?? $sku),
                'description' => $this->nullableString($item['description'] ?? null),
                'price' => $price,
                'discount_percentage' => $discount,
                'rating' => round(max(0.0, min(5.0, (float) ($item['rating'] ?? 0))), 2),
                'brand' => $this->nullableString($item['brand'] ?? null),
                'sku' => $sku,
                'minimum_order_quantity' => max(1, (int) ($item['minimumOrderQuantity'] ?? 1)),
                'availability_status' => $this->nullableString($item['availabilityStatus'] ?? null),
                'shipping_information' => $this->nullableString($item['shippingInformation'] ?? null),
                'return_policy' => $this->nullableString($item['returnPolicy'] ?? null),
                'warranty_information' => $this->nullableString($item['warrantyInformation'] ?? null),
                'reviews' => is_array($item['reviews'] ?? null) ? $item['reviews'] : null,
                'stock' => max(0, (int) ($item['stock'] ?? 0)),
                'is_active' => true,
                'is_featured' => false,
            ]);

            if ($isNew) {
                $thumbnailPath = (string) ($item['localThumbnail'] ?? ($this->folder($item).'/thumbnail.webp'));

                $product->thumbnail = $this->storeFile(
                    $this->inDataFolder('products', $thumbnailPath),
                    'products/thumbnails',
                );
            }

            $product->save();
            $seededProducts++;

            if ($isNew || ! $product->images()->exists()) {
                $seededImages += $this->seedGallery($product, $item);
            }
        }

        $this->command?->getOutput()->writeln(sprintf(
            '  Sample catalogue: %d categories, %d products, %d gallery images.',
            $seededCategories,
            $seededProducts,
            $seededImages,
        ));
    }

    /**
     * @param  array<int, array<string, mixed>>  $categories
     */
    private function seedCategories(array $categories): int
    {
        foreach ($categories as $index => $data) {
            // The JSON slug still identifies the bundled image folder and the
            // product-to-category mapping, but is no longer a database column.
            $slug = (string) ($data['slug'] ?? Str::slug((string) ($data['name'] ?? '')));
            $name = (string) ($data['name'] ?? $slug);

            $category = Category::firstOrNew(['name' => $name]);
            $isNew = ! $category->exists;

            if ($isNew) {
                $category->uuid = (string) Str::uuid();
            }

            $category->fill([
                'name' => $name,
                'sort_order' => (int) ($data['sortOrder'] ?? $index),
                'is_active' => true,
            ]);

            if ($isNew) {
                $imagePath = (string) ($data['localImage'] ?? ($slug.'/image.webp'));

                $category->thumbnail = $this->storeFile(
                    $this->inDataFolder('categories', $imagePath),
                    'categories',
                );
            }

            $category->save();
        }

        return count($categories);
    }

    /**
     * Numbered images go to the gallery; thumbnail.* is the product thumbnail only.
     *
     * @param  array<string, mixed>  $item
     */
    private function seedGallery(Product $product, array $item): int
    {
        $paths = $item['localImages'] ?? [];

        if (! is_array($paths) || $paths === []) {
            $paths = $this->galleryPathsFromUrls($item);
        }

        $paths = array_map(
            fn ($path) => $this->inDataFolder('products', (string) $path),
            $paths,
        );

        $paths = array_values(array_filter($paths, function ($path): bool {
            $name = basename(str_replace('\\', '/', (string) $path));

            return preg_match('/^\d+\./', $name) === 1;
        }));

        usort($paths, function ($left, $right): int {
            preg_match('/^(\d+)/', basename(str_replace('\\', '/', (string) $left)), $a);
            preg_match('/^(\d+)/', basename(str_replace('\\', '/', (string) $right)), $b);

            return ((int) ($a[1] ?? 0)) <=> ((int) ($b[1] ?? 0));
        });

        $count = 0;

        foreach ($paths as $path) {
            $stored = $this->storeFile((string) $path, 'products/gallery');

            if ($stored === null) {
                continue;
            }

            $image = $product->images()->make([
                'path' => $stored,
                'alt' => $product->title,
                'sort_order' => ++$count,
            ]);
            $image->uuid = (string) Str::uuid();
            $image->save();
        }

        return $count;
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array<int, string>
     */
    private function galleryPathsFromUrls(array $item): array
    {
        $folder = $this->folder($item);
        $paths = [];

        foreach ((array) ($item['images'] ?? []) as $url) {
            $name = basename(parse_url((string) $url, PHP_URL_PATH) ?: '');

            if (preg_match('/^\d+\./', $name) === 1) {
                $paths[] = $folder === '' ? $name : $folder.'/'.$name;
            }
        }

        return $paths;
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function folder(array $item): string
    {
        return (string) ($item['folder'] ?? '');
    }

    private function nullableString(mixed $value): ?string
    {
        return is_scalar($value) && trim((string) $value) !== ''
            ? trim((string) $value)
            : null;
    }

    /**
     * Store a local seed image on the public disk using the same layout as the
     * admin controllers (hashed names under categories/, products/thumbnails/
     * and products/gallery/).
     */
    private function storeFile(string $relativePath, string $directory): ?string
    {
        $path = $this->dataPath($relativePath);

        if (! is_file($path)) {
            return null;
        }

        $file = new UploadedFile($path, basename($path), null, null, true);
        $stored = $file->store($directory, 'public');

        return is_string($stored) ? $stored : null;
    }

    /**
     * @return array<int, mixed>
     */
    private function readJson(string $relativePath): array
    {
        $path = $this->dataPath($relativePath);
        $contents = file_get_contents($path);

        if ($contents === false) {
            throw new RuntimeException("Unable to read seed data at [{$path}].");
        }

        $data = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);

        return is_array($data) ? $data : [];
    }

    private function inDataFolder(string $folder, string $path): string
    {
        $path = ltrim(str_replace('\\', '/', $path), '/');

        return Str::startsWith($path, $folder.'/') ? $path : $folder.'/'.$path;
    }

    private function dataPath(string $relativePath): string
    {
        return database_path('seeders/data/'.ltrim(str_replace('\\', '/', $relativePath), '/'));
    }
}
