import React from "react";
import chroma from "chroma-js";
import { setSize } from "@chainplatform/layout";

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
        ? chroma("black").alpha(0.6).css()  // stronger dim in dark
        : chroma("black").alpha(0.25).css(); // softer dim in light
    const shadow = isDark
        ? chroma("black").alpha(0.45).css()
        : chroma("black").alpha(0.15).css();

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
    };
};

// ===== create theme =====
export const createTheme = (options = {}) => {
    const primaryLight = options.primary || "#002fab";
    const isDarkDefault = options.dark ?? false;

    const buildTheme = (isDark) => {
        const c = generateColors(primaryLight, isDark);
        return {
            dark: isDark,
            colors: {
                primary: c.primary,
                primaryHover: colorHover(c.primary, isDark),
                primaryFocus: colorFocus(c.primary, isDark),

                secondary: c.secondary,
                secondaryHover: colorHover(c.secondary, isDark),
                secondaryFocus: colorFocus(c.secondary, isDark),

                // semantic: single-tone (no need hover/focus, but kept floats if you use them)
                success: c.success,
                warning: c.warning,
                error: c.error,
                info: c.info,
                notification: c.notification,

                background: c.background,
                card: c.card,
                border: c.border,
                borderHover: colorHover(c.border, isDark),

                // text tokens
                text: c.text,
                textPrimary: c.textPrimary,
                textSecondary: c.textSecondary,

                // overlay & shadow take the neutral values
                overlay: c.overlay,
                shadow: c.shadow,
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
            fontSize: {
                xs: setSize(12),
                sm: setSize(14),
                md: setSize(16),
                lg: setSize(20),
                xl: setSize(28),
            },
        };
    };

    const light = buildTheme(false);
    const dark = buildTheme(true);

    return {
        light,
        dark,
        default: isDarkDefault ? dark : light,
    };
};

// ===== init =====
currentThemeFull = createTheme();
currentTheme = currentThemeFull.default;

// ===== get full theme =====
export const getTheme = () => currentThemeFull;

// ===== set theme runtime =====
export const setTheme = (themeObject) => {
    if (!themeObject) return;

    const defaultTheme = createTheme(currentThemeFull.light.colors.primary);

    currentThemeFull = {
        light: { ...defaultTheme.light, ...(themeObject.light || {}) },
        dark: { ...defaultTheme.dark, ...(themeObject.dark || {}) },
        default:
            themeObject.default || (themeObject.dark ? defaultTheme.dark : defaultTheme.light),
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
};