import { Building2, ChevronRight, Receipt, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cardBrand, passesLuhn } from '../account-data';
import type { FieldErrors, Transaction } from '../account-data';
import {
    AccountGate,
    CardTile,
    cardLabel,
    cardSpokenLabel,
} from '../components/account-ui';
import { Sheet, SheetFooter } from '../components/sheet';
import { TextField } from '../components/text-field';
import { Button, DevNote, IconButton, TopBar } from '../components/ui';
import { formatMinor, formatShort, parseIso } from '../format';
import { closeSheet, goBack, Link, navigate, openSheet } from '../router';
import { useStore } from '../store';
import { APP_NAME } from '../theme';

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

export function PaymentDetailsScreen() {
    return (
        <div className="flex min-h-full flex-col bg-st-surface">
            <TopBar title="Payment details" fallback="/" />
            <AccountGate>
                {(account) => (
                    <>
                        <main className="flex-1 px-4 pt-4 pb-6">
                            <p className="st-body1 text-st-text-alt">
                                Securely add or remove payment methods to make
                                it easier when you book.
                            </p>
                            <h2 className="pt-8 pb-4 st-headline3">
                                Payment cards
                            </h2>
                            {account.cards.length === 0 ? (
                                <p className="st-body2 text-st-text-alt">
                                    You haven't saved any cards yet.
                                </p>
                            ) : (
                                <ul className="flex flex-col gap-4">
                                    {account.cards.map((card) => (
                                        <li
                                            key={card.id}
                                            className="flex items-center gap-4"
                                        >
                                            <CardTile className="size-14" />
                                            <p className="min-w-0 flex-1 st-body1">
                                                <span aria-hidden>
                                                    {cardLabel(
                                                        card.brand,
                                                        card.lastFour,
                                                    )}
                                                </span>
                                                <span className="sr-only">
                                                    {cardSpokenLabel(
                                                        card.brand,
                                                        card.lastFour,
                                                    )}
                                                    , expires
                                                </span>
                                            </p>
                                            <p className="shrink-0 st-body1 text-st-text-alt">
                                                {pad(card.expMonth)}-
                                                {card.expYear}
                                            </p>
                                            <IconButton
                                                label={`Remove ${cardSpokenLabel(card.brand, card.lastFour)}`}
                                                aria-haspopup="dialog"
                                                onClick={() =>
                                                    openSheet('remove-card', {
                                                        card: card.id,
                                                    })
                                                }
                                                className="-mr-2 hover:bg-st-danger-tint"
                                            >
                                                <Trash2
                                                    className="size-6"
                                                    aria-hidden
                                                />
                                            </IconButton>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </main>
                        <SheetFooter className="sticky bottom-0 pb-3">
                            <Button
                                className="w-full"
                                onClick={() => navigate('/add-card')}
                            >
                                Add card
                            </Button>
                        </SheetFooter>
                    </>
                )}
            </AccountGate>
        </div>
    );
}

function formatCardNumber(value: string): string {
    return value
        .replace(/\D/g, '')
        .slice(0, 19)
        .replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 4);

    return digits.length > 2
        ? `${digits.slice(0, 2)}/${digits.slice(2)}`
        : digits;
}

type CardForm = { name: string; number: string; expiry: string };

function validateCard(form: CardForm): FieldErrors {
    const errors: FieldErrors = {};
    const digits = form.number.replace(/\D/g, '');
    const [month, year] = form.expiry.split('/').map(Number);
    const now = new Date();

    if (!form.name.trim()) {
        errors.name = "Enter the cardholder's name as it's shown on the card.";
    }

    if (
        digits.length < 13 ||
        !passesLuhn(digits) ||
        cardBrand(digits) === null
    ) {
        errors.number =
            'Enter a valid Visa, Mastercard, Amex, Discover or Maestro card number.';
    }

    if (!month || !year || month > 12) {
        errors.expiry = 'Enter the expiry date as MM/YY.';
    } else if (
        2000 + year < now.getFullYear() ||
        (2000 + year === now.getFullYear() && month < now.getMonth() + 1)
    ) {
        errors.expiry = 'This card has expired.';
    }

    return errors;
}

// The full number stays in this form. Only the brand, last four digits and expiry are sent.
export function AddCardScreen() {
    const { addCard } = useStore();
    const [form, setForm] = useState<CardForm>({
        name: '',
        number: '',
        expiry: '',
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [busy, setBusy] = useState(false);
    const digits = form.number.replace(/\D/g, '');
    const brand = digits.length >= 2 ? cardBrand(digits) : null;

    const update = (field: keyof CardForm, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: '', form: '' }));
    };

    return (
        <div className="flex min-h-full flex-col bg-st-surface">
            <TopBar title="Add card" fallback="/payment-details" />
            <form
                noValidate
                className="flex flex-1 flex-col"
                onSubmit={async (event) => {
                    event.preventDefault();
                    const found = validateCard(form);

                    if (Object.keys(found).length > 0) {
                        setErrors(found);

                        return;
                    }

                    const [month, year] = form.expiry.split('/').map(Number);
                    setBusy(true);
                    const failed = await addCard({
                        brand: cardBrand(digits) ?? '',
                        last_four: digits.slice(-4),
                        exp_month: month,
                        exp_year: 2000 + year,
                        holder_name: form.name.trim(),
                    });
                    setBusy(false);

                    if (failed) {
                        setErrors({
                            form: Object.values(failed)[0] ?? '',
                        });

                        return;
                    }

                    toast('Card saved.');
                    goBack('/payment-details');
                }}
            >
                <main className="flex flex-1 flex-col gap-4 px-4 pt-4 pb-6">
                    <TextField
                        id="card-name"
                        label="Cardholder's name"
                        autoComplete="cc-name"
                        value={form.name}
                        error={errors.name || null}
                        onChange={(value) => update('name', value)}
                    />
                    <TextField
                        id="card-number"
                        label="Card number"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        value={form.number}
                        error={errors.number || null}
                        describedBy="card-brand"
                        onChange={(value) =>
                            update('number', formatCardNumber(value))
                        }
                        trailing={
                            <span
                                id="card-brand"
                                className="pr-3 st-small2 text-st-text-alt"
                            >
                                {brand ?? ''}
                            </span>
                        }
                    />
                    <div className="w-40">
                        <TextField
                            id="card-expiry"
                            label="Expiry date"
                            placeholder="MM/YY"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            value={form.expiry}
                            error={errors.expiry || null}
                            onChange={(value) =>
                                update('expiry', formatExpiry(value))
                            }
                        />
                    </div>
                    <p className="st-small1 text-st-text-alt">
                        Only the card type, the last 4 digits and the expiry
                        date are saved. The full card number never leaves this
                        device.
                    </p>
                    {import.meta.env.DEV && (
                        <DevNote>
                            Use a test number such as 5555 5555 5555 4444.
                        </DevNote>
                    )}
                    {errors.form && (
                        <p role="alert" className="st-body2 text-st-danger">
                            {errors.form}
                        </p>
                    )}
                </main>
                <SheetFooter className="sticky bottom-0 pb-3">
                    <Button type="submit" className="w-full" loading={busy}>
                        Save card
                    </Button>
                </SheetFooter>
            </form>
        </div>
    );
}

function RemoveCardBody({ cardId }: { cardId: string }) {
    const { account, removeCard } = useStore();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const card = account?.cards.find((item) => item.id === cardId);

    if (!card) {
        return (
            <p className="px-4 py-4 st-body2 text-st-text-alt">
                This card has already been removed.
            </p>
        );
    }

    return (
        <>
            <p className="px-4 pt-4 pb-3 st-body2 text-st-text-alt">
                {cardSpokenLabel(card.brand, card.lastFour)} will be removed
                from your account. You can add it again at any time.
            </p>
            {error && (
                <p role="alert" className="px-4 pb-3 st-body2 text-st-danger">
                    {error}
                </p>
            )}
            <SheetFooter className="flex flex-col gap-2">
                <Button
                    variant="outlineDanger"
                    className="w-full"
                    loading={busy}
                    onClick={async () => {
                        setBusy(true);
                        const failed = await removeCard(card.id);
                        setBusy(false);

                        if (failed) {
                            setError(Object.values(failed)[0] ?? null);

                            return;
                        }

                        toast('Card removed.');
                        closeSheet();
                    }}
                >
                    Remove card
                </Button>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={closeSheet}
                >
                    Keep card
                </Button>
            </SheetFooter>
        </>
    );
}

export function RemoveCardSheet({
    open,
    cardId,
}: {
    open: boolean;
    cardId: string | null;
}) {
    return (
        <Sheet open={open} title="Remove card?" variant="bottom">
            {cardId && <RemoveCardBody cardId={cardId} />}
        </Sheet>
    );
}

function dateHeading(iso: string): string {
    return `${formatShort(iso)} ${parseIso(iso).getFullYear()}`;
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
    const paid = status === 'paid';

    return (
        <span
            className={
                paid
                    ? 'inline-block rounded-st-sm bg-st-success-tint px-2 py-0.5 st-body2 text-st-success'
                    : 'inline-block rounded-st-sm bg-st-surface-alt px-2 py-0.5 st-body2 text-st-text-alt'
            }
        >
            {paid ? 'Paid' : 'Refunded'}
        </span>
    );
}

// "30 Oct 2026, 00:55", read as written so it doesn't shift with the device's time zone.
function dateTimeText(local: string): string {
    const [date, time] = local.split('T');

    return `${dateHeading(date)}, ${time}`;
}

function TransactionRow({ item }: { item: Transaction }) {
    return (
        <li>
            <Link
                to={`/transaction/${item.id}`}
                aria-label={`${item.description}, ${formatMinor(item.amountMinor, item.currency)}, ${item.status === 'paid' ? 'paid' : 'refunded'} with ${cardSpokenLabel(item.cardBrand, item.cardLastFour)}`}
                className="-mx-4 flex items-center gap-3 px-4 py-3 st-transition hover:bg-st-surface-alt"
            >
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="flex items-center gap-3">
                        <CardTile className="h-8 w-12 rounded-st-sm" />
                        <span className="flex-1 st-body1">
                            •••• {item.cardLastFour}
                        </span>
                        <span className="st-body1">
                            {formatMinor(item.amountMinor, item.currency)}
                        </span>
                    </span>
                    <span>
                        <StatusBadge status={item.status} />
                    </span>
                    <span className="st-body1">{item.description}</span>
                </span>
                <ChevronRight
                    className="size-5 shrink-0 text-st-text-alt"
                    aria-hidden
                />
            </Link>
        </li>
    );
}

export function TransactionsScreen() {
    return (
        <div className="min-h-full bg-st-surface">
            <TopBar title="Transactions" fallback="/" />
            <AccountGate>
                {(account) => {
                    const days = [
                        ...new Set(
                            account.transactions.map(
                                (item) => item.processedOn,
                            ),
                        ),
                    ];

                    return (
                        <main className="px-4 pt-4 pb-8">
                            <p className="rounded-st-md border border-st-border-soft p-4 st-body2 text-st-text-alt">
                                Recent transactions processed by {APP_NAME} are
                                shown here. (Transaction information for car
                                rentals and airport transfers will be available
                                soon.)
                            </p>
                            {days.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 px-2 pt-12 text-center">
                                    <Receipt
                                        className="size-10 text-st-text-alt"
                                        aria-hidden
                                    />
                                    <h2 className="st-strong1">
                                        No transactions yet
                                    </h2>
                                    <p className="st-body2 text-st-text-alt">
                                        Payments for your bookings will show up
                                        here.
                                    </p>
                                </div>
                            ) : (
                                days.map((day) => (
                                    <section key={day} className="pt-6">
                                        <h2 className="st-body1">
                                            {dateHeading(day)}
                                        </h2>
                                        <ul className="divide-y divide-st-border-soft">
                                            {account.transactions
                                                .filter(
                                                    (item) =>
                                                        item.processedOn ===
                                                        day,
                                                )
                                                .map((item) => (
                                                    <TransactionRow
                                                        key={item.id}
                                                        item={item}
                                                    />
                                                ))}
                                        </ul>
                                    </section>
                                ))
                            )}
                        </main>
                    );
                }}
            </AccountGate>
        </div>
    );
}

export function TransactionDetailsScreen({
    transactionId,
}: {
    transactionId?: string;
}) {
    return (
        <div className="min-h-full bg-st-surface">
            <TopBar title="Transaction details" fallback="/transactions" />
            <AccountGate>
                {(account) => {
                    const item = account.transactions.find(
                        (entry) => entry.id === transactionId,
                    );

                    if (!item) {
                        return (
                            <p className="p-4 st-body2 text-st-text-alt">
                                We can't find this transaction.
                            </p>
                        );
                    }

                    return (
                        <main className="px-4 pt-6 pb-8">
                            <div className="flex flex-col items-center gap-1 text-center">
                                <span
                                    aria-hidden
                                    className="mb-3 flex size-12 items-center justify-center rounded-st-full bg-st-brand text-st-on-dark"
                                >
                                    <Building2
                                        className="size-6"
                                        strokeWidth={1.5}
                                    />
                                </span>
                                <p className="st-headline1">
                                    {formatMinor(
                                        item.amountMinor,
                                        item.currency,
                                    )}
                                </p>
                                <h2 className="st-headline3">
                                    {item.category}
                                </h2>
                                <p className="st-body1">{item.description}</p>
                                <p className="pt-3">
                                    <StatusBadge status={item.status} />
                                </p>
                            </div>
                            <h2 className="pt-8 pb-2 st-headline2">
                                Transaction details
                            </h2>
                            <dl className="flex flex-col gap-4">
                                <div>
                                    <dt className="st-body1 text-st-text-alt">
                                        Transaction date
                                    </dt>
                                    <dd className="st-body1">
                                        {dateTimeText(item.processedAt)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="st-body1 text-st-text-alt">
                                        Processed by
                                    </dt>
                                    <dd className="st-body1">{APP_NAME}</dd>
                                </div>
                                <div>
                                    <dt className="st-body1 text-st-text-alt">
                                        Payment method
                                    </dt>
                                    <dd className="flex items-center gap-3 pt-1 st-body1">
                                        <CardTile className="h-8 w-12 rounded-st-sm" />
                                        <span aria-hidden>
                                            •••• {item.cardLastFour}
                                        </span>
                                        <span className="sr-only">
                                            {cardSpokenLabel(
                                                item.cardBrand,
                                                item.cardLastFour,
                                            )}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </main>
                    );
                }}
            </AccountGate>
        </div>
    );
}
