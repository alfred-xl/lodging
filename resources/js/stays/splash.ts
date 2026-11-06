import { easing, motion } from './theme';

const MAX_HOLD_MS = 1500;

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// The splash is plain HTML in stays.blade.php, so it paints before any JavaScript
// runs and is never recreated. Returning from the background can't bring it back.
export async function dismissSplash(
    dataReady: Promise<unknown>,
): Promise<void> {
    const splash = document.getElementById('stays-splash');

    if (!splash) {
        return;
    }

    // Waits for fonts and the property catalogue. Timed from page start, so a slow
    // script download counts towards the limit.
    const ready = Promise.all([
        document.fonts.ready,
        dataReady,
        new Promise((resolve) => requestAnimationFrame(resolve)),
    ]);

    await Promise.race([
        ready,
        delay(Math.max(0, MAX_HOLD_MS - performance.now())),
    ]);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        splash.remove();

        return;
    }

    splash.style.pointerEvents = 'none';

    await splash.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: motion.medium,
        easing: easing.appear,
        fill: 'forwards',
    }).finished;

    splash.remove();
}
