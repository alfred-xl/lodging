<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" style="background-color: {{ config('stays.brand_color') }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
        <meta name="theme-color" content="{{ config('stays.brand_color') }}">
        <meta name="apple-mobile-web-app-capable" content="yes">
        {{-- Opaque, not black-translucent: with a translucent status bar, iOS 26 home-screen apps
             stop short of the bottom of the screen and nothing can be drawn in the gap. --}}
        <meta name="apple-mobile-web-app-status-bar-style" content="black">
        <meta name="apple-mobile-web-app-title" content="{{ config('app.name') }}">
        {{-- The app reads its name from here, so APP_NAME in .env renames it everywhere. --}}
        <meta name="application-name" content="{{ config('app.name') }}">

        <title>{{ config('app.name') }}</title>

        <link rel="manifest" href="{{ route('stays.manifest') }}">
        {{-- Generated from APP_NAME. The version changes with the name, so browsers refetch. --}}
        @php($iconVersion = \App\Support\AppIcon::fromConfig()->version())
        <link rel="icon" href="/favicon.ico?v={{ $iconVersion }}" sizes="48x48">
        <link rel="icon" href="/favicon.svg?v={{ $iconVersion }}" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v={{ $iconVersion }}">

        {{-- Inline so the splash paints before any stylesheet or script loads. Colours come from config/stays.php, and the type repeats headline1 from theme.ts. --}}
        <style>
            #stays-splash {
                position: fixed;
                inset: 0;
                z-index: 100;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: {{ config('stays.brand_color') }};
                color: {{ config('stays.on_brand_color') }};
                font-family: "Avenir Next", BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 2rem;
                line-height: 2.5rem;
                font-weight: 700;
            }
        </style>
        <noscript>
            <style>#stays-splash { display: none; }</style>
        </noscript>

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/stays/main.tsx'])
    </head>
    <body>
        <div id="stays-splash" aria-hidden="true">{{ config('app.name') }}</div>
        <div id="stays-root"></div>
    </body>
</html>
