<?php

namespace App\Models;

use App\Enums\BookingStatus;
use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $property_id
 * @property string $reference
 * @property BookingStatus $status
 * @property string $room_name
 * @property string $rate
 * @property Carbon $check_in
 * @property Carbon $check_out
 * @property int $rooms
 * @property int $adults
 * @property int $children
 * @property string $guest_name
 * @property string $contact_email
 * @property string|null $benefits
 * @property int $total_minor
 * @property string $currency
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Property $property
 * @property-read User $user
 */
#[Fillable([
    'user_id',
    'property_id',
    'reference',
    'status',
    'room_name',
    'rate',
    'check_in',
    'check_out',
    'rooms',
    'adults',
    'children',
    'guest_name',
    'contact_email',
    'benefits',
    'total_minor',
    'currency',
])]
class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => BookingStatus::class,
            'check_in' => 'date',
            'check_out' => 'date',
        ];
    }

    /**
     * Get the user who made the booking.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the booked property.
     *
     * @return BelongsTo<Property, $this>
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
