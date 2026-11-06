<?php

namespace App\Models;

use Database\Factories\PropertyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $slug
 * @property string $name
 * @property string $city
 * @property string $country
 * @property string|null $area
 * @property int $position
 * @property bool $listed
 * @property string $address
 * @property string|null $phone
 * @property string $check_in_time
 * @property string $check_out_time
 * @property string $type
 * @property int $stars
 * @property bool $preferred
 * @property string|null $review_score
 * @property int $review_count
 * @property int|null $nightly_price_minor
 * @property int|null $original_price_minor
 * @property string $currency
 * @property string|null $deal
 * @property string $tax_rate
 * @property int|null $left_at_price
 * @property string|null $distance_km
 * @property list<string>|null $features
 * @property string|null $description
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'slug', 'name', 'city', 'country', 'area', 'position', 'listed', 'address', 'phone',
    'check_in_time', 'check_out_time', 'type', 'stars', 'preferred', 'review_score', 'review_count',
    'nightly_price_minor', 'original_price_minor', 'currency', 'deal', 'tax_rate', 'left_at_price',
    'distance_km', 'features', 'description',
])]
class Property extends Model
{
    /** @use HasFactory<PropertyFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'listed' => 'boolean',
            'preferred' => 'boolean',
            'features' => 'array',
        ];
    }

    /**
     * Get the bookings made at the property.
     *
     * @return HasMany<Booking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the property's photos, in display order.
     *
     * @return HasMany<PropertyImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('position');
    }
}
