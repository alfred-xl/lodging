// Small decorative illustrations for Rewards & Wallet, drawn in theme colours.

export function WalletArt({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 40 40" aria-hidden className={className}>
            <rect
                x="17"
                y="6"
                width="18"
                height="12"
                rx="2"
                transform="rotate(12 26 12)"
                className="fill-st-success"
            />
            <rect
                x="3"
                y="13"
                width="32"
                height="23"
                rx="4"
                className="fill-st-action"
            />
            <rect
                x="24"
                y="20"
                width="13"
                height="10"
                rx="3"
                className="fill-st-brand"
            />
            <circle cx="30" cy="25" r="2" className="fill-st-on-dark" />
            <circle cx="11" cy="10" r="8" className="fill-st-accent" />
            <circle
                cx="11"
                cy="10"
                r="5.5"
                strokeWidth="1.5"
                className="fill-none stroke-st-callout"
            />
        </svg>
    );
}

export function CoinsArt({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 64 64" aria-hidden className={className}>
            <circle
                cx="40"
                cy="24"
                r="17"
                strokeWidth="2"
                className="fill-st-accent stroke-st-callout"
            />
            <circle
                cx="40"
                cy="24"
                r="11"
                strokeWidth="2"
                className="fill-none stroke-st-callout"
            />
            <circle
                cx="22"
                cy="40"
                r="17"
                strokeWidth="2"
                className="fill-st-accent stroke-st-callout"
            />
            <circle cx="16" cy="34" r="3" className="fill-st-callout" />
            <circle cx="28" cy="46" r="3" className="fill-st-callout" />
            <path
                d="M29 33 15 47"
                strokeWidth="3"
                strokeLinecap="round"
                className="stroke-st-callout"
            />
        </svg>
    );
}

export function PhoneArt({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 64 64" aria-hidden className={className}>
            <rect
                x="6"
                y="20"
                width="20"
                height="30"
                rx="3"
                transform="rotate(-18 16 35)"
                className="fill-st-accent"
            />
            <rect
                x="38"
                y="20"
                width="20"
                height="30"
                rx="3"
                transform="rotate(18 48 35)"
                className="fill-st-accent"
            />
            <rect
                x="19"
                y="6"
                width="26"
                height="52"
                rx="6"
                className="fill-st-action"
            />
            <rect
                x="22"
                y="13"
                width="20"
                height="36"
                rx="2"
                className="fill-st-on-dark"
            />
            <rect
                x="25"
                y="21"
                width="14"
                height="18"
                rx="2"
                className="fill-st-action-tint"
            />
            <circle cx="29" cy="26" r="2" className="fill-st-callout" />
            <circle cx="35" cy="34" r="2" className="fill-st-callout" />
            <path
                d="M36 25 28 35"
                strokeWidth="2"
                strokeLinecap="round"
                className="stroke-st-callout"
            />
        </svg>
    );
}

export function CoinStackArt({ className }: { className?: string }) {
    const coins = [48, 41, 34, 27, 20];

    return (
        <svg viewBox="0 0 64 64" aria-hidden className={className}>
            {coins.map((y) => (
                <g key={y}>
                    <rect
                        x="8"
                        y={y}
                        width="32"
                        height="7"
                        className="fill-st-callout"
                    />
                    <ellipse
                        cx="24"
                        cy={y}
                        rx="16"
                        ry="5"
                        className="fill-st-accent"
                    />
                </g>
            ))}
            <circle cx="46" cy="40" r="12" className="fill-st-action-tint" />
            <path
                d="m40 40 4 4 8-9"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="fill-none stroke-st-action"
            />
        </svg>
    );
}
