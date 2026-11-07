import type { CatalogueProperty, Destination } from './data';

export function serverRequest(
    path: string,
    init: RequestInit = {},
): Promise<Response> {
    const token = /(?:^|; )XSRF-TOKEN=([^;]+)/.exec(document.cookie)?.[1];

    // The browser sets the multipart boundary itself when uploading files.
    const isUpload = init.body instanceof FormData;

    return fetch(path, {
        ...init,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            ...(isUpload ? {} : { 'Content-Type': 'application/json' }),
            ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
        },
    });
}

// Returns null when sent, or a message saying what went wrong.
export async function sendSupportMessage(
    message: string,
    email: string,
): Promise<string | null> {
    try {
        const response = await serverRequest('/stays/support-messages', {
            method: 'POST',
            body: JSON.stringify({ message, email }),
        });

        if (response.ok) {
            return null;
        }

        if (response.status === 429) {
            return "You've sent a few messages in a row. Wait a minute, then try again.";
        }

        const body = (await response.json()) as {
            errors?: Record<string, string[]>;
        };

        return (
            Object.values(body.errors ?? {})[0]?.[0] ??
            "We couldn't send your message. Try again."
        );
    } catch {
        return "We couldn't reach the server. Check your connection and try again.";
    }
}

export async function fetchCatalogue(): Promise<{
    destinations: Destination[];
    properties: CatalogueProperty[];
}> {
    const response = await serverRequest('/stays/properties');

    if (!response.ok) {
        throw new Error('The property catalogue could not be loaded.');
    }

    const body = (await response.json()) as {
        data: CatalogueProperty[];
        destinations: Destination[];
    };

    return { destinations: body.destinations, properties: body.data };
}
