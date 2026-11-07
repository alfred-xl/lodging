<?php

namespace App\Support;

use GdImage;
use Illuminate\Support\Str;

/**
 * The app icon: the first letter of APP_NAME in white on the brand blue.
 */
class AppIcon
{
    private const FONT = 'fonts/DejaVuSans-Bold.ttf';

    public function __construct(
        private readonly string $name,
        private readonly string $background,
        private readonly string $foreground,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            (string) config('app.name'),
            (string) config('stays.brand_color'),
            (string) config('stays.on_brand_color'),
        );
    }

    /**
     * The first letter or digit of the name, upper-cased.
     */
    public function letter(): string
    {
        preg_match('/[\p{L}\p{N}]/u', $this->name, $match);

        return Str::upper($match[0] ?? '?');
    }

    /**
     * Changes whenever the name or colours change, so icon URLs can bust browser caches.
     */
    public function version(): string
    {
        return substr(md5($this->letter().$this->background.$this->foreground), 0, 8);
    }

    /**
     * A rounded-square SVG for browser tabs.
     */
    public function svg(): string
    {
        $letter = e($this->letter());

        return <<<SVG
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <rect width="64" height="64" rx="14" fill="{$this->background}"/>
                <text x="32" y="46" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="40" font-weight="700" fill="{$this->foreground}">{$letter}</text>
            </svg>
            SVG;
    }

    /**
     * A square PNG. Full-bleed suits home screens, which round the corners themselves.
     */
    public function png(int $size, bool $rounded = false): string
    {
        // Drawn at 4x and scaled down, which smooths the rounded corners.
        $scale = 4;
        $canvas = $size * $scale;
        $image = imagecreatetruecolor($canvas, $canvas);
        imagesavealpha($image, true);
        imagefill($image, 0, 0, imagecolorallocatealpha($image, 0, 0, 0, 127));

        $background = $this->allocate($image, $this->background);

        if ($rounded) {
            $this->roundedRectangle($image, $canvas, (int) round($canvas * 14 / 64), $background);
        } else {
            imagefilledrectangle($image, 0, 0, $canvas, $canvas, $background);
        }

        $this->drawLetter($image, $canvas);

        $output = imagecreatetruecolor($size, $size);
        imagesavealpha($output, true);
        imagefill($output, 0, 0, imagecolorallocatealpha($output, 0, 0, 0, 127));
        imagecopyresampled($output, $image, 0, 0, 0, 0, $size, $size, $canvas, $canvas);

        ob_start();
        imagepng($output);

        return (string) ob_get_clean();
    }

    /**
     * An ICO holding one PNG, which every current browser reads.
     */
    public function ico(int $size = 48): string
    {
        $png = $this->png($size, rounded: true);

        return pack('vvv', 0, 1, 1)
            .pack('CCCCvvVV', $size, $size, 0, 0, 1, 32, strlen($png), 22)
            .$png;
    }

    private function drawLetter(GdImage $image, int $canvas): void
    {
        $font = resource_path(self::FONT);
        $fontSize = $canvas * 0.45;
        $box = imagettfbbox($fontSize, 0, $font, $this->letter());

        // Centres the glyph's ink, not its line box, so it sits in the middle.
        $width = $box[2] - $box[0];
        $height = $box[1] - $box[7];
        $x = (int) round(($canvas - $width) / 2 - $box[0]);
        $y = (int) round(($canvas + $height) / 2 - $box[1]);

        imagettftext($image, $fontSize, 0, $x, $y, $this->allocate($image, $this->foreground), $font, $this->letter());
    }

    private function roundedRectangle(GdImage $image, int $size, int $radius, int $color): void
    {
        imagefilledrectangle($image, $radius, 0, $size - $radius - 1, $size - 1, $color);
        imagefilledrectangle($image, 0, $radius, $size - 1, $size - $radius - 1, $color);

        foreach ([[$radius, $radius], [$size - $radius - 1, $radius], [$radius, $size - $radius - 1], [$size - $radius - 1, $size - $radius - 1]] as [$x, $y]) {
            imagefilledellipse($image, $x, $y, $radius * 2, $radius * 2, $color);
        }
    }

    private function allocate(GdImage $image, string $hex): int
    {
        [$red, $green, $blue] = sscanf(ltrim($hex, '#'), '%02x%02x%02x');

        return imagecolorallocate($image, $red, $green, $blue);
    }
}
