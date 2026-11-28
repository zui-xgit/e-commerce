<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;
    use HasUuids;

    /** @var list<string> */
    protected $fillable = [
        'category_id',
        'title',
        'description',
        'price',
        'discount_percentage',
        'rating',
        'brand',
        'sku',
        'thumbnail',
        'minimum_order_quantity',
        'availability_status',
        'shipping_information',
        'return_policy',
        'warranty_information',
        'reviews',
        'stock',
        'is_active',
        'is_featured',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'price' => 'integer',
        'discount_percentage' => 'float',
        'rating' => 'float',
        'minimum_order_quantity' => 'integer',
        'stock' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'reviews' => 'array',
    ];

    /**
     * Get the columns that should receive a unique identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    /** @var list<string> */
    protected $appends = ['thumbnail_url'];

    protected static function booted(): void
    {
        static::creating(function (Product $product): void {
            $product->uuid ??= (string) Str::uuid();
        });
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return HasMany<ProductImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    protected function thumbnailUrl(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                if (! is_string($this->thumbnail) || $this->thumbnail === '') {
                    return null;
                }

                return Storage::disk('public')->exists($this->thumbnail)
                    ? Storage::url($this->thumbnail)
                    : null;
            },
        );
    }

    /**
     * The one place where a sale price is derived from the catalogue fields.
     * Every storefront surface reads this value instead of calculating its own.
     */
    protected function discountedPrice(): Attribute
    {
        return Attribute::make(
            get: function (): int {
                $discount = max(0.0, min(100.0, (float) $this->discount_percentage));

                return (int) round((int) $this->price * (1 - $discount / 100));
            },
        );
    }
}
