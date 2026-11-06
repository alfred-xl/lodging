import { useCallback } from 'react';

const DRAG_THRESHOLD_PX = 5;

// Lets a mouse drag a horizontal row, as touch and trackpads already can. A drag
// doesn't count as a click, so cards in the row don't open by accident.
export function useDragScroll<T extends HTMLElement>() {
    return useCallback((element: T | null) => {
        if (!element) {
            return;
        }

        let pointerId: number | null = null;
        let startX = 0;
        let startLeft = 0;
        let dragged = false;

        const onDown = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse' || event.button !== 0) {
                return;
            }

            pointerId = event.pointerId;
            startX = event.clientX;
            startLeft = element.scrollLeft;
            dragged = false;
        };

        const onMove = (event: PointerEvent) => {
            if (event.pointerId !== pointerId) {
                return;
            }

            const distance = event.clientX - startX;

            if (!dragged && Math.abs(distance) > DRAG_THRESHOLD_PX) {
                dragged = true;
                element.setPointerCapture(event.pointerId);
                element.style.scrollSnapType = 'none';
                element.style.cursor = 'grabbing';
                element.style.userSelect = 'none';
            }

            if (dragged) {
                element.scrollLeft = startLeft - distance;
            }
        };

        const onUp = (event: PointerEvent) => {
            if (event.pointerId !== pointerId) {
                return;
            }

            pointerId = null;
            element.style.scrollSnapType = '';
            element.style.cursor = '';
            element.style.userSelect = '';
        };

        const onClick = (event: MouseEvent) => {
            if (dragged) {
                event.preventDefault();
                event.stopPropagation();
                dragged = false;
            }
        };

        const onDragStart = (event: DragEvent) => event.preventDefault();

        element.addEventListener('pointerdown', onDown);
        element.addEventListener('pointermove', onMove);
        element.addEventListener('pointerup', onUp);
        element.addEventListener('pointercancel', onUp);
        element.addEventListener('click', onClick, true);
        element.addEventListener('dragstart', onDragStart);

        return () => {
            element.removeEventListener('pointerdown', onDown);
            element.removeEventListener('pointermove', onMove);
            element.removeEventListener('pointerup', onUp);
            element.removeEventListener('pointercancel', onUp);
            element.removeEventListener('click', onClick, true);
            element.removeEventListener('dragstart', onDragStart);
        };
    }, []);
}
