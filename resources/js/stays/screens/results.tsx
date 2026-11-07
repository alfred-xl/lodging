import clsx from 'clsx';
import {
    ArrowLeft,
    ArrowUpDown,
    Heart,
    Map as MapIcon,
    Menu,
    Search as SearchIcon,
    SearchX,
    SlidersHorizontal,
    WifiOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDragScroll } from '../components/drag-scroll';
import { toast } from 'sonner';
import { HotelPhoto } from '../components/hotel-photo';
import {
    BenefitRow,
    Button,
    DealBadge,
    IconButton,
    Location,
    PriceStack,
    ReviewScore,
    SaveHeart,
    SearchFrame,
    StarRating,
} from '../components/ui';
import {
    applyFilters,
    destinationById,
    filterCount,
    FILTERS,
    hotelsIn,
    priceFor,
    RESULT_CHIP_IDS,
    sortHotels,
} from '../data';
import type { Hotel } from '../data';
import { formatDistance, formatLong, formatShort, plural } from '../format';
import { goBack, Link, navigate, openSheet, selectTab } from '../router';
import { useStore } from '../store';

const LOAD_DELAY_MS = 700;

export function occupancyLabel(search: {
    rooms: number;
    adults: number;
    children: number;
}): string {
    return [
        plural(search.adults, 'adult'),
        ...(search.children > 0
            ? [plural(search.children, 'child', 'children')]
            : []),
        ...(search.rooms > 1 ? [plural(search.rooms, 'room')] : []),
    ].join(', ');
}

export function ResultRow({ hotel }: { hotel: Hotel }) {
    const { search, prefs } = useStore();

    return (
        <article className="relative flex gap-2 border-b border-st-border-soft bg-st-surface px-2 py-3">
            <div className="relative w-[124px] shrink-0 self-stretch">
                <HotelPhoto
                    hotel={hotel}
                    className="absolute inset-0 h-full w-full rounded-st-sm"
                />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 className="pr-7 st-strong2">
                    <Link
                        to={`/property/${hotel.id}`}
                        className="after:absolute after:inset-0 after:content-['']"
                    >
                        {hotel.name}
                    </Link>
                </h2>
                <StarRating stars={hotel.stars} preferred={hotel.preferred} />
                <ReviewScore score={hotel.score} count={hotel.reviewCount} />
                <Location>
                    {hotel.area} ·{' '}
                    {formatDistance(hotel.distanceKm, prefs.units)} from centre
                </Location>
                {hotel.deal && (
                    <div>
                        <DealBadge>{hotel.deal}</DealBadge>
                    </div>
                )}
                <PriceStack price={priceFor(hotel, search)} />
                <div className="flex flex-col gap-0.5">
                    {hotel.features.includes('cancel') && (
                        <BenefitRow>
                            <strong>Free cancellation</strong> before{' '}
                            {formatLong(search.checkIn)}
                        </BenefitRow>
                    )}
                    {hotel.features.includes('noPrepay') && (
                        <BenefitRow>
                            <strong>No prepayment</strong> needed
                        </BenefitRow>
                    )}
                    {hotel.leftAtPrice !== null && (
                        <BenefitRow tone="danger">
                            <strong>
                                We have {hotel.leftAtPrice} left at this price
                            </strong>
                        </BenefitRow>
                    )}
                </div>
            </div>
            <SaveHeart hotel={hotel} className="absolute top-1 right-0 z-10" />
        </article>
    );
}

function SkeletonRows() {
    return (
        <div role="status" aria-label="Loading properties">
            {[0, 1, 2, 3].map((row) => (
                <div
                    key={row}
                    aria-hidden
                    className="flex animate-pulse gap-2 border-b border-st-border-soft px-2 py-3 motion-reduce:animate-none"
                >
                    <div className="h-44 w-[124px] shrink-0 rounded-st-sm bg-st-surface-alt" />
                    <div className="flex flex-1 flex-col gap-2">
                        <div className="h-5 w-3/4 rounded-st-sm bg-st-surface-alt" />
                        <div className="h-3 w-1/3 rounded-st-sm bg-st-surface-alt" />
                        <div className="h-6 w-2/3 rounded-st-sm bg-st-surface-alt" />
                        <div className="h-3 w-1/2 rounded-st-sm bg-st-surface-alt" />
                        <div className="mt-auto ml-auto h-7 w-1/2 rounded-st-sm bg-st-surface-alt" />
                        <div className="ml-auto h-3 w-2/3 rounded-st-sm bg-st-surface-alt" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function Message({
    icon,
    title,
    body,
    action,
    onAction,
}: {
    icon: React.ReactNode;
    title: string;
    body: string;
    action: string;
    onAction: () => void;
}) {
    return (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            {icon}
            <h2 className="st-headline3">{title}</h2>
            <p className="st-body2 text-st-text-alt">{body}</p>
            <Button variant="outline" onClick={onAction}>
                {action}
            </Button>
        </div>
    );
}

export function ResultsScreen({ simulateError }: { simulateError: boolean }) {
    const {
        search,
        filters,
        setFilters,
        sort,
        loadedKey,
        setLoadedKey,
        catalogueStatus,
        reloadCatalogue,
    } = useStore();
    const destination = destinationById(search.destinationId);
    const inDestination = hotelsIn(search.destinationId);
    const hotels = sortHotels(applyFilters(inDestination, filters), sort);
    const key = [
        search.destinationId,
        search.checkIn,
        search.checkOut,
        search.rooms,
        search.adults,
        search.children,
    ].join('|');

    const [attempt, setAttempt] = useState(0);
    const [failedAttempt, setFailedAttempt] = useState<number | null>(null);
    const failed = failedAttempt === attempt;
    const loading =
        catalogueStatus === 'loading' || (!failed && loadedKey !== key);

    useEffect(() => {
        if (!loading) {
            return;
        }

        const timer = window.setTimeout(() => {
            // ?simulate=error fails the first load so the retry can be seen.
            if (simulateError && attempt === 0) {
                setFailedAttempt(attempt);
            } else {
                setLoadedKey(key);
            }
        }, LOAD_DELAY_MS);

        return () => window.clearTimeout(timer);
    }, [loading, simulateError, attempt, key, setLoadedKey]);

    const dragScroll = useDragScroll<HTMLUListElement>();
    const toggleFilter = (id: string) =>
        setFilters(
            filters.includes(id)
                ? filters.filter((filter) => filter !== id)
                : [...filters, id],
        );

    if (search.destinationId === '') {
        return (
            <Message
                icon={
                    <SearchIcon
                        className="size-8 text-st-text-alt"
                        aria-hidden
                    />
                }
                title="Where do you want to go?"
                body="Choose a destination to see places to stay."
                action="Go to Search"
                onAction={() => navigate('/')}
            />
        );
    }

    return (
        <div className="flex min-h-full flex-col bg-st-surface">
            <header className="st-on-brand bg-st-brand st-safe-top pb-8 text-st-on-dark">
                <div className="flex items-center justify-between px-1">
                    <IconButton
                        label="Go back"
                        onClick={() => goBack('/')}
                        className="hover:bg-st-action-hover"
                    >
                        <ArrowLeft className="size-6" aria-hidden />
                    </IconButton>
                    <div className="flex">
                        <IconButton
                            label="Go to Saved"
                            onClick={() => selectTab('saved')}
                            className="hover:bg-st-action-hover"
                        >
                            <Heart className="size-6" aria-hidden />
                        </IconButton>
                        <IconButton
                            label="Menu"
                            onClick={() =>
                                toast(
                                    "The menu isn't part of this prototype yet.",
                                )
                            }
                            className="hover:bg-st-action-hover"
                        >
                            <Menu className="size-6" aria-hidden />
                        </IconButton>
                    </div>
                </div>
            </header>

            <SearchFrame className="relative z-1 mx-2 -mt-7">
                <button
                    type="button"
                    aria-label={`Change search: ${destination.name}, ${formatShort(search.checkIn)} to ${formatShort(search.checkOut)}, ${occupancyLabel(search)}`}
                    onClick={() => navigate('/')}
                    className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-st-sm bg-st-surface px-3 py-1 text-left st-transition hover:bg-st-surface-alt"
                >
                    <SearchIcon className="size-5 shrink-0" aria-hidden />
                    <span className="min-w-0 flex-1">
                        <span className="block truncate st-strong2">
                            {destination.name}
                        </span>
                        <span className="block truncate st-small1 text-st-text-alt">
                            {formatShort(search.checkIn)} -{' '}
                            {formatShort(search.checkOut)} ·{' '}
                            {occupancyLabel(search)}
                        </span>
                    </span>
                </button>
            </SearchFrame>

            <div className="sticky top-[env(safe-area-inset-top)] z-10 mt-2 grid grid-cols-3 border-b border-st-border-soft bg-st-surface">
                <Button
                    variant="text"
                    aria-haspopup="dialog"
                    className="min-h-11"
                    onClick={() => openSheet('sort')}
                >
                    <ArrowUpDown className="size-4" aria-hidden />
                    Sort
                </Button>
                <Button
                    variant="text"
                    aria-haspopup="dialog"
                    className="min-h-11"
                    onClick={() => openSheet('filter')}
                >
                    <SlidersHorizontal className="size-4" aria-hidden />
                    Filter
                    {filters.length > 0 && (
                        <span aria-label={`${filters.length} selected`}>
                            ({filters.length})
                        </span>
                    )}
                </Button>
                <Button
                    variant="text"
                    aria-haspopup="dialog"
                    className="min-h-11"
                    onClick={() => openSheet('map')}
                >
                    <MapIcon className="size-4" aria-hidden />
                    Map
                </Button>
            </div>

            <ul
                ref={dragScroll}
                aria-label="Quick filters"
                className="st-no-scrollbar flex shrink-0 gap-2 overflow-x-auto border-b border-st-border-soft px-2 py-2"
            >
                {RESULT_CHIP_IDS.map((id) => {
                    const option = FILTERS.find((filter) => filter.id === id);

                    if (!option) {
                        return null;
                    }

                    const selected = filters.includes(id);

                    return (
                        <li key={id} className="shrink-0">
                            <button
                                type="button"
                                aria-pressed={selected}
                                onClick={() => toggleFilter(id)}
                                className={clsx(
                                    'st-touch min-h-9 cursor-pointer rounded-st-full border px-3 st-small2 whitespace-nowrap st-transition',
                                    selected
                                        ? 'border-st-link bg-st-action-tint text-st-link'
                                        : 'border-st-border hover:bg-st-surface-alt',
                                )}
                            >
                                {option.label} (
                                {filterCount(inDestination, filters, option)})
                            </button>
                        </li>
                    );
                })}
            </ul>

            <main className="flex-1">
                <h1 className="sr-only">Stays in {destination.name}</h1>
                {loading && <SkeletonRows />}
                {catalogueStatus === 'error' && (
                    <Message
                        icon={
                            <WifiOff
                                className="size-8 text-st-danger"
                                aria-hidden
                            />
                        }
                        title="We couldn't load these properties"
                        body="Check your connection, then try again. Your search is still saved."
                        action="Try again"
                        onAction={reloadCatalogue}
                    />
                )}
                {catalogueStatus === 'ready' && failed && (
                    <Message
                        icon={
                            <WifiOff
                                className="size-8 text-st-danger"
                                aria-hidden
                            />
                        }
                        title="We couldn't load these properties"
                        body="Check your connection, then try again. Your search is still saved."
                        action="Try again"
                        onAction={() => setAttempt(attempt + 1)}
                    />
                )}
                {!loading &&
                    !failed &&
                    catalogueStatus === 'ready' &&
                    hotels.length === 0 && (
                        <Message
                            icon={
                                <SearchX
                                    className="size-8 text-st-text-alt"
                                    aria-hidden
                                />
                            }
                            title="No properties match your filters"
                            body="Remove a filter to see more places to stay."
                            action="Clear all filters"
                            onAction={() => setFilters([])}
                        />
                    )}
                {!loading && !failed && hotels.length > 0 && (
                    <>
                        <p className="sr-only" role="status">
                            {plural(hotels.length, 'property', 'properties')}{' '}
                            found
                        </p>
                        {hotels.map((hotel) => (
                            <ResultRow key={hotel.id} hotel={hotel} />
                        ))}
                    </>
                )}
            </main>
        </div>
    );
}
