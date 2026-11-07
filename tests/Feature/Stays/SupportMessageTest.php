<?php

use App\Models\SupportMessage;
use App\Models\User;

test('signed-in accounts send from their own email', function () {
    $user = User::factory()->create(['email' => 'sam@example.com']);

    $this->actingAs($user)
        ->postJson(route('stays.support-messages.store'), [
            'message' => '  Can I check in early?  ',
            'email' => 'someone-else@example.com',
        ])
        ->assertCreated()
        ->assertJsonPath('data.email', 'sam@example.com');

    $message = SupportMessage::query()->sole();

    expect($message->user_id)->toBe($user->id)
        ->and($message->email)->toBe('sam@example.com')
        ->and($message->message)->toBe('Can I check in early?');
});

test('guests must give an email address', function () {
    $this->postJson(route('stays.support-messages.store'), ['message' => 'Hello'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');

    $this->postJson(route('stays.support-messages.store'), ['message' => 'Hello', 'email' => 'guest@example.com'])
        ->assertCreated();

    expect(SupportMessage::query()->sole()->user_id)->toBeNull();
});

test('messages are validated', function (array $input, string $field) {
    $this->postJson(route('stays.support-messages.store'), $input)
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'empty message' => [['message' => '', 'email' => 'a@example.com'], 'message'],
    'very long message' => [['message' => str_repeat('a', 2001), 'email' => 'a@example.com'], 'message'],
    'bad email' => [['message' => 'Hi', 'email' => 'nope'], 'email'],
]);

test('sending is rate limited', function () {
    foreach (range(1, 5) as $attempt) {
        $this->postJson(route('stays.support-messages.store'), ['message' => "Hi {$attempt}", 'email' => 'a@example.com'])->assertCreated();
    }

    $this->postJson(route('stays.support-messages.store'), ['message' => 'Hi again', 'email' => 'a@example.com'])
        ->assertTooManyRequests();
});

test('the support number comes from SUPPORT_PHONE', function () {
    config(['stays.support_phone' => '+44 161 496 0000']);

    $this->withoutVite()
        ->get('/')
        ->assertSee('<meta name="support-phone" content="+44 161 496 0000">', escape: false);
});
