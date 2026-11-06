import { toast } from 'sonner';
import { hotelById, RATES } from './data';
import { formatDayYear } from './format';
import type { MockBooking } from './store';
import { APP_NAME } from './theme';

// Saved as a local text file built only from this booking's own data.
export function downloadSummary(
    kind: 'receipt' | 'confirmation',
    booking: MockBooking,
    guestName: string,
    contactEmail: string,
    total: string,
): void {
    const hotel = hotelById(booking.hotelId);
    const room = hotel?.rooms.find((item) => item.id === booking.roomId);
    const rate = RATES.find((item) => item.id === booking.rateId);
    const title = kind === 'receipt' ? 'Receipt' : 'Booking confirmation';

    const lines = [
        `${APP_NAME} - ${title}`,
        'Prototype document. Not a real receipt or confirmation.',
        '',
        `Reference: ${booking.reference}`,
        `Status: ${booking.status}`,
        `Property: ${hotel?.name ?? ''}`,
        `Address: ${hotel?.address ?? ''}`,
        `Check-in: ${formatDayYear(booking.search.checkIn)}, ${hotel?.checkInTime ?? ''}`,
        `Check-out: ${formatDayYear(booking.search.checkOut)}, ${hotel?.checkOutTime ?? ''}`,
        `Room: ${room?.name ?? ''}`,
        `Rate: ${rate?.name ?? ''}`,
        `Guest name: ${guestName}`,
        `Email: ${contactEmail}`,
        `Total: ${total}`,
    ];

    const url = URL.createObjectURL(
        new Blob([lines.join('\n')], { type: 'text/plain' }),
    );
    const link = document.createElement('a');

    link.href = url;
    link.download = `${APP_NAME.toLowerCase()}-${kind}-${booking.reference}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast(`${title} saved to your device.`);
}

// Uses the native share sheet. Browsers without one copy the link instead.
export async function shareContent(data: {
    title: string;
    text: string;
    url: string;
}): Promise<void> {
    if (typeof navigator.share === 'function') {
        try {
            await navigator.share(data);
        } catch {
            // Closing the share sheet rejects the promise, and needs no message.
        }

        return;
    }

    try {
        await navigator.clipboard.writeText(data.url);
        toast(
            "Sharing isn't available in this browser, so we copied the link.",
        );
    } catch {
        toast("Sharing isn't available in this browser.");
    }
}

export function directionsUrl(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
