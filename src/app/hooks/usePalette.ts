'use client';

import { useMemo } from 'react';
import { useColorScheme } from './useColorScheme';
import { getPalette, type Palette } from '../utils/colorSchemes';

// Thin convenience wrapper. Chart components import this instead of
// picking hex codes directly so that the colour-blind toggle flows
// through without a per-component rewrite.
export function usePalette(): Palette {
  const [scheme] = useColorScheme();
  return useMemo(() => getPalette(scheme), [scheme]);
}
