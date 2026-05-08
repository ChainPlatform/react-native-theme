import React from "react";
import { PixelRatio, Platform } from "react-native";
import chroma from "chroma-js";
import sdkStyles, { setSize } from "@chainplatform/layout";

const REM_MIN = 0.92;
const REM_MAX = 1.12;
const FONT_SCALE_FACTOR = 0.5;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const getRem = () => { return clamp(sdkStyles.REM, REM_MIN, REM_MAX); };

export const getUserFontScale = () => PixelRatio.getFontScale ? PixelRatio.getFontScale() : 1;

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

const useFontFamily = Platform.OS === "web";

export const getFonts = () => {

    const fontFamily = [
        "system-ui", '"Segoe UI"', "Roboto", "Helvetica", "Arial", "sans-serif", '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'
    ].join(", ");

    const create = (weight) => ({ ...(useFontFamily && { fontFamily }), fontWeight: weight, });

    return {
        thin: create("100"), semilight: create("200"), light: create("300"), regular: create("400"), medium: create("500"), semibold: create("600"), bold: create("700"), heavy: create("800"),
    };
};

const buildTypography = (preset = "balanced") => {

    const presets = {
        balanced: {
            mobile: {
                xs: 12, sm: 14, body: 16, h4: 18, h3: 20, h2: 24, h1: 30,
            }, desktop: {
                xs: 12, sm: 14, body: 15, h4: 18, h3: 22, h2: 28, h1: 36,
            },
        },

        compact: {
            mobile: {
                xs: 11, sm: 13, body: 14, h4: 16, h3: 18, h2: 20, h1: 24,
            }, desktop: {
                xs: 11, sm: 12, body: 14, h4: 16, h3: 18, h2: 22, h1: 28,
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

        caption: tokens.xs, small: tokens.sm, paragraph: tokens.body,

        headline4: tokens.h4, headline3: tokens.h3, headline2: tokens.h2, headline1: tokens.h1,

        lineHeight: {
            xs: Math.round(tokens.xs * 1.45), sm: Math.round(tokens.sm * 1.45), body: Math.round(tokens.body * 1.6), h4: Math.round(tokens.h4 * 1.4), h3: Math.round(tokens.h3 * 1.35), h2: Math.round(tokens.h2 * 1.25), h1: Math.round(tokens.h1 * 1.15),
        },

        fontWeight: {
            thin: 100, semilight: 200, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, heavy: 800,
        },
    };
};

const WHITE = "#FFFFFF";
const BLACK = "#111827";

const contrastText = (bg, light = WHITE, dark = BLACK) => {
    const lightContrast = chroma.contrast(bg, light);
    const darkContrast = chroma.contrast(bg, dark);
    return lightContrast >= darkContrast ? light : dark;
};

const ensureContrast = (fg, bg, ratio = 4.5) => {

    let color = chroma(fg);

    let tries = 0;

    while (chroma.contrast(color, bg) < ratio && tries < 12) {
        color = chroma(bg).luminance() > 0.5 ? color.darken(0.35) : color.brighten(0.35);
        tries++;
    }

    return color.hex();
};

const createPalette = (base) => {

    const [l, c, h] = chroma(base).oklch();

    const palette = { 50: chroma.oklch(0.985, c * 0.08, h).hex(), 100: chroma.oklch(0.95, c * 0.15, h).hex(), 200: chroma.oklch(0.89, c * 0.28, h).hex(), 300: chroma.oklch(0.81, c * 0.45, h).hex(), 400: chroma.oklch(0.72, c * 0.72, h).hex(), 500: chroma.oklch(l, c, h).hex(), 600: chroma.oklch(0.58, c * 0.92, h).hex(), 700: chroma.oklch(0.48, c * 0.82, h).hex(), 800: chroma.oklch(0.38, c * 0.70, h).hex(), 900: chroma.oklch(0.28, c * 0.55, h).hex(), 950: chroma.oklch(0.18, c * 0.40, h).hex(), };

    return palette;
};

const createNeutralPalette = (
    primary,
    isDark
) => {

    const h =
        chroma(primary)
            .get("oklch.h");

    const c =
        isDark
            ? 0.012
            : 0.006;

    return {
        0: chroma.oklch(1, 0, h).hex(),

        50: chroma.oklch(0.985, c, h).hex(),

        100: chroma.oklch(0.96, c, h).hex(),

        200: chroma.oklch(0.90, c, h).hex(),

        300: chroma.oklch(0.82, c, h).hex(),

        400: chroma.oklch(0.70, c, h).hex(),

        500: chroma.oklch(0.56, c, h).hex(),

        600: chroma.oklch(0.45, c, h).hex(),

        700: chroma.oklch(0.36, c, h).hex(),

        800: chroma.oklch(0.27, c, h).hex(),

        900: chroma.oklch(0.20, c, h).hex(),

        950: chroma.oklch(0.14, c, h).hex(),
    };
};

const createSemantic = (base, isDark) => {

    const palette = createPalette(base);
    const bg = isDark ? palette[900] : palette[50];
    const border = isDark ? palette[700] : palette[200];
    const solid = isDark ? palette[600] : palette[600];
    const text = ensureContrast(solid, bg);

    return { palette, bg, border, solid, text, };
};

const generateColors = (primaryBase, isDark) => {
    const basePrimary = isDark
        ? chroma(primaryBase)
            .darken(0.35)
            .desaturate(0.1)
            .hex()
        : chroma(primaryBase).hex();

    const primary = createPalette(basePrimary);

    // const secondary = createPalette(chroma(primaryBase).set("oklch.h", (chroma(primaryBase).get("oklch.h") + 32) % 360).hex());
    const secondaryBase = chroma(basePrimary)
        .set(
            "oklch.h",
            (
                chroma(basePrimary)
                    .get("oklch.h") + 32
            ) % 360
        )
        .hex();

    const secondary =
        createPalette(
            isDark
                ? chroma(secondaryBase)
                    .brighten(0.3)
                    .saturate(0.08)
                    .hex()
                : chroma(secondaryBase)
                    .darken(0.05)
                    .hex()
        );

    const neutral = createNeutralPalette(primaryBase, isDark);

    const primaryColor = chroma(primaryBase);

    const primaryChroma = primaryColor.get("oklch.c");

    const semanticChroma = clamp(primaryChroma * 0.9, 0.08, 0.22);

    const semanticLight = isDark ? 0.52 : 0.58;

    const semanticColor = (hue, lightAdjust = 0) => {
        return chroma.oklch(semanticLight + lightAdjust, semanticChroma, hue).hex();
    };

    const success = createSemantic(semanticColor(145), isDark);

    const warning = createSemantic(semanticColor(85), isDark);

    const error = createSemantic(semanticColor(25), isDark);

    const info = createSemantic(semanticColor(250), isDark);

    const background = isDark ? neutral[950] : neutral[50];

    const card =
        isDark
            ? chroma(neutral[900])
                .brighten(0.15)
                .hex()
            : neutral[0];

    const surface2 =
        isDark
            ? chroma(neutral[800])
                .brighten(0.1)
                .hex()
            : neutral[100];

    const border = isDark ? neutral[700] : neutral[200];

    const text = isDark ? neutral[50] : neutral[900];

    const textSecondary = isDark ? neutral[300] : neutral[600];

    const textMuted = isDark ? neutral[500] : neutral[400];

    const primaryText = contrastText(primary[500]);

    const secondaryText = contrastText(secondary[500]);

    // const overlay = isDark ? chroma("black").alpha(0.72).css("rgba") : chroma("black").alpha(0.25).css("rgba");

    // const shadow = isDark ? chroma("black").alpha(0.5).css("rgba") : chroma("black").alpha(0.14).css("rgba");

    const overlay = isDark ? "#000000" : "#000000";

    const shadow = isDark ? "#000000" : "#000000";

    return {

        primary, secondary, neutral,

        success, warning, error, info,

        background, card, surface2, border,

        text, textSecondary, textMuted,

        primaryText, secondaryText,

        overlay, shadow,
    };
};

export const createTheme = (options = {}) => {

    const primary = options.primary || "#2563EB";

    const dark = options.dark ?? false;

    const buildTheme = (isDark) => {

        const c = generateColors(primary, isDark);

        return {

            dark: isDark,

            colors: {

                primary: c.primary[500],

                primary_hover: c.primary[600],

                primary_focus: c.primary[700],

                primary_border: c.primary[300],

                primary_soft: c.primary[50],

                secondary: c.secondary[500],

                secondary_hover: c.secondary[600],

                secondary_focus: c.secondary[700],

                secondary_border: c.secondary[300],

                secondary_soft: c.secondary[50],

                background: c.background,

                card: c.card,

                surface_2: c.surface2,

                border: c.border,

                text: c.text,

                text_secondary: c.textSecondary,

                text_muted: c.textMuted,

                primary_text: c.primaryText,

                secondary_text: c.secondaryText,

                overlay: c.overlay,

                shadow: c.shadow,

                success: c.success.solid,

                success_bg: c.success.bg,

                success_border: c.success.border,

                success_text: c.success.text,

                warning: c.warning.solid,

                warning_bg: c.warning.bg,

                warning_border: c.warning.border,

                warning_text: c.warning.text,

                error: c.error.solid,

                error_bg: c.error.bg,

                error_border: c.error.border,

                error_text: c.error.text,

                info: c.info.solid,

                info_bg: c.info.bg,

                info_border: c.info.border,

                info_text: c.info.text,

                tab_bar_active: c.primary[500],

                tab_bar_inactive: ensureContrast(c.textMuted, c.card, 3)
            },

            palette: { primary: c.primary, secondary: c.secondary, neutral: c.neutral, },

            spacing: { xs: setSize(4), sm: setSize(8), md: setSize(16), lg: setSize(24), xl: setSize(32), },

            radius: { xs: setSize(4), sm: setSize(8), md: setSize(12), lg: setSize(16), xl: setSize(24), full: 9999, },

            fontSize: buildTypography(options.preset || "balanced"), fonts: getFonts(),
        };
    };

    const light = buildTheme(false);

    const darkTheme = buildTheme(true);

    return { light, dark: darkTheme, default: dark ? darkTheme : light, mode: dark ? "dark" : "light", };
};

let listeners = [];

let currentThemeFull = createTheme();

let currentTheme = currentThemeFull.default;

const notify = (theme) => {
    listeners.forEach((cb) => cb(theme));
};

export const getTheme = () => {
    return currentThemeFull;
};

export const setTheme = (themeObject) => {

    if (!themeObject) {
        return;
    }

    currentThemeFull = { ...currentThemeFull, ...themeObject, };

    currentTheme = currentThemeFull.default;

    notify(currentTheme);

    return currentThemeFull;
};

export const useTheme = () => {

    const [theme, setThemeState] = React.useState(currentTheme);

    React.useEffect(() => {

        const cb = (t) => { setThemeState(t); };

        listeners.push(cb);

        return () => { listeners = listeners.filter((l) => l !== cb); };

    }, []);

    return theme;
};

export default { createTheme, setTheme, getTheme, useTheme, getFonts };