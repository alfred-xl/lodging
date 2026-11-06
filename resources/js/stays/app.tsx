import clsx from 'clsx';
import { useLayoutEffect, useRef, useState } from 'react';
import { BottomNav } from './components/bottom-nav';
import { SheetContainerContext } from './components/sheet';
import { Button } from './components/ui';
import { goHome, lastDirection, TAB_IDS, topOf, useRouter } from './router';
import type { TabId } from './router';
import {
    AccountScreen,
    CurrencyScreen,
    DevicePreferencesScreen,
    InfoScreen,
    LanguageScreen,
    NotificationsScreen,
    SignOutSheet,
} from './screens/account';
import {
    AddCardScreen,
    PaymentDetailsScreen,
    RemoveCardSheet,
    TransactionDetailsScreen,
    TransactionsScreen,
} from './screens/account-payments';
import {
    EditProfileScreen,
    PersonalDetailsScreen,
} from './screens/account-personal';
import {
    CouponSheet,
    RewardsActivityScreen,
    WalletCreditsSheet,
    WalletFaqScreen,
    WalletScreen,
} from './screens/account-wallet';
import {
    AuthForgotScreen,
    AuthPasswordScreen,
    AuthProfileScreen,
    AuthStartScreen,
    AuthVerifyScreen,
} from './screens/auth';
import { BookingsScreen, TripMenuSheet } from './screens/bookings';
import { ConfirmationScreen } from './screens/confirmation';
import { DatesSheet } from './screens/dates';
import { DestinationSheet } from './screens/destination';
import { GuestsSheet } from './screens/guests';
import { HomeScreen } from './screens/home';
import { MapSheet } from './screens/map';
import { PhotoCreditsScreen, PropertyScreen } from './screens/property';
import { ResultsScreen } from './screens/results';
import { ReviewScreen } from './screens/review';
import { RoomsScreen } from './screens/rooms';
import { SavedScreen } from './screens/saved';
import { RateScreen, StayScreen, TripInfoScreen } from './screens/stay';
import { FilterSheet, SortSheet } from './screens/sheets';
import { StoreProvider, useStore } from './store';
import { APP_NAME, themeVariables } from './theme';

// Results and property pages keep the bar so each tab's stack can be left and returned to.
const SCREENS_WITH_BAR = [undefined, 'results', 'property', 'stay', 'wallet'];

function segmentsOf(entry: string): string[] {
    return entry.split('?')[0].split('/').filter(Boolean);
}

function NotFound() {
    return (
        <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <h1 className="st-headline3">We can't find that page</h1>
            <p className="st-body2 text-st-text-alt">
                It may have moved. Start a new search from the home screen.
            </p>
            <Button onClick={goHome}>Go to Home</Button>
        </div>
    );
}

function RootScreen({ tab }: { tab: TabId }) {
    switch (tab) {
        case 'saved':
            return <SavedScreen />;
        case 'bookings':
            return <BookingsScreen />;
        case 'account':
            return <AccountScreen />;
        default:
            return <HomeScreen />;
    }
}

function AuthScreen({ segments }: { segments: string[] }) {
    switch (segments[1]) {
        case undefined:
            return <AuthStartScreen />;
        case 'verify':
            return <AuthVerifyScreen />;
        case 'password':
            return <AuthPasswordScreen />;
        case 'forgot':
            return <AuthForgotScreen />;
        case 'profile':
            return <AuthProfileScreen />;
        case 'info':
            return <InfoScreen slug={segments[2]} />;
        default:
            return <NotFound />;
    }
}

function CurrentScreen({ tab, entry }: { tab: TabId; entry: string }) {
    const segments = segmentsOf(entry);
    const [first, second, third, fourth] = segments;

    switch (first) {
        case undefined:
            return <RootScreen tab={tab} />;
        case 'auth':
            return <AuthScreen segments={segments} />;
        case 'results':
            return (
                <ResultsScreen
                    simulateError={
                        import.meta.env.DEV && entry.includes('simulate=error')
                    }
                />
            );
        case 'property':
            return <PropertyScreen hotelId={second} />;
        case 'rooms':
            return <RoomsScreen hotelId={second} />;
        case 'photo-credits':
            return <PhotoCreditsScreen hotelId={second} />;
        case 'review':
            return (
                <ReviewScreen hotelId={second} roomId={third} rateId={fourth} />
            );
        case 'confirmation':
            return <ConfirmationScreen reference={second} />;
        case 'stay':
            return <StayScreen bookingId={second} />;
        case 'rate':
            return <RateScreen bookingId={second} />;
        case 'trip-info':
            return <TripInfoScreen slug={second} />;
        case 'info':
            return <InfoScreen slug={second} />;
        case 'personal-details':
            return <PersonalDetailsScreen />;
        case 'edit-profile':
            return <EditProfileScreen field={second} />;
        case 'wallet':
            return <WalletScreen />;
        case 'rewards-activity':
            return <RewardsActivityScreen />;
        case 'wallet-faqs':
            return <WalletFaqScreen />;
        case 'payment-details':
            return <PaymentDetailsScreen />;
        case 'add-card':
            return <AddCardScreen />;
        case 'transactions':
            return <TransactionsScreen />;
        case 'transaction':
            return <TransactionDetailsScreen transactionId={second} />;
        case 'device-preferences':
            return <DevicePreferencesScreen />;
        case 'currency':
            return <CurrencyScreen />;
        case 'language':
            return <LanguageScreen />;
        case 'notifications':
            return <NotificationsScreen />;
        default:
            return <NotFound />;
    }
}

function TabPane({
    tab,
    entry,
    active,
    scrollerRef,
}: {
    tab: TabId;
    entry: string;
    active: boolean;
    scrollerRef: (element: HTMLDivElement | null) => void;
}) {
    const { dataVersion } = useStore();
    const scroller = useRef<HTMLDivElement | null>(null);
    const positions = useRef(new Map<string, number>());

    // Going back returns to the earlier scroll position, going forward starts at the top.
    useLayoutEffect(() => {
        scroller.current?.scrollTo({
            top:
                lastDirection() === 'back'
                    ? (positions.current.get(entry) ?? 0)
                    : 0,
        });
    }, [entry]);

    return (
        <div
            ref={(element) => {
                scroller.current = element;
                scrollerRef(element);
            }}
            id={`panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            inert={!active}
            data-active={active}
            onScroll={(event) =>
                positions.current.set(entry, event.currentTarget.scrollTop)
            }
            className={clsx(
                'absolute inset-0 overflow-x-hidden overflow-y-auto',
                !active && 'invisible',
            )}
        >
            <CurrentScreen
                key={`${entry}:${dataVersion}`}
                tab={tab}
                entry={entry}
            />
        </div>
    );
}

function Frame() {
    const router = useRouter();
    const [frame, setFrame] = useState<HTMLElement | null>(null);
    const [visited, setVisited] = useState<TabId[]>([router.tab]);
    const scrollers = useRef(new Map<TabId, HTMLDivElement>());

    // Tabs mount on first visit and then stay mounted, which keeps their state and scroll.
    if (!visited.includes(router.tab)) {
        setVisited([...visited, router.tab]);
    }

    const activeEntry = topOf(router, router.tab);
    const showBar = SCREENS_WITH_BAR.includes(segmentsOf(activeEntry)[0]);

    return (
        <div
            ref={setFrame}
            className="relative flex h-full w-full flex-col overflow-hidden bg-st-surface text-st-text sm:max-w-[30rem] sm:border-x sm:border-st-border-soft"
        >
            <SheetContainerContext.Provider value={frame}>
                <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 z-20 h-[env(safe-area-inset-top)] bg-st-brand"
                />
                <div className="relative min-h-0 flex-1">
                    {TAB_IDS.filter((tab) => visited.includes(tab)).map(
                        (tab) => (
                            <TabPane
                                key={tab}
                                tab={tab}
                                entry={topOf(router, tab)}
                                active={tab === router.tab}
                                scrollerRef={(element) => {
                                    if (element) {
                                        scrollers.current.set(tab, element);
                                    }
                                }}
                            />
                        ),
                    )}
                </div>
                {showBar && (
                    <BottomNav
                        active={router.tab}
                        hidden={router.sheet !== null}
                        onScrollToTop={() =>
                            scrollers.current
                                .get(router.tab)
                                ?.scrollTo({ top: 0 })
                        }
                    />
                )}
                <DestinationSheet open={router.sheet?.name === 'destination'} />
                <DatesSheet open={router.sheet?.name === 'dates'} />
                <GuestsSheet open={router.sheet?.name === 'guests'} />
                <SortSheet open={router.sheet?.name === 'sort'} />
                <FilterSheet open={router.sheet?.name === 'filter'} />
                <MapSheet
                    open={router.sheet?.name === 'map'}
                    hotelId={router.sheet?.params.hotel ?? null}
                />
                <SignOutSheet open={router.sheet?.name === 'signout'} />
                <CouponSheet open={router.sheet?.name === 'coupon'} />
                <WalletCreditsSheet
                    open={router.sheet?.name === 'wallet-credits'}
                />
                <RemoveCardSheet
                    open={router.sheet?.name === 'remove-card'}
                    cardId={router.sheet?.params.card ?? null}
                />
                <TripMenuSheet
                    open={router.sheet?.name === 'trip-menu'}
                    bookingId={router.sheet?.params.booking ?? null}
                />
            </SheetContainerContext.Provider>
        </div>
    );
}

// Screens read the catalogue directly, so none mount until it has loaded. Starting
// them earlier would mean restarting them later and losing what people had typed.
function CatalogueFrame() {
    const { catalogueStatus } = useStore();

    if (catalogueStatus === 'loading') {
        return (
            <div
                role="status"
                className="flex h-full w-full items-center justify-center bg-st-brand st-headline1 text-st-on-dark"
            >
                {APP_NAME}
                <span className="sr-only"> is loading</span>
            </div>
        );
    }

    return <Frame key={catalogueStatus} />;
}

export function StaysApp() {
    return (
        <StoreProvider>
            <div
                style={themeVariables}
                className="st-root fixed inset-0 flex justify-center bg-st-surface"
            >
                <CatalogueFrame />
            </div>
        </StoreProvider>
    );
}
