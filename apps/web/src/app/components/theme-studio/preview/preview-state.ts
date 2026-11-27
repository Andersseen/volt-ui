/**
 * The representative states every preview scenario can be put in. Hover, focus and selection are
 * not listed: the scenarios are live components, so those happen by pointing, tabbing and clicking.
 */
export const PREVIEW_STATES = [
  'default',
  'disabled',
  'invalid',
  'loading',
  'empty',
  'error',
] as const;
export type PreviewState = (typeof PREVIEW_STATES)[number];

export const PREVIEW_SCENARIOS = ['dashboard', 'settings', 'data'] as const;
export type PreviewScenario = (typeof PREVIEW_SCENARIOS)[number];
