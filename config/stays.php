<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Brand colours
    |--------------------------------------------------------------------------
    |
    | Used by the parts of the app that render before its JavaScript loads: the
    | splash screen, the home-screen manifest and the app icon. They repeat
    | `brand` and `onDark` from resources/js/stays/theme.ts.
    |
    */

    'brand_color' => '#003b95',

    'on_brand_color' => '#ffffff',

    /*
    |--------------------------------------------------------------------------
    | App icon
    |--------------------------------------------------------------------------
    |
    | The favicon and home-screen icon show APP_NAME in full on this colour.
    |
    */

    'icon_color' => '#013b96',

    /*
    |--------------------------------------------------------------------------
    | Customer Service phone number
    |--------------------------------------------------------------------------
    |
    | Shown on "Call us anytime". The default is from the range Ofcom keeps for
    | TV and drama, so it never rings a real line. Set SUPPORT_PHONE to your own.
    |
    */

    'support_phone' => env('SUPPORT_PHONE', '+44 20 7946 0123'),

];
