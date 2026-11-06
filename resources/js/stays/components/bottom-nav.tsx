import clsx from 'clsx';
import { Heart, Luggage, Search, User } from 'lucide-react';
import { selectTab } from '../router';
import type { TabId } from '../router';

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
    return (
        <div
            role="tablist"
            aria-label="Main navigation"
            className={clsx(
                'relative z-10 grid shrink-0 grid-cols-4 border-t border-st-border-soft bg-st-surface pb-[env(safe-area-inset-bottom)]',
                hidden && 'invisible',
            )}
        >
            {TABS.map(({ id, label, icon: Icon }) => {
                const selected = id === active;

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
                            'flex min-h-(--st-tab-bar-height) cursor-pointer flex-col items-center justify-center px-0.5 st-small2 whitespace-nowrap st-transition',
                            selected ? 'text-st-link' : 'text-st-text-alt',
                        )}
                    >
                        <Icon className="size-6" aria-hidden />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
