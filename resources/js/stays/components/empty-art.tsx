// Decorative illustrations for empty Saved screens, drawn in theme colours.

export function BellArt({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 160 140" aria-hidden className={className}>
            <g transform="rotate(-18 70 70)">
                <circle cx="70" cy="18" r="9" className="fill-st-accent" />
                <path
                    d="M70 22c-24 0-36 18-38 42-1 14-6 24-16 32h108c-10-8-15-18-16-32-2-24-14-42-38-42Z"
                    className="fill-st-accent"
                />
                <path
                    d="M86 30c10 8 15 20 16 34 1 12 4 20 9 26"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="fill-none stroke-st-on-dark opacity-50"
                />
                <ellipse
                    cx="70"
                    cy="96"
                    rx="54"
                    ry="9"
                    className="fill-st-callout"
                />
                <path
                    d="M70 104v6"
                    strokeWidth="6"
                    className="stroke-st-brand"
                />
                <circle cx="70" cy="114" r="9" className="fill-st-action" />
            </g>
            <path
                d="M94 118c14 8 30 6 40-6 8-10 4-24-6-22-10 2-8 18 2 22 10 4 20-2 24-10"
                strokeWidth="3"
                strokeLinecap="round"
                className="fill-none stroke-st-action"
            />
        </svg>
    );
}

function HotelCard({
    x,
    y,
    name,
    faded,
}: {
    x: number;
    y: number;
    name: string;
    faded?: boolean;
}) {
    return (
        <g transform={`translate(${x} ${y})`} opacity={faded ? 0.55 : 1}>
            <rect
                width="150"
                height="96"
                rx="10"
                strokeWidth="1.5"
                className="fill-st-surface stroke-st-action-tint"
            />
            <rect
                x="12"
                y="18"
                width="56"
                height="62"
                rx="3"
                className="fill-st-accent"
            />
            <path d="M12 26 40 10l28 16Z" className="fill-st-callout" />
            {[0, 1, 2].map((row) =>
                [0, 1, 2].map((column) => (
                    <rect
                        key={`${row}-${column}`}
                        x={22 + column * 14}
                        y={36 + row * 13}
                        width="6"
                        height="8"
                        className="fill-st-action"
                    />
                )),
            )}
            <text
                x="80"
                y="30"
                fontSize="9"
                fontWeight="600"
                className="fill-st-link"
            >
                {name}
            </text>
            {[0, 1, 2, 3].map((star) => (
                <circle
                    key={star}
                    cx={84 + star * 8}
                    cy="40"
                    r="2.6"
                    className="fill-st-accent"
                />
            ))}
            <rect
                x="80"
                y="50"
                width="56"
                height="3"
                rx="1.5"
                className="fill-st-action-tint"
            />
            <rect
                x="80"
                y="58"
                width="40"
                height="3"
                rx="1.5"
                className="fill-st-action-tint"
            />
        </g>
    );
}

export function SavedCardsArt({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 220 150" aria-hidden className={className}>
            <HotelCard x={44} y={4} name="Hill view" faded />
            <HotelCard x={20} y={34} name="Hotel Downtown" />
            <text
                x="112"
                y="118"
                fontSize="14"
                className="fill-st-text-alt"
                textDecoration="line-through"
            >
                100
            </text>
            <text
                x="146"
                y="118"
                fontSize="14"
                fontWeight="700"
                className="fill-st-brand"
            >
                90
            </text>
            <circle
                cx="176"
                cy="38"
                r="16"
                className="fill-st-surface stroke-st-action-tint"
                strokeWidth="1.5"
            />
            <path
                d="M176 46c-7-5-11-8-11-12a5 5 0 0 1 11-2 5 5 0 0 1 11 2c0 4-4 7-11 12Z"
                className="fill-st-callout"
            />
        </svg>
    );
}
