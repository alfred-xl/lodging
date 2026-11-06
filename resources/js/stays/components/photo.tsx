import { useId } from 'react';
import { photoPalettes } from '../theme';

export type PhotoScene =
    | 'exterior'
    | 'room'
    | 'pool'
    | 'coast'
    | 'city'
    | 'lobby';

type Palette = (typeof photoPalettes)[number];

function hash(value: string): number {
    let total = 7;

    for (let index = 0; index < value.length; index++) {
        total = (total * 31 + value.charCodeAt(index)) >>> 0;
    }

    return total;
}

function Exterior({ palette, seed }: { palette: Palette; seed: number }) {
    const columns = 4 + (seed % 3);
    const rows = 4 + (seed % 2);
    const width = 150 + columns * 22;
    const left = (400 - width) / 2;
    const top = 255 - rows * 36 - 20;

    return (
        <>
            <path
                d="M0 220 Q90 160 190 205 T400 190 V300 H0Z"
                fill={palette.ground}
                opacity={0.55}
            />
            <rect
                x={left}
                y={top}
                width={width}
                height={275 - top}
                fill={palette.wall}
            />
            <rect
                x={left - 8}
                y={top - 10}
                width={width + 16}
                height={12}
                fill={palette.trim}
            />
            {Array.from({ length: rows * columns }, (_, index) => (
                <rect
                    key={index}
                    x={left + 14 + (index % columns) * ((width - 28) / columns)}
                    y={top + 12 + Math.floor(index / columns) * 36}
                    width={(width - 28) / columns - 10}
                    height={24}
                    rx={2}
                    fill={palette.glass}
                    opacity={(index + seed) % 5 === 0 ? 0.55 : 0.9}
                />
            ))}
            <rect x={178} y={240} width={44} height={35} fill={palette.trim} />
            <rect
                x={162}
                y={230}
                width={76}
                height={10}
                rx={2}
                fill={palette.wallAlt}
            />
            <rect y={272} width={400} height={28} fill={palette.ground} />
        </>
    );
}

function RoomScene({ palette, seed }: { palette: Palette; seed: number }) {
    return (
        <>
            <rect width={400} height={300} fill={palette.wall} />
            <rect
                x={36 + (seed % 30)}
                y={36}
                width={120}
                height={112}
                fill={palette.skyBottom}
            />
            <circle cx={96 + (seed % 30)} cy={90} r={22} fill={palette.sun} />
            <path
                d={`M${36 + (seed % 30)} 92 h120 M${96 + (seed % 30)} 36 v112`}
                stroke={palette.fabric}
                strokeWidth={5}
            />
            <rect
                y={240}
                width={400}
                height={60}
                fill={palette.trim}
                opacity={0.75}
            />
            <rect
                x={150}
                y={118}
                width={230}
                height={82}
                rx={8}
                fill={palette.wallAlt}
            />
            <rect
                x={130}
                y={186}
                width={270}
                height={68}
                rx={8}
                fill={palette.fabric}
            />
            <rect
                x={130}
                y={214}
                width={270}
                height={40}
                rx={6}
                fill={palette.glass}
                opacity={0.75}
            />
            <rect
                x={168}
                y={162}
                width={78}
                height={34}
                rx={10}
                fill={palette.fabric}
                stroke={palette.wall}
            />
            <rect
                x={262}
                y={162}
                width={78}
                height={34}
                rx={10}
                fill={palette.fabric}
                stroke={palette.wall}
            />
            <rect
                x={60}
                y={204}
                width={52}
                height={52}
                rx={3}
                fill={palette.trim}
            />
            <path d="M74 176 h24 l8 28 h-40Z" fill={palette.sun} />
        </>
    );
}

function Palm({ x, palette }: { x: number; palette: Palette }) {
    return (
        <g>
            <path
                d={`M${x} 205 Q${x + 8} 130 ${x + 22} 92`}
                stroke={palette.trim}
                strokeWidth={7}
                fill="none"
            />
            <path
                d={`M${x + 22} 92 q-42 -18 -60 16 q32 -14 60 -16 q-22 22 -22 50 q18 -30 22 -50 q22 16 26 44 q10 -30 -26 -44 q44 -12 56 16 q-14 -36 -56 -16Z`}
                fill={palette.ground}
            />
        </g>
    );
}

function Pool({ palette }: { palette: Palette }) {
    return (
        <>
            <rect y={150} width={400} height={150} fill={palette.wall} />
            <Palm x={60} palette={palette} />
            <Palm x={320} palette={palette} />
            <path d="M34 300 L86 186 H330 L382 300Z" fill={palette.water} />
            {[208, 232, 262].map((y) => (
                <path
                    key={y}
                    d={`M90 ${y} q30 -10 60 0 t60 0 t60 0 t50 0`}
                    stroke={palette.fabric}
                    strokeWidth={3}
                    fill="none"
                    opacity={0.65}
                />
            ))}
            <rect
                x={120}
                y={158}
                width={70}
                height={14}
                rx={4}
                fill={palette.fabric}
            />
            <rect
                x={220}
                y={158}
                width={70}
                height={14}
                rx={4}
                fill={palette.fabric}
            />
        </>
    );
}

function Coast({ palette }: { palette: Palette }) {
    return (
        <>
            <rect y={150} width={400} height={80} fill={palette.water} />
            <path
                d="M0 212 Q130 188 240 214 T400 202 V300 H0Z"
                fill={palette.wall}
            />
            <path d="M250 150 l30 -34 v34Z" fill={palette.fabric} />
            <rect
                x={240}
                y={150}
                width={56}
                height={7}
                rx={3}
                fill={palette.trim}
            />
            <path d="M92 232 V170" stroke={palette.trim} strokeWidth={4} />
            <path d="M46 176 Q92 122 138 176Z" fill={palette.wallAlt} />
            <rect
                x={110}
                y={252}
                width={70}
                height={12}
                rx={4}
                fill={palette.fabric}
            />
        </>
    );
}

function City({ palette, seed }: { palette: Palette; seed: number }) {
    return (
        <>
            {Array.from({ length: 9 }, (_, index) => {
                const height = 70 + ((seed >>> index) % 7) * 18;
                const x = index * 46 - 8;

                return (
                    <g key={index}>
                        <rect
                            x={x}
                            y={240 - height}
                            width={42}
                            height={height}
                            fill={index % 2 ? palette.wallAlt : palette.trim}
                        />
                        {Array.from(
                            { length: Math.floor(height / 26) },
                            (_, row) => (
                                <rect
                                    key={row}
                                    x={x + 8}
                                    y={250 - height + row * 24}
                                    width={26}
                                    height={10}
                                    fill={palette.sun}
                                    opacity={0.75}
                                />
                            ),
                        )}
                    </g>
                );
            })}
            <rect y={240} width={400} height={60} fill={palette.water} />
        </>
    );
}

function Lobby({ palette }: { palette: Palette }) {
    return (
        <>
            <rect width={400} height={300} fill={palette.wall} />
            {[40, 160, 280].map((x) => (
                <path
                    key={x}
                    d={`M${x} 220 V90 a40 40 0 0 1 80 0 V220Z`}
                    fill={palette.skyBottom}
                    stroke={palette.wallAlt}
                    strokeWidth={5}
                />
            ))}
            <rect
                y={220}
                width={400}
                height={80}
                fill={palette.trim}
                opacity={0.8}
            />
            <rect
                x={110}
                y={196}
                width={180}
                height={52}
                rx={12}
                fill={palette.glass}
            />
            <rect
                x={122}
                y={176}
                width={156}
                height={40}
                rx={12}
                fill={palette.wallAlt}
            />
            <circle cx={346} cy={186} r={26} fill={palette.ground} />
            <rect
                x={334}
                y={208}
                width={24}
                height={36}
                fill={palette.fabric}
            />
        </>
    );
}

export function Photo({
    seed,
    scene,
    alt,
    className,
}: {
    seed: string;
    scene: PhotoScene;
    alt?: string;
    className?: string;
}) {
    const gradientId = useId();
    const seedNumber = hash(seed);
    const palette = photoPalettes[seedNumber % photoPalettes.length];

    return (
        <svg
            viewBox="0 0 400 300"
            preserveAspectRatio="xMidYMid slice"
            role={alt ? 'img' : undefined}
            aria-label={alt}
            aria-hidden={alt ? undefined : true}
            className={className}
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={palette.skyTop} />
                    <stop offset="1" stopColor={palette.skyBottom} />
                </linearGradient>
            </defs>
            <rect width={400} height={300} fill={`url(#${gradientId})`} />
            <circle
                cx={60 + (seedNumber % 280)}
                cy={60}
                r={28}
                fill={palette.sun}
            />
            {scene === 'exterior' && (
                <Exterior palette={palette} seed={seedNumber} />
            )}
            {scene === 'room' && (
                <RoomScene palette={palette} seed={seedNumber} />
            )}
            {scene === 'pool' && <Pool palette={palette} />}
            {scene === 'coast' && <Coast palette={palette} />}
            {scene === 'city' && <City palette={palette} seed={seedNumber} />}
            {scene === 'lobby' && <Lobby palette={palette} />}
        </svg>
    );
}
