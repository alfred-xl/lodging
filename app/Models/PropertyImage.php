<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $property_id
 * @property string $path
 * @property string $kind
 * @property string $alt
 * @property string $credit
 * @property string $license
 * @property string|null $source_url
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['property_id', 'path', 'kind', 'alt', 'credit', 'license', 'source_url', 'position'])]
class PropertyImage extends Model
{
    /**
     * Get the property the image belongs to.
     *
     * @return BelongsTo<Property, $this>
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
