import { BedDouble, Image, User } from 'lucide-react';
import { useState } from 'react';
import { useDragScroll } from '../components/drag-scroll';
import { HotelPhoto } from '../components/hotel-photo';
import {
    BenefitRow,
    Button,
    DealBadge,
    IconButton,
    PriceStack,
    TopBar,
} from '../components/ui';
import { hotelById, priceFor, RATES } from '../data';
import type { Hotel, Rate, Room } from '../data';
import { formatLong } from '../format';
import { navigate } from '../router';
import { useStore } from '../store';
import { MissingHotel } from './property';

function RateCard({
    hotel,
    room,
    rate,
    selected,
    onSelect,
}: {
    hotel: Hotel;
    room: Room;
    rate: Rate;
    selected: boolean;
    onSelect: () => void;
}) {
    const { search, user, startAuth } = useStore();
    const price = priceFor(hotel, search, room.factor * rate.factor);
    const reviewPath = `/review/${hotel.id}/${room.id}/${rate.id}`;

    return (
        <li className="flex w-[min(17.5rem,85%)] shrink-0 snap-start flex-col gap-2 rounded-st-md border border-st-border-room bg-st-surface p-3">
            <label className="flex min-h-11 cursor-pointer items-center justify-between gap-2">
                <span className="st-strong1">{rate.name}</span>
                <input
                    type="radio"
                    name={`rate-${room.id}`}
                    checked={selected}
                    onChange={onSelect}
                    className="size-5 shrink-0 accent-st-action"
                />
            </label>
            <div className="flex items-center gap-1 st-small1 text-st-text-alt">
                Price for:
                <span
                    role="img"
                    aria-label={`${room.sleeps} guests`}
                    className="flex text-st-text"
                >
                    {Array.from({ length: room.sleeps }, (_, index) => (
                        <User key={index} className="size-3.5" aria-hidden />
                    ))}
                </span>
            </div>
            <div className="flex flex-col gap-0.5">
                {rate.cancellable ? (
                    <BenefitRow>
                        <strong>Free cancellation</strong> before{' '}
                        {formatLong(search.checkIn)}
                    </BenefitRow>
                ) : (
                    <p className="st-small1 text-st-text-alt">
                        Non-refundable. You pay less, but can't cancel for free.
                    </p>
                )}
                {rate.breakfast && (
                    <BenefitRow>
                        <strong>Breakfast</strong> included
                    </BenefitRow>
                )}
                {rate.noPrepay && (
                    <BenefitRow>
                        <strong>No prepayment</strong> needed
                    </BenefitRow>
                )}
            </div>
            {hotel.deal && (
                <div>
                    <DealBadge>{hotel.deal}</DealBadge>
                </div>
            )}
            <div className="mt-auto flex flex-col gap-2">
                <PriceStack price={price} />
                <Button
                    className="w-full"
                    aria-label={`Reserve ${room.name}, ${rate.name}`}
                    onClick={() => {
                        if (user) {
                            navigate(reviewPath);
                        } else {
                            startAuth({ type: 'reserve', to: reviewPath });
                        }
                    }}
                >
                    Reserve
                </Button>
            </div>
        </li>
    );
}

function RoomCard({ hotel, room }: { hotel: Hotel; room: Room }) {
    const [rateId, setRateId] = useState(RATES[0].id);
    const dragScroll = useDragScroll<HTMLUListElement>();
    const [showDetails, setShowDetails] = useState(false);

    return (
        <article className="flex flex-col gap-2 rounded-st-md border border-st-border-room bg-st-surface p-3">
            <div className="flex items-start justify-between gap-2">
                <h2 className="min-w-0 st-headline3">
                    <button
                        type="button"
                        aria-expanded={showDetails}
                        onClick={() => setShowDetails(!showDetails)}
                        className="-my-2 min-h-11 cursor-pointer py-2 text-left text-st-link underline"
                    >
                        {room.name}
                    </button>
                </h2>
                <IconButton
                    label={`${showDetails ? 'Hide' : 'Show'} photo of ${room.name}`}
                    aria-expanded={showDetails}
                    onClick={() => setShowDetails(!showDetails)}
                    className="-mt-2 -mr-2 text-st-link hover:bg-st-action-tint"
                >
                    <Image className="size-5" aria-hidden />
                </IconButton>
            </div>
            {showDetails && (
                <div className="flex flex-col gap-2">
                    <HotelPhoto
                        hotel={hotel}
                        kind="room"
                        index={hotel.rooms.indexOf(room)}
                        alt={room.name}
                        className="aspect-[4/3] w-full rounded-st-sm"
                    />
                    <p className="st-body2">{room.description}</p>
                </div>
            )}
            <p className="flex flex-wrap items-center gap-1 st-body2">
                <span>{room.bed}</span>
                <span className="flex gap-0.5">
                    {Array.from({ length: room.beds }, (_, index) => (
                        <BedDouble key={index} className="size-4" aria-hidden />
                    ))}
                </span>
            </p>
            <ul className="flex flex-wrap gap-1">
                {[
                    ...(room.size > 0 ? [`${room.size} m²`] : []),
                    ...room.chips,
                ].map((chip) => (
                    <li
                        key={chip}
                        className="rounded-st-sm border border-st-border-soft px-1.5 py-0.5 st-small1"
                    >
                        {chip}
                    </li>
                ))}
            </ul>
            <ul
                ref={dragScroll}
                aria-label={`Rates for ${room.name}`}
                className="-mx-3 mt-1 st-no-scrollbar flex snap-x scroll-px-3 gap-2 overflow-x-auto px-3 pb-1"
            >
                {RATES.map((rate) => (
                    <RateCard
                        key={rate.id}
                        hotel={hotel}
                        room={room}
                        rate={rate}
                        selected={rateId === rate.id}
                        onSelect={() => setRateId(rate.id)}
                    />
                ))}
            </ul>
        </article>
    );
}

export function RoomsScreen({ hotelId }: { hotelId?: string }) {
    const hotel = hotelById(hotelId);

    if (!hotel) {
        return <MissingHotel />;
    }

    return (
        <div className="min-h-full bg-st-surface-alt">
            <TopBar title={hotel.name} fallback={`/property/${hotel.id}`} />
            <main className="flex flex-col gap-3 px-2.5 py-3">
                <h2 className="sr-only">Choose a room</h2>
                {hotel.rooms.map((room) => (
                    <RoomCard key={room.id} hotel={hotel} room={room} />
                ))}
            </main>
        </div>
    );
}
