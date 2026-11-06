import clsx from 'clsx';
import {
    Ban,
    BedDouble,
    Bell,
    Building,
    CalendarDays,
    CarFront,
    CarTaxiFront,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    CircleCheck,
    CircleHelp,
    Copy,
    Gift,
    HandHeart,
    LifeBuoy,
    Mail,
    MapPin,
    MessagesSquare,
    Phone,
    ReceiptText,
    Send,
    Share,
    Smile,
    User,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { Photo } from '../components/photo';
import { TextField } from '../components/text-field';
import { Button, DevNote, IconButton } from '../components/ui';
import { hotelById, RATES } from '../data';
import { formatDayYear, money, plural } from '../format';
import { goBack, Link } from '../router';
import { useStore } from '../store';
import { directionsUrl, downloadSummary, shareContent } from '../stay-actions';
import { APP_NAME } from '../theme';
import { bookingTotal } from './bookings';

// Used for mock properties, which have no real phone line.
const PLACEHOLDER_PHONE = '+44 20 0000 0000';

const STATUS_WORDS = {
    active: 'confirmed',
    past: 'completed',
    cancelled: 'cancelled',
};

const SURVEY_QUESTIONS = [
    'I was able to find the information I need for this booking',
    'The details of my booking were easy to understand',
];

const INFO: Record<string, { title: string; body?: string }> = {
    help: { title: 'Help' },
    messages: { title: 'Messages' },
    notifications: { title: 'Notifications' },
    discounts: { title: '10% discounts on stays' },
    'offline-trips': { title: 'Offline trips' },
    policies: { title: 'Property policies' },
    message: { title: 'Message property' },
    'room-details': { title: 'Room details' },
    'payment-details': {
        title: 'Payment details',
        body: "This is a prototype, so there's no real payment to show.",
    },
    'airport-transfer': { title: 'Private airport transfer' },
    'car-rental': { title: 'Car rental' },
    attractions: { title: 'Attractions' },
    'safety-centre': { title: 'Safety resource centre' },
    'emergency-services': { title: 'Local emergency services' },
};

function SectionBar({
    backLabel,
    help = true,
}: {
    backLabel: string;
    help?: boolean;
}) {
    return (
        <header className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-1 border-b border-st-border-soft bg-st-surface st-safe-top pr-1">
            <button
                type="button"
                aria-label={`Back to ${backLabel}`}
                onClick={() => goBack('/')}
                className="flex min-h-11 cursor-pointer items-center gap-1 justify-self-start px-2 st-body1"
            >
                <ChevronLeft className="size-6" aria-hidden />
                {backLabel}
            </button>
            <p className="st-headline3">{APP_NAME}</p>
            <div className="flex justify-end">
                {help && (
                    <Link
                        to="/trip-info/help"
                        aria-label="Help"
                        className="flex size-11 items-center justify-center"
                    >
                        <CircleHelp className="size-6" aria-hidden />
                    </Link>
                )}
            </div>
        </header>
    );
}

export function TripInfoScreen({ slug }: { slug?: string }) {
    const info = INFO[slug ?? ''];

    return (
        <div className="min-h-full bg-st-surface">
            <SectionBar backLabel="Back" help={slug !== 'help'} />
            <main className="flex flex-col gap-2 p-4">
                <h1 className="st-headline2">{info?.title ?? 'Information'}</h1>
                <p className="st-body2 text-st-text-alt">
                    {info?.body ??
                        "This screen isn't part of the prototype yet."}
                </p>
            </main>
        </div>
    );
}

function ActionRow({
    icon: Icon,
    iconClass,
    to,
    onClick,
    underline,
    children,
}: {
    icon: LucideIcon;
    iconClass?: string;
    to?: string;
    onClick?: () => void;
    underline?: boolean;
    children: ReactNode;
}) {
    const className =
        'flex min-h-12 w-full cursor-pointer items-center gap-3 text-left st-body1 text-st-link';
    const content = (
        <>
            <Icon className={clsx('size-6 shrink-0', iconClass)} aria-hidden />
            <span className={clsx(underline && 'underline')}>{children}</span>
        </>
    );

    return to ? (
        <Link to={to} className={className}>
            {content}
        </Link>
    ) : (
        <button type="button" onClick={onClick} className={className}>
            {content}
        </button>
    );
}

function Block({
    icon: Icon,
    title,
    children,
}: {
    icon: LucideIcon;
    title: ReactNode;
    children?: ReactNode;
}) {
    return (
        <div className="flex gap-3">
            <Icon className="mt-0.5 size-6 shrink-0" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div>{title}</div>
                {children}
            </div>
        </div>
    );
}

function Divider() {
    return <hr className="border-st-border-soft" />;
}

const textLinkClass =
    'inline-flex min-h-11 items-center self-start st-body1 text-st-link';

function SafetyNotice() {
    const [open, setOpen] = useState(false);

    return (
        <section className="flex gap-3 rounded-st-md border border-st-border p-4">
            <CircleAlert
                className="mt-0.5 size-6 shrink-0 text-st-callout"
                aria-hidden
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 className="st-strong1">Stay safe online</h2>
                <p className="st-body2">
                    You paid with {APP_NAME} – no further payment needed. Please
                    report any payment requests you receive and avoid clicking
                    on payment links.
                </p>
                {open && (
                    <p id="safety-more" className="st-body2 text-st-text-alt">
                        We'd never ask you for card details or passwords by
                        email, text or chat. Be careful with links in unexpected
                        messages.
                    </p>
                )}
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={open ? 'safety-more' : undefined}
                    onClick={() => setOpen(!open)}
                    className="flex min-h-11 cursor-pointer items-center gap-2 self-start st-body1 text-st-link"
                >
                    {open ? 'View less' : 'View more'}
                    <ChevronDown
                        className={clsx('size-5', open && 'rotate-180')}
                        aria-hidden
                    />
                </button>
            </div>
        </section>
    );
}

function SurveyCard({ bookingId }: { bookingId: string }) {
    const { notes, answerSurvey, dismiss } = useStore();
    const key = `survey:${bookingId}`;
    const answers = notes.surveys[bookingId] ?? [];
    const step = answers.length;

    if (notes.dismissed.includes(key)) {
        return null;
    }

    return (
        <section
            aria-labelledby="survey-title"
            className="flex flex-col gap-3 rounded-st-md border border-st-border p-4"
        >
            <div className="flex items-start justify-between gap-2">
                <h2 id="survey-title" className="st-strong1">
                    How are we doing?
                </h2>
                <IconButton
                    label="Dismiss survey"
                    onClick={() => dismiss(key)}
                    className="-mt-2 -mr-2"
                >
                    <X className="size-5" aria-hidden />
                </IconButton>
            </div>
            {step >= SURVEY_QUESTIONS.length ? (
                <p role="status" className="st-body2 text-st-success">
                    Thanks. We saved your answers on this device.
                </p>
            ) : (
                <>
                    <div className="flex items-center gap-4">
                        <div
                            aria-hidden
                            className="relative flex size-16 shrink-0 items-center justify-center rounded-st-full bg-st-action-tint text-st-link"
                        >
                            <Smile className="size-10" />
                            <span className="absolute -top-0.5 -right-0.5 flex size-6 items-center justify-center rounded-st-full bg-st-callout st-strong2 text-st-on-accent">
                                ?
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="st-body2 text-st-text-alt">
                                {step + 1} of {SURVEY_QUESTIONS.length}
                            </p>
                            <p id="survey-question" className="st-body1">
                                {SURVEY_QUESTIONS[step]}
                            </p>
                        </div>
                    </div>
                    <div
                        role="group"
                        aria-labelledby="survey-question"
                        className="grid grid-cols-5 gap-4"
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                aria-label={`${value} out of 5`}
                                onClick={() => answerSurvey(bookingId, value)}
                                className="aspect-square min-h-11 cursor-pointer rounded-st-sm border border-st-border st-body1 st-transition hover:bg-st-action-tint"
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between gap-2 st-body2 text-st-text-alt">
                        <span>Strongly disagree</span>
                        <span className="text-right">Strongly agree</span>
                    </div>
                </>
            )}
        </section>
    );
}

function NotificationNotice({ bookingId }: { bookingId: string }) {
    const { notes, dismiss, prefs, setPrefs } = useStore();
    const key = `notify:${bookingId}`;

    if (notes.dismissed.includes(key)) {
        return null;
    }

    return (
        <section className="flex items-start gap-3 rounded-st-md border border-st-border p-4">
            <Bell className="mt-0.5 size-6 shrink-0" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="st-strong1">Stay updated on this booking?</h3>
                <button
                    type="button"
                    onClick={() => {
                        setPrefs({
                            notifications: {
                                ...prefs.notifications,
                                bookings: true,
                            },
                        });
                        dismiss(key);
                        toast('Booking notifications are on.');
                    }}
                    className="min-h-11 cursor-pointer self-start st-body1 text-st-link"
                >
                    Turn on notifications
                </button>
            </div>
            <IconButton
                label="Dismiss notification notice"
                onClick={() => dismiss(key)}
                className="-mt-2 -mr-2"
            >
                <X className="size-5" aria-hidden />
            </IconButton>
        </section>
    );
}

function AddOnCard({
    to,
    leading,
    title,
    children,
}: {
    to: string;
    leading: ReactNode;
    title: ReactNode;
    children: ReactNode;
}) {
    return (
        <Link
            to={to}
            className="flex items-center gap-4 rounded-st-md border border-st-border p-4"
        >
            {leading}
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 wrap-anywhere">
                {title}
                {children}
            </span>
            <ChevronRight className="size-5 shrink-0" aria-hidden />
        </Link>
    );
}

function MissingBooking() {
    return (
        <div className="min-h-full bg-st-surface">
            <SectionBar backLabel="Trips" />
            <main className="p-4">
                <h1 className="st-headline3">We can't find this booking</h1>
                <p className="mt-2 st-body2 text-st-text-alt">
                    Go back to Trips to see your bookings.
                </p>
            </main>
        </div>
    );
}

export function StayScreen({ bookingId }: { bookingId?: string }) {
    const { bookings, user, notes, tripsLoading } = useStore();
    const booking = bookings.find((item) => item.id === bookingId);
    const hotel = hotelById(booking?.hotelId);
    const room = hotel?.rooms.find((item) => item.id === booking?.roomId);
    const rate = RATES.find((item) => item.id === booking?.rateId);

    if (!booking || !hotel || !room || !rate) {
        return tripsLoading ? (
            <p role="status" className="p-4 st-body1 text-st-text-alt">
                Loading your trip…
            </p>
        ) : (
            <MissingBooking />
        );
    }

    const { search } = booking;
    const total = bookingTotal(booking);
    const paid = booking.status === 'cancelled' ? money(0) : total;
    const rating = notes.ratings[booking.id];
    const appUrl = `${window.location.origin}${window.location.pathname}`;
    const phone = hotel.phone ?? PLACEHOLDER_PHONE;
    const guestName =
        booking.guestName ??
        (user ? `${user.firstName} ${user.lastName}` : 'Guest');
    const contactEmail = booking.contactEmail ?? user?.email ?? '';

    const receipt = () =>
        downloadSummary('receipt', booking, guestName, contactEmail, total);

    return (
        <div className="min-h-full bg-st-surface">
            <SectionBar backLabel="Trips" />
            <main className="flex flex-col gap-4 px-4 pt-3 pb-6">
                {import.meta.env.DEV && (
                    <DevNote>
                        parts of this stay are placeholder data. ASSUMPTIONS.md
                        lists them.
                    </DevNote>
                )}
                <div>
                    <h1 className="st-headline2">
                        Your stay is{' '}
                        <span
                            className={
                                booking.status === 'cancelled'
                                    ? 'text-st-danger'
                                    : 'text-st-status-good'
                            }
                        >
                            {STATUS_WORDS[booking.status]}
                        </span>
                    </h1>
                    <ActionRow
                        icon={Check}
                        iconClass="text-st-text"
                        underline
                        onClick={() =>
                            downloadSummary(
                                'confirmation',
                                booking,
                                guestName,
                                contactEmail,
                                total,
                            )
                        }
                    >
                        Save your confirmation
                    </ActionRow>
                    <ActionRow icon={Building} to={`/property/${hotel.id}`}>
                        Book again
                    </ActionRow>
                    {booking.status === 'past' && (
                        <ActionRow icon={Smile} to={`/rate/${booking.id}`}>
                            {rating
                                ? `You rated this stay ${rating.score}/10`
                                : 'Rate your stay'}
                        </ActionRow>
                    )}
                </div>

                <Divider />
                <SafetyNotice />

                <h2 className="st-headline3 text-st-link">{hotel.name}</h2>

                <Block
                    icon={CalendarDays}
                    title={
                        <p className="st-strong2">
                            {formatDayYear(search.checkIn)} -{' '}
                            {formatDayYear(search.checkOut)}
                        </p>
                    }
                >
                    <p className="st-body2">Check-in: {hotel.checkInTime}</p>
                    <p className="st-body2">Check-out: {hotel.checkOutTime}</p>
                </Block>

                <Block
                    icon={MapPin}
                    title={<h3 className="st-strong2">Property address</h3>}
                >
                    <p className="st-body1">
                        {hotel.address}
                        <IconButton
                            label="Copy address"
                            onClick={() => {
                                void navigator.clipboard
                                    ?.writeText(hotel.address)
                                    .then(() => toast('Address copied.'));
                            }}
                            className="-my-3 align-middle text-st-link"
                        >
                            <Copy className="size-5" aria-hidden />
                        </IconButton>
                    </p>
                    <a
                        href={directionsUrl(hotel.address)}
                        target="_blank"
                        rel="noreferrer"
                        className={textLinkClass}
                    >
                        Get directions
                    </a>
                </Block>

                <Block
                    icon={BedDouble}
                    title={<h3 className="st-strong2">Property policies</h3>}
                >
                    <Link to="/trip-info/policies" className={textLinkClass}>
                        View all policies
                    </Link>
                </Block>

                <Divider />

                <section className="flex flex-col gap-3">
                    <h2 className="st-headline3">Contact the property</h2>
                    <p className="st-body2">
                        Discuss changes to your booking or find out more about
                        your stay.
                    </p>
                    <Block
                        icon={MessagesSquare}
                        title={<h3 className="st-strong2">Message property</h3>}
                    >
                        <Link to="/trip-info/message" className={textLinkClass}>
                            Send a message
                        </Link>
                    </Block>
                    <Block
                        icon={Phone}
                        title={<h3 className="st-strong2">Other methods</h3>}
                    >
                        <a
                            href={`tel:${phone.replace(/\s/g, '')}`}
                            className={textLinkClass}
                        >
                            Call {phone}
                            {!hotel.phone && ' (placeholder number)'}
                        </a>
                    </Block>
                </section>

                <Divider />

                <section className="flex flex-col gap-3">
                    <h2 className="st-headline3">
                        You've booked {plural(search.rooms, 'room')}
                    </h2>
                    <h3 className="st-strong2">{room.name}</h3>
                    <Block
                        icon={User}
                        title={<p className="st-strong2">Guests</p>}
                    >
                        <p className="st-body2">{guestName}</p>
                    </Block>
                    <Block
                        icon={Gift}
                        title={<p className="st-strong2">Benefits</p>}
                    >
                        <p className="st-body2">
                            {booking.benefits ??
                                (rate.breakfast
                                    ? 'Breakfast and free WiFi included'
                                    : 'Free WiFi included')}
                        </p>
                    </Block>
                    <Block
                        icon={rate.cancellable ? CircleCheck : Ban}
                        title={
                            <p className="st-strong2">
                                {rate.cancellable
                                    ? 'Free cancellation'
                                    : 'Non-refundable'}
                            </p>
                        }
                    >
                        <p className="st-body2">
                            {rate.cancellable
                                ? `You could cancel for free before ${formatDayYear(search.checkIn)}.`
                                : "If you cancel, modify the booking, or don't show up, the fee will be the total price of the reservation."}
                        </p>
                    </Block>
                    <Link
                        to="/trip-info/room-details"
                        className={textLinkClass}
                    >
                        View room details
                    </Link>
                </section>

                <Divider />

                <section className="flex flex-col gap-3">
                    <h2 className="st-headline3">Your contact information</h2>
                    <p className="flex items-center gap-3 st-body2">
                        <Mail className="size-6 shrink-0" aria-hidden />
                        <span className="min-w-0 break-words">
                            {contactEmail}
                        </span>
                    </p>
                </section>

                <Divider />

                <div>
                    <div className="flex items-baseline justify-between gap-3 st-headline3">
                        <span>Total</span>
                        <span>{total}</span>
                    </div>
                    <p className="text-right st-small1 text-st-text-alt">
                        Includes taxes and charges
                    </p>
                </div>

                <Divider />

                <section className="flex flex-col gap-4">
                    <h2 className="st-headline3">Payment information</h2>
                    <div className="flex flex-col gap-3 rounded-st-md border border-st-border p-4">
                        <div className="flex justify-between gap-3 st-strong1">
                            <span>Total cost</span>
                            <span>{total}</span>
                        </div>
                        <div className="flex justify-between gap-3 st-body2">
                            <span>Total paid</span>
                            <span>{paid}</span>
                        </div>
                        <Link
                            to="/trip-info/payment-details"
                            className="flex min-h-12 items-center justify-center rounded-st-sm bg-st-action px-4 py-2 text-center st-emphasized1 text-st-on-dark st-transition hover:bg-st-action-hover"
                        >
                            View payment details
                        </Link>
                    </div>
                    <Divider />
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={receipt}
                    >
                        Download receipt
                    </Button>
                    <NotificationNotice bookingId={booking.id} />
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="st-headline3">Add more to your trip</h2>
                    <AddOnCard
                        to="/trip-info/airport-transfer"
                        leading={
                            <CarTaxiFront
                                className="size-7 shrink-0 text-st-link"
                                aria-hidden
                            />
                        }
                        title={
                            <span className="st-strong2">
                                Private airport transfer
                            </span>
                        }
                    >
                        <span className="st-body2 text-st-text-alt">
                            A driver will be waiting to get you to your stay
                        </span>
                    </AddOnCard>
                    <AddOnCard
                        to="/trip-info/car-rental"
                        leading={
                            <CarFront
                                className="size-7 shrink-0 text-st-link"
                                aria-hidden
                            />
                        }
                        title={<span className="st-strong2">Car rental</span>}
                    >
                        <span className="st-body2 text-st-text-alt">
                            Free parking at the property
                        </span>
                        <span className="st-body2 text-st-text-alt">
                            Hundreds of cars and 24/7 customer service
                        </span>
                    </AddOnCard>
                    <AddOnCard
                        to="/trip-info/attractions"
                        leading={
                            <Photo
                                seed={`${hotel.id}-attractions`}
                                scene="city"
                                className="size-16 shrink-0 rounded-st-md"
                            />
                        }
                        title={
                            <span className="flex flex-wrap items-center gap-1">
                                <span className="st-strong2">Attractions</span>
                                <span className="rounded-st-sm bg-st-brand px-1 st-small2 text-st-on-dark">
                                    Member
                                </span>
                                <span className="rounded-st-sm bg-st-success-tint px-1 st-small1 text-st-success">
                                    Up to 10% off
                                </span>
                            </span>
                        }
                    >
                        <span className="st-body2 text-st-success">
                            Free cancellation available
                        </span>
                        <span className="st-body2 text-st-text-alt">
                            Save up to 10% on select attractions
                        </span>
                    </AddOnCard>
                </section>

                <section aria-label="Share" className="flex flex-col">
                    <ActionRow icon={ReceiptText} onClick={receipt}>
                        Download receipt
                    </ActionRow>
                    <ActionRow
                        icon={Send}
                        onClick={() =>
                            void shareContent({
                                title: `My stay at ${hotel.name}`,
                                text: `${hotel.name}, ${formatDayYear(search.checkIn)} - ${formatDayYear(search.checkOut)}`,
                                url: appUrl,
                            })
                        }
                    >
                        Share this booking
                    </ActionRow>
                    <ActionRow
                        icon={Share}
                        onClick={() =>
                            void shareContent({
                                title: hotel.name,
                                text: `Take a look at ${hotel.name} on ${APP_NAME}`,
                                url: `${appUrl}#/property/${hotel.id}`,
                            })
                        }
                    >
                        Share this property
                    </ActionRow>
                    <ActionRow
                        icon={HandHeart}
                        onClick={() =>
                            void shareContent({
                                title: APP_NAME,
                                text: `Find your next stay on ${APP_NAME}`,
                                url: appUrl,
                            })
                        }
                    >
                        Share this app
                    </ActionRow>
                </section>

                <Divider />

                <section className="flex flex-col">
                    <h2 className="pb-1 st-headline3">Travel safely</h2>
                    <ActionRow icon={LifeBuoy} to="/trip-info/safety-centre">
                        Safety resource centre
                    </ActionRow>
                    <ActionRow icon={Bell} to="/trip-info/emergency-services">
                        Local emergency services
                    </ActionRow>
                </section>

                <Divider />

                <Link
                    to="/trip-info/message"
                    className="flex min-h-12 items-center justify-center rounded-st-sm bg-st-action px-4 py-2 text-center st-emphasized1 text-st-on-dark st-transition hover:bg-st-action-hover"
                >
                    Contact property
                </Link>

                <SurveyCard bookingId={booking.id} />
            </main>
        </div>
    );
}

export function RateScreen({ bookingId }: { bookingId?: string }) {
    const { bookings, notes, rateStay } = useStore();
    const booking = bookings.find((item) => item.id === bookingId);
    const hotel = hotelById(booking?.hotelId);
    const existing = bookingId ? notes.ratings[bookingId] : undefined;
    const [score, setScore] = useState<number | null>(existing?.score ?? null);
    const [comment, setComment] = useState(existing?.comment ?? '');
    const [error, setError] = useState<string | null>(null);

    if (!booking || !hotel) {
        return <MissingBooking />;
    }

    return (
        <div className="min-h-full bg-st-surface">
            <SectionBar backLabel="Back" />
            <main className="p-4">
                <form
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();

                        if (score === null) {
                            setError('Choose a score from 1 to 10.');

                            return;
                        }

                        rateStay(booking.id, score, comment.trim());
                        toast('Thanks. We saved your rating on this device.');
                        goBack('/');
                    }}
                    className="flex flex-col gap-4"
                >
                    <div>
                        <h1 className="st-headline2">Rate your stay</h1>
                        <p className="st-body2 text-st-text-alt">
                            {hotel.name}
                        </p>
                    </div>
                    <fieldset
                        aria-describedby={error ? 'rate-error' : undefined}
                    >
                        <legend className="pb-2 st-strong2">
                            Your score out of 10
                        </legend>
                        <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 10 }, (_, index) => {
                                const value = index + 1;

                                return (
                                    <label
                                        key={value}
                                        className={clsx(
                                            'flex min-h-11 cursor-pointer items-center justify-center rounded-st-sm border st-strong2 st-transition has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-st-link',
                                            score === value
                                                ? 'border-st-action bg-st-action text-st-on-dark'
                                                : error
                                                  ? 'border-st-danger'
                                                  : 'border-st-border',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="score"
                                            checked={score === value}
                                            onChange={() => {
                                                setScore(value);
                                                setError(null);
                                            }}
                                            className="sr-only"
                                        />
                                        {value}
                                    </label>
                                );
                            })}
                        </div>
                        {error && (
                            <p
                                id="rate-error"
                                role="alert"
                                className="mt-1 flex items-start gap-1 st-small1 text-st-danger"
                            >
                                <CircleAlert
                                    className="mt-0.5 size-3.5 shrink-0"
                                    aria-hidden
                                />
                                {error}
                            </p>
                        )}
                    </fieldset>
                    <TextField
                        id="rate-comment"
                        label="Add a comment (optional)"
                        type="text"
                        value={comment}
                        error={null}
                        onChange={setComment}
                    />
                    <Button type="submit" className="w-full">
                        Submit rating
                    </Button>
                </form>
            </main>
        </div>
    );
}
