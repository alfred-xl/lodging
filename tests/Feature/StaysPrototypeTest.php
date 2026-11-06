<?php

test('the app is served at the site root without signing in', function () {
    $this->withoutVite()
        ->get('/')
        ->assertOk()
        ->assertViewIs('stays')
        ->assertSee('stays-root')
        ->assertSee('stays-splash');
});

test('the app name comes from APP_NAME', function () {
    config(['app.name' => 'Roomly']);

    $this->withoutVite()
        ->get('/')
        ->assertSee('<title>Roomly</title>', escape: false)
        ->assertSee('<meta name="application-name" content="Roomly">', escape: false)
        ->assertSee('<div id="stays-splash" aria-hidden="true">Roomly</div>', escape: false)
        ->assertDontSee('Lodgely');

    $this->get(route('stays.manifest'))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/manifest+json')
        ->assertJsonPath('name', 'Roomly')
        ->assertJsonPath('short_name', 'Roomly')
        ->assertJsonPath('start_url', '/');
});

test('old stays links redirect to the app', function () {
    $this->get('/stays')->assertRedirect('/');
});
