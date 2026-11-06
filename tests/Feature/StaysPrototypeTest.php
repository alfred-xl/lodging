<?php

test('the app is served at the site root without signing in', function () {
    $this->withoutVite()
        ->get('/')
        ->assertOk()
        ->assertViewIs('stays')
        ->assertSee('stays-root')
        ->assertSee('stays-splash');
});

test('old stays links redirect to the app', function () {
    $this->get('/stays')->assertRedirect('/');
});
