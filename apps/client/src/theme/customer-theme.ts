import { darkColors, lightColors, type ThemeColors } from '@sirohi/design-tokens';
import { useMemo } from 'react';
import { useAppTheme } from './theme-context';

const light: ThemeColors = { ...lightColors, primary: '#182D45', primaryDark: '#102237', ink: '#F7F9FC', background: '#F7F9FC', surfaceSunken: '#EEF3F8', surfaceRaised: '#F4F7FA', cream: '#182D45', textPrimary: '#182D45', muted: '#627185', textSecondary: '#627185', teal: '#345B7C', tealTint: '#EAF1F7', cta: '#CE481C', copper: '#CE481C', copperBright: '#E95C2B', copperTint: '#FFF0E8', line: '#E2E8EF', border: '#E2E8EF', header: '#FFFFFF', footer: '#102237' };
const dark: ThemeColors = { ...darkColors, primary: '#182D45', ink: '#0C1928', background: '#0C1928', surface: '#15283C', surfaceRaised: '#1B3148', surfaceSunken: '#102237', cream: '#F5F8FC', muted: '#B1C0D0', teal: '#A8CBE7', tealTint: '#203B53', cta: '#CE481C', copper: '#FFAA86', copperTint: '#442B27', line: '#2C4056', header: '#102237', footer: '#081522' };
export function useCustomerStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { resolvedTheme } = useAppTheme();
  return useMemo(() => factory(resolvedTheme === 'dark' ? dark : light), [factory, resolvedTheme]);
}
