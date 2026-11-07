import clsx from 'clsx';
import { Check, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import { TopBar } from '../components/ui';
import { Link } from '../router';
import { useStore } from '../store';
import type { Temperature, Units } from '../store';
import { APP_NAME } from '../theme';

// Shown at the foot of Settings.
const APP_VERSION = '1.0';

type Currency = { code: string; symbol: string; name: string };

const PROPERTY_CURRENCY: Currency = {
    code: 'PROPERTY',
    symbol: '€£$',
    name: "Property's currency",
};

const CURRENCIES: Currency[] = [
    { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso' },
    { code: 'AUD', symbol: 'AUD', name: 'Australian Dollar' },
    { code: 'AZN', symbol: 'ман', name: 'Azerbaijani New Manat' },
    { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'BGN', symbol: 'лв.', name: 'Bulgarian Lev' },
    { code: 'CAD', symbol: 'CAD', name: 'Canadian Dollar' },
    { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso' },
    { code: 'CNY', symbol: '元', name: 'Chinese Yuan' },
    { code: 'COP', symbol: 'COL$', name: 'Colombian Peso' },
    { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
    { code: 'DKK', symbol: 'DKK', name: 'Danish Krone' },
    { code: 'EGP', symbol: 'EGP', name: 'Egyptian Pound' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
    { code: 'INR', symbol: 'Rs.', name: 'Indian Rupee' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
    { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    { code: 'MXN', symbol: 'MXN', name: 'Mexican Peso' },
    { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham' },
    { code: 'NZD', symbol: 'NZD', name: 'New Zealand Dollar' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'NOK', symbol: 'NOK', name: 'Norwegian Krone' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
    { code: 'GBP', symbol: '£', name: 'Pound Sterling' },
    { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'ZAR', symbol: 'ZAR', name: 'South African Rand' },
    { code: 'SEK', symbol: 'SEK', name: 'Swedish Krona' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'TRY', symbol: 'TL', name: 'Turkish Lira' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
    { code: 'USD', symbol: 'US$', name: 'U.S. Dollar' },
];

const SUGGESTED = ['AUD', 'CAD', 'EUR', 'GBP', 'PROPERTY', 'SGD', 'USD'];

function currencyByCode(code: string): Currency | undefined {
    return code === PROPERTY_CURRENCY.code
        ? PROPERTY_CURRENCY
        : CURRENCIES.find((currency) => currency.code === code);
}

export function currencyLabel(code: string): string {
    const currency = currencyByCode(code);

    if (!currency) {
        return code;
    }

    return currency.code === PROPERTY_CURRENCY.code
        ? currency.name
        : `${currency.name} (${currency.symbol})`;
}

export const LANGUAGES = [
    'English (United Kingdom)',
    'English (United States)',
    'Español',
    'Français',
    'Deutsch',
    'Italiano',
    'Português (Portugal)',
    'Nederlands',
];

const UNITS: { id: Units; label: string }[] = [
    { id: 'metric', label: 'Metric (km, m²)' },
    { id: 'imperial', label: 'Imperial (mi, ft²)' },
];

const TEMPERATURES: { id: Temperature; label: string }[] = [
    { id: 'celsius', label: 'Celsius' },
    { id: 'fahrenheit', label: 'Fahrenheit' },
];

function SettingRow({
    to,
    label,
    hint,
    value,
}: {
    to: string;
    label: string;
    hint?: string;
    value: string;
}) {
    return (
        <li>
            <Link
                to={to}
                className="flex min-h-14 items-center gap-3 px-4 py-2 st-transition hover:bg-st-surface-alt"
            >
                {/* Labels keep their words whole; long values wrap instead. */}
                <span className="flex-1">
                    <span className="block st-body1">{label}</span>
                    {hint && (
                        <span className="block st-small1 text-st-text-alt">
                            {hint}
                        </span>
                    )}
                </span>
                <span className="max-w-[55%] text-right st-body1">{value}</span>
                <ChevronRight className="size-5 shrink-0" aria-hidden />
            </Link>
        </li>
    );
}

const ABOUT = [
    { label: `${APP_NAME} Privacy Statement`, slug: 'privacy-statement' },
    { label: 'Car rentals Privacy Statement', slug: 'car-rentals-privacy' },
    { label: 'Manage privacy settings', slug: 'manage-privacy-settings' },
    { label: 'Exercise your data rights', slug: 'data-rights' },
    { label: 'Terms and Conditions', slug: 'terms-and-conditions' },
    { label: 'How we work', slug: 'how-we-work' },
    { label: 'Rate us', slug: 'rate-us' },
];

export const SETTINGS_INFO_TITLES: Record<string, string> = Object.fromEntries(
    ABOUT.map(({ label, slug }) => [slug, label]),
);

export function SettingsScreen() {
    const { prefs } = useStore();

    return (
        <div className="min-h-full bg-st-surface">
            <TopBar title="Settings" fallback="/" back="chevron" />
            <main className="pb-6">
                <section aria-labelledby="device-settings">
                    <h2
                        id="device-settings"
                        className="px-4 pt-4 pb-1 st-strong1"
                    >
                        Device settings
                    </h2>
                    <ul>
                        <SettingRow
                            to="/language"
                            label="Language"
                            hint="Text in this prototype stays in English"
                            value={prefs.language}
                        />
                        <SettingRow
                            to="/currency"
                            label="Currency"
                            value={currencyLabel(prefs.currency)}
                        />
                        <SettingRow
                            to="/units"
                            label="Units"
                            value={
                                UNITS.find(({ id }) => id === prefs.units)
                                    ?.label ?? ''
                            }
                        />
                        <SettingRow
                            to="/temperature"
                            label="Temperature"
                            value={
                                TEMPERATURES.find(
                                    ({ id }) => id === prefs.temperature,
                                )?.label ?? ''
                            }
                        />
                    </ul>
                </section>
                <hr className="mx-4 mt-3 border-st-border-soft" />
                <section aria-labelledby="about">
                    <h2 id="about" className="px-4 pt-6 pb-1 st-strong1">
                        About
                    </h2>
                    <ul>
                        {ABOUT.map(({ label, slug }) => (
                            <li key={slug}>
                                <Link
                                    to={`/info/${slug}`}
                                    className="flex min-h-14 items-center px-4 st-body1 st-transition hover:bg-st-surface-alt"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <p className="px-4 pt-3 st-body1 text-st-text-alt">
                        v {APP_VERSION}
                    </p>
                </section>
            </main>
        </div>
    );
}

function ChoiceRow({
    label,
    leading,
    selected,
    onSelect,
}: {
    label: string;
    leading?: string;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <li role="none">
            <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={onSelect}
                className={clsx(
                    'grid min-h-14 w-full cursor-pointer items-center gap-3 px-4 text-left st-body1 st-transition',
                    leading
                        ? 'grid-cols-[3.25rem_minmax(0,1fr)_1.5rem]'
                        : 'grid-cols-[minmax(0,1fr)_1.5rem]',
                    selected
                        ? 'bg-st-action-tint text-st-link'
                        : 'hover:bg-st-surface-alt',
                )}
            >
                {leading && (
                    <span
                        aria-hidden
                        className={selected ? '' : 'text-st-text-alt'}
                    >
                        {leading}
                    </span>
                )}
                <span>{label}</span>
                {selected && <Check className="size-5" aria-hidden />}
            </button>
        </li>
    );
}

function ChoiceScreen<T extends string>({
    title,
    intro,
    options,
    value,
    onSelect,
}: {
    title: string;
    intro: string;
    options: { id: T; label: string }[];
    value: T;
    onSelect: (id: T) => void;
}) {
    return (
        <div className="min-h-full bg-st-surface">
            <TopBar
                title={title}
                fallback="/device-preferences"
                back="chevron"
            />
            <main className="pb-6">
                <p className="px-4 pt-3 pb-3 st-body2 text-st-text-alt">
                    {intro}
                </p>
                <ul role="radiogroup" aria-label={title}>
                    {options.map((option) => (
                        <ChoiceRow
                            key={option.id}
                            label={option.label}
                            selected={option.id === value}
                            onSelect={() => onSelect(option.id)}
                        />
                    ))}
                </ul>
            </main>
        </div>
    );
}

export function LanguageScreen() {
    const { prefs, setPrefs } = useStore();

    return (
        <ChoiceScreen
            title="Language"
            intro="Your choice is saved, but text in this prototype is only written in English."
            options={LANGUAGES.map((language) => ({
                id: language,
                label: language,
            }))}
            value={prefs.language}
            onSelect={(language) => setPrefs({ language })}
        />
    );
}

export function UnitsScreen() {
    const { prefs, setPrefs } = useStore();

    return (
        <ChoiceScreen
            title="Units"
            intro="Distances to the centre in search results use these units."
            options={UNITS}
            value={prefs.units}
            onSelect={(units) => setPrefs({ units })}
        />
    );
}

export function TemperatureScreen() {
    const { prefs, setPrefs } = useStore();

    return (
        <ChoiceScreen
            title="Temperature"
            intro="Used for weather wherever the app shows it."
            options={TEMPERATURES}
            value={prefs.temperature}
            onSelect={(temperature) => setPrefs({ temperature })}
        />
    );
}

function CurrencyList({
    title,
    currencies,
}: {
    title?: string;
    currencies: Currency[];
}) {
    const { prefs, setPrefs } = useStore();

    return (
        <section aria-label={title ?? 'Matching currencies'}>
            {title && <h2 className="px-4 pt-4 pb-1 st-strong1">{title}</h2>}
            <ul role="radiogroup" aria-label={title ?? 'Matching currencies'}>
                {currencies.map((currency) => (
                    <ChoiceRow
                        key={currency.code}
                        leading={currency.symbol}
                        label={currency.name}
                        selected={currency.code === prefs.currency}
                        onSelect={() => setPrefs({ currency: currency.code })}
                    />
                ))}
            </ul>
        </section>
    );
}

export function CurrencyScreen() {
    const [query, setQuery] = useState('');
    const needle = query.trim().toLowerCase();
    const everything = [PROPERTY_CURRENCY, ...CURRENCIES];
    const matches = everything.filter(({ code, symbol, name }) =>
        [code, symbol, name].some((text) =>
            text.toLowerCase().includes(needle),
        ),
    );

    return (
        <div className="min-h-full bg-st-surface">
            <TopBar
                title="Currency"
                fallback="/device-preferences"
                back="chevron"
            />
            <main className="pb-6">
                <p className="px-4 pt-3 st-body2 text-st-text-alt">
                    Where applicable prices will be converted to, and shown in,
                    the currency that you select. The currency you pay in may
                    differ based on your reservation, and a service fee may also
                    apply.
                </p>
                <p className="px-4 pt-2 st-small1 text-st-text-alt">
                    In this prototype, prices stay in pounds.
                </p>
                <div className="px-4 pt-4">
                    <label className="flex min-h-12 items-center gap-3 rounded-st-sm border border-st-border px-3 focus-within:outline-2 focus-within:outline-st-link">
                        <Search
                            className="size-5 shrink-0 text-st-text-alt"
                            aria-hidden
                        />
                        <span className="sr-only">Search for currency</span>
                        <input
                            type="search"
                            value={query}
                            placeholder="Search for currency"
                            onChange={(event) => setQuery(event.target.value)}
                            className="min-w-0 flex-1 bg-transparent st-body1 outline-none"
                        />
                    </label>
                </div>
                {needle ? (
                    matches.length > 0 ? (
                        <CurrencyList currencies={matches} />
                    ) : (
                        <p className="px-4 pt-6 st-body2 text-st-text-alt">
                            No currencies match “{query.trim()}”.
                        </p>
                    )
                ) : (
                    <>
                        <CurrencyList
                            title="Suggested for you"
                            currencies={SUGGESTED.flatMap(
                                (code) => currencyByCode(code) ?? [],
                            )}
                        />
                        <CurrencyList
                            title="All currencies"
                            currencies={CURRENCIES}
                        />
                    </>
                )}
            </main>
        </div>
    );
}
