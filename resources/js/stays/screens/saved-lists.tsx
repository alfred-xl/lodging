import clsx from 'clsx';
import { ChevronRight, Heart, Plane, X } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { BellArt, SavedCardsArt } from '../components/empty-art';
import { HotelPhoto } from '../components/hotel-photo';
import { Sheet, SheetFooter } from '../components/sheet';
import { TextField } from '../components/text-field';
import { Button, IconButton, TopBar } from '../components/ui';
import { hotelById } from '../data';
import { plural } from '../format';
import { closeSheet, goHome, openSheet, selectTab } from '../router';
import { useStore } from '../store';
import { APP_NAME } from '../theme';

type SavedTab = 'lists' | 'alerts';

const TABS: { id: SavedTab; label: string; icon: typeof Heart }[] = [
    { id: 'lists', label: 'Lists', icon: Heart },
    { id: 'alerts', label: 'Alerts', icon: Plane },
];

const ALERTS_SURVEY = 'price-alerts';

function ListCard({
    title,
    detail,
    thumbnail,
    onClick,
}: {
    title: string;
    detail: string;
    thumbnail: ReactNode;
    onClick: () => void;
}) {
    return (
        <li>
            <button
                type="button"
                onClick={onClick}
                className="flex w-full cursor-pointer items-center gap-4 rounded-st-md border border-st-border-soft p-3 text-left st-transition hover:bg-st-surface-alt"
            >
                {thumbnail}
                <span className="min-w-0 flex-1">
                    <span className="block st-strong1 break-words">
                        {title}
                    </span>
                    <span className="block st-body2 text-st-text-alt">
                        {detail}
                    </span>
                </span>
                <ChevronRight
                    className="size-5 shrink-0 text-st-text-alt"
                    aria-hidden
                />
            </button>
        </li>
    );
}

function CreateListLink() {
    const { user, startAuth } = useStore();

    return (
        <button
            type="button"
            aria-haspopup={user ? 'dialog' : undefined}
            onClick={() => (user ? openSheet('create-list') : startAuth())}
            className="inline-flex min-h-11 cursor-pointer items-center st-emphasized1 text-st-link hover:underline"
        >
            Create a list
        </button>
    );
}

function ListsPanel() {
    const { user, saved, notes } = useStore();
    const hotels = user ? saved.flatMap((id) => hotelById(id) ?? []) : [];
    const lists = user ? (notes.lists ?? []) : [];

    if (hotels.length === 0 && lists.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 px-6 pt-16 text-center">
                <SavedCardsArt className="w-56" />
                <h2 className="pt-6 st-headline3">
                    Save what you like for later
                </h2>
                <p className="st-body2">
                    Create lists of your favourite properties to help you share,
                    compare and book.
                </p>
                <Button className="mt-2" onClick={goHome}>
                    Start your search
                </Button>
                <CreateListLink />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 px-4 pt-4">
            <ul className="flex flex-col gap-3">
                <ListCard
                    title="My next trip"
                    detail={plural(hotels.length, 'property', 'properties')}
                    onClick={() => selectTab('saved')}
                    thumbnail={
                        hotels[0] ? (
                            <HotelPhoto
                                hotel={hotels[0]}
                                className="size-16 shrink-0 rounded-st-md"
                            />
                        ) : (
                            <EmptyThumbnail />
                        )
                    }
                />
                {lists.map((name) => (
                    <ListCard
                        key={name}
                        title={name}
                        detail="0 properties"
                        onClick={() =>
                            toast(
                                `Tap the heart on a property to save it, then find it in ${name}.`,
                            )
                        }
                        thumbnail={<EmptyThumbnail />}
                    />
                ))}
            </ul>
            <div>
                <CreateListLink />
            </div>
        </div>
    );
}

function EmptyThumbnail() {
    return (
        <span
            aria-hidden
            className="flex size-16 shrink-0 items-center justify-center rounded-st-md bg-st-action-tint text-st-link"
        >
            <Heart className="size-6" />
        </span>
    );
}

function AlertsSurvey() {
    const { notes, answerSurvey, dismiss } = useStore();
    const key = `survey:${ALERTS_SURVEY}`;

    if (notes.dismissed.includes(key)) {
        return null;
    }

    const answered = (notes.surveys[ALERTS_SURVEY] ?? []).length > 0;

    return (
        <section
            aria-labelledby="alerts-survey"
            className="mx-4 mt-10 flex flex-col gap-3 rounded-st-md border border-st-border-soft p-4"
        >
            <div className="flex items-start justify-between gap-2">
                <h2 id="alerts-survey" className="st-body1">
                    I can easily set up and manage price alerts
                </h2>
                <IconButton
                    label="Dismiss survey"
                    onClick={() => dismiss(key)}
                    className="-mt-2 -mr-2"
                >
                    <X className="size-5" aria-hidden />
                </IconButton>
            </div>
            {answered ? (
                <p role="status" className="st-body2 text-st-success">
                    Thanks for your feedback.
                </p>
            ) : (
                <>
                    <div
                        role="group"
                        aria-labelledby="alerts-survey"
                        className="flex justify-between gap-2"
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                aria-label={`${value} out of 5`}
                                onClick={() =>
                                    answerSurvey(ALERTS_SURVEY, value)
                                }
                                className="size-14 cursor-pointer rounded-st-sm border border-st-border st-body1 st-transition hover:bg-st-action-tint"
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between gap-2 st-small1">
                        <span>Strongly disagree</span>
                        <span className="text-right">Strongly agree</span>
                    </div>
                </>
            )}
        </section>
    );
}

function AlertsPanel() {
    return (
        <div className="pb-4">
            <div className="flex flex-col items-center gap-4 px-6 pt-8 text-center">
                <p className="st-headline3 text-st-brand">{APP_NAME} Rewards</p>
                <BellArt className="w-44" />
                <h2 className="st-headline3">You have no saved price alerts</h2>
                <p className="st-body2">
                    Get price alerts on select flight searches – only for{' '}
                    {APP_NAME} Rewards members
                </p>
                <Button
                    className="mt-2"
                    onClick={() =>
                        toast("Flights aren't part of this prototype yet.")
                    }
                >
                    Start searching for flights
                </Button>
            </div>
            <AlertsSurvey />
        </div>
    );
}

export function SavedListsScreen() {
    const [tab, setTab] = useState<SavedTab>('lists');

    return (
        <div className="min-h-full bg-st-surface">
            <div className="st-on-brand bg-st-brand text-st-on-dark">
                <TopBar title="Saved" fallback="/" back="chevron" />
                <div
                    role="tablist"
                    aria-label="Saved"
                    className="grid grid-cols-2 gap-2 px-4 pb-3"
                >
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            id={`saved-tab-${id}`}
                            type="button"
                            role="tab"
                            aria-selected={tab === id}
                            aria-controls={`saved-panel-${id}`}
                            onClick={() => setTab(id)}
                            className={clsx(
                                'flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-st-full border st-body1 st-transition',
                                tab === id
                                    ? 'border-st-on-dark/70 bg-st-on-dark/10'
                                    : 'border-transparent hover:bg-st-on-dark/10',
                            )}
                        >
                            <Icon className="size-5" aria-hidden />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            <main
                id={`saved-panel-${tab}`}
                role="tabpanel"
                aria-labelledby={`saved-tab-${tab}`}
            >
                {tab === 'lists' ? <ListsPanel /> : <AlertsPanel />}
            </main>
        </div>
    );
}

function CreateListForm() {
    const { notes, createList } = useStore();
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    return (
        <form
            noValidate
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => {
                event.preventDefault();
                const trimmed = name.trim();

                if (!trimmed) {
                    setError('Enter a name for your list.');

                    return;
                }

                if (
                    trimmed === 'My next trip' ||
                    (notes.lists ?? []).includes(trimmed)
                ) {
                    setError('You already have a list with this name.');

                    return;
                }

                createList(trimmed);
                toast(`${trimmed} created.`);
                closeSheet();
            }}
        >
            <div className="px-4 pt-4 pb-3">
                <TextField
                    id="list-name"
                    label="List name"
                    maxLength={40}
                    value={name}
                    error={error}
                    onChange={(value) => {
                        setName(value);
                        setError(null);
                    }}
                />
            </div>
            <SheetFooter>
                <Button type="submit" className="w-full">
                    Create list
                </Button>
            </SheetFooter>
        </form>
    );
}

export function CreateListSheet({ open }: { open: boolean }) {
    return (
        <Sheet open={open} title="Create a list" variant="bottom">
            {open && <CreateListForm />}
        </Sheet>
    );
}
