<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * The single contract for delivery details shared by the address book and the
 * checkout form. Inertia payloads use camelCase; database columns use snake_case.
 */
final class DeliveryFields
{
    public const COUNTRIES = [
        'Tanzania',
        'Kenya',
        'Uganda',
        'Rwanda',
        'Burundi',
        'South Sudan',
    ];

    /**
     * Validation rules keyed by the frontend field names.
     *
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        return [
            'country' => ['required', 'string', Rule::in(self::COUNTRIES)],
            'name' => ['required', 'string', 'max:120'],
            'company' => ['nullable', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:160'],
            'city' => ['required', 'string', 'max:80'],
            'postalCode' => ['nullable', 'string', 'max:20'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:120'],
        ];
    }

    /**
     * The same rules under the checkout payload keys. Email is the exception:
     * checkout calls it `email`, not `deliveryEmail`.
     *
     * @return array<string, array<int, mixed>>
     */
    public static function checkoutRules(): array
    {
        $rules = [];

        foreach (self::rules() as $field => $fieldRules) {
            $key = $field === 'email' ? 'email' : 'delivery'.Str::studly($field);
            $rules[$key] = $fieldRules;
        }

        return $rules;
    }

    /**
     * Convert validated frontend values into database columns.
     *
     * @param  array<string, mixed>  $values
     * @return array<string, string|null>
     */
    public static function columns(array $values, string $prefix = ''): array
    {
        $columns = [];

        foreach (array_keys(self::rules()) as $field) {
            $key = $field === 'email'
                ? 'email'
                : ($prefix === '' ? $field : $prefix.Str::studly($field));
            $value = $values[$key] ?? null;
            $columns[Str::snake($field)] = is_string($value) ? trim($value) : $value;
        }

        foreach (['company', 'postal_code'] as $nullable) {
            if (isset($columns[$nullable]) && trim((string) $columns[$nullable]) === '') {
                $columns[$nullable] = null;
            }
        }

        return $columns;
    }

    /**
     * A camelCase Inertia payload, with empty strings for nullable fields.
     *
     * @return array<string, string>|null
     */
    public static function payload(?Model $record): ?array
    {
        if (! $record) {
            return null;
        }

        return [
            'country' => (string) $record->country,
            'name' => (string) $record->name,
            'company' => (string) ($record->company ?? ''),
            'address' => (string) $record->address,
            'city' => (string) $record->city,
            'postalCode' => (string) ($record->postal_code ?? ''),
            'phone' => (string) $record->phone,
            'email' => (string) $record->email,
        ];
    }
}
