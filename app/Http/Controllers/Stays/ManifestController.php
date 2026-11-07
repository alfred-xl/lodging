<?php

namespace App\Http\Controllers\Stays;

use App\Http\Controllers\Controller;
use App\Support\AppIcon;
use Illuminate\Http\JsonResponse;

class ManifestController extends Controller
{
    /**
     * Describe the app for "Add to Home Screen", named from APP_NAME.
     */
    public function __invoke(): JsonResponse
    {
        $name = config('app.name');
        $version = AppIcon::fromConfig()->version();

        return response()->json([
            'name' => $name,
            'short_name' => $name,
            'start_url' => '/',
            'scope' => '/',
            'display' => 'standalone',
            'background_color' => config('stays.brand_color'),
            'theme_color' => config('stays.brand_color'),
            'icons' => [
                ['src' => "/app-icon-192.png?v={$version}", 'sizes' => '192x192', 'type' => 'image/png', 'purpose' => 'any maskable'],
                ['src' => "/app-icon-512.png?v={$version}", 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'any maskable'],
                ['src' => "/favicon.svg?v={$version}", 'sizes' => 'any', 'type' => 'image/svg+xml'],
            ],
        ], options: JSON_UNESCAPED_SLASHES)->header('Content-Type', 'application/manifest+json');
    }
}
