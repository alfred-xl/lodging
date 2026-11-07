import type { CSSProperties } from 'react';

// Set by APP_NAME in .env. The page writes it into a meta tag, which also names the
// splash screen and the home-screen app before this file loads.
export const APP_NAME =
    document.querySelector<HTMLMetaElement>('meta[name="application-name"]')
        ?.content || document.title;

export const color = {
    brand: '#003b95',
    action: '#006ce4',
    actionHover: '#0057b8',
    actionTint: '#f0f6ff',
    actionFocus: '#006ce43d',
    link: '#006ce4',
    accent: '#ffb700',
    onAccent: '#242424',
    surface: '#ffffff',
    surfaceAlt: '#f5f5f5',
    text: '#1a1a1a',
    textAlt: '#595959',
    border: '#868686',
    borderSoft: '#e7e7e7',
    borderRoom: '#bcbcbcba',
    success: '#008234',
    successFill: '#008234',
    statusGood: '#008234',
    callout: '#f56700',
    successTint: '#f1fef6',
    danger: '#d4111e',
    dangerTint: '#fff5f5',
    disabledBg: '#d9d9d9',
    disabledText: '#a2a2a2',
    rangeFill: '#1a1a1a0f',
    overlay: '#1a1a1a99',
    onDark: '#ffffff',
    mapLand: '#eef2e6',
    mapPark: '#d5e6c3',
    mapWater: '#bcdcf2',
    mapRoad: '#ffffff',
    // Card network marks, in each network's own colours.
    mastercardRed: '#eb001b',
    mastercardYellow: '#f79e1b',
    mastercardOverlap: '#ff5f00',
    visaBlue: '#1a1f71',
    amexBlue: '#2e77bc',
    // The Union Jack, for UK phone numbers.
    flagBlue: '#012169',
    flagRed: '#c8102e',
};

export const space = {
    half: 2,
    x1: 4,
    x2: 8,
    x3: 12,
    x4: 16,
    x6: 24,
    x8: 32,
    x12: 48,
    x16: 64,
};

export const layout = { tabBarHeight: 54 };

export const radius = { sm: 4, chip: 6, md: 8, lg: 16, xl: 24, full: 9999 };

// [fontSize, lineHeight, fontWeight]
export const type = {
    headline1: [32, 40, '700'],
    headline2: [24, 32, '700'],
    headline3: [20, 28, '700'],
    strong1: [16, 24, '700'],
    strong2: [14, 20, '700'],
    emphasized1: [16, 24, '500'],
    emphasized2: [14, 20, '500'],
    body1: [16, 24, '400'],
    body2: [14, 20, '400'],
    small1: [12, 18, '400'],
    small2: [12, 18, '500'],
} as const;

export const shadow = {
    s100: '0 2px 8px #1a1a1a29',
    s200: '0 2px 16px #1a1a1a3d',
};

export const motion = { fast: 120, medium: 240, page: 480 };

export const easing = {
    standard: 'cubic-bezier(0.2, 0, 0.4, 0.8)',
    appear: 'cubic-bezier(0, 0, 0.4, 1)',
};

export const font = {
    body: 'BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    heading:
        '"Avenir Next", BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

// Colors for the original illustrated placeholder photos.
export const photoPalettes = [
    {
        skyTop: '#7fb8e6',
        skyBottom: '#f6dcc0',
        sun: '#ffe0a3',
        wall: '#e9d7c0',
        wallAlt: '#c98d6b',
        glass: '#35567a',
        ground: '#7c9a6a',
        water: '#3f9fc4',
        fabric: '#f8f4ec',
        trim: '#7a4b34',
    },
    {
        skyTop: '#2f4c80',
        skyBottom: '#f0a878',
        sun: '#ffd27d',
        wall: '#d8d2c8',
        wallAlt: '#71808f',
        glass: '#ffd98c',
        ground: '#4f6b5a',
        water: '#2c7fa3',
        fabric: '#efe6d8',
        trim: '#39414f',
    },
    {
        skyTop: '#a6dbe8',
        skyBottom: '#ecf6ee',
        sun: '#fff1bd',
        wall: '#f4efe6',
        wallAlt: '#7fb09b',
        glass: '#4a7f94',
        ground: '#a9b77f',
        water: '#55bfca',
        fabric: '#ffffff',
        trim: '#3e6a5d',
    },
    {
        skyTop: '#c4b5e0',
        skyBottom: '#f8d9d0',
        sun: '#ffe9c4',
        wall: '#e6c9b6',
        wallAlt: '#a4665c',
        glass: '#4f4a78',
        ground: '#8d8a68',
        water: '#6d9fd0',
        fabric: '#f7ebe3',
        trim: '#5d3a3f',
    },
];

function kebab(name: string): string {
    return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function rem(px: number): string {
    return `${px / 16}rem`;
}

// Type sizes are rem so text scales with the browser's font size setting.
export const themeVariables = {
    ...Object.fromEntries(
        Object.entries(color).map(([name, value]) => [
            `--st-color-${kebab(name)}`,
            value,
        ]),
    ),
    ...Object.fromEntries(
        Object.entries(radius).map(([name, value]) => [
            `--st-radius-${name}`,
            `${value}px`,
        ]),
    ),
    ...Object.fromEntries(
        Object.entries(type).flatMap(([name, [size, line, weight]]) => [
            [`--st-type-${name}-size`, rem(size)],
            [`--st-type-${name}-line`, rem(line)],
            [`--st-type-${name}-weight`, weight],
        ]),
    ),
    ...Object.fromEntries(
        Object.entries(shadow).map(([name, value]) => [
            `--st-shadow-${name}`,
            value,
        ]),
    ),
    ...Object.fromEntries(
        Object.entries(motion).map(([name, value]) => [
            `--st-motion-${name}`,
            `${value}ms`,
        ]),
    ),
    '--st-tab-bar-height': rem(layout.tabBarHeight),
    '--st-ease-standard': easing.standard,
    '--st-ease-appear': easing.appear,
    '--st-font-body': font.body,
    '--st-font-heading': font.heading,
} as CSSProperties;
