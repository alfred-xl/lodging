import type { PhotoScene } from './components/photo';
import { addDays, nightsBetween, todayIso } from './format';

export type Feature =
    | 'breakfast'
    | 'cancel'
    | 'noPrepay'
    | 'family'
    | 'wifi'
    | 'pool'
    | 'parking'
    | 'spa'
    | 'gym'
    | 'bar'
    | 'pets';

export type PropertyType = 'Hotel' | 'Apartment' | 'Guest house';

export type Rate = {
    id: string;
    name: string;
    factor: number;
    cancellable: boolean;
    breakfast: boolean;
    noPrepay: boolean;
};

export type Room = {
    id: string;
    name: string;
    bed: string;
    beds: number;
    size: number;
    sleeps: number;
    factor: number;
    chips: string[];
    description: string;
};

export type Hotel = {
    id: string;
    name: string;
    destinationId: string;
    type: PropertyType;
    area: string;
    address: string;
    distanceKm: number;
    stars: number;
    preferred: boolean;
    score: number;
    reviewCount: number;
    nightly: number;
    originalNightly: number | null;
    deal: string | null;
    taxRate: number;
    leftAtPrice: number | null;
    features: Feature[];
    photos: PhotoScene[];
    images: HotelImage[];
    map: { x: number; y: number };
    about: string;
    phone?: string;
    unlisted?: boolean;
    checkInTime: string;
    checkOutTime: string;
    subscores: { label: string; score: number }[];
    quotes: { author: string; country: string; text: string }[];
    rooms: Room[];
};

export type HotelImage = {
    url: string;
    kind: 'exterior' | 'room' | 'lobby' | 'breakfast';
    alt: string;
    credit: string;
    license: string;
    sourceUrl: string | null;
};

export type Destination = { id: string; name: string; country: string };

// The shape of each property in GET /stays/properties.
export type CatalogueProperty = {
    slug: string;
    name: string;
    destination: string;
    area: string | null;
    position: number;
    address: string;
    phone: string | null;
    check_in_time: string;
    check_out_time: string;
    type: PropertyType;
    stars: number;
    preferred: boolean;
    review_score: number | null;
    review_count: number;
    nightly_price: number | null;
    original_price: number | null;
    deal: string | null;
    tax_rate: number;
    left_at_price: number | null;
    distance_km: number | null;
    features: Feature[];
    description: string | null;
    images: {
        url: string;
        kind: HotelImage['kind'];
        alt: string;
        credit: string;
        license: string;
        source_url: string | null;
    }[];
};

export type Search = {
    destinationId: string;
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children: number;
};

// Filled from the server by loadCatalogue when the app starts.
export const DESTINATIONS: Destination[] = [];

const FEATURE_LABELS: Record<Feature, string> = {
    breakfast: 'Very good breakfast',
    cancel: 'Free cancellation',
    noPrepay: 'No prepayment needed',
    family: 'Family rooms',
    wifi: 'Free WiFi',
    pool: 'Swimming pool',
    parking: 'Free parking',
    spa: 'Spa',
    gym: 'Fitness centre',
    bar: 'Bar',
    pets: 'Pets allowed',
};

export function featureLabel(feature: Feature): string {
    return FEATURE_LABELS[feature];
}

export const RATES: Rate[] = [
    {
        id: 'flexible',
        name: 'Flexible',
        factor: 1,
        cancellable: true,
        breakfast: false,
        noPrepay: false,
    },
    {
        id: 'breakfast',
        name: 'Breakfast included',
        factor: 1.12,
        cancellable: true,
        breakfast: true,
        noPrepay: true,
    },
    {
        id: 'saver',
        name: 'Non-refundable',
        factor: 0.9,
        cancellable: false,
        breakfast: false,
        noPrepay: false,
    },
];

const ROOM_TEMPLATES: Omit<Room, 'id'>[] = [
    {
        name: 'Standard Double Room',
        bed: '1 large double bed',
        beds: 1,
        size: 17,
        sleeps: 2,
        factor: 1,
        chips: ['Free WiFi', 'Air conditioning', 'Private bathroom'],
        description:
            'A compact, quiet room with a work desk, a rain shower and blackout curtains.',
    },
    {
        name: 'Twin Room with City View',
        bed: '2 single beds',
        beds: 2,
        size: 22,
        sleeps: 2,
        factor: 1.15,
        chips: ['City view', 'Free WiFi', 'Coffee machine'],
        description:
            'A bright corner room with two single beds and large windows facing the city.',
    },
    {
        name: 'Family Suite',
        bed: '1 king bed and 2 single beds',
        beds: 3,
        size: 38,
        sleeps: 4,
        factor: 1.6,
        chips: ['Balcony', 'Free WiFi', 'Sofa'],
        description:
            'A separate bedroom and living area with space for two adults and two children.',
    },
];

function reviewerFor(index: number) {
    const reviewers = [
        ['Amara', 'United Kingdom'],
        ['Tomas', 'Ireland'],
        ['Priya', 'United Kingdom'],
        ['Jonah', 'Canada'],
        ['Lucia', 'Spain'],
        ['Kenji', 'Japan'],
    ];

    return reviewers[index % reviewers.length];
}

const QUOTES = [
    'Friendly staff and a very comfortable bed. We would stay here again.',
    'Great location, with everything we wanted within a short walk.',
    'Spotless room and a quiet street. Check-in took two minutes.',
    'Breakfast was the highlight, with plenty of fresh local choices.',
];

const GALLERY: PhotoScene[] = [
    'exterior',
    'room',
    'lobby',
    'pool',
    'coast',
    'city',
    'room',
    'exterior',
];

function hotelFromCatalogue(
    property: CatalogueProperty,
    destinationIndex: number,
): Hotel {
    const index = property.position;
    const score = property.review_score ?? 0;
    const roomCount = property.features.includes('family') ? 3 : 2;

    return {
        id: property.slug,
        name: property.name,
        destinationId: property.destination,
        type: property.type,
        area: property.area ?? '',
        address: property.address,
        distanceKm: property.distance_km ?? 0,
        stars: property.stars,
        preferred: property.preferred,
        score,
        reviewCount: property.review_count,
        nightly: property.nightly_price ?? 0,
        originalNightly: property.original_price,
        deal: property.deal,
        taxRate: property.tax_rate,
        leftAtPrice: property.left_at_price,
        features: property.features,
        photos: GALLERY.slice(0, 5 + (index % 4)),
        images: property.images.map((image) => ({
            url: image.url,
            kind: image.kind,
            alt: image.alt,
            credit: image.credit,
            license: image.license,
            sourceUrl: image.source_url,
        })),
        // A loose grid with a little jitter, so price pins don't cover each other.
        map: {
            x: 18 + (index % 3) * 32 + ((index + destinationIndex) % 3) * 2 - 2,
            y: 7 + Math.floor(index / 3) * 13 + ((index * 5) % 3),
        },
        phone: property.phone ?? undefined,
        checkInTime: property.check_in_time,
        checkOutTime: property.check_out_time,
        about: property.description ?? '',
        // Review breakdowns and quotes aren't stored, so they're derived for the prototype.
        subscores: ['Location', 'Staff', 'Cleanliness', 'Comfort', 'Value'].map(
            (label, position) => ({
                label,
                score:
                    Math.round(
                        Math.min(
                            10,
                            score + ((position + index) % 4) / 5 - 0.2,
                        ) * 10,
                    ) / 10,
            }),
        ),
        quotes: [0, 1].map((position) => {
            const [author, country] = reviewerFor(index + position);

            return {
                author,
                country,
                text: QUOTES[(index + position) % QUOTES.length],
            };
        }),
        rooms: ROOM_TEMPLATES.slice(0, roomCount).map((room, position) => ({
            ...room,
            id: `room-${position + 1}`,
        })),
    };
}

export const HOTELS: Hotel[] = [];

let resolveCatalogue: () => void = () => undefined;

// Resolves once the catalogue has loaded, so the splash screen can wait for it.
export const catalogueReady = new Promise<void>((resolve) => {
    resolveCatalogue = resolve;
});

export function loadCatalogue(
    destinations: Destination[],
    properties: CatalogueProperty[],
): void {
    const fromBookings = HOTELS.filter((hotel) => hotel.unlisted);

    DESTINATIONS.splice(0, DESTINATIONS.length, ...destinations);
    HOTELS.splice(
        0,
        HOTELS.length,
        ...properties.map((property) =>
            hotelFromCatalogue(
                property,
                destinations.findIndex(
                    (destination) => destination.id === property.destination,
                ),
            ),
        ),
        ...fromBookings,
    );
    resolveCatalogue();
}

// Adds a property that came with a signed-in user's booking, or its extra rooms.
export function registerHotel(hotel: Hotel): void {
    const existing = HOTELS.find((item) => item.id === hotel.id);

    if (!existing) {
        HOTELS.push(hotel);

        return;
    }

    existing.rooms = [
        ...existing.rooms,
        ...hotel.rooms.filter(
            (room) => !existing.rooms.some((item) => item.id === room.id),
        ),
    ];
}

export function destinationById(id: string): Destination {
    return (
        DESTINATIONS.find((destination) => destination.id === id) ?? {
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            country: '',
        }
    );
}

export function hotelById(id: string | undefined): Hotel | undefined {
    return HOTELS.find((hotel) => hotel.id === id);
}

export function hotelsIn(destinationId: string): Hotel[] {
    return HOTELS.filter(
        (hotel) => hotel.destinationId === destinationId && !hotel.unlisted,
    );
}

export type Price = {
    nights: number;
    rooms: number;
    current: number;
    original: number | null;
    taxes: number;
};

export function priceFor(
    hotel: Hotel,
    search: Pick<Search, 'checkIn' | 'checkOut' | 'rooms'>,
    factor = 1,
): Price {
    const nights = nightsBetween(search.checkIn, search.checkOut);
    const units = nights * search.rooms;
    const current = Math.round(hotel.nightly * factor * units);

    return {
        nights,
        rooms: search.rooms,
        current,
        original: hotel.originalNightly
            ? Math.round(hotel.originalNightly * factor * units)
            : null,
        taxes: Math.round(current * hotel.taxRate),
    };
}

export type FilterGroup =
    | 'Popular'
    | 'Property type'
    | 'Review score'
    | 'Facilities';

export type FilterOption = {
    id: string;
    label: string;
    group: FilterGroup;
    test: (hotel: Hotel) => boolean;
};

function has(feature: Feature) {
    return (hotel: Hotel) => hotel.features.includes(feature);
}

export const FILTERS: FilterOption[] = [
    {
        id: 'breakfast',
        label: 'Breakfast included',
        group: 'Popular',
        test: has('breakfast'),
    },
    {
        id: 'cancel',
        label: 'Free cancellation',
        group: 'Popular',
        test: has('cancel'),
    },
    {
        id: 'noPrepay',
        label: 'No prepayment',
        group: 'Popular',
        test: has('noPrepay'),
    },
    {
        id: 'family',
        label: 'Family rooms',
        group: 'Popular',
        test: has('family'),
    },
    {
        id: 'hotel',
        label: 'Hotels',
        group: 'Property type',
        test: (hotel) => hotel.type === 'Hotel',
    },
    {
        id: 'apartment',
        label: 'Apartments',
        group: 'Property type',
        test: (hotel) => hotel.type === 'Apartment',
    },
    {
        id: 'guesthouse',
        label: 'Guest houses',
        group: 'Property type',
        test: (hotel) => hotel.type === 'Guest house',
    },
    {
        id: 'score9',
        label: 'Wonderful: 9+',
        group: 'Review score',
        test: (hotel) => hotel.score >= 9,
    },
    {
        id: 'score8',
        label: 'Very good: 8+',
        group: 'Review score',
        test: (hotel) => hotel.score >= 8,
    },
    {
        id: 'pool',
        label: 'Swimming pool',
        group: 'Facilities',
        test: has('pool'),
    },
    {
        id: 'parking',
        label: 'Free parking',
        group: 'Facilities',
        test: has('parking'),
    },
    { id: 'spa', label: 'Spa', group: 'Facilities', test: has('spa') },
    {
        id: 'gym',
        label: 'Fitness centre',
        group: 'Facilities',
        test: has('gym'),
    },
    {
        id: 'pets',
        label: 'Pets allowed',
        group: 'Facilities',
        test: has('pets'),
    },
];

export const RESULT_CHIP_IDS = [
    'hotel',
    'breakfast',
    'cancel',
    'family',
    'pool',
    'score9',
];

export const FILTER_GROUPS: FilterGroup[] = [
    'Popular',
    'Property type',
    'Review score',
    'Facilities',
];

function optionsFor(selected: string[]): FilterOption[] {
    return FILTERS.filter((option) => selected.includes(option.id));
}

// Property types are alternatives, so they match with OR. Everything else narrows with AND.
function matchesAll(hotel: Hotel, selected: string[]): boolean {
    const options = optionsFor(selected);
    const types = options.filter((option) => option.group === 'Property type');
    const others = options.filter((option) => option.group !== 'Property type');

    return (
        (types.length === 0 || types.some((option) => option.test(hotel))) &&
        others.every((option) => option.test(hotel))
    );
}

export function applyFilters(hotels: Hotel[], selected: string[]): Hotel[] {
    return hotels.filter((hotel) => matchesAll(hotel, selected));
}

export function filterCount(
    hotels: Hotel[],
    selected: string[],
    option: FilterOption,
): number {
    const others =
        option.group === 'Property type'
            ? selected.filter(
                  (id) =>
                      FILTERS.find((filter) => filter.id === id)?.group !==
                      'Property type',
              )
            : selected;

    return hotels.filter(
        (hotel) => option.test(hotel) && matchesAll(hotel, others),
    ).length;
}

export type SortId = 'top' | 'price' | 'score' | 'stars' | 'distance';

export const SORTS: { id: SortId; label: string }[] = [
    { id: 'top', label: 'Our top picks' },
    { id: 'price', label: 'Lowest price first' },
    { id: 'score', label: 'Best reviewed first' },
    { id: 'stars', label: 'Most stars first' },
    { id: 'distance', label: 'Closest to the centre' },
];

export function sortHotels(hotels: Hotel[], sort: SortId): Hotel[] {
    const sorted = [...hotels];

    switch (sort) {
        case 'price':
            return sorted.sort((a, b) => a.nightly - b.nightly);
        case 'score':
            return sorted.sort((a, b) => b.score - a.score);
        case 'stars':
            return sorted.sort((a, b) => b.stars - a.stars);
        case 'distance':
            return sorted.sort((a, b) => a.distanceKm - b.distanceKm);
        default:
            return sorted;
    }
}

export function reviewLabel(score: number): string {
    if (score >= 9) {
        return 'Wonderful';
    }

    if (score >= 8) {
        return 'Very good';
    }

    if (score >= 7) {
        return 'Good';
    }

    return 'Pleasant';
}

// Starts with no destination and tonight's dates, as the app does on launch.
export function defaultSearch(): Search {
    const checkIn = todayIso();

    return {
        destinationId: '',
        checkIn,
        checkOut: addDays(checkIn, 1),
        rooms: 1,
        adults: 2,
        children: 0,
    };
}
