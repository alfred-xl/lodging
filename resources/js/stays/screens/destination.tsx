import { MapPin, Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { Sheet } from '../components/sheet';
import { DESTINATIONS, hotelsIn } from '../data';
import { plural } from '../format';
import { closeSheet } from '../router';
import { useStore } from '../store';

function DestinationBody() {
    const { updateSearch, catalogueStatus } = useStore();
    const [query, setQuery] = useState('');
    const term = query.trim().toLowerCase();
    const matches = DESTINATIONS.filter((destination) =>
        `${destination.name} ${destination.country}`
            .toLowerCase()
            .includes(term),
    );

    return (
        <>
            <div className="p-3">
                <label className="flex min-h-12 items-center gap-2 rounded-st-sm border-2 border-st-link px-3">
                    <SearchIcon
                        className="size-5 shrink-0 text-st-text-alt"
                        aria-hidden
                    />
                    <span className="sr-only">Where are you going?</span>
                    <input
                        autoFocus
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Where are you going?"
                        className="min-w-0 flex-1 bg-transparent st-body1 shadow-none outline-none placeholder:text-st-text-alt"
                    />
                </label>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
                {catalogueStatus !== 'ready' ? (
                    <p role="status" className="p-4 st-body2 text-st-text-alt">
                        {catalogueStatus === 'loading'
                            ? 'Loading destinations…'
                            : "We couldn't load destinations. Check your connection and try again."}
                    </p>
                ) : matches.length === 0 ? (
                    <p className="p-4 st-body2 text-st-text-alt">
                        No destinations match “{query}”. Check the spelling, or
                        try a city or country name.
                    </p>
                ) : (
                    <ul>
                        {matches.map((destination) => (
                            <li key={destination.id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        updateSearch({
                                            destinationId: destination.id,
                                        });
                                        closeSheet();
                                    }}
                                    className="flex min-h-14 w-full cursor-pointer items-center gap-3 border-b border-st-border-soft px-4 py-2 text-left st-transition hover:bg-st-surface-alt"
                                >
                                    <MapPin
                                        className="size-5 shrink-0"
                                        aria-hidden
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="block st-strong2">
                                            {destination.name}
                                        </span>
                                        <span className="block st-small1 text-st-text-alt">
                                            {destination.country} ·{' '}
                                            {plural(
                                                hotelsIn(destination.id).length,
                                                'property',
                                                'properties',
                                            )}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

export function DestinationSheet({ open }: { open: boolean }) {
    return (
        <Sheet open={open} title="Enter your destination">
            <DestinationBody />
        </Sheet>
    );
}
