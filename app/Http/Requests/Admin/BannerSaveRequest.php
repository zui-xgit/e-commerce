<?php

namespace App\Http\Requests\Admin;

use App\Models\Banner;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BannerSaveRequest extends FormRequest
{
    /**
     * The admin route group already enforces authentication and the admin role.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $input = $this->all();
        $input['is_active'] = $this->boolean('is_active');

        if (blank($input['sort_order'] ?? null)) {
            $input['sort_order'] = 0;
        }

        $this->merge($input);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        /** @var Banner|null $banner */
        $banner = $this->route('banner');

        // Every banner must end up with an image: creating one (or editing a
        // banner that has no stored image) requires an upload, while an edit
        // with an existing image may omit the file to keep it.
        $needsUpload = $banner === null || blank($banner->image_path);

        return [
            'title' => ['required', 'string', 'max:255'],
            'image' => [
                Rule::requiredIf($needsUpload),
                'nullable',
                'image',
                'mimes:jpeg,png,webp',
                'max:4096',
                // Rule::dimensions()
                //     ->minWidth(1280)
                //     ->minHeight(560)
                //     ->ratioBetween(2, 3),
            ],
            'sort_order' => ['required', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image.mimes' => 'The banner image must be a JPG, PNG or WebP file.',
            'image.max' => 'The banner image may not be larger than 4 MB.',
            'image.dimensions' => 'The banner image must be at least 1280 × 560 px with a wide shape (2:1 to 3:1).',
        ];
    }
}
