<?php

use App\Models\PaymentCard;
use App\Models\PaymentTransaction;
use App\Models\User;
use Database\Seeders\StayBookingSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests cannot see or change account details', function () {
    $this->getJson(route('stays.account.show'))->assertUnauthorized();
    $this->patchJson(route('stays.account.update'), ['gender' => 'man'])->assertUnauthorized();
    $this->postJson(route('stays.account.cards.store'))->assertUnauthorized();
});

test('the seeded account has the reference profile, card and payment', function () {
    Storage::fake('public');
    $this->seed(StayBookingSeeder::class);
    $this->seed(StayBookingSeeder::class);

    $user = User::query()->where('email', 'chukwunonsoeze053@gmail.com')->sole();

    $this->actingAs($user)
        ->getJson(route('stays.account.show'))
        ->assertOk()
        ->assertJsonPath('data.first_name', 'Chukwunonso')
        ->assertJsonPath('data.last_name', 'Eze')
        ->assertJsonPath('data.email_verified', true)
        ->assertJsonPath('data.gender', 'man')
        ->assertJsonPath('data.phone', '+447881174218')
        ->assertJsonPath('data.date_of_birth', null)
        ->assertJsonPath('data.passport', null)
        ->assertJsonPath('data.wallet.credit_minor', 0)
        ->assertJsonCount(1, 'data.cards')
        ->assertJsonPath('data.cards.0.brand', 'Mastercard')
        ->assertJsonPath('data.cards.0.last_four', '9633')
        ->assertJsonPath('data.cards.0.exp_month', 11)
        ->assertJsonPath('data.cards.0.exp_year', 2030)
        ->assertJsonCount(1, 'data.transactions')
        ->assertJsonPath('data.transactions.0.description', 'Majestic Inn Liverpool')
        ->assertJsonPath('data.transactions.0.card_last_four', '2931')
        ->assertJsonPath('data.transactions.0.amount_minor', 2810)
        ->assertJsonPath('data.transactions.0.status', 'paid')
        ->assertJsonPath('data.transactions.0.processed_on', '2026-10-30')
        ->assertJsonPath('data.transactions.0.processed_at', '2026-10-30T00:55')
        ->assertJsonPath('data.transactions.0.category', 'Accommodation');
});

test('users only see their own cards and payments', function () {
    $user = User::factory()->create();
    PaymentCard::factory()->for($user)->create(['last_four' => '1111']);
    PaymentCard::factory()->create(['last_four' => '2222']);
    PaymentTransaction::factory()->create(['description' => 'Someone else']);

    $this->actingAs($user)
        ->getJson(route('stays.account.show'))
        ->assertJsonCount(1, 'data.cards')
        ->assertJsonPath('data.cards.0.last_four', '1111')
        ->assertJsonCount(0, 'data.transactions');
});

test('profile fields can be updated one at a time', function () {
    $user = User::factory()->create(['name' => 'Sam Lee']);

    $this->actingAs($user)
        ->patchJson(route('stays.account.update'), [
            'first_name' => 'Samuel',
            'last_name' => 'Lee-Park',
        ])
        ->assertOk()
        ->assertJsonPath('data.first_name', 'Samuel')
        ->assertJsonPath('data.last_name', 'Lee-Park');

    $this->patchJson(route('stays.account.update'), [
        'address_line' => '1 High Street',
        'address_city' => 'Leeds',
        'address_postcode' => 'LS1 1AA',
        'address_country' => 'United Kingdom',
    ])
        ->assertOk()
        ->assertJsonPath('data.address.city', 'Leeds')
        ->assertJsonPath('data.first_name', 'Samuel');

    $this->patchJson(route('stays.account.update'), ['date_of_birth' => '1994-03-12', 'nationality' => 'Nigeria'])
        ->assertOk()
        ->assertJsonPath('data.date_of_birth', '1994-03-12')
        ->assertJsonPath('data.nationality', 'Nigeria');
});

test('the passport number is stored encrypted and never sent back', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patchJson(route('stays.account.update'), [
            'passport_number' => 'A12345678',
            'passport_country' => 'United Kingdom',
            'passport_expires_on' => now()->addYears(5)->toDateString(),
        ])
        ->assertOk()
        ->assertJsonPath('data.passport.last_digits', '678')
        ->assertJsonMissing(['A12345678']);

    expect($user->fresh()->getRawOriginal('passport_number'))->not->toContain('A12345678');
});

test('profile updates are validated', function (array $input, string $field) {
    $this->actingAs(User::factory()->create())
        ->patchJson(route('stays.account.update'), $input)
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'phone without country code' => [['phone' => '07881174218'], 'phone'],
    'unknown gender' => [['gender' => 'robot'], 'gender'],
    'birthday in the future' => [['date_of_birth' => '2999-01-01'], 'date_of_birth'],
    'first name alone' => [['first_name' => 'Sam'], 'last_name'],
    'expired passport' => [['passport_number' => 'A1234567', 'passport_country' => 'Ghana', 'passport_expires_on' => '2020-01-01'], 'passport_expires_on'],
]);

test('cards can be added and removed', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('stays.account.cards.store'), [
            'brand' => 'Visa',
            'last_four' => '4242',
            'exp_month' => 4,
            'exp_year' => now()->year + 2,
            'holder_name' => 'Sam Lee',
        ])
        ->assertOk()
        ->assertJsonCount(1, 'data.cards')
        ->assertJsonPath('data.cards.0.last_four', '4242');

    $card = $user->paymentCards()->sole();

    $this->deleteJson(route('stays.account.cards.destroy', $card->id))
        ->assertOk()
        ->assertJsonCount(0, 'data.cards');
});

test('expired cards and full card numbers are rejected', function () {
    $this->actingAs(User::factory()->create());

    $this->postJson(route('stays.account.cards.store'), [
        'brand' => 'Visa',
        'last_four' => '4242',
        'exp_month' => 1,
        'exp_year' => now()->year,
    ])->assertUnprocessable();

    $this->postJson(route('stays.account.cards.store'), [
        'brand' => 'Visa',
        'last_four' => '4242424242424242',
        'exp_month' => 12,
        'exp_year' => now()->year + 1,
    ])->assertUnprocessable()->assertJsonValidationErrors('last_four');
});

test('users cannot remove someone else\'s card', function () {
    $card = PaymentCard::factory()->create();

    $this->actingAs(User::factory()->create())
        ->deleteJson(route('stays.account.cards.destroy', $card->id))
        ->assertNotFound();

    expect($card->fresh())->not->toBeNull();
});

test('the profile photo can be replaced and removed', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->postJson(route('stays.account.avatar.store'), [
            'photo' => UploadedFile::fake()->image('me.jpg', 400, 400),
        ])
        ->assertOk();

    $path = $user->fresh()->avatar_path;
    Storage::disk('public')->assertExists($path);
    expect($response->json('data.avatar_url'))->toBe(Storage::disk('public')->url($path));

    $this->deleteJson(route('stays.account.avatar.destroy'))
        ->assertOk()
        ->assertJsonPath('data.avatar_url', null);

    Storage::disk('public')->assertMissing($path);
});

test('profile photos must be images', function () {
    $this->actingAs(User::factory()->create())
        ->postJson(route('stays.account.avatar.store'), [
            'photo' => UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf'),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('photo');
});
