import clsx from 'clsx';
import {
    BadgePercent,
    BedDouble,
    Bell,
    Calendar,
    CalendarCheck,
    Car,
    CarTaxiFront,
    ChevronDown,
    FerrisWheel,
    Info,
    MapPin,
    MessageCircle,
    Search as SearchIcon,
    ThumbsUp,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { useDragScroll } from '../components/drag-scroll';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { HotelPhoto } from '../components/hotel-photo';
import { Photo } from '../components/photo';
import { Button, ReviewScore, SearchFrame } from '../components/ui';
import { destinationById, hotelById, hotelsIn, priceFor } from '../data';
import type { Hotel } from '../data';
import {
    formatDayMonth,
    formatRange,
    money,
    nextWeekend,
    plural,
    todayIso,
} from '../format';
import { Link, navigate, openSheet, selectTab } from '../router';
import { useStore } from '../store';
import type { MockBooking } from '../store';
import { APP_NAME } from '../theme';

const SERVICES = [
    { label: 'Stays', icon: BedDouble },
    { label: 'Car rental', icon: Car },
    { label: 'Taxi', icon: CarTaxiFront },
    { label: 'Attractions', icon: FerrisWheel },
];

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const WEEKEND_DESTINATION = 'london';
const WEEKEND_DEAL_COUNT = 5;

function SearchRow({
    icon,
    label,
    value,
    placeholder,
    onClick,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    placeholder?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            aria-haspopup="dialog"
            aria-label={`${label}: ${value}`}
            onClick={onClick}
            className="flex min-h-14 w-full cursor-pointer items-center gap-4 border-b border-st-border-soft bg-st-surface px-4 py-2 text-left st-transition hover:bg-st-surface-alt"
        >
            <span className="flex w-6 shrink-0 justify-center text-st-text">
                {icon}
            </span>
            <span
                className={clsx(
                    'min-w-0 flex-1 st-body1',
                    placeholder && 'text-st-text-alt',
                )}
            >
                {value}
            </span>
        </button>
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
            className="flex size-11 items-center justify-center"
        >
            {children}
        </Link>
    );
}

function HomeHeader() {
    const dragScroll = useDragScroll<HTMLUListElement>();

    return (
        <header className="st-on-brand sticky top-0 z-10 bg-st-brand st-safe-top text-st-on-dark">
            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_5.5rem] items-center pr-1">
                <span />
                <p className="-mx-2 py-1.5 text-center st-headline3">
                    {APP_NAME}
                </p>
                <div className="flex justify-end">
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
            <nav aria-label="Services">
                <ul
                    ref={dragScroll}
                    className="flex gap-1 overflow-x-auto px-4 pt-1 pb-2"
                >
                    {SERVICES.map(({ label, icon: Icon }) => {
                        const active = label === 'Stays';

                        return (
                            <li key={label} className="shrink-0">
                                <button
                                    type="button"
                                    aria-current={active ? 'page' : undefined}
                                    onClick={() => {
                                        if (!active) {
                                            toast(
                                                `${label} isn't part of this prototype yet.`,
                                            );
                                        }
                                    }}
                                    className={clsx(
                                        'flex min-h-11 cursor-pointer items-center gap-2 rounded-st-full border px-4 st-body2 whitespace-nowrap st-transition',
                                        active
                                            ? 'border-st-on-dark bg-st-on-dark/15'
                                            : 'border-transparent hover:bg-st-on-dark/15',
                                    )}
                                >
                                    <Icon className="size-5" aria-hidden />
                                    {label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </header>
    );
}

function SectionHeading({
    id,
    title,
    subtitle,
}: {
    id: string;
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="px-4">
            <h2 id={id} className="st-headline3">
                {title}
            </h2>
            {subtitle && <p className="st-body2">{subtitle}</p>}
        </div>
    );
}

function Carousel({ label, children }: { label: string; children: ReactNode }) {
    const dragScroll = useDragScroll<HTMLUListElement>();

    return (
        <ul
            ref={dragScroll}
            aria-label={label}
            className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-3 pb-1 *:snap-start"
        >
            {children}
        </ul>
    );
}

function TravelMore() {
    const { user, startAuth } = useStore();

    return (
        <section aria-labelledby="travel-heading" className="mt-6">
            <SectionHeading
                id="travel-heading"
                title="Travel more, spend less"
            />
            <Carousel label="Member benefits">
                <li className="w-60 shrink-0">
                    {user ? (
                        <button
                            type="button"
                            onClick={() => selectTab('account')}
                            className="flex h-full w-full cursor-pointer flex-col gap-1 rounded-st-md bg-st-brand p-4 text-left text-st-on-dark"
                        >
                            <span className="st-strong1">
                                {APP_NAME} Rewards
                            </span>
                            <span className="st-body2">
                                {user.firstName}, you're at{' '}
                                <strong>Level 1</strong> in our loyalty
                                programme
                            </span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => startAuth()}
                            className="flex h-full w-full cursor-pointer flex-col gap-1 rounded-st-md bg-st-brand p-4 text-left text-st-on-dark"
                        >
                            <span className="st-strong1">
                                {APP_NAME} Rewards
                            </span>
                            <span className="st-body2">
                                <strong>Sign in</strong> to see your level in
                                our loyalty programme
                            </span>
                        </button>
                    )}
                </li>
                <li className="w-60 shrink-0">
                    <Link
                        to="/trip-info/discounts"
                        className="flex h-full w-full flex-col gap-1 rounded-st-md border border-st-link p-4"
                    >
                        <span className="st-strong1">
                            10% discounts on stays
                        </span>
                        <span className="st-body2">
                            Enjoy discounts at participating properties
                            worldwide
                        </span>
                    </Link>
                </li>
            </Carousel>
        </section>
    );
}

function PendingReviewCard({ booking }: { booking: MockBooking }) {
    const { rateStay } = useStore();
    const [showInfo, setShowInfo] = useState(false);
    const hotel = hotelById(booking.hotelId);

    if (!hotel) {
        return null;
    }

    const { checkIn, checkOut } = booking.search;

    return (
        <div className="mx-4 mt-3 flex flex-col gap-3 rounded-st-md border border-st-border p-4">
            <div className="flex items-center gap-3">
                <HotelPhoto
                    hotel={hotel}
                    kind="room"
                    className="size-12 shrink-0 rounded-st-md"
                />
                <div className="min-w-0">
                    <h3 className="st-strong1">{hotel.name}</h3>
                    <p className="st-body2 text-st-text-alt">
                        {formatRange(checkIn, checkOut)} {checkOut.slice(0, 4)}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-between gap-2">
                <p id="review-score-label" className="st-strong2">
                    Select to submit your review score
                </p>
                <button
                    type="button"
                    aria-label="About review scores"
                    aria-expanded={showInfo}
                    onClick={() => setShowInfo(!showInfo)}
                    className="-my-3 -mr-3 flex size-11 shrink-0 cursor-pointer items-center justify-center"
                >
                    <Info className="size-5" aria-hidden />
                </button>
            </div>
            {showInfo && (
                <p className="st-body2 text-st-text-alt">
                    Your score helps other travellers choose where to stay. In
                    this prototype it's only saved on this device.
                </p>
            )}
            <div
                role="group"
                aria-labelledby="review-score-label"
                className="grid grid-cols-10 divide-x divide-st-border overflow-hidden rounded-st-full border border-st-border"
            >
                {SCORES.map((score) => (
                    <button
                        key={score}
                        type="button"
                        aria-label={`Score ${score} out of 10`}
                        onClick={() => {
                            rateStay(booking.id, score, '');
                            toast('Thanks. We saved your review score.');
                        }}
                        className="min-h-11 cursor-pointer st-strong2 text-st-link st-transition hover:bg-st-action-tint"
                    >
                        {score}
                    </button>
                ))}
            </div>
            <div className="flex justify-between gap-2 st-emphasized2 text-st-text-alt">
                <span>Bad</span>
                <span>Exceptional</span>
            </div>
        </div>
    );
}

function PendingReview() {
    const { user, bookings, notes } = useStore();
    const pending = bookings.find(
        (item) =>
            item.status === 'past' &&
            !notes.ratings[item.id] &&
            !notes.dismissed.includes(`rate:${item.id}`),
    );

    if (!user || !pending) {
        return null;
    }

    return (
        <section aria-labelledby="review-heading" className="mt-8">
            <SectionHeading id="review-heading" title="Pending review" />
            <PendingReviewCard booking={pending} />
        </section>
    );
}

function WeekendDealCard({
    hotel,
    friday,
    sunday,
}: {
    hotel: Hotel;
    friday: string;
    sunday: string;
}) {
    const { search, updateSearch } = useStore();
    const price = priceFor(hotel, {
        ...search,
        checkIn: friday,
        checkOut: sunday,
    });

    return (
        <li className="w-60 shrink-0">
            <article className="relative flex h-full flex-col overflow-hidden rounded-st-md border border-st-border-soft bg-st-surface">
                <HotelPhoto hotel={hotel} kind="room" className="h-40 w-full" />
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                    <p className="flex flex-wrap items-center gap-1 st-body2 text-st-text-alt">
                        {hotel.type}
                        {hotel.preferred && (
                            <span
                                role="img"
                                aria-label="Preferred property"
                                className="inline-flex size-4 items-center justify-center rounded-st-sm bg-st-accent text-st-on-accent"
                            >
                                <ThumbsUp className="size-3" aria-hidden />
                            </span>
                        )}
                        <span className="rounded-st-sm bg-st-brand px-1 st-small2 text-st-on-dark">
                            Member
                        </span>
                    </p>
                    <h3 className="st-strong1">
                        <button
                            type="button"
                            onClick={() => {
                                updateSearch({
                                    destinationId: hotel.destinationId,
                                    checkIn: friday,
                                    checkOut: sunday,
                                });
                                navigate(`/property/${hotel.id}`);
                            }}
                            className="cursor-pointer text-left after:absolute after:inset-0 after:content-['']"
                        >
                            {hotel.name}
                        </button>
                    </h3>
                    <ReviewScore
                        score={hotel.score}
                        count={hotel.reviewCount}
                    />
                    <p className="flex items-center gap-2 st-body2">
                        <MapPin className="size-5 shrink-0" aria-hidden />
                        {destinationById(hotel.destinationId).name}
                    </p>
                    <div>
                        <span className="inline-block rounded-st-sm border border-st-success px-1 st-small1 text-st-success">
                            Mobile-only price
                        </span>
                    </div>
                    <div className="mt-auto pt-1 text-right">
                        <p className="st-small1 text-st-text-alt">
                            {plural(price.nights, 'night')}
                        </p>
                        <p>
                            {price.original !== null && (
                                <s className="mr-1 st-small1 text-st-danger">
                                    <span className="sr-only">
                                        Original price{' '}
                                    </span>
                                    {money(price.original)}
                                </s>
                            )}
                            <strong className="st-strong1 text-st-text">
                                <span className="sr-only">Current price </span>
                                {money(price.current)}
                            </strong>
                        </p>
                    </div>
                </div>
            </article>
        </li>
    );
}

function WeekendDeals() {
    const { friday, sunday } = nextWeekend(todayIso());
    const hotels = hotelsIn(WEEKEND_DESTINATION)
        .filter((hotel) => hotel.deal)
        .slice(0, WEEKEND_DEAL_COUNT);

    return (
        <section aria-labelledby="weekend-heading" className="mt-8">
            <SectionHeading
                id="weekend-heading"
                title="Deals for the weekend"
                subtitle={`Save on stays for ${formatRange(friday, sunday)}`}
            />
            <Carousel label="Weekend deals">
                {hotels.map((hotel) => (
                    <WeekendDealCard
                        key={hotel.id}
                        hotel={hotel}
                        friday={friday}
                        sunday={sunday}
                    />
                ))}
            </Carousel>
        </section>
    );
}

function Offers({ onSearch }: { onSearch: () => void }) {
    return (
        <section aria-labelledby="offers-heading" className="mt-8">
            <SectionHeading
                id="offers-heading"
                title="Offers"
                subtitle="Promotions, deals and special offers for you"
            />
            <div className="mx-4 mt-3 flex gap-4 rounded-st-md border border-st-border p-4">
                <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                    <p className="st-small1">Late Escape Deal</p>
                    <h3 className="st-strong1">15% off or more</h3>
                    <p className="st-body2">
                        Get away for less with Late Escape Deals on select
                        stays.
                    </p>
                    <Button
                        variant="primarySmall"
                        className="mt-2"
                        onClick={onSearch}
                    >
                        Search deals
                    </Button>
                </div>
                <Photo
                    seed="late-escape"
                    scene="pool"
                    className="size-20 shrink-0 rounded-st-md"
                />
            </div>
        </section>
    );
}

function WhyUs() {
    const reasons = [
        {
            icon: BadgePercent,
            title: 'Mobile-only pricing',
            body: 'Save money on selected stays when you book with the app',
        },
        {
            icon: CalendarCheck,
            title: 'Free cancellation',
            body: 'Find what works with flexible cancellation options on most stays',
        },
    ];

    return (
        <section aria-labelledby="why-heading" className="mt-8">
            <SectionHeading id="why-heading" title={`Why ${APP_NAME}?`} />
            <Carousel label={`Reasons to choose ${APP_NAME}`}>
                {reasons.map(({ icon: Icon, title, body }) => (
                    <li
                        key={title}
                        className="flex w-60 shrink-0 flex-col items-center gap-2 rounded-st-md bg-st-action-tint p-4 text-center"
                    >
                        <span className="flex size-14 items-center justify-center rounded-st-full bg-st-accent text-st-on-accent">
                            <Icon className="size-8" aria-hidden />
                        </span>
                        <h3 className="st-strong1">{title}</h3>
                        <p className="st-body2">{body}</p>
                    </li>
                ))}
            </Carousel>
        </section>
    );
}

function PersonalisedRecommendations() {
    const [open, setOpen] = useState(false);

    return (
        <section className="mx-3 mt-8 rounded-st-md border border-st-border">
            <button
                type="button"
                aria-expanded={open}
                aria-controls={open ? 'recommendations-more' : undefined}
                onClick={() => setOpen(!open)}
                className="flex min-h-14 w-full cursor-pointer items-center gap-2 px-3 py-2 text-left st-body1"
            >
                <Info className="size-6 shrink-0 text-st-callout" aria-hidden />
                <span className="min-w-0 flex-1">
                    Manage personalised recommendations
                </span>
                <ChevronDown
                    className={clsx('size-6 shrink-0', open && 'rotate-180')}
                    aria-hidden
                />
            </button>
            {open && (
                <p
                    id="recommendations-more"
                    className="px-3 pb-3 st-body2 text-st-text-alt"
                >
                    Suggestions on this page are chosen from your stays in this
                    prototype. Nothing is sent to anyone else.
                </p>
            )}
        </section>
    );
}

export function HomeScreen() {
    const { search } = useStore();
    const hasDestination = search.destinationId !== '';

    // Searching needs somewhere to look, so the destination picker opens first.
    const runSearch = () => {
        if (hasDestination) {
            navigate('/results');
        } else {
            openSheet('destination');
        }
    };

    const guests = [
        plural(search.rooms, 'room'),
        plural(search.adults, 'adult'),
        search.children > 0
            ? plural(search.children, 'child', 'children')
            : 'No children',
    ].join(' · ');

    return (
        <div className="min-h-full bg-st-surface pb-6">
            <HomeHeader />
            <div aria-hidden className="h-9 bg-st-brand" />

            <main>
                <h1 className="sr-only">Search for a stay</h1>
                <SearchFrame className="relative mx-4 -mt-9">
                    <form
                        role="search"
                        onSubmit={(event) => {
                            event.preventDefault();
                            runSearch();
                        }}
                        className="overflow-hidden rounded-st-sm"
                    >
                        <SearchRow
                            icon={<SearchIcon className="size-6" aria-hidden />}
                            label="Destination"
                            value={
                                hasDestination
                                    ? destinationById(search.destinationId).name
                                    : 'Enter destination'
                            }
                            placeholder={!hasDestination}
                            onClick={() => openSheet('destination')}
                        />
                        <SearchRow
                            icon={<Calendar className="size-6" aria-hidden />}
                            label="Dates"
                            value={`${formatDayMonth(search.checkIn)} – ${formatDayMonth(search.checkOut)}`}
                            onClick={() => openSheet('dates')}
                        />
                        <SearchRow
                            icon={<User className="size-6" aria-hidden />}
                            label="Guests"
                            value={guests}
                            onClick={() => openSheet('guests')}
                        />
                        <Button type="submit" variant="search">
                            Search
                        </Button>
                    </form>
                </SearchFrame>

                <TravelMore />
                <PendingReview />
                <WeekendDeals />
                <Offers onSearch={runSearch} />
                <WhyUs />
                <PersonalisedRecommendations />
            </main>
        </div>
    );
}
