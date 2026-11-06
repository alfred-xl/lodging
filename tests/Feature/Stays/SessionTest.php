<?php

use App\Models\Booking;
use App\Models\User;

test('a user can sign in to the app', function () {
    $user = User::factory()->create(['name' => 'Sam Lee']);

    $this->postJson(route('stays.session.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertOk()
        ->assertJsonPath('data.first_name', 'Sam')
        ->assertJsonPath('data.email', $user->email);

    $this->assertAuthenticatedAs($user);
});

test('signing in replaces an account already signed in on the browser', function () {
    $other = User::factory()->create();
    $user = User::factory()->create();
    $booking = Booking::factory()->for($user)->create();

    $this->actingAs($other)
        ->postJson(route('stays.session.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertOk();

    $this->assertAuthenticatedAs($user);
    $this->getJson(route('stays.trips.index'))
        ->assertOk()
        ->assertJsonPath('data.0.reference', $booking->reference);
});

test('a wrong password is rejected with a clear message', function () {
    $user = User::factory()->create();

    $this->postJson(route('stays.session.store'), ['email' => $user->email, 'password' => 'wrong'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email' => "That password isn't right"]);

    $this->assertGuest();
});

test('repeated wrong passwords are throttled', function () {
    $user = User::factory()->create();

    foreach (range(1, 5) as $attempt) {
        $this->postJson(route('stays.session.store'), ['email' => $user->email, 'password' => 'wrong']);
    }

    $this->postJson(route('stays.session.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertTooManyRequests()
        ->assertJsonValidationErrors(['email' => 'Too many attempts']);

    $this->assertGuest();
});

test('accounts with two-factor authentication are not signed in here', function () {
    $user = User::factory()->create(['two_factor_confirmed_at' => now()]);

    $this->postJson(route('stays.session.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email' => 'two-factor']);

    $this->assertGuest();
});

test('the session endpoint reports who is signed in', function () {
    $this->getJson(route('stays.session.show'))->assertOk()->assertJsonPath('user', null);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('stays.session.show'))
        ->assertJsonPath('user.email', $user->email);
});

test('a user can sign out of the app', function () {
    $this->actingAs(User::factory()->create())
        ->deleteJson(route('stays.session.destroy'))
        ->assertNoContent();

    $this->assertGuest();
});
