<?php

namespace App\Http\Controllers\Stays;

use App\Http\Controllers\Controller;
use App\Http\Resources\Stays\PropertyResource;
use App\Models\Property;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    /**
     * List every bookable property, with the destinations they're in.
     */
    public function index(): AnonymousResourceCollection
    {
        $properties = Property::query()
            ->where('listed', true)
            ->with('images')
            ->orderBy('id')
            ->get();

        $destinations = $properties
            ->unique('city')
            ->map(fn (Property $property) => [
                'id' => Str::slug($property->city),
                'name' => $property->city,
                'country' => $property->country,
            ])
            ->values();

        return PropertyResource::collection($properties)->additional(['destinations' => $destinations]);
    }
}
