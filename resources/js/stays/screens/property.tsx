import {
    Car,
    ChevronLeft,
    ChevronRight,
    Coffee,
    Dumbbell,
    PawPrint,
    Sparkles,
    Waves,
    Wifi,
    Users,
    Wine,
    BadgeCheck,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useDragScroll } from '../components/drag-scroll';
import { MockMap } from '../components/mock-map';
import { Photo } from '../components/photo';
import {
    Button,
    DealBadge,
    IconButton,
    ReviewScore,
    SaveHeart,
    StarRating,
    stayLabel,
    TopBar,
} from '../components/ui';
import { featureLabel, hotelById, priceFor } from '../data';
import type { Feature, Hotel } from '../data';
import { money, plural } from '../format';
import { goHome, navigate, openSheet } from '../router';
import { useStore } from '../store';

const FEATURE_ICONS: Record<Feature, LucideIcon> = {
    breakfast: Coffee,
    cancel: BadgeCheck,
    noPrepay: Wallet,
    family: Users,
    wifi: Wifi,
    pool: Waves,
    parking: Car,
    spa: Sparkles,
    gym: Dumbbell,
    bar: Wine,
    pets: PawPrint,
};

function Gallery({ hotel }: { hotel: Hotel }) {
    const scroller = useRef<HTMLDivElement>(null);
    const [index, setIndex] = useState(0);
    const dragScroll = useDragScroll<HTMLDivElement>();
    const slides =
        hotel.images.length > 0 ? hotel.images.length : hotel.photos.length;

    const goTo = (next: number) =>
        scroller.current?.scrollTo({
            left: next * scroller.current.clientWidth,
        });

    return (
        <div className="relative">
            <div
                ref={(element) => {
                    scroller.current = element;

                    return dragScroll(element);
                }}
                role="group"
                aria-label={`Photos of ${hotel.name}`}
                onScroll={(event) =>
                    setIndex(
                        Math.round(
                            event.currentTarget.scrollLeft /
                                event.currentTarget.clientWidth,
                        ),
                    )
                }
                className="st-no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
            >
                {hotel.images.length > 0
                    ? hotel.images.map((image, position) => (
                          <img
                              key={position}
                              src={image.url}
                              alt={`${image.alt}, photo ${position + 1} of ${slides}`}
                              loading={position === 0 ? 'eager' : 'lazy'}
                              draggable={false}
                              className="aspect-[4/3] w-full shrink-0 snap-start bg-st-surface-alt object-cover"
                          />
                      ))
                    : hotel.photos.map((scene, position) => (
                          <Photo
                              key={position}
                              seed={`${hotel.id}-${position}`}
                              scene={scene}
                              alt={`${hotel.name}, photo ${position + 1} of ${slides}`}
                              className="aspect-[4/3] w-full shrink-0 snap-start"
                          />
                      ))}
            </div>
            {index > 0 && (
                <IconButton
                    label="Previous photo"
                    onClick={() => goTo(index - 1)}
                    className="absolute top-1/2 left-1 -translate-y-1/2"
                >
                    <span className="flex size-8 items-center justify-center rounded-st-full bg-st-surface shadow-st-100">
                        <ChevronLeft className="size-5" aria-hidden />
                    </span>
                </IconButton>
            )}
            {index < slides - 1 && (
                <IconButton
                    label="Next photo"
                    onClick={() => goTo(index + 1)}
                    className="absolute top-1/2 right-1 -translate-y-1/2"
                >
                    <span className="flex size-8 items-center justify-center rounded-st-full bg-st-surface shadow-st-100">
                        <ChevronRight className="size-5" aria-hidden />
                    </span>
                </IconButton>
            )}
            <span className="absolute right-2 bottom-2 rounded-st-sm bg-st-overlay px-2 py-0.5 st-small2 text-st-on-dark">
                {index + 1}/{slides}
            </span>
        </div>
    );
}

export function PropertyScreen({ hotelId }: { hotelId?: string }) {
    const { search } = useStore();
    const hotel = hotelById(hotelId);

    if (!hotel) {
        return <MissingHotel />;
    }

    const price = priceFor(hotel, search);
    const showOnMap = () => openSheet('map', { hotel: hotel.id });

    return (
        <div className="flex min-h-full flex-col bg-st-surface">
            <TopBar
                title={hotel.name}
                fallback="/results"
                trailing={<SaveHeart hotel={hotel} tone="brand" />}
            />
            <Gallery hotel={hotel} />

            <main className="flex flex-col gap-6 px-4 pt-4 pb-6">
                <section className="flex flex-col gap-1">
                    <StarRating
                        stars={hotel.stars}
                        preferred={hotel.preferred}
                    />
                    <h2 className="st-headline2">{hotel.name}</h2>
                    <p className="st-body2 text-st-text-alt">{hotel.address}</p>
                    <button
                        type="button"
                        onClick={showOnMap}
                        className="min-h-11 cursor-pointer self-start st-emphasized2 text-st-link underline"
                    >
                        Show on map
                    </button>
                    {hotel.reviewCount > 0 && (
                        <ReviewScore
                            size="page"
                            score={hotel.score}
                            count={hotel.reviewCount}
                        />
                    )}
                </section>

                <section
                    aria-label="Price"
                    className="rounded-st-md bg-st-surface p-4 shadow-st-100"
                >
                    <p className="st-strong1">{hotel.name}</p>
                    <StarRating
                        stars={hotel.stars}
                        preferred={hotel.preferred}
                    />
                    <p className="mt-1 st-small1 text-st-text-alt">
                        {hotel.address}
                    </p>
                    <hr className="my-3 border-st-border-soft" />
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {hotel.deal && <DealBadge>{hotel.deal}</DealBadge>}
                        <span className="ml-auto flex items-baseline gap-2">
                            {price.original !== null && (
                                <span className="st-small1 text-st-danger">
                                    <span className="sr-only">
                                        Original price{' '}
                                    </span>
                                    <s>{money(price.original)}</s>
                                </span>
                            )}
                            <span className="st-price">
                                <span className="sr-only">Current price </span>
                                {money(price.current)}
                            </span>
                        </span>
                    </div>
                    <p className="mt-1 text-right st-small1 text-st-text-alt">
                        {stayLabel(price)}, {plural(search.adults, 'adult')} · +
                        {money(price.taxes)} taxes and charges
                    </p>
                </section>

                <section aria-label="Highlights">
                    <ul className="grid grid-cols-2 gap-2">
                        {hotel.features.slice(0, 4).map((feature) => {
                            const Icon = FEATURE_ICONS[feature];

                            return (
                                <li
                                    key={feature}
                                    className="flex items-center gap-2 rounded-st-md border border-st-border-soft p-3 st-body2"
                                >
                                    <Icon
                                        className="size-5 shrink-0"
                                        aria-hidden
                                    />
                                    {featureLabel(feature)}
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section>
                    <h2 className="pb-2 st-headline3">About</h2>
                    <p className="st-body2">{hotel.about}</p>
                </section>

                {hotel.features.length > 0 && (
                    <section>
                        <h2 className="pb-2 st-headline3">Facilities</h2>
                        <ul className="flex flex-col gap-2">
                            {hotel.features.map((feature) => {
                                const Icon = FEATURE_ICONS[feature];

                                return (
                                    <li
                                        key={feature}
                                        className="flex items-center gap-2 st-body2"
                                    >
                                        <Icon
                                            className="size-4 shrink-0"
                                            aria-hidden
                                        />
                                        {featureLabel(feature)}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                )}

                {hotel.reviewCount > 0 && (
                    <section>
                        <h2 className="pb-2 st-headline3">Reviews</h2>
                        <ReviewScore
                            score={hotel.score}
                            count={hotel.reviewCount}
                        />
                        <ul className="mt-3 flex flex-col gap-2">
                            {hotel.subscores.map(({ label, score }) => (
                                <li key={label}>
                                    <div className="flex justify-between gap-3 st-body2">
                                        <span>{label}</span>
                                        <strong>{score.toFixed(1)}</strong>
                                    </div>
                                    <div
                                        aria-hidden
                                        className="mt-1 h-2 overflow-hidden rounded-st-full bg-st-surface-alt"
                                    >
                                        <div
                                            style={{ width: `${score * 10}%` }}
                                            className="h-full rounded-st-full bg-st-brand"
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <ul className="mt-4 flex flex-col gap-3">
                            {hotel.quotes.map((quote) => (
                                <li
                                    key={quote.author}
                                    className="rounded-st-md border border-st-border-soft p-3"
                                >
                                    <blockquote className="st-body2">
                                        “{quote.text}”
                                    </blockquote>
                                    <p className="mt-2 st-small1 text-st-text-alt">
                                        {quote.author}, {quote.country}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section>
                    <h2 className="pb-2 st-headline3">Location</h2>
                    <p className="pb-3 st-body2">{hotel.address}</p>
                    <button
                        type="button"
                        aria-label={`Show ${hotel.name} on map`}
                        onClick={showOnMap}
                        className="block w-full cursor-pointer overflow-hidden rounded-st-md"
                    >
                        <MockMap className="relative h-36" />
                    </button>
                </section>
            </main>

            <div className="sticky bottom-0 mt-auto border-t border-st-border-soft bg-st-surface px-4 pt-3 st-safe-bottom">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/rooms/${hotel.id}`)}
                >
                    Select room
                </Button>
            </div>
        </div>
    );
}

export function MissingHotel() {
    return (
        <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <h1 className="st-headline3">We can't find that property</h1>
            <p className="st-body2 text-st-text-alt">
                Go back to Home and search again to see what's available.
            </p>
            <Button onClick={goHome}>Go to Home</Button>
        </div>
    );
}
