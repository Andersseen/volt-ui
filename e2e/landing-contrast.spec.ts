import { expect, test } from './fixtures';

const COLORS = ['volt', 'ember', 'sage', 'dusk', 'glacier'] as const;
const STYLES = ['sharp', 'soft', 'brutal', 'ghost', 'retro'] as const;
const FIXTURES = {
  light: {
    '--background': '#f8fafc',
    '--foreground': '#0f172a',
    '--surface': '#ffffff',
    '--surface-foreground': '#0f172a',
    '--muted': '#e2e8f0',
    '--muted-foreground': '#475569',
    '--border': '#cbd5e1',
    '--ring': '#1d4ed8',
    '--input': '#64748b',
    '--primary': '#1d4ed8',
    '--primary-foreground': '#ffffff',
    '--secondary': '#e2e8f0',
    '--secondary-foreground': '#0f172a',
    '--destructive': '#b91c1c',
    '--destructive-foreground': '#ffffff',
    '--success': '#15803d',
    '--success-foreground': '#ffffff',
    '--warning': '#fef3c7',
    '--warning-foreground': '#713f12',
    '--error': '#b91c1c',
    '--error-foreground': '#ffffff',
    '--info': '#0369a1',
    '--info-foreground': '#ffffff',
  },
  dark: {
    '--background': '#0b1220',
    '--foreground': '#f8fafc',
    '--surface': '#111c2e',
    '--surface-foreground': '#f8fafc',
    '--muted': '#1e293b',
    '--muted-foreground': '#cbd5e1',
    '--border': '#334155',
    '--ring': '#93c5fd',
    '--input': '#94a3b8',
    '--primary': '#60a5fa',
    '--primary-foreground': '#0b1220',
    '--secondary': '#334155',
    '--secondary-foreground': '#f8fafc',
    '--destructive': '#f87171',
    '--destructive-foreground': '#0b1220',
    '--success': '#4ade80',
    '--success-foreground': '#0b1220',
    '--warning': '#fcd34d',
    '--warning-foreground': '#422006',
    '--error': '#f87171',
    '--error-foreground': '#0b1220',
    '--info': '#7dd3fc',
    '--info-foreground': '#0b1220',
  },
} as const;

test.describe('landing page rendered contrast', () => {
  test('keeps step content legible while the scroll entrance moves the card', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await expect(page.locator('#step-install app-step-item h3')).toBeVisible();

    const opacity = await page.locator('#step-install').evaluate(async step => {
      document.documentElement.style.scrollBehavior = 'auto';
      const y = window.scrollY + step.getBoundingClientRect().top - window.innerHeight + 24;
      window.scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 100));
      return Number(getComputedStyle(step.querySelector('app-step-item')!).opacity);
    });

    expect(
      opacity,
      'step text must remain legible throughout its scroll entrance'
    ).toBeGreaterThanOrEqual(0.95);
  });

  test('keeps visible workflow text at WCAG AA across official color and style presets', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('#step-install app-step-item h3')).toBeVisible();
    await page.addStyleTag({
      content:
        '*, *::before, *::after { transition: none !important; animation: none !important; }',
    });

    const failures = await page.evaluate(
      async presets => {
        interface CssColor {
          channels: [number, number, number];
          alpha: number;
        }
        const root = document.documentElement;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true })!;

        function parseColor(value: string): CssColor | null {
          if (!CSS.supports('color', value)) return null;
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = value;
          context.fillRect(0, 0, 1, 1);
          const pixel = context.getImageData(0, 0, 1, 1).data;
          return {
            channels: [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255],
            alpha: pixel[3] / 255,
          };
        }

        const luminance = (channels: number[]) => {
          const linear = channels.map(channel =>
            channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
          );
          return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
        };
        const ratio = (a: number[], b: number[]) => {
          const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
          return (values[0] + 0.05) / (values[1] + 0.05);
        };

        const samples = [
          { selector: 'app-source-visual p:nth-of-type(2)', minimum: 4.5 },
          { selector: 'app-source-visual p:nth-of-type(2) span.text-success', minimum: 3 },
          { selector: 'app-agent-visual div.mt-4 p span', minimum: 4.5 },
          { selector: '#step-install p.flex', minimum: 4.5 },
          { selector: '#step-install h3', minimum: 3 },
          { selector: '#step-install app-prose', minimum: 4.5 },
          { selector: '#step-install app-prose code.bg-muted', minimum: 4.5 },
          { selector: '#step-install app-code-window volt-card-header span', minimum: 4.5 },
          { selector: '#step-install app-code-window pre code', minimum: 4.5 },
        ];
        const failures: string[] = [];

        for (const preset of presets) {
          root.dataset.color = preset.color;
          root.dataset.style = preset.style;
          root.classList.toggle('dark', preset.dark);
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

          for (const sample of samples) {
            const element = document.querySelector<HTMLElement>(sample.selector);
            if (!element) {
              failures.push(
                `${preset.color}/${preset.dark ? 'dark' : 'light'}/${preset.style}: missing ${sample.selector}`
              );
              continue;
            }
            const foreground = parseColor(getComputedStyle(element).color);
            let background: CssColor | null = null;
            for (let node: HTMLElement | null = element; node; node = node.parentElement) {
              const candidate = parseColor(getComputedStyle(node).backgroundColor);
              if (candidate && candidate.alpha > 0) {
                background = candidate;
                if (candidate.alpha === 1) break;
              }
            }
            const fallback = parseColor(getComputedStyle(document.body).backgroundColor);
            const fgOpacity = (() => {
              let opacity = 1;
              for (let node: HTMLElement | null = element; node; node = node.parentElement) {
                opacity *= Number(getComputedStyle(node).opacity);
              }
              return opacity;
            })();
            if (!foreground || !(background ?? fallback)) {
              failures.push(
                `${preset.color}/${preset.dark ? 'dark' : 'light'}/${preset.style}: unparsed colors for ${sample.selector}`
              );
              continue;
            }
            const bg = background ?? fallback!;
            const rendered = foreground.channels.map(
              (channel, index) =>
                channel * foreground.alpha * fgOpacity +
                bg.channels[index] * (1 - foreground.alpha * fgOpacity)
            );
            const contrast = ratio(rendered, bg.channels);
            if (fgOpacity < 0.95 || contrast < sample.minimum) {
              failures.push(
                `${preset.color}/${preset.dark ? 'dark' : 'light'}/${preset.style} ${sample.selector}: ${contrast.toFixed(2)}:1 (opacity ${fgOpacity.toFixed(2)}, needs ${sample.minimum}:1)`
              );
            }
          }
        }
        return failures;
      },
      COLORS.flatMap(color =>
        [false, true].flatMap(dark => STYLES.map(style => ({ color, dark, style })))
      )
    );

    expect(failures).toEqual([]);
  });

  test('supports conforming custom light and dark semantic token fixtures', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('#step-install app-step-item h3')).toBeVisible();
    await page.addStyleTag({
      content:
        '*, *::before, *::after { transition: none !important; animation: none !important; }',
    });

    const failures = await page.evaluate(
      fixtures => {
        const root = document.documentElement;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true })!;
        const samples = [
          ['#step-install p.flex', 4.5],
          ['#step-install h3', 3],
          ['#step-install app-prose', 4.5],
        ] as const;
        const parse = (value: string) => {
          if (!CSS.supports('color', value)) return null;
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = value;
          context.fillRect(0, 0, 1, 1);
          const pixel = context.getImageData(0, 0, 1, 1).data;
          return {
            channels: [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255],
            alpha: pixel[3] / 255,
          };
        };
        const lum = (rgb: number[]) => {
          const c = rgb.map(value =>
            value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
          );
          return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        };
        const failures: string[] = [];
        for (const fixture of fixtures) {
          root.classList.toggle('dark', fixture.mode === 'dark');
          for (const [name, value] of Object.entries(fixture.tokens)) {
            root.style.setProperty(name, value);
          }
          for (const [selector, minimum] of samples) {
            const element = document.querySelector<HTMLElement>(selector);
            const foreground = element && parse(getComputedStyle(element).color);
            let background: number[] | null = null;
            for (let node: HTMLElement | null = element; node; node = node.parentElement) {
              const color = parse(getComputedStyle(node).backgroundColor);
              if (color && color.alpha === 1) {
                background = color.channels;
                break;
              }
            }
            if (!foreground || !background) {
              failures.push(`${fixture.mode}: missing colors for ${selector}`);
              continue;
            }
            const values = [lum(foreground.channels), lum(background)].sort((a, b) => b - a);
            const contrast = (values[0] + 0.05) / (values[1] + 0.05);
            if (contrast < minimum)
              failures.push(`${fixture.mode} ${selector}: ${contrast.toFixed(2)}:1`);
          }
        }
        return failures;
      },
      [
        { mode: 'light', tokens: FIXTURES.light },
        { mode: 'dark', tokens: FIXTURES.dark },
      ]
    );

    expect(failures).toEqual([]);
  });
});
