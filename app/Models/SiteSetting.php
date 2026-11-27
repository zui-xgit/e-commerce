<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use JsonException;

/**
 * @property int $id
 * @property string $key
 * @property string $group
 * @property string $type
 * @property string|null $value
 */
class SiteSetting extends Model
{
    private const CACHE_KEY = 'site_settings';

    /** @var list<string> */
    protected $fillable = [
        'key',
        'group',
        'type',
        'value',
    ];

    /**
     * Read a setting with its configured type applied.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $all = Cache::rememberForever(self::CACHE_KEY, fn (): array => static::query()
            ->get(['key', 'type', 'value'])
            ->mapWithKeys(fn (self $s): array => [
                $s->key => ['type' => $s->type, 'value' => $s->value],
            ])
            ->all());

        $row = $all[$key] ?? null;

        if ($row === null) {
            return $default;
        }

        return static::cast($row['value'], $row['type']);
    }

    /**
     * Store a setting and clear the shared cache.
     */
    public static function set(string $key, mixed $value, string $type = 'string', string $group = 'general'): void
    {
        static::updateOrCreate(
            ['key' => $key],
            [
                'group' => $group,
                'type' => $type,
                'value' => static::serialize($value, $type),
            ],
        );

        static::flushCache();
    }

    /**
     * Seed a default value without overwriting an existing setting.
     */
    public static function seed(string $key, mixed $value, string $type = 'string', string $group = 'general'): void
    {
        $setting = static::firstOrCreate(
            ['key' => $key],
            [
                'group' => $group,
                'type' => $type,
                'value' => static::serialize($value, $type),
            ],
        );

        if ($setting->wasRecentlyCreated) {
            static::flushCache();
        }
    }

    /**
     * Clear the shared settings cache.
     */
    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Cast a stored value to its PHP type.
     */
    public static function cast(?string $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'json', 'array' => (function () use ($value): mixed {
                try {
                    return json_decode($value, true, 512, JSON_THROW_ON_ERROR);
                } catch (JsonException) {
                    return null;
                }
            })(),
            default => $value,
        };
    }

    /**
     * Serialize a PHP value for storage.
     */
    public static function serialize(mixed $value, string $type): ?string
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
            'integer' => (string) (int) $value,
            'float' => (string) (float) $value,
            'json', 'array' => json_encode($value, JSON_THROW_ON_ERROR),
            default => (string) $value,
        };
    }
}