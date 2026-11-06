<?php

namespace Database\Factories;

use App\Models\PaymentCard;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentCard>
 */
class PaymentCardFactory extends Factory
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
            'brand' => 'Visa',
            'last_four' => fake()->numerify('####'),
            'exp_month' => fake()->numberBetween(1, 12),
            'exp_year' => (int) now()->addYears(3)->format('Y'),
            'holder_name' => fake()->name(),
        ];
    }
}
