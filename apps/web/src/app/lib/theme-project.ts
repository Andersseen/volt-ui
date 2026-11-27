import { COLOR_PRESETS, STYLE_PRESETS } from '@shared/lib/theme-presets';
import type { ColorToken, GeneratedPalette, ModePalette, PaletteHarmony } from './palette';
import { paletteHarmonies } from './palette';
import {
  DENSITIES,
  normalizeThemeName,
  SHAPE_CONTROLS,
  THEME_NAME_MAX,
  tokenNames,
  type ShapeKey,
  type ShapeOverrides,
  type ThemeDraft,
} from './theme-draft';

/**
 * The Theme Studio project format: an editable theme as data, so it can be saved, shared and opened
 * again. Version 1:
 *
 * ```json
 * {
 *   "format": "volt-theme-project",
 *   "version": 1,
 *   "name": "northern-lights",
 *   "palette": "glacier",
 *   "style": "sharp",
 *   "density": "comfortable",
 *   "shape": { "radius": 6, "borderWidth": 1, "ringWidth": 2, "shadowIntensity": 10, "spacing": null },
 *   "light": { "background": "#f7fafc", …every colour token… },
 *   "dark": { … },
 *   "generator": { "seed": "k3x9", "harmony": "analogous", "baseHue": 212, "secondaryHue": 242 }
 * }
 * ```
 *
 * Every colour is a lowercase `#rrggbb`; every shape value is an integer inside the studio's range,
 * or `null` to keep the style's. `generator` is optional. Nothing else is accepted: an unknown key,
 * a CSS expression or a script is an error, never ignored, so what is opened is exactly what is
 * shown. Serialization is deterministic (fixed key order), so a project round-trips byte for byte.
 *
 * Palette Crafter exports are a different, separate format (`paletteFromCrafterExport`).
 */

export const THEME_PROJECT_FORMAT = 'volt-theme-project';
export const THEME_PROJECT_VERSION = 1;
/** A project is a few kilobytes; anything far larger is not one. */
export const THEME_PROJECT_MAX_BYTES = 64 * 1024;

export interface ThemeProject {
  readonly format: typeof THEME_PROJECT_FORMAT;
  readonly version: typeof THEME_PROJECT_VERSION;
  readonly draft: ThemeDraft;
  readonly generator: GeneratedPalette['meta'] | null;
}

/** Why a project could not be opened, with the path of the offending value. */
export class ThemeProjectError extends Error {
  constructor(
    readonly code: 'too-large' | 'not-json' | 'not-a-project' | 'unsupported-version' | 'invalid',
    message: string
  ) {
    super(message);
  }
}

const COLOR_KEYS = Object.keys(tokenNames) as ColorToken[];
const SHAPE_KEYS = SHAPE_CONTROLS.map(control => control.key);
const NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const HEX = /^#[0-9a-f]{6}$/;
const SEED = /^[a-z0-9-]{1,64}$/i;

const TOP_KEYS = [
  'format',
  'version',
  'name',
  'palette',
  'style',
  'density',
  'shape',
  'light',
  'dark',
  'generator',
] as const;

/** The project as a plain object, keys in schema order. */
export function toProjectJson(
  draft: ThemeDraft,
  generator: GeneratedPalette['meta'] | null = null
): Record<string, unknown> {
  const palette = (mode: ModePalette) =>
    Object.fromEntries(COLOR_KEYS.map(key => [key, mode[key].toLowerCase()]));
  const json: Record<string, unknown> = {
    format: THEME_PROJECT_FORMAT,
    version: THEME_PROJECT_VERSION,
    name: normalizeThemeName(draft.name),
    palette: draft.palette,
    style: draft.style,
    density: draft.density,
    shape: Object.fromEntries(SHAPE_KEYS.map(key => [key, draft.shape[key]])),
    light: palette(draft.light),
    dark: palette(draft.dark),
  };
  if (generator) {
    json['generator'] = {
      seed: generator.seed,
      harmony: generator.harmony,
      baseHue: generator.baseHue,
      secondaryHue: generator.secondaryHue,
    };
  }
  return json;
}

/** Deterministic text: same project, same bytes. */
export function serializeThemeProject(
  draft: ThemeDraft,
  generator: GeneratedPalette['meta'] | null = null
): string {
  return `${JSON.stringify(toProjectJson(draft, generator), null, 2)}\n`;
}

const invalid = (message: string) => new ThemeProjectError('invalid', message);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, allowed: readonly string[], path: string): void {
  const unknown = Object.keys(value).filter(key => !allowed.includes(key));
  if (unknown.length) {
    throw invalid(
      `${path} has unsupported field${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}`
    );
  }
}

function oneOf<T extends string>(value: unknown, options: readonly T[], path: string): T {
  if (!options.includes(value as T)) {
    throw invalid(`${path} must be one of ${options.join(', ')}`);
  }
  return value as T;
}

function readPalette(value: unknown, path: string): ModePalette {
  if (!isRecord(value)) throw invalid(`${path} must be an object of colours`);
  exactKeys(value, COLOR_KEYS, path);
  const palette = {} as ModePalette;
  for (const key of COLOR_KEYS) {
    const color = value[key];
    if (typeof color !== 'string' || !HEX.test(color.toLowerCase())) {
      throw invalid(`${path}.${key} must be a #rrggbb hex colour`);
    }
    palette[key] = color.toLowerCase();
  }
  return palette;
}

function readShape(value: unknown): ShapeOverrides {
  if (!isRecord(value)) throw invalid('shape must be an object');
  exactKeys(value, SHAPE_KEYS, 'shape');
  const shape = {} as ShapeOverrides;
  for (const control of SHAPE_CONTROLS) {
    const raw = value[control.key];
    if (raw === null || raw === undefined) {
      shape[control.key as ShapeKey] = null;
      continue;
    }
    if (!Number.isInteger(raw) || (raw as number) < control.min || (raw as number) > control.max) {
      throw invalid(
        `shape.${control.key} must be a whole number from ${control.min} to ${control.max}, or null`
      );
    }
    shape[control.key] = raw as number;
  }
  return shape;
}

function readGenerator(value: unknown): GeneratedPalette['meta'] | null {
  if (value === undefined || value === null) return null;
  if (!isRecord(value)) throw invalid('generator must be an object');
  exactKeys(value, ['seed', 'harmony', 'baseHue', 'secondaryHue'], 'generator');
  const { seed, baseHue, secondaryHue, harmony } = value;
  if (typeof seed !== 'string' || !SEED.test(seed)) {
    throw invalid('generator.seed must be 1–64 letters, digits or hyphens');
  }
  const hue = (value: unknown, path: string): number => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value >= 360) {
      throw invalid(`${path} must be a hue from 0 to 359`);
    }
    return value;
  };
  return {
    seed,
    baseHue: hue(baseHue, 'generator.baseHue'),
    secondaryHue: hue(secondaryHue, 'generator.secondaryHue'),
    harmony: oneOf(harmony, paletteHarmonies, 'generator.harmony') as PaletteHarmony,
  };
}

/**
 * Validates untrusted text and returns the project it describes. Throws `ThemeProjectError` with a
 * message a person can act on; never returns a partial project.
 */
export function parseThemeProject(text: string): ThemeProject {
  if (text.length > THEME_PROJECT_MAX_BYTES) {
    throw new ThemeProjectError('too-large', 'That file is too large to be a theme project.');
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ThemeProjectError('not-json', 'That is not valid JSON.');
  }
  return readThemeProject(data);
}

/** `parseThemeProject` for a value that is already parsed (a stored record). */
export function readThemeProject(data: unknown): ThemeProject {
  if (!isRecord(data) || data['format'] !== THEME_PROJECT_FORMAT) {
    throw new ThemeProjectError(
      'not-a-project',
      'That is not a Volt theme project (expected "format": "volt-theme-project").'
    );
  }
  if (data['version'] !== THEME_PROJECT_VERSION) {
    throw new ThemeProjectError(
      'unsupported-version',
      `Theme project version ${JSON.stringify(data['version'])} is not supported; this studio reads version ${THEME_PROJECT_VERSION}.`
    );
  }
  exactKeys(data, TOP_KEYS, 'The project');

  const name = data['name'];
  if (typeof name !== 'string' || name.length > THEME_NAME_MAX || !NAME.test(name)) {
    throw invalid(
      `name must be lowercase letters, digits and single hyphens, starting with a letter (at most ${THEME_NAME_MAX})`
    );
  }

  return {
    format: THEME_PROJECT_FORMAT,
    version: THEME_PROJECT_VERSION,
    draft: {
      name,
      palette: oneOf(data['palette'], COLOR_PRESETS, 'palette'),
      style: oneOf(data['style'], STYLE_PRESETS, 'style'),
      density: oneOf(data['density'], DENSITIES, 'density'),
      shape: readShape(data['shape']),
      light: readPalette(data['light'], 'light'),
      dark: readPalette(data['dark'], 'dark'),
    },
    generator: readGenerator(data['generator']),
  };
}
