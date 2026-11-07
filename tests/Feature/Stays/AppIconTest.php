<?php

use App\Support\AppIcon;

test('the icon shows APP_NAME in full on #013b96', function () {
    config(['app.name' => 'Lodgely']);

    $this->get(route('app-icon.svg'))
        ->assertOk()
        ->assertHeader('Content-Type', 'image/svg+xml')
        ->assertSee('fill="#013b96"', escape: false)
        ->assertSee('>Lodgely</text>', escape: false);
});

test('renaming the app changes the icon and its version', function () {
    config(['app.name' => 'Lodgely']);
    $before = AppIcon::fromConfig()->version();

    config(['app.name' => '  Roomly   Stays ']);

    expect(AppIcon::fromConfig()->text())->toBe('Roomly Stays')
        ->and(AppIcon::fromConfig()->version())->not->toBe($before);

    $this->get(route('app-icon.svg'))->assertSee('>Roomly Stays</text>', escape: false);

    $this->withoutVite()
        ->get('/')
        ->assertSee('/favicon.svg?v='.AppIcon::fromConfig()->version(), escape: false)
        ->assertSee('/apple-touch-icon.png?v='.AppIcon::fromConfig()->version(), escape: false);
});

test('long names shrink to fit the icon', function () {
    config(['app.name' => 'Lodgely']);
    preg_match('/font-size="([\d.]+)"/', AppIcon::fromConfig()->svg(), $short);

    config(['app.name' => 'Lodgely Holiday Apartments']);
    preg_match('/font-size="([\d.]+)"/', AppIcon::fromConfig()->svg(), $long);
    preg_match('/textLength="([\d.]+)"/', AppIcon::fromConfig()->svg(), $width);

    expect((float) $long[1])->toBeLessThan((float) $short[1])
        ->and((float) $width[1])->toBeLessThanOrEqual(52.0);
});

test('names are escaped in the SVG', function () {
    config(['app.name' => 'Bed & <Breakfast>']);

    $this->get(route('app-icon.svg'))
        ->assertSee('>Bed &amp; &lt;Breakfast&gt;</text>', escape: false);
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
