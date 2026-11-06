const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
const MONTHS_LONG = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

export function toIso(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseIso(iso: string): Date {
    const [year, month, day] = iso.split('-').map(Number);

    return new Date(year, month - 1, day);
}

export function todayIso(): string {
    return toIso(new Date());
}

export function addDays(iso: string, days: number): string {
    const date = parseIso(iso);
    date.setDate(date.getDate() + days);

    return toIso(date);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
    const start = parseIso(checkIn);
    const end = parseIso(checkOut);

    return Math.round(
        (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
            Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
            86_400_000,
    );
}

// "10 Dec"
export function formatShort(iso: string): string {
    const date = parseIso(iso);

    return `${date.getDate()} ${MONTHS_LONG[date.getMonth()].slice(0, 3)}`;
}

// "Thu 10 Dec"
export function formatWeekday(iso: string): string {
    return `${WEEKDAYS_SHORT[parseIso(iso).getDay()]} ${formatShort(iso)}`;
}

// "Thu, 5 Nov"
export function formatDayMonth(iso: string): string {
    return `${WEEKDAYS_SHORT[parseIso(iso).getDay()]}, ${formatShort(iso)}`;
}

// The coming Friday to Sunday. On a Friday, Saturday or Sunday, that means next week's.
export function nextWeekend(today: string): { friday: string; sunday: string } {
    const friday = addDays(today, (5 - parseIso(today).getDay() + 7) % 7 || 7);

    return { friday, sunday: addDays(friday, 2) };
}

// "29–30 Oct", or "26 Nov – 1 Dec" across months
export function formatRange(start: string, end: string): string {
    const first = parseIso(start);
    const last = parseIso(end);

    return first.getMonth() === last.getMonth()
        ? `${first.getDate()}–${formatShort(end)}`
        : `${formatShort(start)} – ${formatShort(end)}`;
}

// "Thu, 29 Oct 2026"
export function formatDayYear(iso: string): string {
    const date = parseIso(iso);

    return `${WEEKDAYS_SHORT[date.getDay()]}, ${formatShort(iso)} ${date.getFullYear()}`;
}

// "10 December 2026"
export function formatLong(iso: string): string {
    const date = parseIso(iso);

    return `${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

// "Thursday 10 December 2026"
export function formatFull(iso: string): string {
    return `${WEEKDAYS_LONG[parseIso(iso).getDay()]} ${formatLong(iso)}`;
}

export function monthTitle(year: number, month: number): string {
    return `${MONTHS_LONG[month]} ${year}`;
}

export function money(amount: number): string {
    return `£${amount.toLocaleString('en-GB')}`;
}

// "£28.10", or "£0" when there are no pence to show.
export function formatMinor(minor: number, currency: string): string {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency,
        minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
    }).format(minor / 100);
}

export function plural(count: number, noun: string, nouns?: string): string {
    return `${count.toLocaleString('en-US')} ${count === 1 ? noun : (nouns ?? `${noun}s`)}`;
}
