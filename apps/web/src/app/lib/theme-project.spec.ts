import { describe, expect, it } from 'vitest';
import { clonePreset, themeCss } from './theme-draft';
import {
  parseThemeProject,
  serializeThemeProject,
  THEME_PROJECT_MAX_BYTES,
  ThemeProjectError,
} from './theme-project';

// Test data deliberately reshaped into invalid forms.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;

const draft = () => ({ ...clonePreset('dusk', 'Northern Lights'), style: 'soft' as const });
const meta = { seed: 'k3x9', harmony: 'triadic' as const, baseHue: 212, secondaryHue: 332 };

function errorOf(text: string): ThemeProjectError {
  try {
    parseThemeProject(text);
  } catch (error) {
    return error as ThemeProjectError;
  }
  throw new Error('expected the project to be rejected');
}

const mutate = (change: (json: Record<string, unknown>) => void) => {
  const json = JSON.parse(serializeThemeProject(draft(), meta));
  change(json);
  return JSON.stringify(json);
};

describe('theme project format', () => {
  it('round-trips byte for byte, and to the same CSS', () => {
    const text = serializeThemeProject(draft(), meta);
    const project = parseThemeProject(text);

    expect(serializeThemeProject(project.draft, project.generator)).toBe(text);
    expect(themeCss(project.draft)).toBe(themeCss({ ...draft(), name: 'northern-lights' }));
    expect(project.generator).toEqual(meta);
  });

  it('serializes deterministically, with the schema key order and a normalized name', () => {
    const text = serializeThemeProject(draft());
    const json = JSON.parse(text);
    expect(Object.keys(json)).toEqual([
      'format',
      'version',
      'name',
      'palette',
      'style',
      'density',
      'shape',
      'light',
      'dark',
    ]);
    expect(json.name).toBe('northern-lights');
    expect(text.endsWith('}\n')).toBe(true);
    expect(serializeThemeProject(draft())).toBe(text);
  });

  it('keeps a null shape override as "use the style value"', () => {
    const project = parseThemeProject(
      mutate(json => ((json['shape'] as Record<string, unknown>)['radius'] = null))
    );
    expect(project.draft.shape.radius).toBeNull();
    expect(themeCss(project.draft)).not.toContain('--radius:');
  });

  it('names the version it cannot read', () => {
    const error = errorOf(mutate(json => (json['version'] = 2)));
    expect(error.code).toBe('unsupported-version');
    expect(error.message).toMatch(/version 2 is not supported/);
  });

  it('rejects anything that is not a project', () => {
    expect(errorOf('{ nope').code).toBe('not-json');
    expect(errorOf('{"theme":{"bg":"#fff"}}').code).toBe('not-a-project');
    expect(errorOf('x'.repeat(THEME_PROJECT_MAX_BYTES + 1)).code).toBe('too-large');
  });

  it.each([
    ['a CSS expression as a colour', (j: Json) => (j['light'].primary = 'var(--x)')],
    ['a declaration break-out', (j: Json) => (j['dark'].ring = '#fff; } body {')],
    ['a script as a name', (j: Json) => (j['name'] = '<script>alert(1)</script>')],
    ['a selector break-out name', (j: Json) => (j['name'] = "x'],body{")],
    ['an unknown field', (j: Json) => (j['css'] = 'body{display:none}')],
    ['an unknown colour token', (j: Json) => (j['light'].evil = '#000000')],
    ['a missing colour token', (j: Json) => delete j['dark'].primary],
    ['a fractional radius', (j: Json) => (j['shape'].radius = 4.5)],
    ['an out-of-range ring', (j: Json) => (j['shape'].ringWidth = 40)],
    ['an unknown style', (j: Json) => (j['style'] = 'mystyle')],
    ['an unknown palette', (j: Json) => (j['palette'] = 'neon')],
    ['an unknown density', (j: Json) => (j['density'] = 'huge')],
    ['a generator with extra fields', (j: Json) => (j['generator'].url = 'x')],
  ])('rejects %s with a pointed message', (_, change) => {
    const error = errorOf(mutate(change as (json: Record<string, unknown>) => void));
    expect(error).toBeInstanceOf(ThemeProjectError);
    expect(error.code).toBe('invalid');
    expect(error.message.length).toBeGreaterThan(10);
  });

  it('accepts upper-case hex and stores it lower-case', () => {
    const project = parseThemeProject(
      mutate(json => ((json['light'] as Json)['primary'] = '#ABCDEF'))
    );
    expect(project.draft.light.primary).toBe('#abcdef');
  });
});
