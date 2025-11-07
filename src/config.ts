import type { AccentType } from './types';

export const ACCENT_CONFIG: Record<AccentType, { color: string; ringColor: string; labelKey: string }> = {
  skip: { color: 'bg-slate-500/30', ringColor: 'ring-slate-400', labelKey: 'accentLabelSkip' },
  standard: { color: 'bg-green-500/80', ringColor: 'ring-green-400', labelKey: 'accentLabelStandard' },
  accent1: { color: 'bg-red-500/80', ringColor: 'ring-red-400', labelKey: 'accentLabelAccent1' },
  accent2: { color: 'bg-yellow-500/80', ringColor: 'ring-yellow-400', labelKey: 'accentLabelAccent2' },
};
