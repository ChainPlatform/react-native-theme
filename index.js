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
const textContrast = (bg) => (chroma(bg).luminance() < 0.5 ? "#FFFFFF" : "#111827");

// ===== generate colors =====
const generateColors = (primaryLight, isDark) => {
    const primary = isDark
        ? chroma(primaryLight).darken(1.5).saturate(0.3).hex()
        : chroma(primaryLight).hex();

    const secondary = chroma(primary)
        .set("hsl.h", (chroma(primary).get("hsl.h") + 160) % 360)
        .hex();

    const success = chroma(primary)
        .set("hsl.h", (chroma(primary).get("hsl.h") + 100) % 360)
        .saturate(isDark ? 0.4 : 0.2)
        .hex();

    const warning = chroma(primary)
        .set("hsl.h", (chroma(primary).get("hsl.h") + 60) % 360)
        .saturate(isDark ? 0.3 : 0)
        .hex();

    const error = chroma(primary)
        .set("hsl.h", (chroma(primary).get("hsl.h") - 60 + 360) % 360)
        .saturate(isDark ? 0.5 : 0.3)
        .hex();

    const notification = chroma(primary)
        .set("hsl.h", (chroma(primary).get("hsl.h") + 200) % 360)
        .saturate(isDark ? 0.3 : 0.2)
        .hex();

    // background/card/border
    let bgBase = isDark ? chroma(primary).darken(4.5) : chroma(primary).brighten(1.5);
    const background = bgBase.hex();
    const card = isDark ? bgBase.brighten(0.5).hex() : bgBase.brighten(1).hex();
    const border = isDark ? bgBase.brighten(1.2).hex() : bgBase.darken(0.5).hex();

    const text = textContrast(background);

    return {
        primary,
        secondary,
        success,
        warning,
        error,
        notification,
        background,
        card,
        border,
        text,
    };
};

// ===== create theme =====
export const createTheme = (options = {}) => {
    const primaryLight = options.primary || "#2E6F40";
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

                success: c.success,
                successHover: colorHover(c.success, isDark),
                successFocus: colorFocus(c.success, isDark),

                warning: c.warning,
                warningHover: colorHover(c.warning, isDark),
                warningFocus: colorFocus(c.warning, isDark),

                error: c.error,
                errorHover: colorHover(c.error, isDark),
                errorFocus: colorFocus(c.error, isDark),

                notification: c.notification,
                notificationHover: colorHover(c.notification, isDark),
                notificationFocus: colorFocus(c.notification, isDark),

                background: c.background,
                card: c.card,
                border: c.border,
                borderHover: colorHover(c.border, isDark),

                text: c.text,
                textPrimary: c.text,
                textSecondary: chroma(c.text).alpha(0.7).css(),

                overlay: chroma(c.primary).alpha(isDark ? 0.2 : 0.12).css(),
                shadow: isDark ? chroma("black").alpha(0.7).css() : chroma("black").alpha(0.15).css(),
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
            themeObject.default ||
            (themeObject.dark ? defaultTheme.dark : defaultTheme.light),
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