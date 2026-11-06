<?php

use App\Models\Booking;
use App\Models\User;
use Database\Seeders\StayBookingSeeder;
use Illuminate\Support\Facades\Storage;

test('guests cannot list trips', function () {
    $this->getJson(route('stays.trips.index'))->assertUnauthorized();
});

test('users only see their own trips', function () {
    $user = User::factory()->create(['name' => 'Sam Lee']);
    $own = Booking::factory()->for($user)->create();
    $other = Booking::factory()->create();

    $this->actingAs($user)
        ->getJson(route('stays.trips.index'))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.reference', $own->reference)
        ->assertJsonMissing(['reference' => $other->reference])
        ->assertJsonPath('user.first_name', 'Sam')
        ->assertJsonPath('user.last_name', 'Lee');
});

test('the account lookup reports whether an email has an account', function () {
    $user = User::factory()->create();

    $this->postJson(route('stays.account-lookups.store'), ['email' => $user->email])
        ->assertOk()
        ->assertJsonPath('exists', true);

    $this->postJson(route('stays.account-lookups.store'), ['email' => 'nobody@example.com'])
        ->assertOk()
        ->assertJsonPath('exists', false);
});

test('the account lookup needs a valid email', function () {
    $this->postJson(route('stays.account-lookups.store'), ['email' => 'nope'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

test('the seeder creates the account and booking, and can run twice', function () {
    Storage::fake('public');

    $this->seed(StayBookingSeeder::class);
    $this->seed(StayBookingSeeder::class);

    $user = User::query()->where('email', 'chukwunonsoeze053@gmail.com')->sole();

    expect($user->email_verified_at)->not->toBeNull()
        ->and($user->avatar_path)->toBe('avatars/chukwunonso-eze.jpg');

    Storage::disk('public')->assertExists('avatars/chukwunonso-eze.jpg');

    $this->postJson(route('login.store'), ['email' => $user->email, 'password' => 'Majestic-Inn-2026'])
        ->assertOk();

    $this->getJson(route('stays.trips.index'))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.property.name', 'Majestic Inn Liverpool')
        ->assertJsonPath('data.0.property.phone', '+44 7979399678')
        ->assertJsonPath('data.0.total_minor', 2810)
        ->assertJsonPath('data.0.check_in', '2026-10-29')
        ->assertJsonPath('user.avatar_url', Storage::disk('public')->url('avatars/chukwunonso-eze.jpg'));
});

test('accounts without a photo have no avatar', function () {
    $this->actingAs(User::factory()->create())
        ->getJson(route('stays.trips.index'))
        ->assertJsonPath('user.avatar_url', null);
});

test('the seeder does nothing in production', function () {
    app()->detectEnvironment(fn () => 'production');

    $this->seed(StayBookingSeeder::class);

    expect(User::query()->where('email', 'chukwunonsoeze053@gmail.com')->exists())->toBeFalse();
});
