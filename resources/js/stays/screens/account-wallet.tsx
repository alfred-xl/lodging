import {
    BadgePercent,
    ChevronDown,
    Info,
    PiggyBank,
    Receipt,
    Smartphone,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { redeemCoupon } from '../account-data';
import { AccountGate } from '../components/account-ui';
import { Sheet, SheetFooter } from '../components/sheet';
import { TextField } from '../components/text-field';
import { Button, TopBar } from '../components/ui';
import { formatMinor } from '../format';
import { closeSheet, Link, navigate, openSheet } from '../router';
import { APP_NAME } from '../theme';

const EXPLAINERS: { icon: LucideIcon; title: string; body: string }[] = [
    {
        icon: BadgePercent,
        title: 'Book and earn travel rewards',
        body: `Credits, vouchers, you name it! These are all spendable on your next ${APP_NAME} trip.`,
    },
    {
        icon: Smartphone,
        title: 'Track everything at a glance',
        body: 'Your Wallet keeps all rewards safe, while updating you of your earnings and spendings.',
    },
    {
        icon: PiggyBank,
        title: 'Pay with Wallet to save money',
        body: "If a booking accepts any rewards in your Wallet, it'll appear during payment for spending.",
    },
];

export function WalletScreen() {
    return (
        <div className="min-h-full bg-st-surface">
            <TopBar title="Rewards & Wallet" fallback="/" />
            <AccountGate>
                {(account) => {
                    const balance = formatMinor(
                        account.walletCreditMinor,
                        account.walletCurrency,
                    );

                    return (
                        <main className="flex flex-col gap-4 px-4 pt-4 pb-8">
                            <section
                                aria-labelledby="wallet-balance"
                                className="rounded-st-lg border border-st-border-soft p-4 shadow-st-100"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        aria-hidden
                                        className="flex size-10 shrink-0 items-center justify-center rounded-st-md bg-st-action-tint text-st-link"
                                    >
                                        <Wallet className="size-6" />
                                    </span>
                                    <h2
                                        id="wallet-balance"
                                        className="flex-1 st-headline3"
                                    >
                                        Wallet balance
                                    </h2>
                                    <p className="st-headline3">{balance}</p>
                                </div>
                                <p className="pt-1 pl-13 st-body2 text-st-text-alt">
                                    Includes all spendable rewards
                                </p>
                                <div className="mt-3 flex min-h-12 items-center justify-between gap-2 border-y border-st-border-soft">
                                    <span className="flex items-center gap-1 st-body1">
                                        Credits
                                        <button
                                            type="button"
                                            aria-label="What are credits?"
                                            aria-haspopup="dialog"
                                            onClick={() =>
                                                openSheet('wallet-credits')
                                            }
                                            className="-my-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-st-full text-st-link hover:bg-st-action-tint"
                                        >
                                            <Info
                                                className="size-5"
                                                aria-hidden
                                            />
                                        </button>
                                    </span>
                                    <span className="st-body1">{balance}</span>
                                </div>
                                <Link
                                    to="/rewards-activity"
                                    className="mt-1 inline-flex min-h-11 items-center st-emphasized1 text-st-link hover:underline"
                                >
                                    View rewards activity
                                </Link>
                            </section>

                            <section className="rounded-st-md border border-st-border-soft px-4 py-3">
                                <h2 className="st-body1">Got a coupon code?</h2>
                                <button
                                    type="button"
                                    aria-haspopup="dialog"
                                    onClick={() => openSheet('coupon')}
                                    className="inline-flex min-h-11 cursor-pointer items-center st-emphasized1 text-st-link hover:underline"
                                >
                                    Add coupon into Wallet
                                </button>
                            </section>

                            <section
                                aria-labelledby="wallet-about"
                                className="pt-4"
                            >
                                <h2
                                    id="wallet-about"
                                    className="pb-2 st-headline2"
                                >
                                    What's Rewards & Wallet?
                                </h2>
                                <ul className="flex flex-col gap-6 pt-3">
                                    {EXPLAINERS.map(
                                        ({ icon: Icon, title, body }) => (
                                            <li
                                                key={title}
                                                className="flex gap-4"
                                            >
                                                <span
                                                    aria-hidden
                                                    className="flex size-14 shrink-0 items-center justify-center rounded-st-full bg-st-accent/20 text-st-callout"
                                                >
                                                    <Icon className="size-7" />
                                                </span>
                                                <div className="min-w-0">
                                                    <h3 className="st-strong1">
                                                        {title}
                                                    </h3>
                                                    <p className="pt-1 st-body2 text-st-text-alt">
                                                        {body}
                                                    </p>
                                                </div>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </section>

                            <Button
                                variant="outline"
                                className="mt-4 w-full"
                                onClick={() => navigate('/wallet-faqs')}
                            >
                                Need help? Visit FAQs
                            </Button>
                        </main>
                    );
                }}
            </AccountGate>
        </div>
    );
}

export function RewardsActivityScreen() {
    return (
        <div className="min-h-full bg-st-surface">
            <TopBar title="Rewards activity" fallback="/wallet" />
            <main className="flex flex-col items-center gap-3 px-6 pt-16 text-center">
                <span
                    aria-hidden
                    className="flex size-16 items-center justify-center rounded-st-full bg-st-action-tint text-st-link"
                >
                    <Receipt className="size-8" />
                </span>
                <h2 className="st-headline3">No rewards activity yet</h2>
                <p className="st-body2 text-st-text-alt">
                    When you earn or spend credits and vouchers, they'll show up
                    here.
                </p>
            </main>
        </div>
    );
}

const FAQS = [
    {
        question: 'What can I spend my Wallet balance on?',
        answer: `Credits can be spent on stays booked with ${APP_NAME} when the property accepts them. You'll see the option during payment.`,
    },
    {
        question: 'How do I earn credits?',
        answer: 'Some deals and promotions give you credits after your stay. They land in your Wallet once the stay is complete.',
    },
    {
        question: 'Do credits expire?',
        answer: 'Each reward shows its expiry date in your rewards activity. Spend it before then to keep its value.',
    },
    {
        question: 'Can I turn credits into cash?',
        answer: "No. Credits can only be spent on bookings, and they can't be transferred to someone else.",
    },
];

export function WalletFaqScreen() {
    return (
        <div className="min-h-full bg-st-surface">
            <TopBar title="Rewards & Wallet FAQs" fallback="/wallet" />
            <main className="px-4 pt-2 pb-8">
                {FAQS.map(({ question, answer }) => (
                    <details
                        key={question}
                        className="group border-b border-st-border-soft"
                    >
                        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 st-strong1 [&::-webkit-details-marker]:hidden">
                            {question}
                            <ChevronDown
                                className="size-5 shrink-0 st-transition group-open:rotate-180"
                                aria-hidden
                            />
                        </summary>
                        <p className="pb-4 st-body2 text-st-text-alt">
                            {answer}
                        </p>
                    </details>
                ))}
            </main>
        </div>
    );
}

export function WalletCreditsSheet({ open }: { open: boolean }) {
    return (
        <Sheet open={open} title="Credits" variant="bottom">
            <p className="px-4 pt-4 pb-3 st-body2 text-st-text-alt">
                Credits are money added to your Wallet from rewards and
                promotions. When a booking accepts them, they're taken off the
                price during payment.
            </p>
            <SheetFooter>
                <Button className="w-full" onClick={closeSheet}>
                    Got it
                </Button>
            </SheetFooter>
        </Sheet>
    );
}

function CouponForm() {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    return (
        <form
            noValidate
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setError(await redeemCoupon(code));
                setBusy(false);
            }}
        >
            <div className="px-4 pt-4 pb-3">
                <TextField
                    id="coupon-code"
                    label="Coupon code"
                    autoComplete="off"
                    autoCapitalize="characters"
                    value={code}
                    error={error}
                    onChange={(value) => {
                        setCode(value);
                        setError(null);
                    }}
                />
            </div>
            <SheetFooter>
                <Button type="submit" className="w-full" loading={busy}>
                    Add to Wallet
                </Button>
            </SheetFooter>
        </form>
    );
}

export function CouponSheet({ open }: { open: boolean }) {
    return (
        <Sheet open={open} title="Add a coupon" variant="bottom">
            {open && <CouponForm />}
        </Sheet>
    );
}
