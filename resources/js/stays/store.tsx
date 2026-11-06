import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
    applyChanges,
    blankAccount,
    cardFrom,
    createCard,
    deleteAvatar,
    deleteCard,
    fetchAccount,
    patchAccount,
    shrinkPhoto,
    uploadAvatar,
} from './account-data';
import type {
    AccountDetails,
    AccountResult,
    FieldErrors,
    NewCard,
    ProfileChanges,
} from './account-data';
import {
    clearSession,
    endServerSession,
    fetchTrips,
    loadSession,
    saveSession,
} from './auth/mock-auth';
import type { User } from './auth/mock-auth';
import { fetchCatalogue } from './api';
import { defaultSearch, loadCatalogue, registerHotel } from './data';
import type { Search, SortId } from './data';
import { bookingsFor } from './fixtures/bookings';
import { navigate } from './router';

export type BookingStatus = 'active' | 'past' | 'cancelled';

export type MockBooking = {
    id: string;
    reference: string;
    status: BookingStatus;
    hotelId: string;
    roomId: string;
    rateId: string;
    search: Search;
    guestName?: string;
    contactEmail?: string;
    benefits?: string;
    totalText?: string;
    fromServer?: boolean;
};

export type Prefs = {
    currency: string;
    language: string;
    notifications: Record<string, boolean>;
};

export type AuthIntent =
    | { type: 'save'; hotelId: string }
    | { type: 'reserve'; to: string }
    | null;

export type AuthDraft = {
    email: string;
    existing: boolean;
    remote?: boolean;
    code: string;
    sentAt: number;
};

export type StayNotes = {
    ratings: Record<string, { score: number; comment: string }>;
    surveys: Record<string, number[]>;
    dismissed: string[];
};

const EMPTY_NOTES: StayNotes = { ratings: {}, surveys: {}, dismissed: [] };

type Session = {
    user: User;
    saved: string[];
    bookings: MockBooking[];
    prefs: Prefs;
    notes?: StayNotes;
    account?: AccountDetails;
};

const DEFAULT_PREFS: Prefs = {
    currency: 'GBP',
    language: 'English (UK)',
    notifications: {
        bookings: true,
        deals: false,
        prices: true,
        reviews: false,
    },
};

type Store = {
    search: Search;
    updateSearch: (changes: Partial<Search>) => void;
    filters: string[];
    setFilters: (filters: string[]) => void;
    sort: SortId;
    setSort: (sort: SortId) => void;
    loadedKey: string | null;
    setLoadedKey: (key: string) => void;
    user: User | null;
    signIn: (user: User) => void;
    signOut: () => void;
    saved: string[];
    addSaved: (hotelId: string) => void;
    toggleSaved: (hotelId: string) => void;
    bookings: MockBooking[];
    tripsLoading: boolean;
    catalogueStatus: 'loading' | 'ready' | 'error';
    reloadCatalogue: () => void;
    dataVersion: string;
    addBooking: (booking: MockBooking) => void;
    cancelBooking: (id: string) => void;
    tripsTab: BookingStatus;
    setTripsTab: (tab: BookingStatus) => void;
    notes: StayNotes;
    rateStay: (id: string, score: number, comment: string) => void;
    answerSurvey: (id: string, answer: number) => void;
    dismiss: (key: string) => void;
    prefs: Prefs;
    setPrefs: (changes: Partial<Prefs>) => void;
    account: AccountDetails | null;
    accountStatus: 'loading' | 'ready' | 'error';
    reloadAccount: () => void;
    saveProfile: (changes: ProfileChanges) => Promise<FieldErrors | null>;
    savePhoto: (photo: File | null) => Promise<FieldErrors | null>;
    addCard: (card: NewCard) => Promise<FieldErrors | null>;
    removeCard: (id: string) => Promise<FieldErrors | null>;
    authDraft: AuthDraft | null;
    setAuthDraft: (draft: AuthDraft | null) => void;
    authIntent: AuthIntent;
    setAuthIntent: (intent: AuthIntent) => void;
    startAuth: (intent?: AuthIntent) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
    const [restored] = useState(() => loadSession<Session>());
    const [search, setSearch] = useState<Search>(defaultSearch);
    const [filters, setFilters] = useState<string[]>([]);
    const [sort, setSort] = useState<SortId>('top');
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(restored?.user ?? null);
    const [saved, setSaved] = useState<string[]>(restored?.saved ?? []);
    const [bookings, setBookings] = useState<MockBooking[]>(
        restored?.bookings ?? [],
    );
    const [prefs, setPrefsState] = useState<Prefs>(
        restored?.prefs ?? DEFAULT_PREFS,
    );
    const [tripsTab, setTripsTab] = useState<BookingStatus>('active');
    const [notes, setNotes] = useState<StayNotes>(
        restored?.notes ?? EMPTY_NOTES,
    );
    // Mock accounts keep their details on this device. Database accounts load them below.
    const [localAccount, setLocalAccount] = useState<AccountDetails | null>(
        restored?.account ?? null,
    );
    const [remoteAccount, setRemoteAccount] = useState<AccountDetails | null>(
        null,
    );
    const [accountFailed, setAccountFailed] = useState(false);
    const [accountAttempt, setAccountAttempt] = useState(0);
    const [authDraft, setAuthDraft] = useState<AuthDraft | null>(null);
    const [authIntent, setAuthIntent] = useState<AuthIntent>(null);

    const [catalogueStatus, setCatalogueStatus] = useState<
        'loading' | 'ready' | 'error'
    >('loading');
    const [catalogueAttempt, setCatalogueAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;

        fetchCatalogue()
            .then(({ destinations, properties }) => {
                if (!cancelled) {
                    loadCatalogue(destinations, properties);
                    setCatalogueStatus('ready');
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setCatalogueStatus('error');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [catalogueAttempt]);

    // Accounts in the database get their bookings from the server on every launch.
    const [loadedFor, setLoadedFor] = useState<string | null>(null);
    const remoteEmail = user?.remote ? user.email : null;

    useEffect(() => {
        if (!remoteEmail) {
            return;
        }

        let cancelled = false;

        fetchTrips()
            .then((trips) => {
                if (cancelled) {
                    return;
                }

                // Signed out on the server, or signed in there as someone else.
                if (!trips || trips.email !== remoteEmail) {
                    setUser(null);
                    setBookings([]);
                    setSaved([]);

                    return;
                }

                setUser((current) =>
                    current && current.avatarUrl !== trips.avatarUrl
                        ? { ...current, avatarUrl: trips.avatarUrl }
                        : current,
                );
                trips.hotels.forEach(registerHotel);
                setBookings((current) => [
                    ...current.filter((item) => !item.fromServer),
                    ...trips.bookings,
                ]);
                setLoadedFor(remoteEmail);
            })
            .catch(() => {
                if (!cancelled) {
                    setLoadedFor(remoteEmail);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [remoteEmail]);

    useEffect(() => {
        if (!remoteEmail) {
            return;
        }

        let cancelled = false;

        fetchAccount()
            .then((details) => {
                // A signed-out server session is handled by the trips request.
                if (!cancelled && details && details.email === remoteEmail) {
                    setRemoteAccount(details);
                    setAccountFailed(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setAccountFailed(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [remoteEmail, accountAttempt]);

    const account = user
        ? user.remote
            ? remoteAccount?.email === user.email
                ? remoteAccount
                : null
            : (localAccount ?? blankAccount(user))
        : null;

    // Keeps the header's name and photo in step with what the server sends back.
    const applyRemote = (result: AccountResult): FieldErrors | null => {
        if (result.errors) {
            return result.errors;
        }

        const { details } = result;
        setRemoteAccount(details);
        setUser((current) =>
            current
                ? {
                      ...current,
                      firstName: details.firstName,
                      lastName: details.lastName,
                      avatarUrl: details.avatarUrl,
                  }
                : current,
        );

        return null;
    };

    const applyLocal = (next: AccountDetails): null => {
        setLocalAccount(next);
        setUser((current) =>
            current
                ? {
                      ...current,
                      firstName: next.firstName,
                      lastName: next.lastName,
                      avatarUrl: next.avatarUrl,
                  }
                : current,
        );

        return null;
    };

    useEffect(() => {
        if (user) {
            saveSession({
                user,
                saved,
                bookings: bookings.filter((item) => !item.fromServer),
                prefs,
                notes,
                account: user.remote ? undefined : (localAccount ?? undefined),
            } satisfies Session);
        } else {
            clearSession();
        }
    }, [user, saved, bookings, prefs, notes, localAccount]);

    const store = useMemo<Store>(
        () => ({
            search,
            updateSearch: (changes) =>
                setSearch((current) => ({ ...current, ...changes })),
            filters,
            setFilters,
            sort,
            setSort,
            loadedKey,
            setLoadedKey,
            user,
            signIn: (nextUser) => {
                setUser(nextUser);
                setBookings(nextUser.remote ? [] : bookingsFor(nextUser.email));
                setLocalAccount(null);
                setRemoteAccount(null);
                setAuthDraft(null);
            },
            signOut: () => {
                if (user?.remote) {
                    endServerSession();
                }

                setLoadedFor(null);
                setUser(null);
                setSaved([]);
                setBookings([]);
                setPrefsState(DEFAULT_PREFS);
                setNotes(EMPTY_NOTES);
                setLocalAccount(null);
                setRemoteAccount(null);
            },
            saved,
            addSaved: (hotelId) =>
                setSaved((current) =>
                    current.includes(hotelId) ? current : [...current, hotelId],
                ),
            toggleSaved: (hotelId) =>
                setSaved((current) =>
                    current.includes(hotelId)
                        ? current.filter((id) => id !== hotelId)
                        : [...current, hotelId],
                ),
            bookings,
            tripsLoading: remoteEmail !== null && loadedFor !== remoteEmail,
            dataVersion: `${loadedFor}:${catalogueStatus}`,
            catalogueStatus,
            reloadCatalogue: () => {
                setCatalogueStatus('loading');
                setCatalogueAttempt((attempt) => attempt + 1);
            },
            addBooking: (booking) =>
                setBookings((current) => [booking, ...current]),
            cancelBooking: (id) =>
                setBookings((current) =>
                    current.map((item) =>
                        item.id === id
                            ? { ...item, status: 'cancelled' }
                            : item,
                    ),
                ),
            tripsTab,
            setTripsTab,
            notes,
            rateStay: (id, score, comment) =>
                setNotes((current) => ({
                    ...current,
                    ratings: { ...current.ratings, [id]: { score, comment } },
                })),
            answerSurvey: (id, answer) =>
                setNotes((current) => ({
                    ...current,
                    surveys: {
                        ...current.surveys,
                        [id]: [...(current.surveys[id] ?? []), answer],
                    },
                })),
            dismiss: (key) =>
                setNotes((current) => ({
                    ...current,
                    dismissed: [...current.dismissed, key],
                })),
            prefs,
            setPrefs: (changes) =>
                setPrefsState((current) => ({ ...current, ...changes })),
            account,
            accountStatus: account
                ? 'ready'
                : accountFailed
                  ? 'error'
                  : 'loading',
            reloadAccount: () => {
                setAccountFailed(false);
                setAccountAttempt((attempt) => attempt + 1);
            },
            saveProfile: async (changes) => {
                if (!account) {
                    return null;
                }

                return user?.remote
                    ? applyRemote(await patchAccount(changes))
                    : applyLocal(applyChanges(account, changes));
            },
            savePhoto: async (photo) => {
                if (!account) {
                    return null;
                }

                if (user?.remote) {
                    return applyRemote(
                        await (photo ? uploadAvatar(photo) : deleteAvatar()),
                    );
                }

                try {
                    return applyLocal({
                        ...account,
                        avatarUrl: photo ? await shrinkPhoto(photo) : undefined,
                    });
                } catch (error) {
                    return { photo: (error as Error).message };
                }
            },
            addCard: async (card) => {
                if (!account) {
                    return null;
                }

                return user?.remote
                    ? applyRemote(await createCard(card))
                    : applyLocal({
                          ...account,
                          cards: [cardFrom(card), ...account.cards],
                      });
            },
            removeCard: async (id) => {
                if (!account) {
                    return null;
                }

                return user?.remote
                    ? applyRemote(await deleteCard(id))
                    : applyLocal({
                          ...account,
                          cards: account.cards.filter((card) => card.id !== id),
                      });
            },
            authDraft,
            setAuthDraft,
            authIntent,
            setAuthIntent,
            startAuth: (intent = null) => {
                setAuthIntent(intent);
                navigate('/auth');
            },
        }),
        [
            search,
            filters,
            sort,
            loadedKey,
            user,
            saved,
            bookings,
            tripsTab,
            notes,
            prefs,
            authDraft,
            authIntent,
            remoteEmail,
            loadedFor,
            catalogueStatus,
            localAccount,
            remoteAccount,
            accountFailed,
        ],
    );

    return (
        <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
}

export function useStore(): Store {
    const store = useContext(StoreContext);

    if (!store) {
        throw new Error('useStore must be used inside StoreProvider');
    }

    return store;
}
