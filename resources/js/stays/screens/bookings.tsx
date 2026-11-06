import clsx from 'clsx';
import {
    ChevronRight,
    CircleHelp,
    CloudDownload,
    EllipsisVertical,
    Luggage,
    RefreshCw,
    Star,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { HotelPhoto } from '../components/hotel-photo';
import { EmptyState, SignInButtons } from '../components/root-panels';
import { Sheet, SheetFooter } from '../components/sheet';
import { Button, IconButton } from '../components/ui';
import { destinationById, hotelById, priceFor, RATES } from '../data';
import { formatRange, money } from '../format';
import { closeSheet, Link, navigate, openSheet } from '../router';
import { useStore } from '../store';
import type { BookingStatus, MockBooking } from '../store';

const SECTIONS: { id: BookingStatus; label: string; empty: string }[] = [
    { id: 'active', label: 'Active', empty: 'You have no active trips.' },
    { id: 'past', label: 'Past', empty: 'You have no past trips yet.' },
    {
        id: 'cancelled',
        label: 'Cancelled',
        empty: 'You have no cancelled trips.',
    },
];

export const STATUS_LABELS: Record<BookingStatus, string> = {
    active: 'Confirmed',
    past: 'Completed',
    cancelled: 'Cancelled',
};

// Seeded stays carry the exact total they were booked at.
export function bookingTotal(booking: MockBooking): string {
    if (booking.totalText) {
        return booking.totalText;
    }

    const hotel = hotelById(booking.hotelId);
    const room = hotel?.rooms.find((item) => item.id === booking.roomId);
    const rate = RATES.find((item) => item.id === booking.rateId);

    if (!hotel || !room || !rate) {
        return money(0);
    }

    const price = priceFor(hotel, booking.search, room.factor * rate.factor);

    return money(price.current + price.taxes);
}

function destinationOf(booking: MockBooking): string {
    return hotelById(booking.hotelId)?.destinationId ?? '';
}

function groupRange(bookings: MockBooking[]): string {
    const starts = bookings.map((item) => item.search.checkIn).sort();
    const end =
        bookings
            .map((item) => item.search.checkOut)
            .sort()
            .at(-1) ?? '';

    return `${formatRange(starts[0], end)} ${end.slice(0, 4)}`;
}

function TripCard({ booking }: { booking: MockBooking }) {
    const { notes, dismiss } = useStore();
    const hotel = hotelById(booking.hotelId);

    if (!hotel) {
        return null;
    }

    const rateKey = `rate:${booking.id}`;
    const showRate =
        booking.status === 'past' &&
        !notes.ratings[booking.id] &&
        !notes.dismissed.includes(rateKey);

    return (
        <article className="rounded-st-md border border-st-border-soft bg-st-surface">
            <div className="relative flex gap-4 p-4">
                <HotelPhoto
                    hotel={hotel}
                    kind="room"
                    className="size-16 shrink-0 rounded-st-md"
                />
                <div className="min-w-0 flex-1 pr-6">
                    <h3 className="st-strong2">
                        <Link
                            to={`/stay/${booking.id}`}
                            className="after:absolute after:inset-0 after:content-['']"
                        >
                            {hotel.name}
                        </Link>
                    </h3>
                    <p className="st-body2">
                        {formatRange(
                            booking.search.checkIn,
                            booking.search.checkOut,
                        )}{' '}
                        · {bookingTotal(booking)}
                    </p>
                    <p className="st-body2 text-st-text-alt">
                        {STATUS_LABELS[booking.status]}
                    </p>
                </div>
                <IconButton
                    label={`More options for ${hotel.name}`}
                    aria-haspopup="dialog"
                    onClick={() =>
                        openSheet('trip-menu', { booking: booking.id })
                    }
                    className="absolute top-2 right-1 z-10"
                >
                    <EllipsisVertical className="size-5" aria-hidden />
                </IconButton>
            </div>
            <Link
                to={`/property/${hotel.id}`}
                className="flex min-h-14 items-center gap-3 border-t border-st-border-soft px-4 py-2 st-body1"
            >
                <RefreshCw className="size-6 shrink-0" aria-hidden />
                <span className="flex-1">Rebook this property</span>
                <ChevronRight
                    className="size-5 shrink-0 text-st-text-alt"
                    aria-hidden
                />
            </Link>
            {showRate && (
                <div className="flex min-h-14 items-center border-t border-st-border-soft pl-4">
                    <Link
                        to={`/rate/${booking.id}`}
                        className="flex min-h-11 flex-1 items-center gap-3 st-body1"
                    >
                        <Star className="size-6 shrink-0" aria-hidden />
                        Rate your stay
                    </Link>
                    <IconButton
                        label={`Dismiss rating for ${hotel.name}`}
                        onClick={() => dismiss(rateKey)}
                        className="mr-1"
                    >
                        <X className="size-5" aria-hidden />
                    </IconButton>
                </div>
            )}
        </article>
    );
}

function TripGroups({ bookings }: { bookings: MockBooking[] }) {
    const groups = [...new Set(bookings.map(destinationOf))].map(
        (destinationId) => ({
            destinationId,
            items: bookings.filter(
                (item) => destinationOf(item) === destinationId,
            ),
        }),
    );

    return (
        <div className="flex flex-col gap-6 px-4 py-4">
            {groups.map(({ destinationId, items }) => (
                <section
                    key={destinationId}
                    aria-labelledby={`trip-${destinationId}`}
                    className="flex flex-col gap-4"
                >
                    <div>
                        <h2
                            id={`trip-${destinationId}`}
                            className="st-headline3"
                        >
                            {destinationById(destinationId).name}
                        </h2>
                        <p className="st-body1 text-st-text-alt">
                            {groupRange(items)}
                        </p>
                    </div>
                    {items.map((booking) => (
                        <TripCard key={booking.id} booking={booking} />
                    ))}
                </section>
            ))}
        </div>
    );
}

export function BookingsScreen() {
    // Kept in the store so coming back from a stay returns to the same tab.
    const {
        user,
        bookings,
        tripsTab: activeId,
        setTripsTab: setActiveId,
        tripsLoading,
    } = useStore();
    const tabRefs = useRef(new Map<BookingStatus, HTMLButtonElement>());
    const section =
        SECTIONS.find((item) => item.id === activeId) ?? SECTIONS[0];
    const matching = bookings.filter((item) => item.status === activeId);

    const moveTab = (event: KeyboardEvent<HTMLDivElement>) => {
        const step =
            event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;

        if (step === 0) {
            return;
        }

        event.preventDefault();

        const index = SECTIONS.findIndex((item) => item.id === activeId);
        const next =
            SECTIONS[(index + step + SECTIONS.length) % SECTIONS.length];

        setActiveId(next.id);
        tabRefs.current.get(next.id)?.focus();
    };

    return (
        <div className="flex min-h-full flex-col bg-st-surface">
            <header className="grid grid-cols-[5.5rem_minmax(0,1fr)_5.5rem] items-center border-b border-st-border-soft st-safe-top pr-1">
                <span />
                <h1 className="truncate text-center st-emphasized1">Trips</h1>
                <div className="flex justify-end">
                    <Link
                        to="/trip-info/help"
                        aria-label="Help"
                        className="flex size-11 items-center justify-center"
                    >
                        <CircleHelp className="size-6" aria-hidden />
                    </Link>
                    <Link
                        to="/trip-info/offline-trips"
                        aria-label="Offline trips"
                        className="flex size-11 items-center justify-center"
                    >
                        <CloudDownload className="size-6" aria-hidden />
                    </Link>
                </div>
            </header>
            {!user ? (
                <main className="flex-1">
                    <EmptyState
                        icon={
                            <Luggage
                                className="size-8 text-st-text-alt"
                                aria-hidden
                            />
                        }
                        title="Sign in to see your trips"
                        body="Your upcoming, past and cancelled stays are all kept here."
                    >
                        <SignInButtons />
                    </EmptyState>
                </main>
            ) : (
                <>
                    <div
                        role="tablist"
                        aria-label="Trip status"
                        onKeyDown={moveTab}
                        className="sticky top-[env(safe-area-inset-top)] z-10 flex flex-wrap gap-1 bg-st-surface px-4 py-3"
                    >
                        {SECTIONS.map((item) => {
                            const selected = item.id === activeId;

                            return (
                                <button
                                    key={item.id}
                                    ref={(element) => {
                                        if (element) {
                                            tabRefs.current.set(
                                                item.id,
                                                element,
                                            );
                                        }
                                    }}
                                    type="button"
                                    role="tab"
                                    aria-selected={selected}
                                    tabIndex={selected ? 0 : -1}
                                    onClick={() => setActiveId(item.id)}
                                    className={clsx(
                                        'min-h-11 cursor-pointer rounded-st-full border px-4 st-body1 st-transition',
                                        selected
                                            ? 'border-st-action bg-st-action-tint text-st-action'
                                            : 'border-transparent text-st-text',
                                    )}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                    <main
                        role="tabpanel"
                        aria-label={section.label}
                        className="flex-1"
                    >
                        {tripsLoading && (
                            <p
                                role="status"
                                className="px-4 py-12 text-center st-body1 text-st-text-alt"
                            >
                                Loading your trips…
                            </p>
                        )}
                        {!tripsLoading && matching.length === 0 && (
                            <p className="px-4 py-12 text-center st-body1 text-st-text-alt">
                                {section.empty}
                            </p>
                        )}
                        {!tripsLoading && matching.length > 0 && (
                            <TripGroups bookings={matching} />
                        )}
                    </main>
                </>
            )}
        </div>
    );
}

function TripMenuBody({ bookingId }: { bookingId: string | null }) {
    const { bookings, cancelBooking } = useStore();
    const [confirming, setConfirming] = useState(false);
    const booking = bookings.find((item) => item.id === bookingId);

    if (!booking) {
        return (
            <p className="p-4 st-body2 text-st-text-alt">
                We can't find this booking any more.
            </p>
        );
    }

    if (confirming) {
        return (
            <>
                <p className="px-4 pt-4 pb-3 st-body2">
                    This cancels your mock booking and moves it to Cancelled. No
                    real booking or payment is affected.
                </p>
                <SheetFooter className="flex flex-col gap-2">
                    <Button
                        variant="outlineDanger"
                        className="w-full"
                        onClick={() => {
                            cancelBooking(booking.id);
                            closeSheet();
                            toast('Your mock booking was cancelled.');
                        }}
                    >
                        Cancel booking
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setConfirming(false)}
                    >
                        Keep booking
                    </Button>
                </SheetFooter>
            </>
        );
    }

    const rowClass =
        'flex min-h-12 w-full cursor-pointer items-center border-b border-st-border-soft px-4 py-2 text-left st-body1 st-transition hover:bg-st-surface-alt';

    return (
        <div className="pb-4">
            <button
                type="button"
                onClick={() => navigate(`/stay/${booking.id}`)}
                className={rowClass}
            >
                View details
            </button>
            <button
                type="button"
                onClick={() => navigate(`/property/${booking.hotelId}`)}
                className={rowClass}
            >
                Rebook
            </button>
            {booking.status === 'active' && (
                <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className={clsx(rowClass, 'text-st-danger')}
                >
                    Cancel (mock)
                </button>
            )}
        </div>
    );
}

export function TripMenuSheet({
    open,
    bookingId,
}: {
    open: boolean;
    bookingId: string | null;
}) {
    return (
        <Sheet open={open} title="Trip options" variant="bottom">
            <TripMenuBody bookingId={bookingId} />
        </Sheet>
    );
}
