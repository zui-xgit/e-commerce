<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductSaveRequest extends FormRequest
{
    /**
     * The admin route group already enforces authentication and the admin role.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalise FormData values before the rules run.
     */
    protected function prepareForValidation(): void
    {
        $input = $this->all();

        foreach ([
            'discount_percentage',
            'rating',
            'brand',
            'description',
            'availability_status',
            'shipping_information',
            'return_policy',
            'warranty_information',
        ] as $key) {
            if (($input[$key] ?? null) === '') {
                $input[$key] = null;
            }
        }

        foreach (['is_active', 'is_featured'] as $key) {
            $input[$key] = $this->boolean($key);
        }

        if (($input['minimum_order_quantity'] ?? '') === '') {
            $input['minimum_order_quantity'] = 1;
        }

        if (($input['stock'] ?? '') === '') {
            $input['stock'] = 0;
        }

        if (($input['discount_percentage'] ?? null) === null) {
            $input['discount_percentage'] = 0;
        }

        if (($input['rating'] ?? null) === null) {
            $input['rating'] = 0;
        }

        $this->merge($input);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        /** @var Product|null $product */
        $product = $this->route('product');

        $removedImages = $this->input('removed_images');
        $removedImages = is_array($removedImages)
            ? array_values(array_filter($removedImages, 'is_string'))
            : [];

        // Edits keep the stored thumbnail/gallery unless the form explicitly
        // replaces or removes them, so a fresh upload is only required when
        // there is nothing stored to fall back on.
        $needsThumbnail = $product === null || blank($product->thumbnail);
        $hasRemainingImages = $product !== null
            && $product->images()->whereNotIn('uuid', $removedImages)->exists();
        $needsGalleryImages = $product === null || ! $hasRemainingImages;

        return [
            'category_uuid' => ['required', 'string', Rule::exists('categories', 'uuid')],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'price' => ['required', 'integer', 'min:0'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'brand' => ['nullable', 'string', 'max:255'],
            'sku' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'sku')->ignore($product),
            ],
            'thumbnail' => [
                Rule::requiredIf($needsThumbnail),
                'nullable',
                'image',
                'max:2048',
            ],
            'clear_thumbnail' => ['nullable', 'boolean'],
            'minimum_order_quantity' => ['required', 'integer', 'min:1'],
            'availability_status' => [
                'nullable',
                Rule::in(['in_stock', 'out_of_stock', 'preorder', 'backorder']),
            ],
            'shipping_information' => ['nullable', 'string', 'max:2000'],
            'return_policy' => ['nullable', 'string', 'max:2000'],
            'warranty_information' => ['nullable', 'string', 'max:2000'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'images' => [
                Rule::requiredIf($needsGalleryImages),
                'nullable',
                'array',
                'max:8',
            ],
            'images.*' => ['required', 'image', 'max:2048'],
            'removed_images' => ['nullable', 'array'],
            'removed_images.*' => ['string', 'uuid'],
            'image_order' => ['nullable', 'array'],
            'image_order.*' => ['string', 'uuid'],
        ];
    }
}
