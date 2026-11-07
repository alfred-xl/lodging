<?php

namespace App\Support;

use GdImage;
use Illuminate\Support\Str;

/**
 * The app icon: APP_NAME in full, in white, sized to fit the icon's width.
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
            (string) config('stays.icon_color'),
            (string) config('stays.on_brand_color'),
        );
    }

    /**
     * The name as shown on the icon, with spacing tidied.
     */
    public function text(): string
    {
        return Str::squish($this->name) ?: '?';
    }

    /**
     * Changes whenever the name or colours change, so icon URLs can bust browser caches.
     */
    public function version(): string
    {
        return substr(md5($this->text().$this->background.$this->foreground), 0, 8);
    }

    /**
     * A rounded-square SVG for browser tabs.
     */
    public function svg(): string
    {
        $text = e($this->text());

        // Long names get a smaller size, and textLength stretches or squeezes them to fit.
        $fontSize = round(min(22, 54 / (mb_strlen($this->text()) * 0.6)), 1);
        $width = round(min(52, mb_strlen($this->text()) * $fontSize * 0.62), 1);
        $baseline = round(32 + $fontSize * 0.36, 1);

        return <<<SVG
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <rect width="64" height="64" rx="14" fill="{$this->background}"/>
                <text x="32" y="{$baseline}" text-anchor="middle" textLength="{$width}" lengthAdjust="spacingAndGlyphs" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="{$fontSize}" font-weight="700" fill="{$this->foreground}">{$text}</text>
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

        // Sized so the name fills 80% of the width, but never taller than 40% of the icon.
        $box = imagettfbbox(100, 0, $font, $this->text());
        $fontSize = 100 * min(
            ($canvas * 0.8) / ($box[2] - $box[0]),
            ($canvas * 0.4) / ($box[1] - $box[7]),
        );
        $box = imagettfbbox($fontSize, 0, $font, $this->text());

        // Centres the glyph's ink, not its line box, so it sits in the middle.
        $width = $box[2] - $box[0];
        $height = $box[1] - $box[7];
        $x = (int) round(($canvas - $width) / 2 - $box[0]);
        $y = (int) round(($canvas + $height) / 2 - $box[1]);

        imagettftext($image, $fontSize, 0, $x, $y, $this->allocate($image, $this->foreground), $font, $this->text());
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
