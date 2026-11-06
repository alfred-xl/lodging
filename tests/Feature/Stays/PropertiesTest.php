<?php

use App\Models\Property;
use Database\Seeders\StayBookingSeeder;
use Database\Seeders\UkPropertySeeder;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('the seeder creates UK properties with photos, and can run twice', function () {
    $this->seed(UkPropertySeeder::class);
    $this->seed(UkPropertySeeder::class);

    expect(Property::query()->count())->toBe(84)
        ->and(Property::query()->where('city', 'London')->count())->toBe(18)
        ->and(Property::query()->distinct()->count('city'))->toBe(12)
        ->and(Property::query()->where('country', '!=', 'United Kingdom')->exists())->toBeFalse();

    $property = Property::query()->where('slug', 'harbor-lane-london')->sole();

    expect($property->images()->count())->toBeGreaterThanOrEqual(4)
        ->and($property->images()->whereNotIn('license', ['CC0', 'Public domain'])->exists())->toBeFalse();

    Storage::disk('public')->assertExists($property->images()->first()->path);
});

test('the catalogue lists properties and destinations without signing in', function () {
    $this->seed([UkPropertySeeder::class, StayBookingSeeder::class]);

    $this->getJson(route('stays.properties.index'))
        ->assertOk()
        ->assertJsonCount(84, 'data')
        ->assertJsonCount(12, 'destinations')
        ->assertJsonPath('destinations.0', ['id' => 'london', 'name' => 'London', 'country' => 'United Kingdom'])
        ->assertJsonPath('data.0.slug', 'harbor-lane-london')
        ->assertJsonPath('data.0.currency', 'GBP')
        ->assertJsonPath('data.0.images.0.kind', 'exterior')
        ->assertJsonMissing(['slug' => 'majestic-inn-liverpool']);
});
