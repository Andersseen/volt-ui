import { describe, expect, it } from 'vitest';
import { COLOR_PRESETS, STYLE_PRESETS } from '@shared/lib/theme-presets';
import { contrastRatio, hexToLinearSrgb } from '@shared/lib/contrast';
import { DraftHistory } from './draft-history';
import { shippedStyle } from './shipped-palettes';
import { clonePreset } from './theme-draft';
import { evaluateContrast, suggestCorrection } from './theme-contrast';

const knobs = shippedStyle('sharp').knobs;

describe('Live contrast evaluation', () => {
  it('checks both modes with every pair check:contrast uses for one style', () => {
    const results = evaluateContrast(clonePreset('volt'), knobs);
    // 37 palette pairs + 5 style pairs + 4 alert tints, per mode.
    expect(results).toHaveLength(2 * (37 + 5 + 4));
    expect(new Set(results.map(r => r.id)).size).toBe(results.length);
    expect(results.filter(r => r.mode === 'dark')).toHaveLength(46);
  });

  it.each(COLOR_PRESETS.flatMap(color => STYLE_PRESETS.map(style => [color, style] as const)))(
    'agrees with the preset audit: %s / %s passes everywhere',
    (color, style) => {
      const failures = evaluateContrast(clonePreset(color), shippedStyle(style).knobs).filter(
        r => r.status !== 'pass'
      );
      expect(failures.map(r => `${r.mode} ${r.label} ${r.ratio}`)).toEqual([]);
    }
  );

  it('uses the role threshold: 4.5 for text, 3 for indicators and boundaries', () => {
    const results = evaluateContrast(clonePreset('volt'), knobs);
    expect(results.find(r => r.id === 'light:foreground|background')?.min).toBe(4.5);
    expect(results.find(r => r.id === 'light:ring|background')?.min).toBe(3);
    expect(results.find(r => r.id === 'light:input|background')?.kind).toBe('non-text');
  });

  it('flags a failing foreground and points at the token to edit', () => {
    const draft = clonePreset('volt');
    draft.light.primaryForeground = draft.light.primary;
    const failing = evaluateContrast(draft, knobs).find(
      r => r.id === 'light:primary-foreground|primary'
    )!;
    expect(failing.status).toBe('fail');
    expect(failing.ratio).toBe(1);
    expect(failing.target).toBe('primaryForeground');
    expect(failing.adjustable).toBe('primaryForeground');
  });

  it('points a derived surface at the colour it is made from', () => {
    const result = evaluateContrast(clonePreset('volt'), knobs).find(
      r => r.id === 'dark:surface-foreground|surface-elevated'
    )!;
    expect(result.target).toBe('surfaceForeground');
    const track = evaluateContrast(clonePreset('volt'), knobs).find(
      r => r.id === 'light:track|primary'
    )!;
    expect(track.target).toBe('primary');
    expect(track.adjustable).toBeNull();
  });
});

describe('contrast suggestions', () => {
  it('proposes the smallest hue-preserving change that clears the threshold', () => {
    const draft = clonePreset('glacier');
    draft.light.ring = '#c6dff0';
    const result = evaluateContrast(draft, knobs).find(r => r.id === 'light:ring|background')!;
    expect(result.status).toBe('fail');

    const suggestion = suggestCorrection(draft, knobs, result)!;
    expect(suggestion.token).toBe('ring');
    expect(suggestion.from).toBe('#c6dff0');
    expect(suggestion.ratio).toBeGreaterThanOrEqual(3);
    const measured = contrastRatio(
      hexToLinearSrgb(suggestion.to)!,
      hexToLinearSrgb(draft.light.background)!
    );
    expect(measured).toBeGreaterThanOrEqual(3);
  });

  it('offers nothing for a passing pair or one whose foreground is a surface', () => {
    const draft = clonePreset('volt');
    const results = evaluateContrast(draft, knobs);
    expect(suggestCorrection(draft, knobs, results[0])).toBeNull();

    draft.light.background = draft.light.foreground;
    const tooltip = evaluateContrast(draft, knobs).find(
      r => r.id === 'light:background|foreground'
    )!;
    expect(tooltip.status).toBe('fail');
    expect(suggestCorrection(draft, knobs, tooltip)).toBeNull();
  });

  it('says so when no lightness can reach the threshold', () => {
    // 4.5:1 and 3:1 are always reachable against black or white; a stricter goal is not always.
    const draft = clonePreset('volt');
    draft.light.muted = '#777777';
    const result = evaluateContrast(draft, knobs).find(
      r => r.id === 'light:muted-foreground|muted'
    )!;
    expect(suggestCorrection(draft, knobs, { ...result, status: 'fail', min: 7 })).toBeNull();
    expect(suggestCorrection(draft, knobs, { ...result, status: 'fail' })).not.toBeNull();
  });
});

describe('DraftHistory', () => {
  it('undoes and redoes, clears redo on a new change, and stays bounded', () => {
    const history = new DraftHistory<number>(3);
    let state = 0;
    for (const next of [1, 2, 3, 4]) {
      history.record(state);
      state = next;
    }
    state = history.undo(state)!; // 3
    state = history.undo(state)!; // 2
    state = history.undo(state)!; // 1
    expect(state).toBe(1);
    expect(history.undo(state)).toBeNull(); // 0 fell off the bounded stack
    state = history.redo(state)!;
    expect(state).toBe(2);
    history.record(state);
    expect(history.canRedo).toBe(false);
  });
});
