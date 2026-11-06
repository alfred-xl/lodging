import clsx from 'clsx';
import {
    ArrowLeft,
    Check,
    Clock,
    Heart,
    LoaderCircle,
    Star,
    ThumbsUp,
    MapPin,
} from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { reviewLabel } from '../data';
import type { Hotel, Price } from '../data';
import { money, plural } from '../format';
import { goBack } from '../router';
import { useStore } from '../store';

type ButtonVariant =
    | 'primary'
    | 'primarySmall'
    | 'search'
    | 'outline'
    | 'outlineDanger'
    | 'text';

const BUTTON_CLASSES: Record<ButtonVariant, string> = {
    primary:
        'min-h-12 rounded-st-sm bg-st-action px-4 py-2 st-emphasized1 text-st-on-dark hover:bg-st-action-hover disabled:bg-st-disabled-bg disabled:text-st-disabled-text',
    primarySmall:
        'st-touch min-h-9 rounded-st-sm bg-st-action px-3 py-1 st-emphasized2 text-st-on-dark hover:bg-st-action-hover disabled:bg-st-disabled-bg disabled:text-st-disabled-text',
    search: 'min-h-14 w-full bg-st-action px-4 py-2 st-emphasized1 text-st-on-dark hover:bg-st-action-hover',
    outline:
        'min-h-12 rounded-st-sm border border-st-link bg-st-surface px-4 py-2 st-emphasized1 text-st-link hover:bg-st-action-tint',
    outlineDanger:
        'min-h-12 rounded-st-sm border border-st-danger bg-st-surface px-4 py-2 st-emphasized1 text-st-danger hover:bg-st-danger-tint',
    text: 'st-touch min-h-9 rounded-st-sm px-2 py-1 st-emphasized2 text-st-link hover:bg-st-action-tint',
};

export function Button({
    variant = 'primary',
    className,
    type = 'button',
    loading = false,
    onClick,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    loading?: boolean;
}) {
    return (
        <button
            type={type}
            aria-busy={loading}
            onClick={(event) => {
                // Stays enabled while loading so focus isn't lost, but ignores further taps.
                if (loading) {
                    event.preventDefault();
                } else {
                    onClick?.(event);
                }
            }}
            className={clsx(
                'inline-flex cursor-pointer items-center justify-center gap-2 text-center st-transition disabled:cursor-not-allowed',
                loading && 'cursor-progress',
                BUTTON_CLASSES[variant],
                className,
            )}
            {...props}
        >
            {loading && (
                <LoaderCircle
                    className="size-4 animate-spin motion-reduce:animate-none"
                    aria-hidden
                />
            )}
            {children}
        </button>
    );
}

export function IconButton({
    label,
    className,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
    return (
        <button
            type="button"
            aria-label={label}
            className={clsx(
                'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-st-sm st-transition',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export function TopBar({
    title,
    fallback,
    trailing,
}: {
    title?: string;
    fallback: string;
    trailing?: ReactNode;
}) {
    return (
        <header className="st-on-brand bg-st-brand st-safe-top text-st-on-dark">
            <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-1 px-1">
                <IconButton
                    label="Go back"
                    onClick={() => goBack(fallback)}
                    className="hover:bg-st-action-hover"
                >
                    <ArrowLeft className="size-6" aria-hidden />
                </IconButton>
                <h1 className="truncate text-center st-strong1">{title}</h1>
                <div className="flex min-w-11 justify-end">{trailing}</div>
            </div>
        </header>
    );
}

export function ReviewScore({
    score,
    count,
    size = 'list',
}: {
    score: number;
    count: number;
    size?: 'list' | 'page';
}) {
    const label = reviewLabel(score);

    return (
        <div
            role="img"
            aria-label={`Scored ${score.toFixed(1)}, ${label}, ${plural(count, 'review')}`}
            className="flex flex-wrap items-center gap-x-1"
        >
            <span
                className={clsx(
                    'inline-flex shrink-0 items-center justify-center rounded-t-st-chip rounded-br-st-chip bg-st-brand text-st-on-dark',
                    size === 'list'
                        ? 'size-6 st-small1'
                        : 'size-8 st-emphasized1',
                )}
            >
                {score.toFixed(1)}
            </span>
            <span className="ml-1 st-body2">{label}</span>
            <span className="st-body2 text-st-text-alt">
                · {plural(count, 'review')}
            </span>
        </div>
    );
}

export function StarRating({
    stars,
    preferred,
}: {
    stars: number;
    preferred?: boolean;
}) {
    return (
        <div className="flex items-center gap-1">
            <span
                role="img"
                aria-label={`${stars} out of 5 stars`}
                className="flex gap-px"
            >
                {Array.from({ length: stars }, (_, index) => (
                    <Star
                        key={index}
                        className="size-3 fill-st-accent text-st-accent"
                        aria-hidden
                    />
                ))}
            </span>
            {preferred && (
                <span
                    role="img"
                    aria-label="Preferred property"
                    className="inline-flex size-3.5 items-center justify-center rounded-st-sm bg-st-accent text-st-on-accent"
                >
                    <ThumbsUp className="size-2.5" aria-hidden />
                </span>
            )}
        </div>
    );
}

export function DealBadge({ children }: { children: ReactNode }) {
    return (
        <span className="inline-block rounded-st-sm border border-st-success-fill bg-st-success-fill px-1 py-px st-small1 text-st-on-dark">
            {children}
        </span>
    );
}

export function SaveHeart({
    hotel,
    className,
    tone = 'surface',
}: {
    hotel: Hotel;
    className?: string;
    tone?: 'surface' | 'brand';
}) {
    const { user, saved, toggleSaved, startAuth } = useStore();
    const isSaved = saved.includes(hotel.id);

    return (
        <IconButton
            label={
                isSaved
                    ? `Remove ${hotel.name} from your list`
                    : `Save ${hotel.name} to a list`
            }
            aria-pressed={isSaved}
            onClick={() => {
                if (user) {
                    toggleSaved(hotel.id);
                } else {
                    startAuth({ type: 'save', hotelId: hotel.id });
                }
            }}
            className={className}
        >
            <Heart
                aria-hidden
                className={clsx(
                    'size-5',
                    isSaved && 'fill-st-danger text-st-danger',
                    !isSaved && tone === 'surface' && 'text-st-text',
                    !isSaved && tone === 'brand' && 'text-st-on-dark',
                )}
            />
        </IconButton>
    );
}

export function BenefitRow({
    children,
    tone = 'success',
}: {
    children: ReactNode;
    tone?: 'success' | 'danger';
}) {
    const Icon = tone === 'success' ? Check : Clock;

    return (
        <p
            className={clsx(
                'flex items-start gap-1 st-small1',
                tone === 'success' ? 'text-st-success' : 'text-st-danger',
            )}
        >
            <Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>{children}</span>
        </p>
    );
}

export function stayLabel(price: Pick<Price, 'nights' | 'rooms'>): string {
    return price.rooms > 1
        ? `${plural(price.nights, 'night')}, ${plural(price.rooms, 'room')}`
        : plural(price.nights, 'night');
}

export function PriceStack({ price }: { price: Price }) {
    return (
        <div className="text-right">
            <p className="st-small1 text-st-text-alt">
                Price for <strong>{stayLabel(price)}</strong>:
            </p>
            {price.original !== null && (
                <p className="st-small1 text-st-danger">
                    <span className="sr-only">Original price </span>
                    <s>{money(price.original)}</s>
                </p>
            )}
            <p className="st-price text-st-text">
                <span className="sr-only">Current price </span>
                {money(price.current)}
            </p>
            <p className="st-small1 text-st-text-alt">
                +{money(price.taxes)} taxes and charges
            </p>
        </div>
    );
}

export function SearchFrame({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={clsx(
                'rounded-st-md bg-st-accent p-1 shadow-st-100',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function Location({ children }: { children: ReactNode }) {
    return (
        <p className="flex items-start gap-1 st-small1 text-st-text">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>{children}</span>
        </p>
    );
}

export function Stepper({
    label,
    hint,
    value,
    min,
    max,
    onChange,
}: {
    label: string;
    hint?: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
}) {
    const stepClass =
        'st-transition inline-flex size-11 cursor-pointer items-center justify-center rounded-st-sm border border-st-border st-strong1 text-st-link hover:bg-st-action-tint disabled:cursor-not-allowed disabled:border-st-disabled-bg disabled:text-st-disabled-text disabled:hover:bg-transparent';

    return (
        <div className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
                <p className="st-emphasized1">{label}</p>
                {hint && <p className="st-small1 text-st-text-alt">{hint}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
                <button
                    type="button"
                    aria-label={`Fewer ${label.toLowerCase()}`}
                    disabled={value <= min}
                    onClick={() => onChange(value - 1)}
                    className={stepClass}
                >
                    −
                </button>
                <span
                    aria-live="polite"
                    aria-label={`${value} ${label.toLowerCase()}`}
                    className="min-w-8 text-center st-strong1"
                >
                    {value}
                </span>
                <button
                    type="button"
                    aria-label={`More ${label.toLowerCase()}`}
                    disabled={value >= max}
                    onClick={() => onChange(value + 1)}
                    className={stepClass}
                >
                    +
                </button>
            </div>
        </div>
    );
}

// Only rendered behind import.meta.env.DEV, which removes it from production bundles.
export function DevNote({ children }: { children: ReactNode }) {
    return (
        <p
            role="note"
            className="rounded-st-sm border border-dashed border-st-border bg-st-surface-alt p-2 st-small1"
        >
            <strong>Development only:</strong> {children}
        </p>
    );
}
