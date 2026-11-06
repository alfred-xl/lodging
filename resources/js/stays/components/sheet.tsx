import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { closeSheet, restoreSheetFocus } from '../router';
import { IconButton } from './ui';

// Sheets portal into the phone frame so they stay inside it on wide screens.
export const SheetContainerContext = createContext<HTMLElement | null>(null);

export function Sheet({
    open,
    title,
    variant = 'full',
    children,
}: {
    open: boolean;
    title: string;
    variant?: 'full' | 'bottom';
    children: ReactNode;
}) {
    const container = useContext(SheetContainerContext);

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    closeSheet();
                }
            }}
        >
            <Dialog.Portal container={container}>
                <Dialog.Overlay className="st-overlay absolute inset-0 z-30 bg-st-overlay" />
                <Dialog.Content
                    aria-describedby={undefined}
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                        restoreSheetFocus();
                    }}
                    className={clsx(
                        'st-sheet absolute inset-x-0 z-40 flex flex-col bg-st-surface text-st-text shadow-st-200',
                        variant === 'full'
                            ? 'inset-y-0 st-safe-top'
                            : 'bottom-0 max-h-[85%] rounded-t-st-lg',
                    )}
                >
                    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-1 border-b border-st-border-soft px-1">
                        <Dialog.Close asChild>
                            <IconButton
                                label={`Close ${title.toLowerCase()}`}
                                className="hover:bg-st-action-tint"
                            >
                                <X className="size-6" aria-hidden />
                            </IconButton>
                        </Dialog.Close>
                        <Dialog.Title className="truncate text-center st-strong1">
                            {title}
                        </Dialog.Title>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col">
                        {children}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export function SheetFooter({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={clsx(
                'shrink-0 border-t border-st-border-soft bg-st-surface px-4 pt-3 st-safe-bottom',
                className,
            )}
        >
            {children}
        </div>
    );
}
