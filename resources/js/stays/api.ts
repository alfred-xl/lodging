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
