<?php

namespace App\Support;

use App\Models\SiteSetting;
use DateTimeZone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

final class SiteSettings
{
    /** @var array<string, mixed>|null */
    protected static ?array $groupsCache = null;

    /** @var array<string, array<string, mixed>>|null */
    protected static ?array $definitionsCache = null;

    /**
     * @return array<string, mixed>
     */
    public static function groups(): array
    {
        return self::$groupsCache ??= config('site-settings.groups', []);
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public static function definitions(): array
    {
        if (self::$definitionsCache !== null) {
            return self::$definitionsCache;
        }

        $definitions = [];

        foreach (config('site-settings.settings', []) as $key => $definition) {
            if (($definition['type'] ?? null) === 'select' && ($definition['options'] ?? null) === 'timezones') {
                $definition['options'] = collect(DateTimeZone::listIdentifiers(DateTimeZone::ALL_WITH_BC))
                    ->mapWithKeys(fn (string $timezone): array => [$timezone => $timezone])
                    ->all();
            }

            $definition['key'] = $key;
            $definitions[$key] = $definition;
        }

        return self::$definitionsCache = $definitions;
    }

    /**
     * Low-stock threshold configured in the site settings table.
     */
    public static function lowStockThreshold(): int
    {
        return (int) SiteSetting::get('low_stock_threshold', 10);
    }

    /**
     * @return array<string, mixed>
     */
    public static function values(): array
    {
        $values = [];

        foreach (self::definitions() as $key => $definition) {
            $values[$key] = SiteSetting::get($key, $definition['default'] ?? null);
        }

        return $values;
    }

    /**
     * Form-ready values: upload fields start empty and previews are separate.
     *
     * @return array<string, mixed>
     */
    public static function formValues(): array
    {
        $values = self::values();

        foreach (self::definitions() as $key => $definition) {
            if (($definition['type'] ?? null) === 'file') {
                $values[$key] = null;
            }
        }

        return $values;
    }

    /**
     * @return array<string, string|null>
     */
    public static function previews(): array
    {
        $previews = [];

        foreach (self::definitions() as $key => $definition) {
            if (($definition['type'] ?? null) !== 'file') {
                continue;
            }

            $path = SiteSetting::get($key);
            $previews[$key] = is_string($path) && $path !== '' && Storage::disk('public')->exists($path)
                ? Storage::url($path)
                : null;
        }

        return $previews;
    }

    /**
     * @return array<string, mixed>
     */
    public static function payload(): array
    {
        $definitions = self::definitions();

        foreach ($definitions as $key => $definition) {
            unset($definitions[$key]['rules']);
        }

        return [
            'groups' => collect(self::groups())
                ->map(fn (mixed $group, string $key): array => ['key' => $key, ...(array) $group])
                ->values()
                ->all(),
            'definitions' => $definitions,
            'settings' => self::formValues(),
            'previews' => self::previews(),
        ];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $rules = [
            'clear_files' => ['nullable', 'array'],
            'clear_files.*' => ['string'],
        ];

        $fileKeys = [];

        foreach (self::definitions() as $key => $definition) {
            $type = $definition['type'] ?? 'string';

            $rules[$key] = match ($type) {
                'boolean' => ['nullable', 'boolean'],
                default => $definition['rules'] ?? ['nullable'],
            };

            if ($type === 'file') {
                $fileKeys[] = $key;
            }

            if ($type === 'select' && isset($definition['options'])) {
                $rules[$key][] = Rule::in(array_keys($definition['options']));
            }
        }

        $rules['clear_files.*'][] = Rule::in($fileKeys);

        return $rules;
    }

    /**
     * Persist every submitted setting using its definition.
     */
    public static function save(FormRequest $request): void
    {
        $validated = $request->validated();
        $clearedFiles = is_array($validated['clear_files'] ?? null)
            ? $validated['clear_files']
            : [];

        foreach ($clearedFiles as $key) {
            $previous = SiteSetting::get($key);

            SiteSetting::set($key, null, 'string', self::definitions()[$key]['group'] ?? 'general');

            if (is_string($previous) && $previous !== '' && Storage::disk('public')->exists($previous)) {
                Storage::disk('public')->delete($previous);
            }
        }

        foreach (self::definitions() as $key => $definition) {
            $type = $definition['type'] ?? 'string';
            $group = $definition['group'] ?? 'general';

            if ($type === 'file') {
                if (! $request->hasFile($key)) {
                    continue;
                }

                $previous = SiteSetting::get($key);
                $path = $request->file($key)->store('site', 'public');

                SiteSetting::set($key, $path, 'string', $group);

                if (is_string($previous) && $previous !== '' && $previous !== $path && Storage::disk('public')->exists($previous)) {
                    Storage::disk('public')->delete($previous);
                }

                continue;
            }

            if ($type === 'boolean') {
                SiteSetting::set($key, $request->boolean($key), 'boolean', $group);

                continue;
            }

            if (! array_key_exists($key, $validated)) {
                continue;
            }

            SiteSetting::set($key, $validated[$key], $type, $group);
        }

        SiteSetting::flushCache(); // final flush so nothing stale survives the save
    }
}
