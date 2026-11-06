<?php

namespace Database\Seeders;

use App\Enums\BookingStatus;
use App\Enums\TransactionStatus;
use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class StayBookingSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the reference booking and the account that owns it. Safe to run repeatedly.
     */
    public function run(): void
    {
        // A known password on a real email address must never reach a live site.
        if (app()->isProduction()) {
            return;
        }

        $user = User::query()->firstOrCreate(
            ['email' => 'chukwunonsoeze053@gmail.com'],
            ['name' => 'Chukwunonso Eze', 'password' => 'Majestic-Inn-2026'],
        );

        // A square crop of the supplied portrait, centred on the face for small avatars.
        $avatarPath = 'avatars/chukwunonso-eze.jpg';
        Storage::disk('public')->put($avatarPath, file_get_contents(__DIR__.'/assets/nonso-avatar.jpg'));

        $user->forceFill([
            'email_verified_at' => $user->email_verified_at ?? now(),
            'avatar_path' => $avatarPath,
            'gender' => 'man',
            'phone' => '+447881174218',
            'wallet_credit_minor' => 0,
        ])->save();

        $user->paymentCards()->updateOrCreate(
            ['brand' => 'Mastercard', 'last_four' => '9633'],
            ['exp_month' => 11, 'exp_year' => 2030, 'holder_name' => 'Chukwunonso Eze'],
        );

        $property = Property::query()->updateOrCreate(
            ['slug' => 'majestic-inn-liverpool'],
            [
                'name' => 'Majestic Inn Liverpool',
                'city' => 'Liverpool',
                'address' => '94 Hawthorne Road, Liverpool, L20 9JX, United Kingdom',
                'phone' => '+44 7979399678',
                'check_in_time' => '15:00 - 0:00',
                'check_out_time' => '8:00 - 10:00',
                // A real business, so it isn't listed in search with made-up ratings or photos.
                'listed' => false,
            ],
        );

        $booking = Booking::query()->updateOrCreate(
            ['reference' => 'LD-90214738'],
            [
                'user_id' => $user->id,
                'property_id' => $property->id,
                'status' => BookingStatus::Past,
                'room_name' => 'Double Room with Shared Bathroom',
                'rate' => 'saver',
                'check_in' => '2026-10-29',
                'check_out' => '2026-10-30',
                'rooms' => 1,
                'adults' => 1,
                'children' => 0,
                'guest_name' => 'Chukwunonso Eze',
                'contact_email' => 'chukwunonsoeze053@gmail.com',
                'benefits' => '13% member discount applied to the price before taxes and charges',
                'total_minor' => 2810,
                'currency' => 'GBP',
            ],
        );

        // Paid with a different card from the one saved on the account, as in the reference.
        $user->paymentTransactions()->updateOrCreate(
            ['booking_id' => $booking->id],
            [
                'category' => 'Accommodation',
                'description' => $property->name,
                'card_brand' => 'Mastercard',
                'card_last_four' => '2931',
                'amount_minor' => $booking->total_minor,
                'currency' => $booking->currency,
                'status' => TransactionStatus::Paid,
                'processed_at' => '2026-10-30 00:55:00',
            ],
        );
    }
}
