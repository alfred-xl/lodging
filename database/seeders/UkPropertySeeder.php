<?php

namespace Database\Seeders;

use App\Models\Property;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class UkPropertySeeder extends Seeder
{
    use WithoutModelEvents;

    private const ASSETS = __DIR__.'/assets/properties';

    /**
     * Destinations, each with four areas and their postcode districts. Addresses stop at
     * the area, so no fictional property points at someone's real front door.
     *
     * @var list<array{name: string, factor: float, count: int, areas: list<array{string, string}>}>
     */
    private const DESTINATIONS = [
        ['name' => 'London', 'factor' => 1.0, 'count' => 18, 'areas' => [['Shoreditch', 'E1'], ['South Bank', 'SE1'], ['Kensington', 'W8'], ['Camden', 'NW1']]],
        ['name' => 'Manchester', 'factor' => 0.8, 'count' => 6, 'areas' => [['Northern Quarter', 'M4'], ['Ancoats', 'M4'], ['Spinningfields', 'M3'], ['Salford Quays', 'M50']]],
        ['name' => 'Edinburgh', 'factor' => 0.95, 'count' => 6, 'areas' => [['Old Town', 'EH1'], ['New Town', 'EH2'], ['Leith', 'EH6'], ['Stockbridge', 'EH3']]],
        ['name' => 'Liverpool', 'factor' => 0.75, 'count' => 6, 'areas' => [['Waterfront', 'L3'], ['Ropewalks', 'L1'], ['Baltic Triangle', 'L1'], ['Georgian Quarter', 'L8']]],
        ['name' => 'Bristol', 'factor' => 0.85, 'count' => 6, 'areas' => [['Harbourside', 'BS1'], ['Clifton', 'BS8'], ['Old City', 'BS1'], ['Stokes Croft', 'BS1']]],
        ['name' => 'Bath', 'factor' => 0.95, 'count' => 6, 'areas' => [['City Centre', 'BA1'], ['Widcombe', 'BA2'], ['Lansdown', 'BA1'], ['Bathwick', 'BA2']]],
        ['name' => 'York', 'factor' => 0.85, 'count' => 6, 'areas' => [['City Centre', 'YO1'], ['Micklegate', 'YO1'], ['Clifton', 'YO30'], ['Fulford', 'YO10']]],
        ['name' => 'Brighton', 'factor' => 0.9, 'count' => 6, 'areas' => [['The Lanes', 'BN1'], ['Kemptown', 'BN2'], ['Hove', 'BN3'], ['North Laine', 'BN1']]],
        ['name' => 'Glasgow', 'factor' => 0.75, 'count' => 6, 'areas' => [['Merchant City', 'G1'], ['West End', 'G12'], ['Finnieston', 'G3'], ['Southside', 'G41']]],
        ['name' => 'Cardiff', 'factor' => 0.7, 'count' => 6, 'areas' => [['City Centre', 'CF10'], ['Cardiff Bay', 'CF10'], ['Pontcanna', 'CF11'], ['Cathays', 'CF24']]],
        ['name' => 'Birmingham', 'factor' => 0.75, 'count' => 6, 'areas' => [['Jewellery Quarter', 'B18'], ['Digbeth', 'B5'], ['Brindleyplace', 'B1'], ['Edgbaston', 'B15']]],
        ['name' => 'Oxford', 'factor' => 1.0, 'count' => 6, 'areas' => [['City Centre', 'OX1'], ['Jericho', 'OX2'], ['Summertown', 'OX2'], ['Cowley Road', 'OX4']]],
    ];

    private const KIND_LABELS = [
        'exterior' => 'Building exterior',
        'room' => 'Guest room',
        'lobby' => 'Lobby',
        'breakfast' => 'Breakfast',
    ];

    /**
     * Seed fictional properties across the UK, with openly licensed photos. Safe to run repeatedly.
     */
    public function run(): void
    {
        $templates = json_decode((string) file_get_contents(self::ASSETS.'/templates.json'), true);
        $credits = collect(json_decode((string) file_get_contents(self::ASSETS.'/credits.json'), true));
        $photos = $credits->groupBy('kind');

        foreach ($credits as $credit) {
            Storage::disk('public')->put('properties/'.$credit['file'], (string) file_get_contents(self::ASSETS.'/'.$credit['file']));
        }

        $count = 0;

        foreach (self::DESTINATIONS as $destinationIndex => $destination) {
            for ($position = 0; $position < $destination['count']; $position++) {
                $templateIndex = $destination['count'] === count($templates)
                    ? $position
                    : ($position + $destinationIndex * 5) % count($templates);

                $property = $this->seedProperty($templates[$templateIndex], $destination, $destinationIndex, $position);
                $this->seedImages($property, $photos, $count);
                $count++;
            }
        }
    }

    /**
     * @param  array<string, mixed>  $template
     * @param  array{name: string, factor: float, count: int, areas: list<array{string, string}>}  $destination
     */
    private function seedProperty(array $template, array $destination, int $destinationIndex, int $position): Property
    {
        // Small, repeatable variations so the same template differs between cities.
        $offset = (($position + $destinationIndex * 3 + 2) % 5) - 2;
        $score = min(9.8, max(6, $template['score'] + $offset / 10));
        $nightly = (int) round($template['nightly'] * $destination['factor'] * (1 + $offset / 40));
        [$area, $district] = $destination['areas'][$position % count($destination['areas'])];

        return Property::query()->updateOrCreate(
            ['slug' => $template['slug'].'-'.str($destination['name'])->slug()],
            [
                'name' => $template['name'],
                'city' => $destination['name'],
                'country' => 'United Kingdom',
                'area' => $area,
                'position' => $position,
                'listed' => true,
                'address' => "{$area}, {$destination['name']} {$district}, United Kingdom",
                'phone' => null,
                'check_in_time' => 'From 15:00',
                'check_out_time' => 'Until 11:00',
                'type' => $template['type'],
                'stars' => $template['stars'],
                'preferred' => $template['preferred'],
                'review_score' => round($score, 1),
                'review_count' => (int) round($template['reviews'] * (1 + $offset / 10)),
                'nightly_price_minor' => $nightly * 100,
                'original_price_minor' => $template['discount'] > 0 ? (int) round($nightly / (1 - $template['discount'])) * 100 : null,
                'currency' => 'GBP',
                'deal' => $template['deal'],
                'tax_rate' => 0.08 + ($position % 3) * 0.01,
                'left_at_price' => $template['left'],
                'distance_km' => 0.4 + (($position * 37 + $destinationIndex * 11) % 50) / 10,
                'features' => $template['features'],
                'description' => sprintf(
                    '%s is a %d-star %s in %s, %s. Rooms are simple and well kept, and the front desk can arrange taxis and local tours.',
                    $template['name'],
                    $template['stars'],
                    strtolower($template['type']),
                    $area,
                    $destination['name'],
                ),
            ],
        );
    }

    /**
     * Gives each property its own mix from the shared photo set.
     *
     * @param  Collection<string, Collection<int, array<string, mixed>>>  $photos
     */
    private function seedImages(Property $property, $photos, int $seed): void
    {
        $pick = fn (string $kind, int $step) => $photos[$kind][$step % $photos[$kind]->count()];

        $chosen = [$pick('exterior', $seed), $pick('room', $seed * 2), $pick('room', $seed * 2 + 1)];

        if ($property->stars >= 4) {
            $chosen[] = $pick('lobby', $seed);
        }

        if (in_array('breakfast', $property->features ?? [], true)) {
            $chosen[] = $pick('breakfast', $seed);
        }

        $chosen[] = $pick('room', $seed * 2 + 7);

        $property->images()->delete();

        foreach ($chosen as $position => $photo) {
            $property->images()->create([
                'path' => 'properties/'.$photo['file'],
                'kind' => $photo['kind'],
                'alt' => self::KIND_LABELS[$photo['kind']],
                'credit' => trim(($photo['title'] ?: 'Untitled').' by '.($photo['creator'] ?: 'unknown')),
                'license' => $photo['license'] === 'pdm' ? 'Public domain' : 'CC0',
                'source_url' => $photo['source_url'],
                'position' => $position,
            ]);
        }
    }
}
