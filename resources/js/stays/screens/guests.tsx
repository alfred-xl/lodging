import { useState } from 'react';
import { Sheet, SheetFooter } from '../components/sheet';
import { Button, Stepper } from '../components/ui';
import { closeSheet } from '../router';
import { useStore } from '../store';

function GuestsBody() {
    const { search, updateSearch } = useStore();
    const [rooms, setRooms] = useState(search.rooms);
    const [adults, setAdults] = useState(search.adults);
    const [children, setChildren] = useState(search.children);

    return (
        <>
            <div className="min-h-0 flex-1 divide-y divide-st-border-soft overflow-y-auto px-4 py-1">
                <Stepper
                    label="Rooms"
                    value={rooms}
                    min={1}
                    max={10}
                    onChange={(value) => {
                        setRooms(value);
                        setAdults(Math.max(adults, value));
                    }}
                />
                <Stepper
                    label="Adults"
                    hint={
                        rooms > 1
                            ? 'At least one adult is needed in each room'
                            : undefined
                    }
                    value={adults}
                    min={rooms}
                    max={30}
                    onChange={setAdults}
                />
                <Stepper
                    label="Children"
                    hint="Ages 0 to 17"
                    value={children}
                    min={0}
                    max={10}
                    onChange={setChildren}
                />
            </div>
            <SheetFooter>
                <Button
                    className="w-full"
                    onClick={() => {
                        updateSearch({ rooms, adults, children });
                        closeSheet();
                    }}
                >
                    Apply
                </Button>
            </SheetFooter>
        </>
    );
}

export function GuestsSheet({ open }: { open: boolean }) {
    return (
        <Sheet open={open} title="Rooms and guests" variant="bottom">
            <GuestsBody />
        </Sheet>
    );
}
