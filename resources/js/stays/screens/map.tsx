import { List } from 'lucide-react';
import { useState } from 'react';
import { MockMap } from '../components/mock-map';
import { Sheet } from '../components/sheet';
import { Button, ReviewScore } from '../components/ui';
import { applyFilters, hotelById, hotelsIn, priceFor } from '../data';
import { money } from '../format';
import { closeSheet, Link } from '../router';
import { useStore } from '../store';

function MapBody({ hotelId }: { hotelId: string | null }) {
    const { search, filters } = useStore();
    const focused = hotelById(hotelId ?? undefined);
    const hotels = focused
        ? [focused]
        : applyFilters(hotelsIn(search.destinationId), filters);
    const [selectedId, setSelectedId] = useState<string | null>(
        focused?.id ?? null,
    );
    const selected = hotels.find((hotel) => hotel.id === selectedId);

    return (
        <div className="relative min-h-0 flex-1">
            <MockMap
                className="absolute inset-0"
                selectedId={selectedId}
                onSelect={(hotel) => setSelectedId(hotel.id)}
                pins={hotels.map((hotel) => ({
                    hotel,
                    price: priceFor(hotel, search).current,
                }))}
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-2 st-safe-bottom">
                {!focused && (
                    <Button
                        variant="primarySmall"
                        className="shadow-st-100"
                        onClick={closeSheet}
                    >
                        <List className="size-4" aria-hidden />
                        Show list
                    </Button>
                )}
                {selected && (
                    <Link
                        to={`/property/${selected.id}`}
                        className="flex w-full flex-col gap-1 rounded-st-md bg-st-surface p-3 shadow-st-200"
                    >
                        <span className="st-strong2">{selected.name}</span>
                        <ReviewScore
                            score={selected.score}
                            count={selected.reviewCount}
                        />
                        <span className="st-strong2">
                            {money(priceFor(selected, search).current)}
                        </span>
                    </Link>
                )}
            </div>
        </div>
    );
}

export function MapSheet({
    open,
    hotelId,
}: {
    open: boolean;
    hotelId: string | null;
}) {
    return (
        <Sheet open={open} title="Map">
            <MapBody hotelId={hotelId} />
        </Sheet>
    );
}
