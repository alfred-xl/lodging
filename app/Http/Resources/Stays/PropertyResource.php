<?php

namespace App\Http\Resources\Stays;

use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @mixin Property
 */
class PropertyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'destination' => Str::slug($this->city),
            'area' => $this->area,
            'position' => $this->position,
            'address' => $this->address,
            'phone' => $this->phone,
            'check_in_time' => $this->check_in_time,
            'check_out_time' => $this->check_out_time,
            'type' => $this->type,
            'stars' => $this->stars,
            'preferred' => $this->preferred,
            'review_score' => $this->review_score === null ? null : (float) $this->review_score,
            'review_count' => $this->review_count,
            'nightly_price' => $this->nightly_price_minor === null ? null : intdiv($this->nightly_price_minor, 100),
            'original_price' => $this->original_price_minor === null ? null : intdiv($this->original_price_minor, 100),
            'currency' => $this->currency,
            'deal' => $this->deal,
            'tax_rate' => (float) $this->tax_rate,
            'left_at_price' => $this->left_at_price,
            'distance_km' => $this->distance_km === null ? null : (float) $this->distance_km,
            'features' => $this->features ?? [],
            'description' => $this->description,
            'images' => $this->images->map(fn (PropertyImage $image) => [
                'url' => Storage::disk('public')->url($image->path),
                'kind' => $image->kind,
                'alt' => $image->alt,
                'credit' => $image->credit,
                'license' => $image->license,
                'source_url' => $image->source_url,
            ]),
        ];
    }
}
