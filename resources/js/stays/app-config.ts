// Settings from .env, written into meta tags by stays.blade.php.

function meta(name: string): string {
    return (
        document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
            ?.content ?? ''
    );
}

// SUPPORT_PHONE in .env. It defaults to a fictional number that rings no one.
export const SUPPORT_PHONE = meta('support-phone') || '+44 20 7946 0123';
