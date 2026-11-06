import clsx from 'clsx';
import type { Hotel } from '../data';
import { money } from '../format';

// A drawn placeholder only. No map provider is involved.
export function MockMap({
    pins = [],
    selectedId,
    onSelect,
    className,
}: {
    pins?: { hotel: Hotel; price: number }[];
    selectedId?: string | null;
    onSelect?: (hotel: Hotel) => void;
    className?: string;
}) {
    return (
        <div className={clsx('overflow-hidden bg-st-map-land', className)}>
            <div aria-hidden>
                <div className="absolute -right-10 -bottom-16 size-56 rounded-st-full bg-st-map-water" />
                <div className="absolute top-6 -left-8 h-28 w-40 rounded-st-lg bg-st-map-park" />
                <div className="absolute top-[35%] left-0 h-2 w-full -rotate-6 bg-st-map-road" />
                <div className="absolute top-[68%] left-0 h-1.5 w-full rotate-3 bg-st-map-road" />
                <div className="absolute top-0 left-[28%] h-full w-1.5 rotate-6 bg-st-map-road" />
                <div className="absolute top-0 left-[66%] h-full w-2 -rotate-3 bg-st-map-road" />
            </div>
            {pins.map(({ hotel, price }) => {
                const selected = hotel.id === selectedId;

                return (
                    <button
                        key={hotel.id}
                        type="button"
                        aria-label={`${hotel.name}, ${money(price)}`}
                        aria-pressed={selected}
                        onClick={() => onSelect?.(hotel)}
                        style={{
                            left: `${hotel.map.x}%`,
                            top: `${hotel.map.y}%`,
                        }}
                        className="absolute flex min-h-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center"
                    >
                        <span
                            className={clsx(
                                'rounded-st-sm px-1.5 py-0.5 st-small2 shadow-st-100 st-transition',
                                selected
                                    ? 'bg-st-action text-st-on-dark'
                                    : 'bg-st-brand text-st-on-dark',
                            )}
                        >
                            {money(price)}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
