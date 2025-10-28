# 🎨 @chainplatform/theme

A lightweight **theming system** for React Native / React Native Web.  
Supports **light / dark mode**, **custom palettes**, **hover/focus states**, and can be used in both **Class Components** and **Function Components**.

<p align="center">
  <a href="https://github.com/ChainPlatform/react-native-theme/blob/HEAD/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
  <a href="https://www.npmjs.com/package/@chainplatform/theme">
    <img src="https://img.shields.io/npm/v/@chainplatform/theme?color=brightgreen&label=npm%20package" alt="Current npm package version." />
  </a>
  <a href="https://www.npmjs.com/package/@chainplatform/theme">
    <img src="https://img.shields.io/npm/dt/@chainplatform/theme.svg"></img>
  </a>
  <a href="https://www.npmjs.com/package/@chainplatform/theme">
    <img src="https://img.shields.io/badge/platform-android%20%7C%20ios%20%7C%20web-blue"></img>
  </a>
  <a href="https://github.com/ChainPlatform/react-native-theme/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=doansan">
    <img src="https://img.shields.io/twitter/follow/doansan.svg?label=Follow%20@doansan" alt="Follow @doansan" />
  </a>
</p>

---

## ✨ Features

- 🌗 **Light / Dark mode** (auto via `Appearance` or manual with `setTheme`)  
- 🎨 Generate full palette (primary, secondary, success, error, warning, notification…) from a single `primary` color  
- 🖌️ Supports **hover** and **focus** variants (`primaryHover`, `primaryFocus`, etc.)  
- 📐 Built-in **spacing, radius, fontSize** scales with `setSize` from `@chainplatform/layout`  
- 🔧 Easy access with **`getTheme()`** (no need to care class vs function)  
- ⚡ Fully typed, extendable, customizable with `createTheme`  

---

## 📦 Installation

```bash
npm install @chainplatform/theme
# or
yarn add @chainplatform/theme
```

---

## 🚀 Usage

### 1. Get theme anywhere

#### In **Function Components**

```jsx
import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@chainplatform/theme";

export default function Home() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md }}>
      <Text style={{ color: theme.colors.primary_text, fontSize: theme.fontSize.lg }}>
        Hello from {theme.dark ? "Dark" : "Light"} mode 👋
      </Text>
    </View>
  );
}
```

#### In **Class Components**

```jsx
import React, { Component } from "react";
import { View, Text } from "react-native";
import { getTheme } from "@chainplatform/theme";

export default class Profile extends Component {
  render() {
    const theme = getTheme();
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text }}>Profile Page</Text>
      </View>
    );
  }
}
```

---

### 2. Override Theme

#### Set theme manually

```jsx
import { setTheme } from "@chainplatform/theme";

// Switch to dark
setTheme({ dark: true });

// Switch to light
setTheme({ dark: false });
```

#### Override full object (keep all keys consistent)

```jsx
import { setTheme } from "@chainplatform/theme";

setTheme({
  dark: false,
  colors: {
    primary: "#E63946",
    background: "#F8FAFC",
    card: "#FFFFFF",
    border: "#E2E8F0",
    primary_text: "#0F172A",
    text: "#334155",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    notification: "#3B82F6",
    // hover & focus variants auto generated
  }
});
```

#### Create new theme object

```jsx
import { createTheme } from "@chainplatform/theme";

const customTheme = createTheme("#8B5CF6"); // primary violet
console.log(customTheme.colors.primary); // → #8B5CF6
```

---

## ⚙️ API

### 🔧 Theme Functions

- `useTheme()` → Hook to get current theme (function components)  
- `getTheme()` → Function to get current theme (works in class components & anywhere)  
- `setTheme(partialTheme)` → Merge and apply theme globally  
- `createTheme(primary)` → Generate a new theme object from given primary  

---

## 🎨 Theme Object

A generated theme includes:

```ts
{
  dark: boolean,
  colors: {
    primary, primaryHover, primaryFocus,
    secondary, secondaryHover, secondaryFocus,
    success, error, warning, notification, notificationHover,
    background, card, border,
    primary_text, text,
  },
  spacing: { xs, sm, md, lg, xl },
  radius: { sm, md, lg, xl },
  fontSize: { xs, sm, md, lg, xl },
}
```

---

## ✅ Summary

- Use `useTheme` or `getTheme` to access theme anywhere  
- Switch or override with `setTheme`  
- Generate new themes with `createTheme`  
- Supports **light / dark**, **hover/focus**, **scales**  

---

## 🪪 License

MIT © 2025 [Chain Platform](https://chainplatform.net)

---

## 💖 Support & Donate

If you find this package helpful, consider supporting the development:

| Cryptocurrency | Address |
|----------------|----------|
| **Bitcoin (BTC)** | `17grbSNSEcEybS1nHh4TGYVodBwT16cWtc` |
| ![alt text](image-1.png) | `17grbSNSEcEybS1nHh4TGYVodBwT16cWtc` |
| **Ethereum (ETH)** | `0xa2fd119a619908d53928e5848b49bf1cc15689d4` |
| ![alt text](image-2.png) | `0xa2fd119a619908d53928e5848b49bf1cc15689d4` |
| **Tron (TRX)** | `TYL8p2PLCLDfq3CgGBp58WdUvvg9zsJ8pd` |
| ![alt text](image.png) | `TYL8p2PLCLDfq3CgGBp58WdUvvg9zsJ8pd` |
| **DOGE (DOGE)** | `DDfKN2ys4frNaUkvPKcAdfL6SiVss5Bm19` |
| **USDT (SOLANA)** | `cPUZsb7T9tMfiZFqXbWbRvrUktxgZQXQ2Ni1HiVXgFm` |

Your contribution helps maintain open-source development under the Chain Platform ecosystem 🚀
