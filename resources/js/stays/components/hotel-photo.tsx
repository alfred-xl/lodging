import clsx from 'clsx';
import type { Hotel, HotelImage } from '../data';
import { Photo } from './photo';

// Uses the property's photos when it has them, otherwise an illustration.
export function HotelPhoto({
    hotel,
    kind,
    index = 0,
    alt = '',
    className,
}: {
    hotel: Hotel;
    kind?: HotelImage['kind'];
    index?: number;
    alt?: string;
    className?: string;
}) {
    const pool = kind
        ? hotel.images.filter((image) => image.kind === kind)
        : hotel.images;
    const image = pool.length > 0 ? pool[index % pool.length] : hotel.images[0];

    if (image) {
        return (
            <img
                src={image.url}
                alt={alt}
                loading="lazy"
                draggable={false}
                className={clsx('bg-st-surface-alt object-cover', className)}
            />
        );
    }

    return (
        <Photo
            seed={`${hotel.id}-${kind ?? 'any'}-${index}`}
            scene={kind === 'room' ? 'room' : hotel.photos[0]}
            alt={alt || undefined}
            className={className}
        />
    );
}
