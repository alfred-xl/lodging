import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Sheet, SheetFooter } from '../components/sheet';
import { Button } from '../components/ui';
import {
    addDays,
    formatFull,
    monthTitle,
    nightsBetween,
    parseIso,
    plural,
    toIso,
    todayIso,
} from '../format';
import { closeSheet } from '../router';
import { useStore } from '../store';

const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS_AHEAD = 12;

const ARROW_STEPS: Record<string, number> = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -7,
    ArrowDown: 7,
};

function monthsFrom(today: string) {
    const start = parseIso(today);

    return Array.from({ length: MONTHS_AHEAD }, (_, index) => {
        const first = new Date(
            start.getFullYear(),
            start.getMonth() + index,
            1,
        );

        return { year: first.getFullYear(), month: first.getMonth() };
    });
}

function daysIn(year: number, month: number): string[] {
    const count = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: count }, (_, index) =>
        toIso(new Date(year, month, index + 1)),
    );
}

function DatesBody() {
    const { search, updateSearch } = useStore();
    const today = todayIso();
    const [start, setStart] = useState<string>(search.checkIn);
    const [end, setEnd] = useState<string | null>(search.checkOut);
    const [cursor, setCursor] = useState<string>(search.checkIn);
    const scroller = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scroller.current
            ?.querySelector(`[data-date="${search.checkIn}"]`)
            ?.closest('section')
            ?.scrollIntoView({ block: 'start' });
    }, [search.checkIn]);

    const choose = (date: string) => {
        setCursor(date);

        if (end !== null || date <= start) {
            setStart(date);
            setEnd(null);
        } else {
            setEnd(date);
        }
    };

    const moveCursor = (event: KeyboardEvent<HTMLDivElement>) => {
        const step = ARROW_STEPS[event.key];

        if (!step) {
            return;
        }

        event.preventDefault();

        const next = addDays(cursor, step);
        const button = scroller.current?.querySelector<HTMLButtonElement>(
            `[data-date="${next}"]`,
        );

        if (next >= today && button) {
            setCursor(next);
            button.focus();
        }
    };

    const nights = end ? nightsBetween(start, end) : 0;

    return (
        <>
            <div
                ref={scroller}
                onKeyDown={moveCursor}
                className="min-h-0 flex-1 overflow-y-auto px-2 pb-4"
            >
                {monthsFrom(today).map(({ year, month }) => {
                    const days = daysIn(year, month);
                    const leadingBlanks = (parseIso(days[0]).getDay() + 6) % 7;

                    return (
                        <section
                            key={`${year}-${month}`}
                            aria-label={monthTitle(year, month)}
                            className="pt-4"
                        >
                            <h2 className="px-2 pb-2 st-strong1">
                                {monthTitle(year, month)}
                            </h2>
                            <div
                                aria-hidden
                                className="grid grid-cols-7 text-center st-small2 text-st-text-alt"
                            >
                                {WEEK.map((day) => (
                                    <span key={day} className="py-1">
                                        {day}
                                    </span>
                                ))}
                            </div>
                            <div className="grid grid-cols-7">
                                {Array.from(
                                    { length: leadingBlanks },
                                    (_, index) => (
                                        <span key={`blank-${index}`} />
                                    ),
                                )}
                                {days.map((date) => {
                                    const isPast = date < today;
                                    const isStart = date === start;
                                    const isEnd = date === end;
                                    const isBetween =
                                        end !== null &&
                                        date > start &&
                                        date < end;

                                    return (
                                        <button
                                            key={date}
                                            type="button"
                                            data-date={date}
                                            disabled={isPast}
                                            tabIndex={date === cursor ? 0 : -1}
                                            aria-label={formatFull(date)}
                                            aria-pressed={
                                                isStart || isEnd || isBetween
                                            }
                                            onClick={() => choose(date)}
                                            className={clsx(
                                                'h-11 cursor-pointer st-body2 st-transition disabled:cursor-not-allowed disabled:text-st-disabled-text',
                                                (isStart || isEnd) &&
                                                    'bg-st-action font-bold text-st-on-dark',
                                                isStart && 'rounded-l-st-sm',
                                                isEnd && 'rounded-r-st-sm',
                                                isBetween &&
                                                    'bg-st-range-fill font-bold',
                                                !isStart &&
                                                    !isEnd &&
                                                    !isBetween &&
                                                    !isPast &&
                                                    'hover:bg-st-action-tint',
                                            )}
                                        >
                                            {parseIso(date).getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>
            <SheetFooter>
                <Button
                    className="w-full"
                    disabled={end === null}
                    onClick={() => {
                        if (end) {
                            updateSearch({ checkIn: start, checkOut: end });
                            closeSheet();
                        }
                    }}
                >
                    {end
                        ? `Select dates (${plural(nights, 'night')})`
                        : 'Select your check-out date'}
                </Button>
            </SheetFooter>
        </>
    );
}

export function DatesSheet({ open }: { open: boolean }) {
    return (
        <Sheet open={open} title="Select dates">
            <DatesBody />
        </Sheet>
    );
}
