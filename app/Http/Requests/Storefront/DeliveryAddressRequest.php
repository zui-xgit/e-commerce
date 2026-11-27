<?php

namespace App\Http\Requests\Storefront;

use App\Support\DeliveryFields;
use Illuminate\Foundation\Http\FormRequest;

class DeliveryAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return DeliveryFields::rules();
    }
}
