/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import type { LinearGradientProps } from 'expo-linear-gradient';
import type { ColorValue } from 'react-native';
import { Platform } from 'react-native';

type GradientColors = LinearGradientProps['colors'];

export type ThemeType = {
  primary: ColorValue;
  primaryDark: ColorValue;
  background: {
    dark: ColorValue;
    medium: ColorValue;
    light: ColorValue;
  };
  text: {
    primary: ColorValue;
    secondary: ColorValue;
    accent: ColorValue;
  };
  border: {
    primary: ColorValue;
    secondary: ColorValue;
  };
  shadow: {
    primary: ColorValue;
    dark: ColorValue;
  };
  gradient: {
    primary: GradientColors;
    button: GradientColors;
    overlay: GradientColors;
  };
};

export const theme: ThemeType = {
  primary: '#22c55e',
  primaryDark: '#15803d',
  background: {
    dark: '#000000',
    medium: '#111827',
    light: '#1f2937',
  },
  text: {
    primary: '#ffffff',
    secondary: '#8b9cb8',
    accent: '#22c55e',
  },
  border: {
    primary: '#22c55e',
    secondary: 'rgba(34, 197, 94, 0.2)',
  },
  shadow: {
    primary: '#22c55e',
    dark: '#000000',
  },
  gradient: {
    primary: ['#22c55e', '#1f2937', '#000000'],
    button: ['#22c55e', '#15803d'],
    overlay: ['rgba(34, 197, 94, 0.3)', 'transparent'],
  }
};

// Legacy theme colors (keeping for backward compatibility)
const tintColorLight = '#a4880aff';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: theme.background.dark,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: theme.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
