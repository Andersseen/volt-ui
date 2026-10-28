import coreTheme from '../../projects/volt/src/themes/core.css?raw';
import emberColor from '../../projects/volt/src/themes/colors/ember.css?raw';
import sageColor from '../../projects/volt/src/themes/colors/sage.css?raw';
import duskColor from '../../projects/volt/src/themes/colors/dusk.css?raw';
import glacierColor from '../../projects/volt/src/themes/colors/glacier.css?raw';
import softStyle from '../../projects/volt/src/themes/styles/soft.css?raw';
import brutalStyle from '../../projects/volt/src/themes/styles/brutal.css?raw';
import ghostStyle from '../../projects/volt/src/themes/styles/ghost.css?raw';
import retroStyle from '../../projects/volt/src/themes/styles/retro.css?raw';

/**
 * The library's color and style presets as plain variable maps, read from the same CSS files
 * the library ships.
 *
 * Presets are keyed on `:root[data-color]` / `:root[data-style]`, so they can only theme the
 * whole page. The landing playground needs one preset on one panel; reading the files here
 * (instead of copying their values) means a preset change can never leave the playground
 * showing an old palette.
 */

export const COLOR_PRESETS = ['volt', 'ember', 'sage', 'dusk', 'glacier'] as const;
export const STYLE_PRESETS = ['sharp', 'soft', 'brutal', 'ghost', 'retro'] as const;

export type ColorPreset = (typeof COLOR_PRESETS)[number];
export type StylePreset = (typeof STYLE_PRESETS)[number];

type Vars = Readonly<Record<string, string>>;

// `volt` and `sharp` are the defaults, so their values live in core.css; their own files are
// placeholders.
const COLOR_SOURCES: Record<ColorPreset, string> = {
  volt: coreTheme,
  ember: emberColor,
  sage: sageColor,
  dusk: duskColor,
  glacier: glacierColor,
};

const STYLE_SOURCES: Record<StylePreset, string> = {
  sharp: coreTheme,
  soft: softStyle,
  brutal: brutalStyle,
  ghost: ghostStyle,
  retro: retroStyle,
};

/** The custom properties declared in the first rule whose selector list includes `selector`. */
export function readVars(css: string, selector: string): Vars {
  const start = css.indexOf(selector);
  if (start === -1) {
    return {};
  }

  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const vars: Record<string, string> = {};

  for (const match of css.slice(open + 1, close).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    vars[match[1]] = match[2].trim();
  }

  return vars;
}

const COLORS = Object.fromEntries(
  COLOR_PRESETS.map(name => [
    name,
    {
      light: readVars(COLOR_SOURCES[name], `:root[data-color='${name}']`),
      dark: readVars(COLOR_SOURCES[name], `.dark[data-color='${name}']`),
    },
  ])
) as Record<ColorPreset, { light: Vars; dark: Vars }>;

const STYLES = Object.fromEntries(
  STYLE_PRESETS.map(name => [name, readVars(STYLE_SOURCES[name], `:root[data-style='${name}']`)])
) as Record<StylePreset, Vars>;

/** The primary color of each preset in light mode, for swatches. */
export function swatch(color: ColorPreset): string {
  return COLORS[color].light['--primary'] ?? 'currentColor';
}

function toStyle(vars: Vars): string {
  return Object.entries(vars)
    .map(([name, value]) => `${name}: ${value}`)
    .join('; ');
}

/** An inline `style` value that applies only a style preset (radius, borders, shadows). */
export function shapeVars(style: StylePreset): string {
  return toStyle(STYLES[style]);
}

/**
 * An inline `style` value that themes one element with a preset pair, so Tailwind utilities
 * inside it (`bg-primary`, `rounded-md`, `shadow-lg`) resolve to that preset rather than the page's.
 */
export function presetStyle(color: ColorPreset, style: StylePreset, dark: boolean): string {
  return toStyle({ ...STYLES[style], ...COLORS[color][dark ? 'dark' : 'light'] });
}
