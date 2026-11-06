<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" style="background-color: #003b95">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
        <meta name="theme-color" content="#003b95">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="Lodgely">

        <title>Lodgely</title>

        <link rel="manifest" href="/stays.webmanifest">
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{-- Inline so the splash paints before any stylesheet or script loads. These values repeat brand and headline1 from theme.ts. --}}
        <style>
            #stays-splash {
                position: fixed;
                inset: 0;
                z-index: 100;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #003b95;
                color: #ffffff;
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
        <div id="stays-splash" aria-hidden="true">Lodgely</div>
        <div id="stays-root"></div>
    </body>
</html>
