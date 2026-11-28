<?php

namespace App\Http\Requests\Admin;

use App\Support\SiteSettings;
use Illuminate\Foundation\Http\FormRequest;

class SiteSettingsUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return SiteSettings::rules();
    }

    /**
     * Remove upload fields that were left empty so their rules do not fire.
     */
    protected function prepareForValidation(): void
    {
        foreach (SiteSettings::definitions() as $key => $definition) {
            if (($definition['type'] ?? null) === 'file' && ! $this->hasFile($key)) {
                $this->request->remove($key);
            }
        }
    }
}
