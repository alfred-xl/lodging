import { Heart } from 'lucide-react';
import {
    EmptyState,
    RootHeader,
    SignInButtons,
} from '../components/root-panels';
import { Button } from '../components/ui';
import { hotelById } from '../data';
import { goHome } from '../router';
import { useStore } from '../store';
import { ResultRow } from './results';

const HEART_ICON = <Heart className="size-8 text-st-text-alt" aria-hidden />;

export function SavedScreen() {
    const { user, saved } = useStore();
    const hotels = saved.flatMap((id) => hotelById(id) ?? []);

    return (
        <div className="min-h-full bg-st-surface">
            <RootHeader title="Saved" />
            <main>
                {!user && (
                    <EmptyState
                        icon={HEART_ICON}
                        title="Sign in to see your saved properties"
                        body="Your saved properties stay here, ready for when you want to book."
                    >
                        <SignInButtons />
                    </EmptyState>
                )}
                {user && hotels.length === 0 && (
                    <EmptyState
                        icon={HEART_ICON}
                        title="Nothing saved yet"
                        body="Tap the heart on a property to keep it here."
                    >
                        <Button onClick={goHome}>Go to Search</Button>
                    </EmptyState>
                )}
                {user &&
                    hotels.map((hotel) => (
                        <ResultRow key={hotel.id} hotel={hotel} />
                    ))}
            </main>
        </div>
    );
}
