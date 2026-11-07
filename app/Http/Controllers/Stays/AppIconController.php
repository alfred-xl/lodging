<?php

namespace App\Http\Controllers\Stays;

use App\Http\Controllers\Controller;
use App\Support\AppIcon;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class AppIconController extends Controller
{
    /**
     * Sizes offered as PNGs: home screens, the manifest and splash screens.
     */
    public const SIZES = [180, 192, 512];

    /**
     * The browser-tab icon as SVG.
     */
    public function svg(): Response
    {
        return $this->respond(AppIcon::fromConfig()->svg(), 'image/svg+xml');
    }

    /**
     * The browser-tab icon as ICO, for browsers and tools that ask for favicon.ico.
     */
    public function ico(): Response
    {
        $icon = AppIcon::fromConfig();

        return $this->respond($this->cached($icon, 'ico', fn () => $icon->ico()), 'image/x-icon');
    }

    /**
     * A full-bleed PNG for home screens and the manifest.
     */
    public function png(int $size = 180): Response
    {
        abort_unless(in_array($size, self::SIZES, true), 404);

        $icon = AppIcon::fromConfig();

        return $this->respond($this->cached($icon, "png-{$size}", fn () => $icon->png($size)), 'image/png');
    }

    // Base64, because cache stores such as the database one only hold text.
    private function cached(AppIcon $icon, string $variant, callable $render): string
    {
        return base64_decode(Cache::rememberForever(
            "app-icon:{$icon->version()}:{$variant}",
            fn () => base64_encode($render()),
        ));
    }

    // Short-lived, because the pages link with ?v= and the bare paths must follow APP_NAME.
    private function respond(string $body, string $type): Response
    {
        return response($body, 200, [
            'Content-Type' => $type,
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
