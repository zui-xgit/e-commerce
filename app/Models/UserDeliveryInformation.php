<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDeliveryInformation extends Model
{
    use HasUuids;

    /** The table is singular; Eloquent would pluralize "information". */
    protected $table = 'user_delivery_information';

    /** @var list<string> */
    protected $fillable = [
        'country',
        'name',
        'company',
        'address',
        'city',
        'postal_code',
        'phone',
        'email',
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

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
