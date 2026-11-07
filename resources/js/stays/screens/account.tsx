import {
    Award,
    Bell,
    ChevronRight,
    CircleHelp,
    CirclePercent,
    CreditCard,
    FileQuestion,
    Gift,
    Handshake,
    Heart,
    HousePlus,
    LifeBuoy,
    Lock,
    MessageCircle,
    MessageSquareText,
    Newspaper,
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
import { Sheet, SheetFooter } from '../components/sheet';
import { Button, TopBar } from '../components/ui';
import { formatMinor, plural } from '../format';
import { closeSheet, Link, openSheet } from '../router';
import { useStore } from '../store';
import { APP_NAME } from '../theme';
import { LEVEL_ONE_REWARDS, staysToNextLevel } from './account-wallet';
import { SETTINGS_INFO_TITLES } from './settings';

type Row = { label: string; icon: LucideIcon; to: string };

type Section = { title?: string; rows: Row[] };

function info(slug: string): string {
    return `/info/${slug}`;
}

const PREFERENCE_ROWS: Row[] = [
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
];

const SUPPORT_ROWS: Row[] = [
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
];

const QUESTIONS_ROW: Row = {
    label: 'My questions to properties',
    icon: FileQuestion,
    to: info('questions-to-properties'),
};

const SAVED_ROW: Row = {
    label: 'Saved lists',
    icon: Heart,
    to: '/saved-lists',
};

const WALLET_ROW: Row = {
    label: 'Rewards & Wallet',
    icon: Wallet,
    to: '/wallet',
};

const SHARED_TAIL: Section[] = [
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

const SIGNED_IN_SECTIONS: Section[] = [
    {
        title: 'Payment information',
        rows: [
            WALLET_ROW,
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
        rows: [
            { label: 'Personal details', icon: User, to: '/personal-details' },
            {
                label: 'Security settings',
                icon: Lock,
                to: info('security-settings'),
            },
            {
                label: 'Other travellers',
                icon: Users,
                to: info('other-travellers'),
            },
        ],
    },
    { title: 'Preferences', rows: PREFERENCE_ROWS },
    {
        title: 'Travel activity',
        rows: [
            SAVED_ROW,
            {
                label: 'My reviews',
                icon: MessageCircle,
                to: info('my-reviews'),
            },
            QUESTIONS_ROW,
        ],
    },
    { title: 'Help and support', rows: SUPPORT_ROWS },
    ...SHARED_TAIL,
];

const SIGNED_OUT_SECTIONS: Section[] = [
    {
        rows: [
            {
                label: `${APP_NAME} Rewards programme`,
                icon: Award,
                to: '/rewards-programme',
            },
            WALLET_ROW,
            SAVED_ROW,
            PREFERENCE_ROWS[0],
            PREFERENCE_ROWS[2],
        ],
    },
    {
        title: 'Help and support',
        rows: [
            ...SUPPORT_ROWS,
            {
                label: 'Dispute resolution',
                icon: Handshake,
                to: info('dispute-resolution'),
            },
        ],
    },
    {
        title: 'Travel activity',
        rows: [
            {
                label: 'Travel articles',
                icon: Newspaper,
                to: info('travel-articles'),
            },
            QUESTIONS_ROW,
        ],
    },
    ...SHARED_TAIL,
];

const INFO_TITLES: Record<string, string> = {
    'privacy-statement': 'Privacy statement',
    'terms-and-conditions': 'Terms and conditions',
    'email-phone-verification': 'Change email',
    ...SETTINGS_INFO_TITLES,
    ...Object.fromEntries(
        [...SIGNED_IN_SECTIONS, ...SIGNED_OUT_SECTIONS].flatMap(({ rows }) =>
            rows
                .filter((row) => row.to.startsWith('/info/'))
                .map((row) => [row.to.replace('/info/', ''), row.label]),
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

function SignedOutHeader() {
    const { startAuth } = useStore();

    return (
        <header className="st-on-brand bg-st-brand st-safe-top text-st-on-dark">
            <div className="flex justify-end px-2 pt-1">
                <HeaderLink to="/trip-info/notifications" label="Notifications">
                    <Bell className="size-6" aria-hidden />
                </HeaderLink>
            </div>
            <div className="flex flex-col items-center gap-4 px-4 pb-6 text-center">
                <span
                    aria-hidden
                    className="flex size-16 items-center justify-center rounded-st-full bg-st-text-alt ring-[3px] ring-st-accent"
                >
                    <User className="size-8" strokeWidth={1.5} />
                </span>
                <h1 className="sr-only">My account</h1>
                <p className="st-body2">
                    Sign in to manage your trip and save 10% or more on select
                    stays and rental cars
                </p>
                <button
                    type="button"
                    onClick={() => startAuth()}
                    className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-st-md bg-st-action px-4 st-emphasized1 st-transition hover:bg-st-action-hover"
                >
                    Sign in or register
                </button>
            </div>
        </header>
    );
}

function RewardsCards() {
    const { bookings, account } = useStore();
    const toNext = staysToNextLevel(bookings);

    return (
        <div className="flex flex-col gap-3 px-4 pt-1 pb-6 text-st-text">
            <Link
                to="/rewards-programme"
                className="block rounded-st-md bg-st-surface p-4 st-transition hover:bg-st-surface-alt"
            >
                <span className="flex items-center gap-4">
                    <span
                        aria-hidden
                        className="flex size-14 shrink-0 items-center justify-center rounded-st-md bg-st-action text-st-accent"
                    >
                        <Gift className="size-8" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block st-strong1">
                            You have {LEVEL_ONE_REWARDS.length} {APP_NAME}{' '}
                            rewards
                        </span>
                        <span className="block st-body2 text-st-text-alt">
                            10% discounts and so much more!
                        </span>
                    </span>
                    <ChevronRight
                        className="size-5 shrink-0 text-st-text-alt"
                        aria-hidden
                    />
                </span>
                <span className="mt-4 block border-t border-st-border-soft pt-3 st-body2">
                    {toNext > 0 ? (
                        <>
                            You're <strong>{plural(toNext, 'booking')}</strong>{' '}
                            away from <strong>{APP_NAME} Level 2</strong>
                        </>
                    ) : (
                        <>
                            You've completed enough stays for{' '}
                            <strong>{APP_NAME} Level 2</strong>
                        </>
                    )}
                </span>
            </Link>
            <Link
                to="/wallet"
                className="flex min-h-14 items-center gap-3 rounded-st-md bg-st-surface px-4 py-3 st-transition hover:bg-st-surface-alt"
            >
                <span className="min-w-0 flex-1 st-body1">
                    {account && account.walletCreditMinor > 0
                        ? 'Credits and vouchers'
                        : 'No Credits or vouchers yet'}
                </span>
                {account && (
                    <span className="st-strong1">
                        {formatMinor(
                            account.walletCreditMinor,
                            account.walletCurrency,
                        )}
                    </span>
                )}
                <ChevronRight
                    className="size-5 shrink-0 text-st-text-alt"
                    aria-hidden
                />
            </Link>
        </div>
    );
}

// The greeting stays at the top while the rewards cards scroll under it.
function SignedInHeader({
    user,
}: {
    user: { firstName: string; lastName: string; avatarUrl?: string };
}) {
    return (
        <div className="bg-st-brand text-st-on-dark">
            <header className="st-on-brand sticky top-0 z-10 bg-st-brand st-safe-top">
                <div className="flex items-center gap-3 py-4 pr-2 pl-4">
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
                    <div className="min-w-0 flex-1">
                        <h1 className="st-headline3 break-words">
                            Hi, {user.firstName}
                        </h1>
                        <p className="st-strong1">
                            {APP_NAME} Rewards{' '}
                            <span className="whitespace-nowrap text-st-accent">
                                Level 1
                            </span>
                        </p>
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
            <RewardsCards />
        </div>
    );
}

export function AccountScreen() {
    const { user } = useStore();
    const sections = user ? SIGNED_IN_SECTIONS : SIGNED_OUT_SECTIONS;

    return (
        <div className="min-h-full bg-st-surface-alt">
            {user ? <SignedInHeader user={user} /> : <SignedOutHeader />}
            <main className="pb-6">
                {sections.map(({ title, rows }, index) => (
                    <RowGroup key={title ?? index} title={title}>
                        {rows.map(({ label, icon, to }) => (
                            <NavRow
                                key={label}
                                label={label}
                                icon={icon}
                                to={to}
                            />
                        ))}
                    </RowGroup>
                ))}
                {user && (
                    <div className="px-4 pt-8">
                        <button
                            type="button"
                            aria-haspopup="dialog"
                            onClick={() => openSheet('signout')}
                            className="flex min-h-14 w-full cursor-pointer items-center justify-center rounded-st-md border border-st-border-soft bg-st-surface st-body1 text-st-danger st-transition hover:bg-st-danger-tint"
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </main>
        </div>
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
