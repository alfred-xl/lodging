import type { ReactNode } from 'react';
import { useStore } from '../store';
import { Button } from './ui';

export function RootHeader({ title }: { title: string }) {
    return (
        <header className="st-on-brand bg-st-brand st-safe-top text-st-on-dark">
            <h1 className="py-3 text-center st-headline3">{title}</h1>
        </header>
    );
}

export function EmptyState({
    icon,
    title,
    body,
    children,
}: {
    icon: ReactNode;
    title: string;
    body: string;
    children: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            {icon}
            <h2 className="st-headline3">{title}</h2>
            <p className="st-body2 text-st-text-alt">{body}</p>
            {children}
        </div>
    );
}

export function SignInButtons() {
    const { startAuth } = useStore();

    return (
        <div className="flex w-full flex-col gap-2">
            <Button className="w-full" onClick={() => startAuth()}>
                Sign in
            </Button>
            <Button
                variant="outline"
                className="w-full"
                onClick={() => startAuth()}
            >
                Create account
            </Button>
        </div>
    );
}
