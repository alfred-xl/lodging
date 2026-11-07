import clsx from 'clsx';
import {
    ChevronDown,
    ChevronRight,
    CircleCheck,
    Info,
    Mail,
    Phone,
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetFooter } from '../components/sheet';
import { TextField } from '../components/text-field';
import { sendSupportMessage } from '../api';
import { SUPPORT_PHONE } from '../app-config';
import { Button, TopBar } from '../components/ui';
import { closeSheet, goBack, navigate, openSheet } from '../router';
import { useStore } from '../store';
import { APP_NAME } from '../theme';
import { validateEmail } from '../validation';

// Confirmation numbers are shown as "LD-90214738". People may type just the digits.
function digitsOf(reference: string): string {
    return reference.replace(/\D/g, '');
}

function ConfirmationForm() {
    const { user, bookings } = useStore();
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    return (
        <form
            noValidate
            className="flex flex-col gap-2 bg-st-surface px-4 pt-3 pb-4"
            onSubmit={(event) => {
                event.preventDefault();
                const digits = digitsOf(value);

                if (!digits) {
                    setError('Enter your confirmation number.');

                    return;
                }

                if (!user) {
                    setError(
                        'Sign in to the account you booked with, then try again.',
                    );

                    return;
                }

                const booking = bookings.find(
                    (item) => digitsOf(item.reference) === digits,
                );

                if (!booking) {
                    setError(
                        "We can't find a booking with that confirmation number. Check it and try again.",
                    );

                    return;
                }

                navigate(`/stay/${booking.id}`);
            }}
        >
            <p className="pb-2 st-body2">
                To get help with accommodation bookings or to contact us, please
                enter your confirmation number. You’ll find it in your
                confirmation e-mail.
            </p>
            <TextField
                id="confirmation-number"
                label="Confirmation number"
                placeholder="Ex. 1234567890"
                inputMode="text"
                autoComplete="off"
                value={value}
                error={error}
                onChange={(next) => {
                    setValue(next);
                    setError(null);
                }}
            />
            <Button type="submit" className="w-full">
                Continue
            </Button>
        </form>
    );
}

function BrandBadge() {
    return (
        <span aria-hidden className="relative shrink-0">
            <span className="flex size-8 items-center justify-center rounded-st-full bg-st-brand st-strong2 text-st-on-dark">
                {APP_NAME.charAt(0)}
            </span>
            <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-st-full bg-st-action text-st-on-dark ring-2 ring-st-surface">
                <Phone className="size-2.5" />
            </span>
        </span>
    );
}

export function ContactCustomerServiceScreen() {
    const [moreOpen, setMoreOpen] = useState(true);

    return (
        <div className="min-h-full bg-st-surface-alt">
            <TopBar
                title="Enter booking details"
                fallback="/help"
                back="chevron"
            />
            <main className="flex flex-col gap-2 pb-6">
                <ConfirmationForm />

                <section
                    aria-labelledby="find-booking-details"
                    className="bg-st-surface pt-4"
                >
                    <h2
                        id="find-booking-details"
                        className="px-4 pb-1 st-strong1"
                    >
                        Find your booking details
                    </h2>
                    <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={() => openSheet('resend-confirmation')}
                        className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 text-left st-body2 st-transition hover:bg-st-surface-alt"
                    >
                        <Mail
                            className="size-5 shrink-0 text-st-link"
                            aria-hidden
                        />
                        <span className="flex-1">
                            Resend accommodation confirmation email
                        </span>
                        <ChevronRight
                            className="size-5 shrink-0 text-st-text-alt"
                            aria-hidden
                        />
                    </button>
                </section>

                <section
                    aria-labelledby="talk-to-someone"
                    className="flex flex-col gap-4 bg-st-surface px-4 pt-6 pb-4"
                >
                    <h2 id="talk-to-someone" className="st-headline3">
                        Need to talk to someone?
                    </h2>
                    <p className="st-body2">
                        If you can't find your booking details or you have a
                        question for Customer Service, you can message or call
                        us.
                    </p>
                    <div className="flex flex-col gap-3 rounded-st-lg border border-st-border-soft p-4">
                        <h3 className="st-strong1">Message Customer Service</h3>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate('/help/messages')}
                        >
                            Message Customer Service
                        </Button>
                    </div>
                    <div>
                        <button
                            type="button"
                            aria-expanded={moreOpen}
                            aria-controls="more-contact-options"
                            onClick={() => setMoreOpen(!moreOpen)}
                            className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 st-body2 text-st-link"
                        >
                            More contact options
                            <ChevronDown
                                className={clsx(
                                    'size-5 shrink-0 text-st-text st-transition',
                                    moreOpen && 'rotate-180',
                                )}
                                aria-hidden
                            />
                        </button>
                        {moreOpen && (
                            <button
                                id="more-contact-options"
                                type="button"
                                onClick={() => navigate('/help/call')}
                                className="flex min-h-14 w-full cursor-pointer items-center gap-4 text-left st-body1 text-st-link"
                            >
                                <BrandBadge />
                                <span className="flex-1">
                                    Call Customer Service
                                </span>
                                <ChevronRight
                                    className="size-5 shrink-0 text-st-text-alt"
                                    aria-hidden
                                />
                            </button>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export function MessageCustomerServiceScreen() {
    const { user } = useStore();
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<{ message?: string; email?: string }>(
        {},
    );
    const [busy, setBusy] = useState(false);
    const [sentTo, setSentTo] = useState<string | null>(null);

    if (sentTo) {
        return (
            <div className="min-h-full bg-st-surface">
                <TopBar
                    title="Message Customer Service"
                    fallback="/help/contact"
                    back="chevron"
                />
                <main
                    role="status"
                    className="flex flex-col items-center gap-3 px-6 pt-12 text-center"
                >
                    <CircleCheck
                        className="size-12 text-st-success"
                        aria-hidden
                    />
                    <h2 className="st-headline3">Message sent</h2>
                    <p className="st-body2">
                        We've saved your message with your email address,{' '}
                        <strong className="break-all">{sentTo}</strong>. This
                        prototype has no support team, so no one will reply.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => goBack('/help/contact')}
                    >
                        Done
                    </Button>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-st-surface">
            <TopBar
                title="Message Customer Service"
                fallback="/help/contact"
                back="chevron"
            />
            <form
                noValidate
                className="flex flex-col gap-3 px-4 pt-4 pb-6"
                onSubmit={async (event) => {
                    event.preventDefault();
                    const address = user?.email ?? email.trim();
                    const found = {
                        message: message.trim()
                            ? undefined
                            : 'Write a message before sending.',
                        email: user
                            ? undefined
                            : (validateEmail(address) ?? undefined),
                    };

                    if (found.message || found.email) {
                        setErrors(found);

                        return;
                    }

                    setBusy(true);
                    const problem = await sendSupportMessage(
                        message.trim(),
                        address,
                    );
                    setBusy(false);

                    if (problem) {
                        setErrors({ message: problem });

                        return;
                    }

                    setSentTo(address);
                }}
            >
                <h2 className="st-headline3">Message Customer Service</h2>
                <div className="flex flex-col gap-1">
                    <label htmlFor="support-message" className="st-body2">
                        Your message
                    </label>
                    <textarea
                        id="support-message"
                        rows={4}
                        maxLength={2000}
                        value={message}
                        placeholder="Please write your message here..."
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={
                            errors.message ? 'support-message-error' : undefined
                        }
                        onChange={(event) => {
                            setMessage(event.target.value);
                            setErrors({});
                        }}
                        className={clsx(
                            'w-full resize-y rounded-st-sm border bg-st-surface px-3 py-2 st-body1',
                            errors.message
                                ? 'border-st-danger'
                                : 'border-st-border',
                        )}
                    />
                    {errors.message && (
                        <p
                            id="support-message-error"
                            role="alert"
                            className="st-small1 text-st-danger"
                        >
                            {errors.message}
                        </p>
                    )}
                </div>
                {user ? (
                    <div>
                        <p className="st-body2">Your email address</p>
                        <p className="pt-1 st-body2 break-all">{user.email}</p>
                    </div>
                ) : (
                    <TextField
                        id="support-email"
                        label="Your email address"
                        type="email"
                        autoComplete="email"
                        value={email}
                        error={errors.email ?? null}
                        onChange={(next) => {
                            setEmail(next);
                            setErrors({});
                        }}
                    />
                )}
                <Button type="submit" className="mt-1 w-full" loading={busy}>
                    Send
                </Button>
            </form>
        </div>
    );
}

export function CallCustomerServiceScreen() {
    return (
        <div className="min-h-full bg-st-surface-alt">
            <TopBar
                title="Call us anytime"
                fallback="/help/contact"
                back="chevron"
            />
            <main>
                <section className="flex flex-col gap-4 bg-st-surface px-4 pt-4 pb-6">
                    <h2 className="st-headline3">Speak to Customer Service</h2>
                    <p className="st-body1">
                        We’re available to help you on the number below:
                    </p>
                    <a
                        href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}
                        className="flex items-center gap-4 rounded-st-sm st-transition hover:bg-st-surface-alt"
                    >
                        <Phone
                            className="size-7 shrink-0 text-st-link"
                            strokeWidth={1.5}
                            aria-hidden
                        />
                        <span>
                            <span className="block st-body1">
                                Customer service
                            </span>
                            <span className="block st-strong1">
                                {SUPPORT_PHONE}
                            </span>
                        </span>
                    </a>
                </section>
                <p className="flex items-start gap-3 px-4 pt-4 st-body2 text-st-notice-text">
                    <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                    Local charges apply to in-country telephone numbers. Extra
                    fees may apply to international numbers.
                </p>
            </main>
        </div>
    );
}

function ResendForm() {
    const { user } = useStore();
    const [email, setEmail] = useState(user?.email ?? '');
    const [error, setError] = useState<string | null>(null);
    const [sentTo, setSentTo] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    if (sentTo) {
        return (
            <>
                <p role="status" className="px-4 pt-4 pb-3 st-body2">
                    If there are bookings for <strong>{sentTo}</strong>, their
                    confirmations would be sent there now. This prototype
                    doesn't send emails, so nothing will arrive.
                </p>
                <SheetFooter>
                    <Button className="w-full" onClick={closeSheet}>
                        Done
                    </Button>
                </SheetFooter>
            </>
        );
    }

    return (
        <form
            noValidate
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={async (event) => {
                event.preventDefault();
                const problem = validateEmail(email);

                if (problem) {
                    setError(problem);

                    return;
                }

                setBusy(true);
                await new Promise((resolve) => setTimeout(resolve, 600));
                setBusy(false);
                setSentTo(email.trim());
            }}
        >
            <p className="px-4 pt-4 st-body2 text-st-text-alt">
                Enter the email address you booked with.
            </p>
            <div className="px-4 pt-3 pb-3">
                <TextField
                    id="resend-email"
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    value={email}
                    error={error}
                    onChange={(next) => {
                        setEmail(next);
                        setError(null);
                    }}
                />
            </div>
            <SheetFooter>
                <Button type="submit" className="w-full" loading={busy}>
                    Resend confirmation
                </Button>
            </SheetFooter>
        </form>
    );
}

export function ResendConfirmationSheet({ open }: { open: boolean }) {
    return (
        <Sheet open={open} title="Resend confirmation" variant="bottom">
            {open && <ResendForm />}
        </Sheet>
    );
}
