import { useSyncExternalStore } from 'react';
import type { AnchorHTMLAttributes, MouseEvent } from 'react';

export type TabId = 'search' | 'saved' | 'bookings' | 'account';

export const TAB_IDS: TabId[] = ['search', 'saved', 'bookings', 'account'];

const TAB_PREFIX: Record<TabId, string> = {
    search: '',
    saved: '/saved',
    bookings: '/bookings',
    account: '/account',
};

export type SheetState = {
    name: string;
    params: Record<string, string>;
} | null;

export type RouterState = {
    tab: TabId;
    stacks: Record<TabId, string[]>;
    sheet: SheetState;
};

// Each history entry holds the whole state, so browser back restores every tab's stack.
type HistoryEntry = {
    router: RouterState;
    prevKey: string | null;
    depth: number;
};

const listeners = new Set<() => void>();
let direction: 'forward' | 'back' = 'forward';
let sheetOpener: Element | null = null;
let afterPop: (() => void) | null = null;

function keyOf(state: RouterState): string {
    return JSON.stringify(state);
}

function freshStacks(): Record<TabId, string[]> {
    return { search: ['/'], saved: ['/'], bookings: ['/'], account: ['/'] };
}

export function topOf(state: RouterState, tab: TabId): string {
    const stack = state.stacks[tab];

    return stack[stack.length - 1];
}

function hashOf(state: RouterState): string {
    const [path, queryString = ''] = topOf(state, state.tab).split('?');
    const query = new URLSearchParams(queryString);

    if (state.sheet) {
        query.set('sheet', state.sheet.name);
        Object.entries(state.sheet.params).forEach(([key, value]) =>
            query.set(key, value),
        );
    }

    const prefix = TAB_PREFIX[state.tab];
    const fullPath = path === '/' && prefix ? prefix : `${prefix}${path}`;
    const suffix = query.toString();

    return `#${fullPath}${suffix ? `?${suffix}` : ''}`;
}

function parseHash(
    hash: string,
    stacks: Record<TabId, string[]> = freshStacks(),
): RouterState {
    const [path, queryString = ''] = (hash.replace(/^#/, '') || '/').split('?');
    const query = new URLSearchParams(queryString);
    const tab =
        TAB_IDS.find(
            (id) =>
                TAB_PREFIX[id] !== '' &&
                (path === TAB_PREFIX[id] ||
                    path.startsWith(`${TAB_PREFIX[id]}/`)),
        ) ?? 'search';
    const relative = path.slice(TAB_PREFIX[tab].length) || '/';

    const sheetName = query.get('sheet');
    const simulate = query.get('simulate');
    query.delete('sheet');
    query.delete('simulate');

    const entry = simulate ? `${relative}?simulate=${simulate}` : relative;
    const stack =
        relative === '/' ? ['/'] : tab === 'search' ? [entry] : ['/', entry];

    return {
        tab,
        stacks: { ...stacks, [tab]: stack },
        sheet: sheetName
            ? { name: sheetName, params: Object.fromEntries(query.entries()) }
            : null,
    };
}

function currentEntry(): HistoryEntry | null {
    return window.history.state as HistoryEntry | null;
}

let current: RouterState =
    currentEntry()?.router ?? parseHash(window.location.hash);

window.history.replaceState(
    {
        router: current,
        prevKey: currentEntry()?.prevKey ?? null,
        depth: currentEntry()?.depth ?? 0,
    } satisfies HistoryEntry,
    '',
);

function notify(): void {
    listeners.forEach((listener) => listener());
}

window.addEventListener('popstate', (event) => {
    const entry = event.state as HistoryEntry | null;
    const previous = current;

    current = entry?.router ?? parseHash(window.location.hash, current.stacks);

    // A hand-edited hash arrives with no state, so it's recorded like a normal visit.
    if (!entry) {
        window.history.replaceState(
            {
                router: current,
                prevKey: keyOf(previous),
                depth: 1,
            } satisfies HistoryEntry,
            '',
        );
    }

    direction = 'back';
    notify();

    const callback = afterPop;
    afterPop = null;
    callback?.();
});

function commit(next: RouterState, options: { replace?: boolean } = {}): void {
    const entry = currentEntry();

    if (options.replace) {
        window.history.replaceState(
            {
                router: next,
                prevKey: entry?.prevKey ?? null,
                depth: entry?.depth ?? 0,
            } satisfies HistoryEntry,
            '',
            hashOf(next),
        );
    } else {
        window.history.pushState(
            {
                router: next,
                prevKey: keyOf(current),
                depth: (entry?.depth ?? 0) + 1,
            } satisfies HistoryEntry,
            '',
            hashOf(next),
        );
    }

    current = next;
    notify();
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

export function useRouter(): RouterState {
    return useSyncExternalStore(
        subscribe,
        () => current,
        () => current,
    );
}

function withStack(stack: string[]): RouterState {
    return {
        ...current,
        sheet: null,
        stacks: { ...current.stacks, [current.tab]: stack },
    };
}

// Paths are relative to the active tab, so a property opened from Saved stays in Saved.
export function navigate(
    to: string,
    options: { replace?: boolean } = {},
): void {
    const stack = current.stacks[current.tab];
    let next: string[];

    if (to === '/') {
        next = ['/'];
    } else if (options.replace) {
        next = [...stack.slice(0, -1), to];
    } else {
        next = [...stack, to];
    }

    direction = 'forward';
    commit(withStack(next), options);
}

// Uses browser history when that's the way we came, so back and forward stay in step.
function retreatTo(target: RouterState): void {
    if (keyOf(target) === keyOf(current)) {
        return;
    }

    if (keyOf(target) === currentEntry()?.prevKey) {
        window.history.back();

        return;
    }

    direction = 'back';
    commit(target);
}

export function goBack(fallback: string): void {
    const stack = current.stacks[current.tab];

    retreatTo(withStack(stack.length > 1 ? stack.slice(0, -1) : [fallback]));
}

// Returns true when the tab is already at its root, so the caller can scroll to the top.
export function selectTab(tab: TabId): boolean {
    if (tab !== current.tab) {
        commit({ ...current, tab, sheet: null });

        return false;
    }

    if (current.stacks[tab].length > 1) {
        direction = 'forward';
        commit(withStack(['/']));

        return false;
    }

    return true;
}

export function goHome(): void {
    direction = 'forward';
    commit({
        tab: 'search',
        sheet: null,
        stacks: { ...current.stacks, [current.tab]: ['/'], search: ['/'] },
    });
}

export function openSheet(
    name: string,
    params: Record<string, string> = {},
): void {
    sheetOpener = document.activeElement;
    commit({ ...current, sheet: { name, params } });
}

export function closeSheet(): void {
    retreatTo({ ...current, sheet: null });
}

export function restoreSheetFocus(): void {
    if (sheetOpener instanceof HTMLElement) {
        sheetOpener.focus();
    }

    sheetOpener = null;
}

export function isAuthEntry(entry: string): boolean {
    return entry === '/auth' || entry.startsWith('/auth/');
}

// Closes the sign-in flow in one step, then runs `then` from where the user started.
export function leaveAuth(then?: () => void): void {
    if (afterPop) {
        return;
    }

    const stack = current.stacks[current.tab];
    const kept = stack.filter((entry) => !isAuthEntry(entry));
    const count = stack.length - kept.length;

    if (count === 0) {
        then?.();

        return;
    }

    if ((currentEntry()?.depth ?? 0) >= count) {
        afterPop = () => then?.();
        window.history.go(-count);

        return;
    }

    direction = 'back';
    commit(withStack(kept.length > 0 ? kept : ['/']), { replace: true });
    then?.();
}

export function lastDirection(): 'forward' | 'back' {
    return direction;
}

export function Link({
    to,
    onClick,
    children,
    ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
    const { tab } = useRouter();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);

        if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
            event.preventDefault();
            navigate(to);
        }
    };

    return (
        <a href={`#${TAB_PREFIX[tab]}${to}`} onClick={handleClick} {...props}>
            {children}
        </a>
    );
}
