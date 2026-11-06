import emberColor from '../../../../../packages/volt/src/themes/colors/ember.css?raw';
import glacierColor from '../../../../../packages/volt/src/themes/colors/glacier.css?raw';
import sageColor from '../../../../../packages/volt/src/themes/colors/sage.css?raw';
import { oklchToHex, type ColorToken, type ModePalette } from './palette';

/**
 * The studio's starting points, read from the stylesheets the library ships rather than copied, so
 * a palette change cannot leave the studio offering an old one. The colour fields edit hex.
 */
const SOURCES = { ember: emberColor, glacier: glacierColor, sage: sageColor };

const TOKENS: Record<ColorToken, string> = {
  background: 'background',
  foreground: 'foreground',
  surface: 'surface',
  surfaceForeground: 'surface-foreground',
  muted: 'muted',
  mutedForeground: 'muted-foreground',
  border: 'border',
  input: 'input',
  ring: 'ring',
  primary: 'primary',
  primaryForeground: 'primary-foreground',
  secondary: 'secondary',
  secondaryForeground: 'secondary-foreground',
  success: 'success',
  successForeground: 'success-foreground',
  warning: 'warning',
  warningForeground: 'warning-foreground',
  error: 'error',
  errorForeground: 'error-foreground',
  info: 'info',
  infoForeground: 'info-foreground',
};

function readPalette(rule: string): ModePalette {
  const read = (token: string): string => {
    const match = rule.match(new RegExp(`--${token}: oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)\\)`));
    if (!match) {
      throw new Error(`Palette token --${token} is not a literal oklch() value`);
    }
    return oklchToHex({ l: Number(match[1]), c: Number(match[2]), h: Number(match[3]) });
  };

  return Object.fromEntries(
    Object.entries(TOKENS).map(([key, token]) => [key, read(token)])
  ) as ModePalette;
}

/** The light and dark values of a shipped palette. Light is the first rule of the file, dark the second. */
export function shippedPalette(name: keyof typeof SOURCES): {
  light: ModePalette;
  dark: ModePalette;
} {
  const [, light, dark] = SOURCES[name].split('{');
  return { light: readPalette(light), dark: readPalette(dark) };
}
