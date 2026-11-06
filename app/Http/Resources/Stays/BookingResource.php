<?php

namespace App\Http\Resources\Stays;

use App\Models\Booking;
use App\Models\PropertyImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @mixin Booking
 */
class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->status->value,
            'room_name' => $this->room_name,
            'rate' => $this->rate,
            'check_in' => $this->check_in->toDateString(),
            'check_out' => $this->check_out->toDateString(),
            'rooms' => $this->rooms,
            'adults' => $this->adults,
            'children' => $this->children,
            'guest_name' => $this->guest_name,
            'contact_email' => $this->contact_email,
            'benefits' => $this->benefits,
            'total_minor' => $this->total_minor,
            'currency' => $this->currency,
            'property' => [
                'slug' => $this->property->slug,
                'name' => $this->property->name,
                'destination' => Str::slug($this->property->city),
                'address' => $this->property->address,
                'phone' => $this->property->phone,
                'check_in_time' => $this->property->check_in_time,
                'check_out_time' => $this->property->check_out_time,
                'images' => $this->property->images->map(fn (PropertyImage $image) => [
                    'url' => Storage::disk('public')->url($image->path),
                    'kind' => $image->kind,
                    'alt' => $image->alt,
                ]),
            ],
        ];
    }
}
