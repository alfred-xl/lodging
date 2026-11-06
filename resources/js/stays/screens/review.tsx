import { Info } from 'lucide-react';
import { useRef, useState } from 'react';
import { EmptyState, SignInButtons } from '../components/root-panels';
import { TextField } from '../components/text-field';
import { Button, ReviewScore, TopBar } from '../components/ui';
import { hotelById, priceFor, RATES } from '../data';
import { formatWeekday, money, nightsBetween, plural } from '../format';
import { navigate } from '../router';
import { useStore } from '../store';
import { MissingHotel } from './property';
import { validateEmail } from '../validation';
import { occupancyLabel } from './results';

type Field = 'name' | 'email';

function validate(field: Field, value: string): string | null {
    if (field === 'email') {
        return validateEmail(value);
    }

    return value.trim().split(/\s+/).length >= 2
        ? null
        : 'Enter a first and last name, such as Sam Lee.';
}

export function ReviewScreen({
    hotelId,
    roomId,
    rateId,
}: {
    hotelId?: string;
    roomId?: string;
    rateId?: string;
}) {
    const { search, user, addBooking } = useStore();
    const [name, setName] = useState(
        user ? `${user.firstName} ${user.lastName}` : '',
    );
    const [email, setEmail] = useState(user?.email ?? '');
    const [errors, setErrors] = useState<Record<Field, string | null>>({
        name: null,
        email: null,
    });
    const nameInput = useRef<HTMLInputElement>(null);
    const emailInput = useRef<HTMLInputElement>(null);

    const hotel = hotelById(hotelId);
    const room = hotel?.rooms.find((candidate) => candidate.id === roomId);
    const rate = RATES.find((candidate) => candidate.id === rateId);

    if (!hotel || !room || !rate) {
        return <MissingHotel />;
    }

    if (!user) {
        return (
            <div className="min-h-full bg-st-surface">
                <TopBar
                    title="Review and details"
                    fallback={`/rooms/${hotel.id}`}
                />
                <EmptyState
                    icon={
                        <Info className="size-8 text-st-text-alt" aria-hidden />
                    }
                    title="Sign in to finish your booking"
                    body="You need an account to reserve a room."
                >
                    <SignInButtons />
                </EmptyState>
            </div>
        );
    }

    const price = priceFor(hotel, search, room.factor * rate.factor);
    const nights = nightsBetween(search.checkIn, search.checkOut);

    const submit = () => {
        const nextErrors = {
            name: validate('name', name),
            email: validate('email', email),
        };

        setErrors(nextErrors);

        if (nextErrors.name) {
            nameInput.current?.focus();

            return;
        }

        if (nextErrors.email) {
            emailInput.current?.focus();

            return;
        }

        const reference = `LD-${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;

        addBooking({
            id: reference,
            reference,
            status: 'active',
            hotelId: hotel.id,
            roomId: room.id,
            rateId: rate.id,
            search,
        });
        navigate(`/confirmation/${reference}`, { replace: true });
    };

    return (
        <div className="flex min-h-full flex-col bg-st-surface-alt">
            <TopBar
                title="Review and details"
                fallback={`/rooms/${hotel.id}`}
            />
            <main className="flex flex-col gap-3 p-2.5">
                <section className="flex flex-col gap-1 rounded-st-md border border-st-border-soft bg-st-surface p-4">
                    <h2 className="st-strong1">{hotel.name}</h2>
                    <p className="st-small1 text-st-text-alt">
                        {hotel.address}
                    </p>
                    <ReviewScore
                        score={hotel.score}
                        count={hotel.reviewCount}
                    />
                    <hr className="my-2 border-st-border-soft" />
                    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 st-body2">
                        <dt className="text-st-text-alt">Check-in</dt>
                        <dd>{formatWeekday(search.checkIn)}</dd>
                        <dt className="text-st-text-alt">Check-out</dt>
                        <dd>{formatWeekday(search.checkOut)}</dd>
                        <dt className="text-st-text-alt">Stay</dt>
                        <dd>{plural(nights, 'night')}</dd>
                        <dt className="text-st-text-alt">Guests</dt>
                        <dd>{occupancyLabel(search)}</dd>
                        <dt className="text-st-text-alt">Room</dt>
                        <dd>{room.name}</dd>
                        <dt className="text-st-text-alt">Rate</dt>
                        <dd>{rate.name}</dd>
                    </dl>
                </section>

                <section className="rounded-st-md border border-st-border-soft bg-st-surface p-4">
                    <h2 className="pb-2 st-strong1">Price breakdown</h2>
                    <dl className="flex flex-col gap-1 st-body2">
                        <div className="flex justify-between gap-3">
                            <dt>
                                {plural(search.rooms, 'room')} ×{' '}
                                {plural(nights, 'night')}
                            </dt>
                            <dd>{money(price.current)}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                            <dt>Taxes and charges</dt>
                            <dd>{money(price.taxes)}</dd>
                        </div>
                        <div className="mt-1 flex justify-between gap-3 border-t border-st-border-soft pt-2 st-strong1">
                            <dt>Total</dt>
                            <dd>{money(price.current + price.taxes)}</dd>
                        </div>
                    </dl>
                </section>

                <form
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit();
                    }}
                    className="flex flex-col gap-4 rounded-st-md border border-st-border-soft bg-st-surface p-4"
                >
                    <h2 className="st-strong1">Your details</h2>
                    <p className="flex items-start gap-1 rounded-st-sm bg-st-action-tint p-2 st-small1">
                        <Info
                            className="mt-0.5 size-3.5 shrink-0"
                            aria-hidden
                        />
                        This is a prototype, so nothing is sent or stored. Use
                        made-up details.
                    </p>
                    <TextField
                        id="guest-name"
                        label="Full name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        error={errors.name}
                        inputRef={nameInput}
                        onChange={(value) => {
                            setName(value);

                            if (errors.name) {
                                setErrors({
                                    ...errors,
                                    name: validate('name', value),
                                });
                            }
                        }}
                    />
                    <TextField
                        id="guest-email"
                        label="Email address"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        error={errors.email}
                        inputRef={emailInput}
                        onChange={(value) => {
                            setEmail(value);

                            if (errors.email) {
                                setErrors({
                                    ...errors,
                                    email: validate('email', value),
                                });
                            }
                        }}
                    />
                    <Button type="submit" className="w-full">
                        Complete mock booking
                    </Button>
                </form>
            </main>
        </div>
    );
}
