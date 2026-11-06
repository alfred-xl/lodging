import {
    Bell,
    CircleHelp,
    Coins,
    CirclePercent,
    CreditCard,
    FileQuestion,
    Globe,
    Heart,
    HousePlus,
    LifeBuoy,
    MessageCircle,
    MessageSquareText,
    Receipt,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    User,
    Users,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar, NavRow, RowGroup } from '../components/account-ui';
import { SignInButtons } from '../components/root-panels';
import { Sheet, SheetFooter } from '../components/sheet';
import { Button, TopBar } from '../components/ui';
import { closeSheet, Link, openSheet, selectTab } from '../router';
import type { TabId } from '../router';
import { useStore } from '../store';
import { APP_NAME } from '../theme';

type Row = { label: string; icon: LucideIcon; to?: string; tab?: TabId };

type Section = { title: string; rows: Row[]; signedIn?: boolean };

function info(slug: string): string {
    return `/info/${slug}`;
}

const SECTIONS: Section[] = [
    {
        title: 'Payment information',
        signedIn: true,
        rows: [
            { label: 'Rewards & Wallet', icon: Wallet, to: '/wallet' },
            {
                label: 'Payment methods',
                icon: CreditCard,
                to: '/payment-details',
            },
            { label: 'Transactions', icon: Receipt, to: '/transactions' },
        ],
    },
    {
        title: 'Manage account',
        signedIn: true,
        rows: [
            { label: 'Personal details', icon: User, to: '/personal-details' },
            {
                label: 'Security settings',
                icon: ShieldCheck,
                to: info('security-settings'),
            },
            {
                label: 'Other travellers',
                icon: Users,
                to: info('other-travellers'),
            },
        ],
    },
    {
        title: 'Preferences',
        rows: [
            {
                label: 'Device preferences',
                icon: Settings,
                to: '/device-preferences',
            },
            {
                label: 'Accessibility settings',
                icon: SlidersHorizontal,
                to: info('accessibility-settings'),
            },
            {
                label: 'Communication preferences',
                icon: MessageSquareText,
                to: '/notifications',
            },
        ],
    },
    {
        title: 'Travel activity',
        signedIn: true,
        rows: [
            { label: 'Saved lists', icon: Heart, tab: 'saved' },
            {
                label: 'My reviews',
                icon: MessageCircle,
                to: info('my-reviews'),
            },
            {
                label: 'My questions to properties',
                icon: FileQuestion,
                to: info('questions-to-properties'),
            },
        ],
    },
    {
        title: 'Help and support',
        rows: [
            {
                label: 'Contact Customer service',
                icon: CircleHelp,
                to: info('contact-customer-service'),
            },
            {
                label: 'Safety resource centre',
                icon: LifeBuoy,
                to: info('safety-resource-centre'),
            },
        ],
    },
    {
        title: 'Legal and privacy',
        rows: [
            {
                label: 'Privacy and data management',
                icon: ShieldCheck,
                to: info('privacy-and-data-management'),
            },
        ],
    },
    {
        title: 'Discover',
        rows: [
            { label: 'Deals', icon: CirclePercent, to: '/trip-info/discounts' },
        ],
    },
    {
        title: 'Manage your property',
        rows: [
            {
                label: 'List your property',
                icon: HousePlus,
                to: info('list-your-property'),
            },
        ],
    },
];

const INFO_TITLES: Record<string, string> = {
    'privacy-statement': 'Privacy statement',
    'terms-and-conditions': 'Terms and conditions',
    'email-phone-verification': 'Change email',
    ...Object.fromEntries(
        SECTIONS.flatMap(({ rows }) =>
            rows
                .filter((row) => row.to?.startsWith('/info/'))
                .map((row) => [row.to!.replace('/info/', ''), row.label]),
        ),
    ),
};

const INFO_NOTES: Record<string, string> = {
    'email-phone-verification':
        "Changing your email with a text message code isn't part of this prototype, so no message will be sent.",
};

export function InfoScreen({ slug }: { slug?: string }) {
    return (
        <div className="min-h-full bg-st-surface">
            <TopBar
                title={INFO_TITLES[slug ?? ''] ?? 'Information'}
                fallback="/"
            />
            <main className="p-4">
                <p className="st-body2 text-st-text-alt">
                    {INFO_NOTES[slug ?? ''] ??
                        "This screen isn't part of the prototype yet."}
                </p>
            </main>
        </div>
    );
}

function HeaderLink({
    to,
    label,
    children,
}: {
    to: string;
    label: string;
    children: ReactNode;
}) {
    return (
        <Link
            to={to}
            aria-label={label}
            className="flex size-11 items-center justify-center rounded-st-sm st-transition hover:bg-st-action-hover"
        >
            {children}
        </Link>
    );
}

function AccountHeader() {
    const { user } = useStore();

    return (
        <header className="st-on-brand sticky top-0 z-10 bg-st-brand st-safe-top text-st-on-dark">
            <div className="flex items-center gap-3 py-4 pr-2 pl-4">
                {user ? (
                    <Link
                        to="/personal-details"
                        aria-label="Your profile"
                        className="shrink-0 rounded-st-full"
                    >
                        <Avatar
                            firstName={user.firstName}
                            lastName={user.lastName}
                            url={user.avatarUrl}
                            className="size-14 ring-[3px] ring-st-accent ring-offset-2 ring-offset-st-brand"
                        />
                    </Link>
                ) : null}
                <div className="min-w-0 flex-1">
                    <h1 className="st-headline3 break-words">
                        {user ? `Hi, ${user.firstName}` : 'My account'}
                    </h1>
                    {user && (
                        <p className="st-strong1">
                            {APP_NAME} Rewards{' '}
                            <span className="whitespace-nowrap text-st-accent">
                                Level 1
                            </span>
                        </p>
                    )}
                </div>
                <div className="flex shrink-0">
                    <HeaderLink to="/trip-info/messages" label="Messages">
                        <MessageCircle className="size-6" aria-hidden />
                    </HeaderLink>
                    <HeaderLink
                        to="/trip-info/notifications"
                        label="Notifications"
                    >
                        <Bell className="size-6" aria-hidden />
                    </HeaderLink>
                </div>
            </div>
        </header>
    );
}

export function AccountScreen() {
    const { user } = useStore();

    return (
        <div className="min-h-full bg-st-surface">
            <AccountHeader />
            <main className="pb-6">
                {!user && (
                    <div className="flex flex-col gap-4 px-4 pt-4">
                        <p className="st-body1">
                            Sign in to see your bookings, saved properties and
                            payment details.
                        </p>
                        <SignInButtons />
                    </div>
                )}
                {SECTIONS.filter((section) => user || !section.signedIn).map(
                    ({ title, rows }) => (
                        <RowGroup key={title} title={title}>
                            {rows.map(({ label, icon, to, tab }) => (
                                <NavRow
                                    key={label}
                                    label={label}
                                    icon={icon}
                                    to={to}
                                    onClick={
                                        tab ? () => selectTab(tab) : undefined
                                    }
                                />
                            ))}
                        </RowGroup>
                    ),
                )}
                {user && (
                    <div className="px-4 pt-8">
                        <button
                            type="button"
                            aria-haspopup="dialog"
                            onClick={() => openSheet('signout')}
                            className="flex min-h-14 w-full cursor-pointer items-center justify-center rounded-st-md border border-st-border-soft st-body1 text-st-danger st-transition hover:bg-st-danger-tint"
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export function DevicePreferencesScreen() {
    const { prefs } = useStore();

    return (
        <div className="min-h-full bg-st-surface">
            <TopBar title="Device preferences" fallback="/" />
            <main className="pb-6">
                <RowGroup>
                    <NavRow
                        label="Currency"
                        icon={Coins}
                        to="/currency"
                        value={prefs.currency}
                    />
                    <NavRow
                        label="Language"
                        icon={Globe}
                        to="/language"
                        value={prefs.language}
                    />
                </RowGroup>
            </main>
        </div>
    );
}

function Picker({
    title,
    name,
    note,
    options,
    value,
    onSelect,
}: {
    title: string;
    name: string;
    note: string;
    options: string[];
    value: string;
    onSelect: (option: string) => void;
}) {
    return (
        <div className="min-h-full bg-st-surface">
            <TopBar title={title} fallback="/" />
            <main>
                <p className="px-4 pt-3 pb-2 st-small1 text-st-text-alt">
                    {note}
                </p>
                <fieldset>
                    <legend className="sr-only">{title}</legend>
                    {options.map((option) => (
                        <label
                            key={option}
                            className="flex min-h-14 cursor-pointer items-center justify-between gap-3 border-b border-st-border-soft px-4 py-2 st-body1 st-transition hover:bg-st-surface-alt"
                        >
                            {option}
                            <input
                                type="radio"
                                name={name}
                                checked={value === option}
                                onChange={() => onSelect(option)}
                                className="size-5 shrink-0 accent-st-action"
                            />
                        </label>
                    ))}
                </fieldset>
            </main>
        </div>
    );
}

export function CurrencyScreen() {
    const { prefs, setPrefs } = useStore();

    return (
        <Picker
            title="Currency"
            name="currency"
            note="Prices in this prototype are always shown in pounds."
            options={['GBP', 'EUR', 'USD', 'NGN', 'GHS', 'CAD']}
            value={prefs.currency}
            onSelect={(currency) => setPrefs({ currency })}
        />
    );
}

export function LanguageScreen() {
    const { prefs, setPrefs } = useStore();

    return (
        <Picker
            title="Language"
            name="language"
            note="This prototype is only written in English."
            options={[
                'English (UK)',
                'English (US)',
                'Español',
                'Français',
                'Português',
                'Deutsch',
            ]}
            value={prefs.language}
            onSelect={(language) => setPrefs({ language })}
        />
    );
}

const NOTIFICATIONS = [
    { id: 'bookings', label: 'Booking updates' },
    { id: 'prices', label: 'Price alerts' },
    { id: 'deals', label: 'Deals and offers' },
    { id: 'reviews', label: 'Review reminders' },
];

export function NotificationsScreen() {
    const { prefs, setPrefs } = useStore();

    return (
        <div className="min-h-full bg-st-surface">
            <TopBar title="Communication preferences" fallback="/" />
            <main>
                {NOTIFICATIONS.map(({ id, label }) => (
                    <label
                        key={id}
                        className="flex min-h-14 cursor-pointer items-center justify-between gap-3 border-b border-st-border-soft px-4 py-2 st-body1"
                    >
                        {label}
                        <input
                            type="checkbox"
                            role="switch"
                            checked={prefs.notifications[id] ?? false}
                            onChange={(event) =>
                                setPrefs({
                                    notifications: {
                                        ...prefs.notifications,
                                        [id]: event.target.checked,
                                    },
                                })
                            }
                            className="peer sr-only"
                        />
                        <span
                            aria-hidden
                            className="relative h-7 w-12 shrink-0 rounded-st-full bg-st-border st-transition peer-checked:bg-st-action peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-st-link after:absolute after:top-0.5 after:left-0.5 after:size-6 after:rounded-st-full after:bg-st-surface after:content-[''] peer-checked:after:left-[1.375rem]"
                        />
                    </label>
                ))}
            </main>
        </div>
    );
}

function SignOutBody() {
    const { signOut } = useStore();

    return (
        <>
            <p className="px-4 pt-4 pb-3 st-body2 text-st-text-alt">
                Your mock session, saved properties and bookings will be cleared
                from this device.
            </p>
            <SheetFooter className="flex flex-col gap-2">
                <Button
                    variant="outlineDanger"
                    className="w-full"
                    onClick={() => {
                        signOut();
                        closeSheet();
                    }}
                >
                    Sign out
                </Button>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={closeSheet}
                >
                    Stay signed in
                </Button>
            </SheetFooter>
        </>
    );
}

export function SignOutSheet({ open }: { open: boolean }) {
    return (
        <Sheet open={open} title="Sign out?" variant="bottom">
            <SignOutBody />
        </Sheet>
    );
}
