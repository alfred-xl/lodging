import clsx from 'clsx';
import { ChevronRight, CreditCard, LoaderCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import type { AccountDetails } from '../account-data';
import { Link } from '../router';
import { useStore } from '../store';
import { SignInButtons } from './root-panels';
import { Button } from './ui';

function initials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Decorative wherever the name sits next to it, so callers label the link around it.
export function Avatar({
    firstName,
    lastName,
    url,
    className,
}: {
    firstName: string;
    lastName: string;
    url?: string;
    className: string;
}) {
    const [failed, setFailed] = useState(false);

    if (url && !failed) {
        return (
            <img
                src={url}
                alt=""
                onError={() => setFailed(true)}
                className={clsx(
                    'shrink-0 rounded-st-full bg-st-surface-alt object-cover',
                    className,
                )}
            />
        );
    }

    return (
        <span
            aria-hidden
            className={clsx(
                'flex shrink-0 items-center justify-center rounded-st-full bg-st-surface-alt st-strong1 text-st-brand',
                className,
            )}
        >
            {initials(firstName, lastName)}
        </span>
    );
}

export function RowGroup({
    title,
    children,
}: {
    title?: string;
    children: ReactNode;
}) {
    return (
        <section className="px-4 pt-6">
            {title && <h2 className="pb-3 st-strong1">{title}</h2>}
            <ul className="divide-y divide-st-border-soft overflow-hidden rounded-st-md border border-st-border-soft bg-st-surface">
                {children}
            </ul>
        </section>
    );
}

const ROW_CLASS =
    'flex min-h-14 w-full cursor-pointer items-center gap-4 px-4 py-3 text-left st-transition hover:bg-st-surface-alt';

export function NavRow({
    label,
    icon: Icon,
    to,
    onClick,
    value,
}: {
    label: string;
    icon: LucideIcon;
    to?: string;
    onClick?: () => void;
    value?: string;
}) {
    const content = (
        <>
            <Icon className="size-6 shrink-0 text-st-text" aria-hidden />
            <span className="flex-1 st-body1">{label}</span>
            {value && (
                <span className="text-right st-body2 text-st-text-alt">
                    {value}
                </span>
            )}
            <ChevronRight
                className="size-5 shrink-0 text-st-text-alt"
                aria-hidden
            />
        </>
    );

    return (
        <li>
            {to ? (
                <Link to={to} className={ROW_CLASS}>
                    {content}
                </Link>
            ) : (
                <button type="button" onClick={onClick} className={ROW_CLASS}>
                    {content}
                </button>
            )}
        </li>
    );
}

function MastercardMark() {
    const clip = useId();

    return (
        <svg viewBox="0 0 38 24" className="w-3/4">
            <defs>
                <clipPath id={clip}>
                    <circle cx="12" cy="12" r="11" />
                </clipPath>
            </defs>
            <circle cx="12" cy="12" r="11" className="fill-st-mastercard-red" />
            <circle
                cx="26"
                cy="12"
                r="11"
                className="fill-st-mastercard-yellow"
            />
            <circle
                cx="26"
                cy="12"
                r="11"
                clipPath={`url(#${clip})`}
                className="fill-st-mastercard-overlap"
            />
        </svg>
    );
}

function BrandMark({ brand }: { brand: string }) {
    switch (brand) {
        case 'Mastercard':
            return <MastercardMark />;
        case 'Visa':
            return (
                <span className="font-extrabold tracking-tight text-st-visa-blue italic">
                    VISA
                </span>
            );
        case 'American Express':
            return (
                <span className="rounded-st-sm bg-st-amex-blue px-1 st-small2 text-st-on-dark">
                    AMEX
                </span>
            );
        default:
            return (
                <CreditCard
                    className="size-1/2 text-st-link"
                    strokeWidth={1.5}
                />
            );
    }
}

// The card network's mark on a white tile. Decorative, so callers name the card in text.
export function CardTile({
    brand,
    className,
}: {
    brand: string;
    className?: string;
}) {
    return (
        <span
            aria-hidden
            className={clsx(
                'flex shrink-0 items-center justify-center rounded-st-md border border-st-border-soft bg-st-surface st-strong1',
                className,
            )}
        >
            <BrandMark brand={brand} />
        </span>
    );
}

export function cardLabel(brand: string, lastFour: string): string {
    return `${brand} •••• ${lastFour}`;
}

export function cardSpokenLabel(brand: string, lastFour: string): string {
    return `${brand} ending in ${lastFour}`;
}

// Holds account pages until the details have loaded, and offers a retry if they fail.
export function AccountGate({
    children,
}: {
    children: (account: AccountDetails) => ReactNode;
}) {
    const { user, account, accountStatus, reloadAccount } = useStore();

    if (account) {
        return children(account);
    }

    if (!user) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <p className="st-body1">Sign in to see your account details.</p>
                <SignInButtons />
            </div>
        );
    }

    if (accountStatus === 'error') {
        return (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
                <p className="st-body1">We couldn't load your details.</p>
                <Button variant="outline" onClick={reloadAccount}>
                    Try again
                </Button>
            </div>
        );
    }

    return (
        <p
            role="status"
            className="flex items-center justify-center gap-2 p-6 st-body2 text-st-text-alt"
        >
            <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden
            />
            Loading your details
        </p>
    );
}
