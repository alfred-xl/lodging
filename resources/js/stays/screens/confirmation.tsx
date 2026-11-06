import { CircleCheck } from 'lucide-react';
import { Button } from '../components/ui';
import { hotelById, priceFor, RATES } from '../data';
import { formatWeekday, money, nightsBetween, plural } from '../format';
import { goHome } from '../router';
import { useStore } from '../store';
import { MissingHotel } from './property';
import { occupancyLabel } from './results';

export function ConfirmationScreen({ reference }: { reference?: string }) {
    const { bookings } = useStore();
    const booking = bookings.find((item) => item.reference === reference);
    const hotel = hotelById(booking?.hotelId);
    const room = hotel?.rooms.find((item) => item.id === booking?.roomId);
    const rate = RATES.find((item) => item.id === booking?.rateId);

    if (!booking || !hotel || !room || !rate) {
        return <MissingHotel />;
    }

    const { search } = booking;
    const price = priceFor(hotel, search, room.factor * rate.factor);

    return (
        <div className="flex min-h-full flex-col bg-st-surface st-safe-top">
            <main className="flex flex-1 flex-col gap-4 px-4 pt-8 pb-6">
                <div
                    role="status"
                    className="flex flex-col items-center gap-2 rounded-st-md bg-st-success-tint p-4 text-center"
                >
                    <CircleCheck
                        className="size-10 text-st-success"
                        aria-hidden
                    />
                    <h1 className="st-headline2">
                        Your mock booking is complete
                    </h1>
                    <p className="st-body2">
                        Reference number <strong>{booking.reference}</strong>
                    </p>
                    <p className="st-small1 text-st-text-alt">
                        This is a prototype, so no room was reserved and no
                        email was sent.
                    </p>
                </div>

                <section className="rounded-st-md border border-st-border-soft p-4">
                    <h2 className="pb-2 st-strong1">{hotel.name}</h2>
                    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 st-body2">
                        <dt className="text-st-text-alt">Check-in</dt>
                        <dd>{formatWeekday(search.checkIn)}</dd>
                        <dt className="text-st-text-alt">Check-out</dt>
                        <dd>{formatWeekday(search.checkOut)}</dd>
                        <dt className="text-st-text-alt">Stay</dt>
                        <dd>
                            {plural(
                                nightsBetween(search.checkIn, search.checkOut),
                                'night',
                            )}
                        </dd>
                        <dt className="text-st-text-alt">Guests</dt>
                        <dd>{occupancyLabel(search)}</dd>
                        <dt className="text-st-text-alt">Room</dt>
                        <dd>{room.name}</dd>
                        <dt className="text-st-text-alt">Total</dt>
                        <dd className="font-bold">
                            {money(price.current + price.taxes)}
                        </dd>
                    </dl>
                </section>

                <Button className="mt-auto w-full" onClick={goHome}>
                    Back to Home
                </Button>
            </main>
        </div>
    );
}
