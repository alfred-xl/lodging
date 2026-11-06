import { addDays, todayIso } from '../format';
import type { MockBooking } from '../store';
import { SEED_USERS } from './users';

function stay(
    id: string,
    reference: string,
    status: MockBooking['status'],
    hotelId: string,
    startInDays: number,
    nights: number,
): MockBooking {
    const checkIn = addDays(todayIso(), startInDays);

    return {
        id,
        reference,
        status,
        hotelId,
        roomId: 'room-1',
        rateId: 'flexible',
        search: {
            destinationId: hotelId.slice(hotelId.lastIndexOf('-') + 1),
            checkIn,
            checkOut: addDays(checkIn, nights),
            rooms: 1,
            adults: 2,
            children: 0,
        },
    };
}

// Only the mock account has history. New mock accounts start with empty lists.
export function bookingsFor(email: string): MockBooking[] {
    if (email !== SEED_USERS[0].email) {
        return [];
    }

    return [
        stay('seed-1', 'LD-41820376', 'active', 'cedar-court-london', 21, 3),
        stay(
            'seed-2',
            'LD-57302914',
            'active',
            'nine-arches-manchester',
            58,
            5,
        ),
        stay('seed-6', 'LD-30917465', 'past', 'harbor-lane-london', -7, 1),
        stay('seed-5', 'LD-68451903', 'cancelled', 'atrium-london', 40, 2),
    ];
}
