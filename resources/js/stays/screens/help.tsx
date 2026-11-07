import clsx from 'clsx';
import {
    BedDouble,
    Car,
    CarTaxiFront,
    ChevronDown,
    ChevronRight,
    CircleAlert,
    FerrisWheel,
    Plane,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useDragScroll } from '../components/drag-scroll';
import { HotelPhoto } from '../components/hotel-photo';
import { Button, TopBar } from '../components/ui';
import { destinationById, hotelById } from '../data';
import { formatWeekday } from '../format';
import { Link, navigate, selectTab } from '../router';
import { useStore } from '../store';
import type { BookingStatus, MockBooking } from '../store';
import { APP_NAME } from '../theme';

type Faq = { question: string; answer: string };

type Topic = { id: string; title: string; faqs: Faq[] };

type Category = {
    id: string;
    label: string;
    icon: LucideIcon;
    topics: Topic[];
    // Set for services the prototype doesn't offer, whose topics have no answers.
    unavailable?: string;
};

const STAY_TOPICS: Topic[] = [
    {
        id: 'cancellations',
        title: 'Cancellations',
        faqs: [
            {
                question: 'Can I cancel my booking?',
                answer: 'Yes. Open the booking in Bookings and choose Cancel booking. Whether there is a fee depends on the policy you booked, which is shown on your booking.',
            },
            {
                question: 'How do I know if my booking is refundable?',
                answer: 'Your booking shows its cancellation policy. A non-refundable booking costs the full price if you cancel, change it or don’t show up.',
            },
            {
                question: 'When will I get my refund?',
                answer: 'Refunds go back to the card you paid with, usually within 5 to 10 working days of cancelling.',
            },
        ],
    },
    {
        id: 'payment',
        title: 'Payment',
        faqs: [
            {
                question: 'When will I be charged?',
                answer: 'It depends on the rate you chose. Pay-now rates are charged when you book. Pay-at-property rates are charged by the property, usually at check-in.',
            },
            {
                question: 'Why is there a pending charge on my card?',
                answer: 'Some properties check your card with a temporary hold. It disappears after a few days, depending on your bank.',
            },
        ],
    },
    {
        id: 'booking-details',
        title: 'Booking details',
        faqs: [
            {
                question: 'Where can I find my confirmation?',
                answer: 'Open the booking in Bookings and choose Save your confirmation. Your booking reference is shown there too.',
            },
            {
                question: 'Can I change my dates?',
                answer: 'Message the property from your booking. Changes depend on availability and your booking’s policy.',
            },
        ],
    },
    {
        id: 'communications',
        title: 'Communications',
        faqs: [
            {
                question: 'How do I contact the property?',
                answer: 'Open the booking and choose Message property, or use Other methods to call them.',
            },
            {
                question: 'I didn’t get a confirmation email',
                answer: 'Check your spam folder and that the email address in Personal details is right. Your booking is always in Bookings.',
            },
        ],
    },
    {
        id: 'room-types',
        title: 'Room types',
        faqs: [
            {
                question:
                    'What’s the difference between a double and a twin room?',
                answer: 'A double room has one bed for two people. A twin room has two single beds.',
            },
            {
                question: 'What does “shared bathroom” mean?',
                answer: 'The bathroom is outside your room and other guests use it too.',
            },
        ],
    },
    {
        id: 'pricing',
        title: 'Pricing',
        faqs: [
            {
                question: 'Are taxes included in the price?',
                answer: 'Prices show taxes and charges separately while you search. The total on your booking includes them.',
            },
            {
                question: 'Why did the price change?',
                answer: 'Prices change with availability and dates. The price you booked at is the one you pay.',
            },
        ],
    },
    {
        id: 'credit-cards',
        title: 'Credit cards',
        faqs: [
            {
                question: 'Is my card information safe?',
                answer: `${APP_NAME} only keeps your card’s type, last 4 digits and expiry date. The full number is never stored.`,
            },
            {
                question: 'Why was my card declined?',
                answer: 'Check the card number and expiry date, then contact your bank. Some banks block payments abroad until you confirm them.',
            },
        ],
    },
    {
        id: 'property-policies',
        title: 'Property policies',
        faqs: [
            {
                question: 'What are the check-in and check-out times?',
                answer: 'They’re shown on your booking. Contact the property if you’ll arrive outside them.',
            },
            {
                question: 'Are pets allowed?',
                answer: 'It depends on the property. Check its policies, or message it before you travel.',
            },
        ],
    },
    {
        id: 'extra-facilities',
        title: 'Extra facilities',
        faqs: [
            {
                question: 'How do I ask for a cot or an extra bed?',
                answer: 'Message the property from your booking. Extra beds depend on availability and may cost more.',
            },
            {
                question: 'Is parking available?',
                answer: 'Parking is listed in the property’s facilities. Some properties ask you to reserve a space.',
            },
        ],
    },
    {
        id: 'security-and-awareness',
        title: 'Security and awareness',
        faqs: [
            {
                question: 'How can I spot a fake message?',
                answer: `${APP_NAME} will never ask you to pay by bank transfer or to share card details by phone, email or chat. Don’t click links in messages like that.`,
            },
            {
                question: 'What if I shared my card details?',
                answer: 'Contact your bank straight away to block the card, then report the message to customer service.',
            },
        ],
    },
];

function placeholderTopics(titles: string[]): Topic[] {
    return titles.map((title) => ({
        id: title.toLowerCase().replace(/[^a-z]+/g, '-'),
        title,
        faqs: [],
    }));
}

const CATEGORIES: Category[] = [
    { id: 'stays', label: 'Stays', icon: BedDouble, topics: STAY_TOPICS },
    {
        id: 'flights',
        label: 'Flights',
        icon: Plane,
        unavailable: 'Flights',
        topics: placeholderTopics([
            'Booking',
            'Changes and cancellations',
            'Baggage',
            'Check-in',
            'Payment',
            'Seats',
        ]),
    },
    {
        id: 'car-rentals',
        label: 'Car rentals',
        icon: Car,
        unavailable: 'Car rentals',
        topics: placeholderTopics([
            'Booking',
            'Driver requirements',
            'Insurance',
            'Pick-up and drop-off',
            'Payment',
            'Fuel policy',
        ]),
    },
    {
        id: 'attractions',
        label: 'Attractions',
        icon: FerrisWheel,
        unavailable: 'Attractions',
        topics: placeholderTopics([
            'Booking',
            'Tickets',
            'Cancellations',
            'Payment',
        ]),
    },
    {
        id: 'airport-taxis',
        label: 'Airport taxis',
        icon: CarTaxiFront,
        unavailable: 'Airport taxis',
        topics: placeholderTopics([
            'Booking',
            'Meeting your driver',
            'Changes and cancellations',
            'Payment',
            'Luggage',
        ]),
    },
];

const STATUS: Record<BookingStatus, { label: string; className: string }> = {
    active: { label: 'Confirmed', className: 'bg-st-success-fill' },
    past: { label: 'Completed', className: 'bg-st-brand' },
    cancelled: { label: 'Cancelled', className: 'bg-st-danger' },
};

const STATUS_ORDER: BookingStatus[] = ['active', 'past', 'cancelled'];

function StaySafeNotice() {
    const [open, setOpen] = useState(false);

    return (
        <section className="mx-1 mt-1 rounded-st-md border border-st-border-soft bg-st-surface">
            <button
                type="button"
                aria-expanded={open}
                aria-controls="stay-safe-body"
                onClick={() => setOpen(!open)}
                className="flex min-h-12 w-full cursor-pointer items-center gap-3 px-3 text-left"
            >
                <CircleAlert
                    className="size-5 shrink-0 text-st-callout"
                    aria-hidden
                />
                <span className="flex-1 st-body2">Stay safe online</span>
                <ChevronDown
                    className={clsx(
                        'size-5 shrink-0 st-transition',
                        open && 'rotate-180',
                    )}
                    aria-hidden
                />
            </button>
            {open && (
                <p
                    id="stay-safe-body"
                    className="px-3 pb-3 pl-11 st-body2 text-st-text-alt"
                >
                    {APP_NAME} will never ask you to pay by bank transfer, or to
                    share card details by phone, email or chat. If a message
                    asks you to, don’t click any links and report it to customer
                    service.
                </p>
            )}
        </section>
    );
}

function BookingChoice({ booking }: { booking: MockBooking }) {
    const hotel = hotelById(booking.hotelId);

    if (!hotel) {
        return null;
    }

    const status = STATUS[booking.status];

    return (
        <li>
            <Link
                to={`/stay/${booking.id}`}
                className="flex items-center gap-4 px-4 py-3 st-transition hover:bg-st-surface-alt"
            >
                <HotelPhoto
                    hotel={hotel}
                    kind="room"
                    className="size-18 shrink-0 rounded-st-sm"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="st-strong1">{hotel.name}</span>
                    <span className="st-small1">
                        {destinationById(booking.search.destinationId).name}
                    </span>
                    <span className="st-small1">
                        {formatWeekday(booking.search.checkIn)} –{' '}
                        {formatWeekday(booking.search.checkOut)}
                    </span>
                    <span>
                        <span
                            className={clsx(
                                'mt-1 inline-block rounded-st-sm px-1.5 st-small1 text-st-on-dark',
                                status.className,
                            )}
                        >
                            {status.label}
                        </span>
                    </span>
                </span>
                <ChevronRight
                    className="size-5 shrink-0 text-st-text-alt"
                    aria-hidden
                />
            </Link>
        </li>
    );
}

function TopicRow({ to, label }: { to: string; label: string }) {
    return (
        <li className="border-b border-st-border-soft last:border-b-0">
            <Link
                to={to}
                className="flex min-h-14 items-center gap-3 px-2 st-body1 st-transition hover:bg-st-surface-alt"
            >
                <span className="flex-1">{label}</span>
                <ChevronRight
                    className="size-5 shrink-0 text-st-text-alt"
                    aria-hidden
                />
            </Link>
        </li>
    );
}

export function HelpCentreScreen() {
    const { user, bookings } = useStore();
    const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
    const dragScroll = useDragScroll<HTMLDivElement>();
    const category =
        CATEGORIES.find(({ id }) => id === categoryId) ?? CATEGORIES[0];
    const choices = user
        ? STATUS_ORDER.flatMap((status) =>
              bookings.filter((booking) => booking.status === status),
          )
        : [];

    return (
        <div className="min-h-full bg-st-surface-alt">
            <TopBar title="Help Centre" fallback="/" back="chevron" />
            <main className="flex flex-col gap-2 pb-6">
                {choices.length > 0 && (
                    <>
                        <StaySafeNotice />
                        <section
                            aria-labelledby="help-bookings"
                            className="bg-st-surface pt-4 pb-2"
                        >
                            <h2
                                id="help-bookings"
                                className="px-4 pb-1 st-headline3"
                            >
                                Which booking do you need help with?
                            </h2>
                            <ul>
                                {choices.map((booking) => (
                                    <BookingChoice
                                        key={booking.id}
                                        booking={booking}
                                    />
                                ))}
                            </ul>
                        </section>
                    </>
                )}

                <section
                    aria-labelledby="help-faqs"
                    className={clsx(
                        'bg-st-surface pt-4',
                        choices.length === 0 && 'mt-2',
                    )}
                >
                    <h2 id="help-faqs" className="px-4 pb-3 st-strong1">
                        Frequently asked questions
                    </h2>
                    <div
                        ref={dragScroll}
                        role="tablist"
                        aria-label="Help topics"
                        className="flex overflow-x-auto border-b border-st-border-soft"
                    >
                        {CATEGORIES.map(({ id, label, icon: Icon }) => {
                            const selected = id === category.id;

                            return (
                                <button
                                    key={id}
                                    id={`help-tab-${id}`}
                                    type="button"
                                    role="tab"
                                    aria-selected={selected}
                                    aria-controls="help-topics"
                                    onClick={() => setCategoryId(id)}
                                    className={clsx(
                                        'flex min-h-14 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 border-b-2 px-4 st-body2 whitespace-nowrap st-transition',
                                        selected
                                            ? 'border-st-link text-st-link'
                                            : 'border-transparent hover:bg-st-surface-alt',
                                    )}
                                >
                                    <Icon className="size-5" aria-hidden />
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    <ul
                        id="help-topics"
                        role="tabpanel"
                        aria-labelledby={`help-tab-${category.id}`}
                        className="px-2"
                    >
                        {category.topics.map((topic) => (
                            <TopicRow
                                key={topic.id}
                                to={`/help/${category.id}/${topic.id}`}
                                label={topic.title}
                            />
                        ))}
                    </ul>
                </section>

                <ul className="bg-st-surface px-2">
                    <TopicRow
                        to="/help/find-booking"
                        label="I can't find my booking"
                    />
                </ul>
            </main>
        </div>
    );
}

function FaqList({ faqs }: { faqs: Faq[] }) {
    return (
        <div className="bg-st-surface px-4">
            {faqs.map(({ question, answer }) => (
                <details
                    key={question}
                    className="group border-b border-st-border-soft last:border-b-0"
                >
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 st-strong2 [&::-webkit-details-marker]:hidden">
                        {question}
                        <ChevronDown
                            className="size-5 shrink-0 st-transition group-open:rotate-180"
                            aria-hidden
                        />
                    </summary>
                    <p className="pb-4 st-body2 text-st-text-alt">{answer}</p>
                </details>
            ))}
        </div>
    );
}

function StillNeedHelp() {
    return (
        <section className="flex flex-col items-start gap-3 bg-st-surface px-4 py-4">
            <h2 className="st-strong1">Still need help?</h2>
            <p className="st-body2 text-st-text-alt">
                For questions about a booking, message the property from your
                booking in Bookings, or contact us.
            </p>
            <Button variant="outline" onClick={() => navigate('/help/contact')}>
                Contact customer service
            </Button>
        </section>
    );
}

export function HelpTopicScreen({
    categoryId,
    topicId,
}: {
    categoryId?: string;
    topicId?: string;
}) {
    const category = CATEGORIES.find(({ id }) => id === categoryId);
    const topic = category?.topics.find(({ id }) => id === topicId);

    return (
        <div className="min-h-full bg-st-surface-alt">
            <TopBar
                title={topic?.title ?? 'Help Centre'}
                fallback="/help"
                back="chevron"
            />
            <main className="flex flex-col gap-2 pb-6">
                {!category || !topic ? (
                    <p className="bg-st-surface p-4 st-body2 text-st-text-alt">
                        We can't find that help topic.
                    </p>
                ) : category.unavailable ? (
                    <p className="bg-st-surface p-4 st-body2 text-st-text-alt">
                        {category.unavailable} aren't part of this prototype
                        yet, so there are no answers here.
                    </p>
                ) : (
                    <FaqList faqs={topic.faqs} />
                )}
                <StillNeedHelp />
            </main>
        </div>
    );
}

export function FindBookingScreen() {
    const { user, startAuth } = useStore();

    return (
        <div className="min-h-full bg-st-surface-alt">
            <TopBar
                title="I can't find my booking"
                fallback="/help"
                back="chevron"
            />
            <main className="flex flex-col gap-2 pb-6">
                <FaqList
                    faqs={[
                        {
                            question: 'Are you signed in to the right account?',
                            answer: `Bookings are saved to the account that made them. If you booked with a different email address, sign in with that one.`,
                        },
                        {
                            question: 'Was the booking made recently?',
                            answer: 'New bookings appear in Bookings within a few minutes. Your confirmation email has the booking reference.',
                        },
                        {
                            question: 'Was it cancelled or completed?',
                            answer: 'Look in the Past and Cancelled tabs in Bookings, not just Active.',
                        },
                    ]}
                />
                <section className="flex flex-col gap-2 bg-st-surface px-4 py-4">
                    {user ? (
                        <Button onClick={() => selectTab('bookings')}>
                            Go to Bookings
                        </Button>
                    ) : (
                        <Button onClick={() => startAuth()}>
                            Sign in to see your bookings
                        </Button>
                    )}
                </section>
            </main>
        </div>
    );
}
