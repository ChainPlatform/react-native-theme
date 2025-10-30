import React from "react";
import { PixelRatio, Platform } from "react-native";
import chroma from "chroma-js";
import sdkStyles, { setSize } from "@chainplatform/layout";

// ===== REM & Font Scaling =====
const REM_MIN = 0.92;
const REM_MAX = 1.12;
const FONT_SCALE_FACTOR = 0.5;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const getRem = () => {
    return clamp(sdkStyles.REM, REM_MIN, REM_MAX);
};

export const getUserFontScale = () =>
    PixelRatio.getFontScale ? PixelRatio.getFontScale() : 1;

export const getFontSize = (base) => {
    const rem = getRem();
    const userScale = getUserFontScale();
    if (sdkStyles.DESKTOP) {
        const v = base * userScale;
        return Math.round(clamp(v, Math.max(10, base * 0.85), Math.max(28, base * 1.25)));
    }
    const blended = 1 + (rem - 1) * FONT_SCALE_FACTOR;
    const v = base * blended * userScale;
    return Math.round(clamp(v, Math.max(10, base * 0.85), Math.max(36, base * 1.35)));
};

const useFontFamily = Platform.OS === 'web';

export const getFonts = () => {
    const fontFamily = [
        'system-ui',
        '"Segoe UI"',
        'Roboto',
        'Helvetica',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
    ].join(', ');

    return {
        thin: {
            ...(useFontFamily && { fontFamily }),
            fontWeight: 100,
        },
        semilight: {
            ...(useFontFamily && { fontFamily }),
            fontWeight: 200,
        },
        light: {
            ...(useFontFamily && { fontFamily }),
            fontWeight: 300,
        },
        regular: {
            ...(useFontFamily && { fontFamily }),
            fontWeight: 400,
        },
        medium: {
            ...(useFontFamily && { fontFamily }),
            fontWeight: 500,
        },
        bold: {
            ...(useFontFamily && { fontFamily }),
            fontWeight: 600,
        },
        heavy: {
            ...(useFontFamily && { fontFamily }),
            fontWeight: 700,
        },
    };
};

// ===== Typography Tokens =====
const buildTypography = (preset = "balanced") => {
    const presets = {
        balanced: {
            mobile: {
                xs: 12, sm: 14, body: 16, h4: 16, h3: 18, h2: 20, h1: 24
            },
            desktop: {
                xs: 12, sm: 13, body: 14, h4: 15, h3: 16, h2: 18, h1: 22
            }
        },
        web: {
            mobile: {
                xs: 12, sm: 13, body: 15, h4: 15, h3: 16, h2: 18, h1: 22
            },
            desktop: {
                xs: 12, sm: 13, body: 14, h4: 15, h3: 16, h2: 18, h1: 20
            },
        },
        compact: {
            mobile: {
                xs: 11, sm: 13, body: 14, h4: 14, h3: 15, h2: 17, h1: 20
            },
            desktop: {
                xs: 11, sm: 12, body: 13, h4: 14, h3: 15, h2: 16, h1: 18
            },
        },
    };
    const set = presets[preset] || presets.balanced;
    const source = sdkStyles.DESKTOP ? set.desktop : set.mobile;

    const tokens = {};
    Object.keys(source).forEach((k) => {
        tokens[k] = getFontSize(source[k]);
    });

    return {
        ...tokens,
        caption: tokens.xs,
        small: tokens.sm,
        paragraph: tokens.body,
        headline4: tokens.h4,
        headline3: tokens.h3,
        headline2: tokens.h2,
        headline1: tokens.h1,
        lineHeight: {
            xs: Math.round(tokens.xs * 1.4),
            sm: Math.round(tokens.sm * 1.4),
            body: Math.round(tokens.body * 1.5),
            h4: Math.round(tokens.h4 * 1.4),
            h3: Math.round(tokens.h3 * 1.35),
            h2: Math.round(tokens.h2 * 1.25),
            h1: Math.round(tokens.h1 * 1.2),
        },
        fontWeight: {
            thin: 100,
            semilight: 200,
            light: 300,
            regular: 400,
            // medium: 500,
            semibold: 600,
            bold: 700,
        },
    };
};

// ===== global state =====
let listeners = [];
let currentThemeFull = null;
let currentTheme = null;
const notify = (theme) => listeners.forEach((cb) => cb(theme));

// ===== helpers =====
const colorHover = (c, isDark) =>
    isDark ? chroma(c).brighten(0.6).hex() : chroma(c).darken(0.3).hex();
const colorFocus = (c, isDark) =>
    isDark ? chroma(c).darken(0.6).hex() : chroma(c).darken(0.6).hex();

// choose best contrast between white and dark text (#111827)
const bestContrast = (bg) => {
    const whiteContrast = chroma.contrast(bg, "#FFFFFF");
    const darkContrast = chroma.contrast(bg, "#111827");
    return whiteContrast >= darkContrast ? "#FFFFFF" : "#111827";
};

function getTabBarInactive(card) {
    const base = chroma(card);
    const isDark = base.luminance() < 0.5;

    let color;

    if (isDark) {
        color = "#B0B3B8";
        if (chroma.contrast(color, card) < 3) {
            color = chroma(color).brighten(0.45);
        }
    } else {
        color = "#2E2E2E";
        if (chroma.contrast(color, card) < 4) {
            color = chroma.mix(color, "#000", 0.25, "lab");
        }
    }

    return chroma(color).hex();
}

export function getTabBarActive(card, primary, minContrast = 3) {
    let active = chroma(primary);
    const isDark = chroma(card).luminance() < 0.5;

    active = isDark ? active.brighten(0.8) : active.darken(0.8);

    let contrast = chroma.contrast(active, card);
    if (contrast < minContrast) {
        const adjust = minContrast - contrast;
        active = isDark
            ? active.brighten(adjust * 0.6)
            : active.darken(adjust * 0.6);
    }

    return chroma.mix(primary, active, 0.6, "lab").hex();
}

// ===== generate colors =====
const generateColors = (primaryLight, isDark) => {
    // primary for theme (dark variant derived)
    const primary = isDark
        ? chroma(primaryLight).darken(1.5).saturate(0.3).hex()
        : chroma(primaryLight).hex();

    // secondary based on primary hue (complement-ish)
    const secondary = chroma(primary)
        .set("hsl.h", (chroma(primary).get("hsl.h") + 160) % 360)
        .hex();

    // derive saturation / lightness hints from primary (to harmonize semantic colors)
    const primaryCh = chroma(primary);
    const primaryS = Number(primaryCh.get("hsl.s")) || 0.5; // fallback
    // clamp saturation so semantics don't become too dull or too neon
    const sat = Math.max(0.45, Math.min(0.85, primaryS * 1.0));
    // lightness base for semantic colors: light vs dark
    const semL = isDark ? 0.40 : 0.56;

    // semantic fixed-hue colors but tuned by primary's sat & theme lightness
    const success = chroma.hsl(120, sat, semL).hex();   // green
    const warning = chroma.hsl(40, sat, semL).hex();    // orange
    const error = chroma.hsl(0, sat, semL).hex();       // red
    const info = chroma.hsl(210, sat, semL).hex();      // blue
    const notification = chroma.hsl(280, sat, semL).hex(); // purple

    // surfaces (background / card / border)
    // use a separate base so surfaces are visually separated from primary
    const surfaceBase = isDark
        ? chroma(primary).darken(4.5) // dark background anchored from primary
        : chroma(primary).brighten(1.5); // light background slightly brightened
    const background = surfaceBase.hex();
    const card = isDark ? surfaceBase.brighten(0.5).hex() : surfaceBase.brighten(1).hex();
    // in light mode border should be slightly darker than card to be visible
    // in dark mode border slightly lighter than card
    const border = isDark ? surfaceBase.brighten(1.2).hex() : surfaceBase.darken(0.5).hex();

    // text colors:
    // - text: contrast with background
    // - textPrimary: contrast with primary
    // - textSecondary: contrast with secondary
    const text = bestContrast(background);
    const textPrimary = bestContrast(primary);
    const textSecondary = bestContrast(secondary);

    // overlay & shadow (neutral, not brand-dependent)
    const overlay = isDark
        ? chroma("black").alpha(0.6).css()
        : chroma("black").alpha(0.25).css();
    const shadow = isDark
        ? chroma("black").alpha(0.45).css()
        : chroma("black").alpha(0.15).css();

    const tabBarActive = primary;
    const tabBarInactive = getTabBarInactive(card);

    return {
        primary,
        secondary,
        success,
        warning,
        error,
        info,
        notification,
        background,
        card,
        border,
        text,
        textPrimary,
        textSecondary,
        overlay,
        shadow,
        tabBarActive,
        tabBarInactive,
    };
};

// ===== create theme =====
export const createTheme = (options = {}) => {
    const primaryLight = options.primary || "#002fab";
    const isDarkDefault = options.dark ?? false;

    const buildTheme = (isDark) => {
        const c = generateColors(primaryLight, isDark);
        const typography = buildTypography(options.preset || "balanced");
        const primary_border = colorFocus(c.primary, isDark);
        const secondary_border = colorFocus(c.secondary, isDark);
        return {
            dark: isDark,
            colors: {
                primary: c.primary,
                primary_hover: colorHover(c.primary, isDark),
                primary_focus: primary_border,
                primary_border: primary_border,

                secondary: c.secondary,
                secondary_hover: colorHover(c.secondary, isDark),
                secondary_focus: secondary_border,
                secondary_border: secondary_border,

                // semantic: single-tone (no need hover/focus, but kept floats if you use them)
                success: c.success,
                warning: c.warning,
                error: c.error,
                info: c.info,
                notification: c.notification,

                background: c.background,
                card: c.card,
                border: c.border,

                // text tokens
                text: c.text,
                primary_text: c.textPrimary,
                secondary_text: c.textSecondary,

                // overlay & shadow take the neutral values
                // overlay: c.overlay,
                // shadow: c.shadow,

                tab_bar_active: c.primary,
                tab_bar_inactive: c.tabBarInactive,
            },
            spacing: {
                xs: setSize(4),
                sm: setSize(8),
                md: setSize(16),
                lg: setSize(24),
                xl: setSize(32),
            },
            radius: {
                sm: setSize(4),
                md: setSize(8),
                lg: setSize(16),
                xl: setSize(24),
            },
            fontSize: typography,
            fonts: getFonts()
        };
    };

    const light = buildTheme(false);
    const dark = buildTheme(true);

    return {
        light,
        dark,
        default: isDarkDefault ? dark : light,
        mode: isDarkDefault ? 'dark' : 'light',
    };
};

// ===== init =====
currentThemeFull = createTheme();
currentTheme = currentThemeFull.default;

const filterThemeKeys = (theme = {}) => {
    const filtered = {};
    THEME_KEYS.forEach(key => {
        if (theme[key] !== undefined) {
            filtered[key] = theme[key];
        }
    });
    return filtered;
};

const THEME_KEYS = [
    "primary",
    "primary_hover",
    "primary_focus",
    "primary_border",
    "secondary",
    "secondary_hover",
    "secondary_focus",
    "secondary_border",
    "success",
    "warning",
    "error",
    "info",
    "notification",
    "background",
    "card",
    "border",
    "text",
    "primary_text",
    "secondary_text",
    "overlay",
    "shadow",
    "tab_bar_active",
    "tab_bar_inactive"
];

const buildFiltered = (themeVariant = {}) => ({
    ...themeVariant,
    colors: filterThemeKeys(themeVariant.colors || {})
});

// ===== get full theme =====
export const getTheme = () => {
    let theme = currentThemeFull;
    if (!theme) return {};
    theme.light = buildFiltered(theme.light);
    theme.dark = buildFiltered(theme.dark);
    theme.default = buildFiltered(theme.default);
    return theme;
}

// ===== set theme runtime =====
export const setTheme = (themeObject) => {
    if (!themeObject) return;
    const defaultTheme = createTheme(currentThemeFull.light.colors.primary);
    currentThemeFull = {
        light: { ...defaultTheme.light, ...(themeObject.light || {}) },
        dark: { ...defaultTheme.dark, ...(themeObject.dark || {}) },
        default: themeObject.default || (themeObject.dark ? defaultTheme.dark : defaultTheme.light),
        mode: typeof themeObject.mode != "undefined" ? themeObject.mode : defaultTheme.mode,
    };
    ["light", "dark"].forEach((key) => {
        currentThemeFull[key] = {
            ...currentThemeFull[key],
            colors: { ...defaultTheme[key].colors, ...(currentThemeFull[key].colors || {}) },
            spacing: { ...defaultTheme[key].spacing, ...(currentThemeFull[key].spacing || {}) },
            radius: { ...defaultTheme[key].radius, ...(currentThemeFull[key].radius || {}) },
            fontSize: { ...defaultTheme[key].fontSize, ...(currentThemeFull[key].fontSize || {}) },
        };
    });
    currentThemeFull.light = buildFiltered(currentThemeFull.light);
    currentThemeFull.dark = buildFiltered(currentThemeFull.dark);
    currentThemeFull.default = buildFiltered(currentThemeFull.default);
    currentTheme = currentThemeFull.default;
    notify(currentTheme);
    return currentThemeFull;
};

// ===== reactive hook =====
export const useTheme = () => {
    const [theme, setThemeState] = React.useState(currentTheme);
    React.useEffect(() => {
        const cb = (t) => setThemeState(t);
        listeners.push(cb);
        return () => {
            listeners = listeners.filter((l) => l !== cb);
        };
    }, []);
    return theme;
};

// ===== export =====
export default {
    createTheme,
    setTheme,
    getTheme,
    useTheme,
    getFonts
};