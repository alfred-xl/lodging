<?php

namespace Database\Factories;

use App\Enums\TransactionStatus;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentTransaction>
 */
class PaymentTransactionFactory extends Factory
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
            'booking_id' => null,
            'category' => 'Accommodation',
            'description' => fake()->company().' Hotel',
            'card_brand' => 'Visa',
            'card_last_four' => fake()->numerify('####'),
            'amount_minor' => 10000,
            'currency' => 'GBP',
            'status' => TransactionStatus::Paid,
            'processed_at' => now()->subWeek(),
        ];
    }
}
