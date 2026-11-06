import { useState } from 'react';
import { Sheet, SheetFooter } from '../components/sheet';
import { Button } from '../components/ui';
import {
    applyFilters,
    filterCount,
    FILTER_GROUPS,
    FILTERS,
    hotelsIn,
    SORTS,
} from '../data';
import { closeSheet } from '../router';
import { plural } from '../format';
import { useStore } from '../store';

function SortBody() {
    const { sort, setSort } = useStore();

    return (
        <fieldset className="overflow-y-auto pb-4">
            <legend className="sr-only">Sort properties by</legend>
            {SORTS.map((option) => (
                <label
                    key={option.id}
                    className="flex min-h-12 cursor-pointer items-center justify-between gap-3 border-b border-st-border-soft px-4 py-2 st-body1 st-transition hover:bg-st-surface-alt"
                >
                    {option.label}
                    <input
                        type="radio"
                        name="sort"
                        checked={sort === option.id}
                        onChange={() => setSort(option.id)}
                        onClick={closeSheet}
                        className="size-5 shrink-0 accent-st-action"
                    />
                </label>
            ))}
        </fieldset>
    );
}

export function SortSheet({ open }: { open: boolean }) {
    return (
        <Sheet open={open} title="Sort by" variant="bottom">
            <SortBody />
        </Sheet>
    );
}

function FilterBody() {
    const { search, filters, setFilters } = useStore();
    const [draft, setDraft] = useState(filters);
    const hotels = hotelsIn(search.destinationId);
    const matching = applyFilters(hotels, draft).length;

    const toggle = (id: string) =>
        setDraft((current) =>
            current.includes(id)
                ? current.filter((filter) => filter !== id)
                : [...current, id],
        );

    return (
        <>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <div className="flex justify-end pt-2">
                    <Button
                        variant="text"
                        disabled={draft.length === 0}
                        className="disabled:text-st-disabled-text"
                        onClick={() => setDraft([])}
                    >
                        Clear all
                    </Button>
                </div>
                {FILTER_GROUPS.map((group) => (
                    <fieldset key={group} className="mt-4 first-of-type:mt-1">
                        <legend className="pb-2 st-strong1">{group}</legend>
                        <div className="flex flex-wrap gap-2">
                            {FILTERS.filter(
                                (option) => option.group === group,
                            ).map((option) => (
                                <label
                                    key={option.id}
                                    className="st-touch inline-flex min-h-9 cursor-pointer items-center rounded-st-sm border border-st-border px-3 py-1 st-body2 st-transition hover:bg-st-surface-alt has-checked:border-st-link has-checked:bg-st-action has-checked:text-st-on-dark has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-st-link"
                                >
                                    <input
                                        type="checkbox"
                                        checked={draft.includes(option.id)}
                                        onChange={() => toggle(option.id)}
                                        className="sr-only"
                                    />
                                    {option.label} (
                                    {filterCount(hotels, draft, option)})
                                </label>
                            ))}
                        </div>
                    </fieldset>
                ))}
            </div>
            <SheetFooter className="flex items-center justify-between gap-3">
                <p role="status" className="min-w-0 st-body2">
                    <strong>{matching}</strong> of{' '}
                    {plural(hotels.length, 'property', 'properties')}
                </p>
                <Button
                    className="shrink-0"
                    onClick={() => {
                        setFilters(draft);
                        closeSheet();
                    }}
                >
                    Show results
                </Button>
            </SheetFooter>
        </>
    );
}

export function FilterSheet({ open }: { open: boolean }) {
    return (
        <Sheet open={open} title="Filter by">
            <FilterBody />
        </Sheet>
    );
}
