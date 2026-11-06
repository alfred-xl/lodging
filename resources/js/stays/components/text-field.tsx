import clsx from 'clsx';
import { CircleAlert } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode, Ref } from 'react';

export function TextField({
    id,
    label,
    error,
    inputRef,
    trailing,
    onChange,
    describedBy,
    ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    id: string;
    label: string;
    error: string | null;
    inputRef?: Ref<HTMLInputElement>;
    trailing?: ReactNode;
    describedBy?: string;
    onChange: (value: string) => void;
}) {
    const description = [error ? `${id}-error` : null, describedBy]
        .filter(Boolean)
        .join(' ');

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="st-strong2">
                {label}
            </label>
            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    aria-invalid={error !== null}
                    aria-describedby={description || undefined}
                    onChange={(event) => onChange(event.target.value)}
                    // Keeps the field above the on-screen keyboard.
                    onFocus={(event) =>
                        event.target.scrollIntoView({ block: 'center' })
                    }
                    className={clsx(
                        'min-h-12 w-full rounded-st-sm border bg-st-surface px-3 st-body1',
                        error ? 'border-st-danger' : 'border-st-border',
                        trailing && 'pr-12',
                    )}
                    {...props}
                />
                {trailing && (
                    <div className="absolute inset-y-0 right-0 flex items-center">
                        {trailing}
                    </div>
                )}
            </div>
            {error && (
                <p
                    id={`${id}-error`}
                    className="flex items-start gap-1 st-small1 text-st-danger"
                >
                    <CircleAlert
                        className="mt-0.5 size-3.5 shrink-0"
                        aria-hidden
                    />
                    {error}
                </p>
            )}
        </div>
    );
}
