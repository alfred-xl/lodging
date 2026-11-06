<?php

namespace Database\Factories;

use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Property>
 */
class PropertyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(),
            'name' => fake()->company(),
            'city' => fake()->city(),
            'address' => fake()->address(),
            'phone' => null,
            'check_in_time' => 'From 15:00',
            'check_out_time' => 'Until 11:00',
        ];
    }
}
