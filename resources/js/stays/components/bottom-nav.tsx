import clsx from 'clsx';
import { Heart, Luggage, Search, User } from 'lucide-react';
import { selectTab } from '../router';
import type { TabId } from '../router';
import { useStore } from '../store';

const TABS: { id: TabId; label: string; icon: typeof Search }[] = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'saved', label: 'Saved', icon: Heart },
    { id: 'bookings', label: 'Bookings', icon: Luggage },
    { id: 'account', label: 'My account', icon: User },
];

export function BottomNav({
    active,
    hidden,
    onScrollToTop,
}: {
    active: TabId;
    hidden: boolean;
    onScrollToTop: () => void;
}) {
    const { user } = useStore();

    // Floats over the page, so screens with it reserve --st-bar-space at the bottom.
    return (
        <div
            className={clsx(
                'pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-[max(0.5rem,calc(env(safe-area-inset-bottom)-0.75rem))]',
                hidden && 'invisible',
            )}
        >
            <div
                role="tablist"
                aria-label="Main navigation"
                className="pointer-events-auto grid w-full max-w-[28rem] grid-cols-4 rounded-st-full border border-st-border-soft bg-st-surface/85 p-1 shadow-st-200 backdrop-blur-md"
            >
                {TABS.map(({ id, label: tabLabel, icon: Icon }) => {
                    const selected = id === active;
                    const label =
                        id === 'account' && !user ? 'Sign in' : tabLabel;

                    return (
                        <button
                            key={id}
                            id={`tab-${id}`}
                            type="button"
                            role="tab"
                            aria-label={label}
                            aria-selected={selected}
                            aria-controls={`panel-${id}`}
                            onClick={() => {
                                if (selectTab(id)) {
                                    onScrollToTop();
                                }
                            }}
                            className={clsx(
                                'flex min-h-(--st-tab-bar-height) cursor-pointer flex-col items-center justify-center rounded-st-full px-0.5 st-small2 whitespace-nowrap st-transition',
                                selected
                                    ? 'bg-st-range-fill text-st-link'
                                    : 'text-st-text',
                            )}
                        >
                            <Icon className="size-6" aria-hidden />
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
