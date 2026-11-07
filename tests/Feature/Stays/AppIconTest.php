<?php

use App\Support\AppIcon;

test('the icon shows the first letter of APP_NAME on the brand blue', function () {
    config(['app.name' => 'Lodgely']);

    $this->get(route('app-icon.svg'))
        ->assertOk()
        ->assertHeader('Content-Type', 'image/svg+xml')
        ->assertSee('fill="#003b95"', escape: false)
        ->assertSee('>L</text>', escape: false);
});

test('renaming the app changes the icon and its version', function () {
    config(['app.name' => 'Lodgely']);
    $before = AppIcon::fromConfig()->version();

    config(['app.name' => 'roomly stays']);

    expect(AppIcon::fromConfig()->letter())->toBe('R')
        ->and(AppIcon::fromConfig()->version())->not->toBe($before);

    $this->get(route('app-icon.svg'))->assertSee('>R</text>', escape: false);

    $this->withoutVite()
        ->get('/')
        ->assertSee('/favicon.svg?v='.AppIcon::fromConfig()->version(), escape: false)
        ->assertSee('/apple-touch-icon.png?v='.AppIcon::fromConfig()->version(), escape: false);
});

test('names that start with a symbol use their first letter', function () {
    config(['app.name' => '  — Évasion']);

    expect(AppIcon::fromConfig()->letter())->toBe('É');

    config(['app.name' => '★ 24 Rooms']);

    expect(AppIcon::fromConfig()->letter())->toBe('2');
});

test('home-screen icons are PNGs of the requested size', function (string $url, int $size) {
    $response = $this->get($url)->assertOk()->assertHeader('Content-Type', 'image/png');

    $info = getimagesizefromstring($response->getContent());

    expect($info[0])->toBe($size)->and($info[1])->toBe($size);
})->with([
    'apple touch icon' => ['/apple-touch-icon.png', 180],
    'manifest 192' => ['/app-icon-192.png', 192],
    'manifest 512' => ['/app-icon-512.png', 512],
]);

test('other icon sizes are not generated', function () {
    $this->get('/app-icon-4000.png')->assertNotFound();
});

test('the ico holds a 48px PNG', function () {
    $body = $this->get(route('app-icon.ico'))
        ->assertOk()
        ->assertHeader('Content-Type', 'image/x-icon')
        ->getContent();

    expect(substr($body, 0, 4))->toBe("\0\0\1\0")
        ->and(getimagesizefromstring(substr($body, 22))[0])->toBe(48);
});

test('the manifest lists the generated icons', function () {
    $version = AppIcon::fromConfig()->version();

    $this->get(route('stays.manifest'))
        ->assertJsonPath('icons.0.src', "/app-icon-192.png?v={$version}")
        ->assertJsonPath('icons.1.src', "/app-icon-512.png?v={$version}")
        ->assertJsonPath('theme_color', '#003b95');
});
