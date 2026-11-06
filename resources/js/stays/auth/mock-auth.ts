import { serverRequest } from '../api';
import type { Hotel, HotelImage } from '../data';
import { SEED_USERS } from '../fixtures/users';
import type { BookingStatus, MockBooking } from '../store';

// Every call the app makes for authentication goes through this file. Accounts in the
// database sign in with a password through the app's own Laravel session endpoint. Everything else here is still mock,
// so to connect a real provider, replace these functions and keep their signatures.

export type User = {
    firstName: string;
    lastName: string;
    email: string;
    remote?: boolean;
    avatarUrl?: string;
};

const SESSION_KEY = 'lodgely.session.v2';
const USERS_KEY = 'lodgely.users';
const NETWORK_DELAY_MS = 600;

let activeCode: { email: string; code: string } | null = null;

// Passwords chosen at sign-up stay in memory only, because people reuse real ones.
const sessionPasswords = new Map<string, string>();

function wait(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
}

function readJson<T>(key: string): T | null {
    try {
        const value = window.localStorage.getItem(key);

        return value ? (JSON.parse(value) as T) : null;
    } catch {
        return null;
    }
}

function writeJson(key: string, value: unknown): void {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Private windows can block storage. The session then lasts until reload.
    }
}

function normalize(email: string): string {
    return email.trim().toLowerCase();
}

function registeredUsers(): User[] {
    return readJson<User[]>(USERS_KEY) ?? [];
}

function findUser(email: string): User | null {
    const address = normalize(email);
    const seed = SEED_USERS.find((user) => user.email === address);

    if (seed) {
        return {
            firstName: seed.firstName,
            lastName: seed.lastName,
            email: seed.email,
        };
    }

    return registeredUsers().find((user) => user.email === address) ?? null;
}

// `remote` means the account is in the database, so it needs a real password.
export async function accountStatus(
    email: string,
): Promise<{ exists: boolean; remote: boolean }> {
    await wait();

    if (findUser(email) !== null) {
        return { exists: true, remote: false };
    }

    try {
        const response = await serverRequest('/stays/account-lookups', {
            method: 'POST',
            body: JSON.stringify({ email: email.trim() }),
        });
        const { exists } = (await response.json()) as { exists?: boolean };

        return { exists: exists === true, remote: exists === true };
    } catch {
        return { exists: false, remote: false };
    }
}

// Returns the code only because this mock has no inbox. A real provider sends it
// and returns nothing, and the development banner goes away with this return value.
export async function sendVerificationCode(email: string): Promise<string> {
    await wait();

    const code = String(Math.floor(100_000 + Math.random() * 900_000));
    activeCode = { email: normalize(email), code };

    return code;
}

export async function verifyCode(
    email: string,
    code: string,
): Promise<boolean> {
    await wait();

    return activeCode?.email === normalize(email) && activeCode.code === code;
}

export async function signInWithCode(email: string): Promise<User | null> {
    return findUser(email);
}

export const WRONG_PASSWORD =
    "That password isn't right. Check it and try again, or use Forgot your password.";

// Returns the user, or a message saying what went wrong.
export async function signInWithPassword(
    email: string,
    password: string,
): Promise<User | string> {
    const address = normalize(email);
    const seed = SEED_USERS.find((user) => user.email === address);
    const expected = seed?.password ?? sessionPasswords.get(address);

    if (expected !== undefined) {
        await wait();

        return expected === password
            ? (findUser(address) ?? WRONG_PASSWORD)
            : WRONG_PASSWORD;
    }

    return signInToServer(address, password);
}

type ServerBooking = {
    id: number;
    reference: string;
    status: BookingStatus;
    room_name: string;
    rate: string;
    check_in: string;
    check_out: string;
    rooms: number;
    adults: number;
    children: number;
    guest_name: string;
    contact_email: string;
    benefits: string | null;
    total_minor: number;
    currency: string;
    property: {
        slug: string;
        name: string;
        destination: string;
        address: string;
        phone: string | null;
        check_in_time: string;
        check_out_time: string;
        images: Pick<HotelImage, 'url' | 'kind' | 'alt'>[];
    };
};

type ServerTrips = {
    data: ServerBooking[];
    user: {
        first_name: string;
        last_name: string;
        email: string;
        avatar_url: string | null;
    };
};

const SERVER_UNREACHABLE =
    "We couldn't reach the server. Check your connection and try again.";

// Returns the user, or a message saying what went wrong.
async function signInToServer(
    email: string,
    password: string,
): Promise<User | string> {
    try {
        // Refreshes the CSRF cookie, which can go stale while the page is open.
        await serverRequest('/stays/session');

        const response = await serverRequest('/stays/session', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        const body = (await response.json()) as {
            data?: ServerTrips['user'];
            errors?: { email?: string[] };
        };

        if (!response.ok || !body.data) {
            return body.errors?.email?.[0] ?? SERVER_UNREACHABLE;
        }

        return {
            firstName: body.data.first_name,
            lastName: body.data.last_name,
            email: body.data.email,
            remote: true,
            avatarUrl: body.data.avatar_url ?? undefined,
        };
    } catch {
        return SERVER_UNREACHABLE;
    }
}

function roomId(booking: ServerBooking): string {
    return `room-${booking.id}`;
}

// The database only holds what the booking shows, so the rest stays empty. A property's
// page hides its review and facility sections when there's nothing to show.
function hotelFrom(booking: ServerBooking): Hotel {
    const { property } = booking;

    return {
        id: property.slug,
        name: property.name,
        destinationId: property.destination,
        unlisted: true,
        type: 'Guest house',
        area: '',
        address: property.address,
        distanceKm: 0,
        stars: 0,
        preferred: false,
        score: 0,
        reviewCount: 0,
        nightly: 36,
        originalNightly: null,
        deal: null,
        taxRate: 0,
        leftAtPrice: null,
        features: [],
        photos: ['room', 'exterior', 'lobby', 'city'],
        images: property.images.map((image) => ({
            ...image,
            credit: '',
            license: '',
            sourceUrl: null,
        })),
        map: { x: 50, y: 40 },
        phone: property.phone ?? undefined,
        checkInTime: property.check_in_time,
        checkOutTime: property.check_out_time,
        about: `${property.name}, ${property.address}.`,
        subscores: [],
        quotes: [],
        rooms: [
            {
                id: roomId(booking),
                name: booking.room_name,
                bed: 'See room details',
                beds: 1,
                size: 0,
                sleeps: 2,
                factor: 1,
                chips: [],
                description: booking.room_name,
            },
        ],
    };
}

function bookingFrom(booking: ServerBooking): MockBooking {
    return {
        id: String(booking.id),
        reference: booking.reference,
        status: booking.status,
        hotelId: booking.property.slug,
        roomId: roomId(booking),
        rateId: booking.rate,
        fromServer: true,
        search: {
            destinationId: booking.property.destination,
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            rooms: booking.rooms,
            adults: booking.adults,
            children: booking.children,
        },
        guestName: booking.guest_name,
        contactEmail: booking.contact_email,
        benefits: booking.benefits ?? undefined,
        totalText: new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: booking.currency,
        }).format(booking.total_minor / 100),
    };
}

// Returns null once the server session has ended.
export async function fetchTrips(): Promise<{
    email: string;
    avatarUrl?: string;
    bookings: MockBooking[];
    hotels: Hotel[];
} | null> {
    const response = await serverRequest('/stays/trips');

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error('Trips could not be loaded.');
    }

    const { data, user } = (await response.json()) as ServerTrips;

    return {
        email: user.email,
        avatarUrl: user.avatar_url ?? undefined,
        bookings: data.map(bookingFrom),
        hotels: data.map(hotelFrom),
    };
}

export function endServerSession(): void {
    void serverRequest('/stays/session', { method: 'DELETE' }).catch(
        () => undefined,
    );
}

export async function requestPasswordReset(email: string): Promise<void> {
    await wait();
    normalize(email);
}

export async function createAccount(details: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}): Promise<User> {
    await wait();

    const user: User = {
        firstName: details.firstName.trim(),
        lastName: details.lastName.trim(),
        email: normalize(details.email),
    };

    writeJson(USERS_KEY, [...registeredUsers(), user]);

    if (details.password) {
        sessionPasswords.set(user.email, details.password);
    }

    return user;
}

export function loadSession<T>(): T | null {
    return readJson<T>(SESSION_KEY);
}

export function saveSession(session: unknown): void {
    writeJson(SESSION_KEY, session);
}

export function clearSession(): void {
    try {
        window.localStorage.removeItem(SESSION_KEY);
    } catch {
        // Nothing was stored if storage is blocked.
    }
}
