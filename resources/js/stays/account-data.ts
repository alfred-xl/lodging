import { serverRequest } from './api';
import type { User } from './auth/mock-auth';

// The My account pages read and change everything through this file. Accounts in the
// database use the Laravel endpoints under /stays/account. Mock accounts keep the same
// shape on this device only.

export type Gender = 'man' | 'woman' | 'non_binary' | 'prefer_not_to_say';

export const GENDER_LABELS: Record<Gender, string> = {
    man: 'I am a man',
    woman: 'I am a woman',
    non_binary: 'I am non-binary',
    prefer_not_to_say: "I'd rather not say",
};

export type Address = {
    line: string;
    city: string;
    postcode: string;
    country: string;
};

export type Passport = {
    lastDigits: string;
    country: string;
    expiresOn: string;
};

export type PaymentCard = {
    id: string;
    brand: string;
    lastFour: string;
    expMonth: number;
    expYear: number;
    holderName: string | null;
};

export type Transaction = {
    id: string;
    category: string;
    description: string;
    cardBrand: string;
    cardLastFour: string;
    amountMinor: number;
    currency: string;
    status: 'paid' | 'refunded';
    processedOn: string;
    processedAt: string;
};

export type AccountDetails = {
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    avatarUrl?: string;
    displayName: string | null;
    gender: Gender | null;
    dateOfBirth: string | null;
    phone: string | null;
    nationality: string | null;
    address: Address | null;
    passport: Passport | null;
    walletCreditMinor: number;
    walletCurrency: string;
    cards: PaymentCard[];
    transactions: Transaction[];
};

// Uses the server's field names, so mock accounts and real ones send the same thing.
export type ProfileChanges = Partial<{
    first_name: string;
    last_name: string;
    display_name: string | null;
    gender: Gender | null;
    date_of_birth: string | null;
    phone: string | null;
    nationality: string | null;
    address_line: string | null;
    address_city: string | null;
    address_postcode: string | null;
    address_country: string | null;
    passport_number: string | null;
    passport_country: string | null;
    passport_expires_on: string | null;
}>;

export type NewCard = {
    brand: string;
    last_four: string;
    exp_month: number;
    exp_year: number;
    holder_name: string | null;
};

// Field name to message. `form` holds anything that isn't about one field.
export type FieldErrors = Record<string, string>;

export type AccountResult =
    | { details: AccountDetails; errors?: undefined }
    | { details?: undefined; errors: FieldErrors };

export const SERVER_UNREACHABLE =
    "We couldn't reach the server. Check your connection and try again.";

type ServerAccount = {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    email_verified: boolean;
    display_name: string | null;
    gender: Gender | null;
    date_of_birth: string | null;
    phone: string | null;
    nationality: string | null;
    address: Address | null;
    passport: {
        last_digits: string;
        country: string;
        expires_on: string;
    } | null;
    wallet: { credit_minor: number; currency: string };
    cards: {
        id: number;
        brand: string;
        last_four: string;
        exp_month: number;
        exp_year: number;
        holder_name: string | null;
    }[];
    transactions: {
        id: number;
        category: string;
        description: string;
        card_brand: string;
        card_last_four: string;
        amount_minor: number;
        currency: string;
        status: 'paid' | 'refunded';
        processed_on: string;
        processed_at: string;
    }[];
};

function detailsFrom(account: ServerAccount): AccountDetails {
    return {
        firstName: account.first_name,
        lastName: account.last_name,
        email: account.email,
        emailVerified: account.email_verified,
        avatarUrl: account.avatar_url ?? undefined,
        displayName: account.display_name,
        gender: account.gender,
        dateOfBirth: account.date_of_birth,
        phone: account.phone,
        nationality: account.nationality,
        address: account.address,
        passport: account.passport && {
            lastDigits: account.passport.last_digits,
            country: account.passport.country,
            expiresOn: account.passport.expires_on,
        },
        walletCreditMinor: account.wallet.credit_minor,
        walletCurrency: account.wallet.currency,
        cards: account.cards.map((card) => ({
            id: String(card.id),
            brand: card.brand,
            lastFour: card.last_four,
            expMonth: card.exp_month,
            expYear: card.exp_year,
            holderName: card.holder_name,
        })),
        transactions: account.transactions.map((item) => ({
            id: String(item.id),
            category: item.category,
            description: item.description,
            cardBrand: item.card_brand,
            cardLastFour: item.card_last_four,
            amountMinor: item.amount_minor,
            currency: item.currency,
            status: item.status,
            processedOn: item.processed_on,
            processedAt: item.processed_at,
        })),
    };
}

// Returns null once the server session has ended.
export async function fetchAccount(): Promise<AccountDetails | null> {
    const response = await serverRequest('/stays/account');

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error('Account details could not be loaded.');
    }

    const { data } = (await response.json()) as { data: ServerAccount };

    return detailsFrom(data);
}

async function send(path: string, init: RequestInit): Promise<AccountResult> {
    try {
        const response = await serverRequest(path, init);
        const body = (await response.json()) as {
            data?: ServerAccount;
            errors?: Record<string, string[]>;
            message?: string;
        };

        if (response.ok && body.data) {
            return { details: detailsFrom(body.data) };
        }

        if (body.errors) {
            return {
                errors: Object.fromEntries(
                    Object.entries(body.errors).map(([field, messages]) => [
                        field,
                        messages[0],
                    ]),
                ),
            };
        }

        return {
            errors: {
                form:
                    response.status === 401
                        ? 'Your session has ended. Sign in again to make changes.'
                        : SERVER_UNREACHABLE,
            },
        };
    } catch {
        return { errors: { form: SERVER_UNREACHABLE } };
    }
}

export function patchAccount(changes: ProfileChanges): Promise<AccountResult> {
    return send('/stays/account', {
        method: 'PATCH',
        body: JSON.stringify(changes),
    });
}

export function uploadAvatar(photo: File): Promise<AccountResult> {
    const body = new FormData();
    body.append('photo', photo);

    return send('/stays/account/avatar', { method: 'POST', body });
}

export function deleteAvatar(): Promise<AccountResult> {
    return send('/stays/account/avatar', { method: 'DELETE' });
}

export function createCard(card: NewCard): Promise<AccountResult> {
    return send('/stays/account/cards', {
        method: 'POST',
        body: JSON.stringify(card),
    });
}

export function deleteCard(id: string): Promise<AccountResult> {
    return send(`/stays/account/cards/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}

// Mock accounts: the same changes, applied on this device.

export function blankAccount(user: User): AccountDetails {
    return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: true,
        avatarUrl: user.avatarUrl,
        displayName: null,
        gender: null,
        dateOfBirth: null,
        phone: null,
        nationality: null,
        address: null,
        passport: null,
        walletCreditMinor: 0,
        walletCurrency: 'GBP',
        cards: [],
        transactions: [],
    };
}

function has<K extends keyof ProfileChanges>(
    changes: ProfileChanges,
    key: K,
): boolean {
    return Object.prototype.hasOwnProperty.call(changes, key);
}

// Only the passport's last digits are kept, as on the server.
export function applyChanges(
    account: AccountDetails,
    changes: ProfileChanges,
): AccountDetails {
    const next = { ...account };

    if (changes.first_name !== undefined && changes.last_name !== undefined) {
        next.firstName = changes.first_name.trim();
        next.lastName = changes.last_name.trim();
    }

    if (has(changes, 'display_name')) {
        next.displayName = changes.display_name ?? null;
    }

    if (has(changes, 'gender')) {
        next.gender = changes.gender ?? null;
    }

    if (has(changes, 'date_of_birth')) {
        next.dateOfBirth = changes.date_of_birth ?? null;
    }

    if (has(changes, 'phone')) {
        next.phone = changes.phone ?? null;
    }

    if (has(changes, 'nationality')) {
        next.nationality = changes.nationality ?? null;
    }

    if (has(changes, 'address_line')) {
        next.address = changes.address_line
            ? {
                  line: changes.address_line,
                  city: changes.address_city ?? '',
                  postcode: changes.address_postcode ?? '',
                  country: changes.address_country ?? '',
              }
            : null;
    }

    if (has(changes, 'passport_number')) {
        next.passport = changes.passport_number
            ? {
                  lastDigits: changes.passport_number.slice(-3),
                  country: changes.passport_country ?? '',
                  expiresOn: changes.passport_expires_on ?? '',
              }
            : null;
    }

    return next;
}

export function cardFrom(card: NewCard): PaymentCard {
    return {
        id: `local-${Date.now()}`,
        brand: card.brand,
        lastFour: card.last_four,
        expMonth: card.exp_month,
        expYear: card.exp_year,
        holderName: card.holder_name,
    };
}

// Mock accounts keep a small copy of the photo, because a full one can fill storage.
export function shrinkPhoto(photo: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(photo);
        const image = new Image();

        image.onload = () => {
            const size = 256;
            const side = Math.min(image.width, image.height);
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            canvas
                .getContext('2d')
                ?.drawImage(
                    image,
                    (image.width - side) / 2,
                    (image.height - side) / 2,
                    side,
                    side,
                    0,
                    0,
                    size,
                    size,
                );
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('That file isn’t a photo we can read.'));
        };
        image.src = url;
    });
}

// No codes exist in this prototype, so every code is turned down after a short wait.
export async function redeemCoupon(code: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    return code.trim()
        ? "We couldn't find that coupon code. Check it and try again."
        : 'Enter a coupon code.';
}

// Cards

export function cardBrand(digits: string): string | null {
    if (digits.startsWith('4')) {
        return 'Visa';
    }

    if (/^3[47]/.test(digits)) {
        return 'American Express';
    }

    if (/^(5018|5020|5038|6304|6759|676[1-3])/.test(digits)) {
        return 'Maestro';
    }

    if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) {
        return 'Mastercard';
    }

    if (/^(6011|65|64[4-9])/.test(digits)) {
        return 'Discover';
    }

    return null;
}

export function passesLuhn(digits: string): boolean {
    let sum = 0;

    for (let index = 0; index < digits.length; index++) {
        let digit = Number(digits[digits.length - 1 - index]);

        if (index % 2 === 1) {
            digit *= 2;

            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
    }

    return digits.length > 0 && sum % 10 === 0;
}

// Countries offered for phone numbers, addresses, passports and nationality.
export const COUNTRIES = [
    { name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
    { name: 'Ireland', dial: '+353', flag: '🇮🇪' },
    { name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
    { name: 'Ghana', dial: '+233', flag: '🇬🇭' },
    { name: 'Kenya', dial: '+254', flag: '🇰🇪' },
    { name: 'South Africa', dial: '+27', flag: '🇿🇦' },
    { name: 'United States', dial: '+1', flag: '🇺🇸' },
    { name: 'Canada', dial: '+1', flag: '🇨🇦' },
    { name: 'France', dial: '+33', flag: '🇫🇷' },
    { name: 'Germany', dial: '+49', flag: '🇩🇪' },
    { name: 'Spain', dial: '+34', flag: '🇪🇸' },
    { name: 'Italy', dial: '+39', flag: '🇮🇹' },
    { name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
    { name: 'Portugal', dial: '+351', flag: '🇵🇹' },
    { name: 'Poland', dial: '+48', flag: '🇵🇱' },
    { name: 'India', dial: '+91', flag: '🇮🇳' },
    { name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
    { name: 'China', dial: '+86', flag: '🇨🇳' },
    { name: 'Japan', dial: '+81', flag: '🇯🇵' },
    { name: 'Australia', dial: '+61', flag: '🇦🇺' },
    { name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
    { name: 'Brazil', dial: '+55', flag: '🇧🇷' },
];

// Longest dial code first, so +353 isn't read as +3.
export function splitPhone(phone: string): { dial: string; number: string } {
    const match = [...COUNTRIES]
        .sort((a, b) => b.dial.length - a.dial.length)
        .find((country) => phone.startsWith(country.dial));

    return match
        ? { dial: match.dial, number: phone.slice(match.dial.length) }
        : { dial: '+44', number: phone.replace(/^\+/, '') };
}

export function flagFor(phone: string): string {
    // Codes shared by several countries, like +1, show the first one listed.
    const { dial } = splitPhone(phone);

    return COUNTRIES.find((country) => country.dial === dial)?.flag ?? '';
}
