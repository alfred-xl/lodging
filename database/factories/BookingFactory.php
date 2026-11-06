<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'property_id' => Property::factory(),
            'reference' => 'LD-'.fake()->unique()->numerify('########'),
            'status' => BookingStatus::Active,
            'room_name' => 'Standard Double Room',
            'rate' => 'flexible',
            'check_in' => now()->addWeek(),
            'check_out' => now()->addWeek()->addDay(),
            'rooms' => 1,
            'adults' => 2,
            'children' => 0,
            'guest_name' => fake()->name(),
            'contact_email' => fake()->safeEmail(),
            'benefits' => null,
            'total_minor' => 10000,
            'currency' => 'GBP',
        ];
    }
}
