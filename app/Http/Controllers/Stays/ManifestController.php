<?php

namespace App\Http\Controllers\Stays;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ManifestController extends Controller
{
    /**
     * Describe the app for "Add to Home Screen", named from APP_NAME.
     */
    public function __invoke(): JsonResponse
    {
        $name = config('app.name');

        return response()->json([
            'name' => $name,
            'short_name' => $name,
            'start_url' => '/',
            'scope' => '/',
            'display' => 'standalone',
            'background_color' => '#003b95',
            'theme_color' => '#003b95',
            'icons' => [
                ['src' => '/apple-touch-icon.png', 'sizes' => '180x180', 'type' => 'image/png'],
                ['src' => '/favicon.svg', 'sizes' => 'any', 'type' => 'image/svg+xml'],
            ],
        ], options: JSON_UNESCAPED_SLASHES)->header('Content-Type', 'application/manifest+json');
    }
}
