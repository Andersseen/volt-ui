import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Translations } from '../../../i18n/translations';
import { Prose } from '../../../components/prose';
import { RouterLink } from '@angular/router';
import {
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
} from 'volt';

@Component({
  selector: 'app-themes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Prose,
    RouterLink,
    VoltCard,
    VoltCardHeader,
    VoltCardTitle,
    VoltCardDescription,
    VoltCardContent,
  ],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('guide.themesPage.title') }}</h1>
        <p class="text-lg text-muted-foreground mt-2">{{ t('guide.themesPage.lede') }}</p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- Available Themes -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.themesPage.availableTitle') }}
        </h2>
        <p class="text-muted-foreground">{{ t('guide.themesPage.availableLede') }}</p>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          @for (preset of presets; track preset.id) {
            <div
              class="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  [class]="preset.badge"
                >
                  {{ preset.initial }}
                </div>
                <div>
                  <h3 class="font-medium" [class]="preset.hover">{{ preset.name }}</h3>
                  <p class="text-xs text-muted-foreground">{{ t(preset.descriptionKey) }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                @for (swatch of preset.swatches; track $index) {
                  <div class="w-6 h-6 rounded-full" [class]="swatch"></div>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Theme Setup -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">{{ t('guide.themesPage.setupTitle') }}</h2>
        <p class="text-muted-foreground">{{ t('guide.themesPage.setupLede') }}</p>

        <div class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm">
          import {{ '{' }} provideVoltTheme {{ '}' }} from '&#64;voltui/components'; export const
          appConfig: ApplicationConfig = {{ '{' }} providers: [ provideVoltTheme({{ '{' }} color:
          'volt', style: 'soft', dark: false {{ '}' }}) ] {{ '}' }};
        </div>
      </div>

      <!-- Color Options -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.themesPage.colorOptionsTitle') }}
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          <volt-card>
            <volt-card-header>
              <volt-card-title>{{ t('guide.themesPage.colorsTitle') }}</volt-card-title>
              <volt-card-description>{{ t('guide.themesPage.colorsLede') }}</volt-card-description>
            </volt-card-header>
            <volt-card-content>
              <ul class="space-y-2 text-sm">
                @for (key of colorKeys; track key) {
                  <li><app-prose [key]="key" /></li>
                }
              </ul>
            </volt-card-content>
          </volt-card>

          <volt-card>
            <volt-card-header>
              <volt-card-title>{{ t('guide.themesPage.stylesTitle') }}</volt-card-title>
              <volt-card-description>{{ t('guide.themesPage.stylesLede') }}</volt-card-description>
            </volt-card-header>
            <volt-card-content>
              <ul class="space-y-2 text-sm">
                @for (key of styleKeys; track key) {
                  <li><app-prose [key]="key" /></li>
                }
              </ul>
            </volt-card-content>
          </volt-card>
        </div>
      </div>

      <!-- Runtime API -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.themesPage.runtimeTitle') }}
        </h2>
        <p class="text-muted-foreground"><app-prose key="guide.themesPage.runtimeLede" /></p>

        <div class="grid gap-4 md:grid-cols-2">
          <volt-card>
            <volt-card-header>
              <volt-card-title class="font-mono text-base"
                >provideVoltTheme(options)</volt-card-title
              >
              <volt-card-description>
                <app-prose key="guide.themesPage.provideLede" />
              </volt-card-description>
            </volt-card-header>
            <volt-card-content>
              <p class="text-sm text-muted-foreground">
                <app-prose key="guide.themesPage.provideBody" />
              </p>
            </volt-card-content>
          </volt-card>

          <volt-card>
            <volt-card-header>
              <volt-card-title class="font-mono text-base"
                >applyVoltTheme(options, doc?)</volt-card-title
              >
              <volt-card-description>
                {{ t('guide.themesPage.applyLede') }}
              </volt-card-description>
            </volt-card-header>
            <volt-card-content>
              <p class="text-sm text-muted-foreground">
                <app-prose key="guide.themesPage.applyBody" />
              </p>
            </volt-card-content>
          </volt-card>
        </div>

        <div class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm">
          <div class="text-muted-foreground">// app.config.ts — set the theme at bootstrap</div>
          <div>import {{ '{' }} provideVoltTheme {{ '}' }} from '&#64;voltui/components';</div>
          <br />
          <div>export const appConfig: ApplicationConfig = {{ '{' }}</div>
          <div>
            &nbsp;&nbsp;providers: [provideVoltTheme({{ '{' }} color: 'ember', style: 'soft'
            {{ '}' }})],
          </div>
          <div>{{ '}' }};</div>
        </div>
      </div>

      <!-- Dark Mode Strategy -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">{{ t('guide.themesPage.darkTitle') }}</h2>
        <p class="text-muted-foreground"><app-prose key="guide.themesPage.darkLede" /></p>

        <div class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm">
          <div class="text-muted-foreground">// Static: dark by default</div>
          <div>provideVoltTheme({{ '{' }} color: 'volt', dark: true {{ '}' }})</div>
          <br />
          <div class="text-muted-foreground">// Dynamic: toggle from a button, a signal, etc.</div>
          <div>import {{ '{' }} applyVoltTheme {{ '}' }} from '&#64;voltui/components';</div>
          <div>applyVoltTheme({{ '{' }} dark: true {{ '}' }});</div>
          <br />
          <div class="text-muted-foreground">// Opt in to following the OS preference yourself</div>
          <div>const media = matchMedia('(prefers-color-scheme: dark)');</div>
          <div>applyVoltTheme({{ '{' }} dark: media.matches {{ '}' }});</div>
          <div>
            media.addEventListener('change', e =&gt; applyVoltTheme({{ '{' }} dark: e.matches
            {{ '}' }}));
          </div>
        </div>

        <p class="text-xs text-muted-foreground">
          <app-prose key="guide.themesPage.persistNote" />
        </p>
      </div>

      <!-- CSS Variables -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">{{ t('guide.themesPage.varsTitle') }}</h2>
        <p class="text-muted-foreground"><app-prose key="guide.themesPage.varsLede" /></p>

        <div
          class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm overflow-x-auto"
        >
          <pre>
/* Color tokens — one block per data-color, one per .dark[data-color] */
--background / --foreground
--surface / --surface-foreground        /* cards, popovers, dropdowns */
--muted / --muted-foreground
--border / --input / --ring             /* --input is the form-control border */
--primary / --primary-foreground
--secondary / --secondary-foreground
--destructive / --destructive-foreground /* shared by all colors, only in core.css */
--success / --success-foreground
--warning / --warning-foreground
--error / --error-foreground
--info / --info-foreground

/* Style tokens — one block per data-style */
--radius
--border-width / --border-style
--ring-width / --ring-offset-width
--volt-shadow-sm / --volt-shadow / --volt-shadow-md / --volt-shadow-lg
--spacing-component / --spacing-gap
--volt-font-weight-base / --volt-font-weight-heading / --volt-font-weight-label</pre
          >
        </div>
      </div>

      <!-- Custom color preset -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.themesPage.colorPresetTitle') }}
        </h2>
        <p class="text-muted-foreground"><app-prose key="guide.themesPage.colorPresetLede" /></p>

        <div
          class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm overflow-x-auto"
        >
          <pre>
:root[data-color='mytheme'] {{ '{' }}
  --primary: oklch(0.58 0.2 265);
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.96 0.01 265);
  --secondary-foreground: oklch(0.15 0.01 265);
  --background: oklch(1 0 0);
  --foreground: oklch(0.15 0.01 265);
  --surface: oklch(1 0 0);
  --surface-foreground: oklch(0.15 0.01 265);
  --muted: oklch(0.96 0.005 265);
  --muted-foreground: oklch(0.5 0.02 265);
  --border: oklch(0.9 0.01 265);
  --input: oklch(0.65 0.02 265);
  --ring: oklch(0.58 0.2 265);
  --success: oklch(0.5 0.14 150);
  --success-foreground: oklch(0.98 0 0);
  --warning: oklch(0.7 0.16 70);
  --warning-foreground: oklch(0.2 0.05 70);
  --error: oklch(0.55 0.22 25);
  --error-foreground: oklch(0.98 0 0);
  --info: oklch(0.55 0.14 240);
  --info-foreground: oklch(0.98 0 0);
{{ '}' }}

.dark[data-color='mytheme'] {{ '{' }}
  /* same tokens, tuned for a dark --background/--surface */
{{ '}' }}</pre
          >
        </div>

        <p class="text-xs text-muted-foreground">
          <app-prose key="guide.themesPage.contrastNote" />
          <a
            [routerLink]="path('/create-theme')"
            class="text-primary underline-offset-4 hover:underline"
            >{{ t('nav.createTheme') }}</a
          >
          {{ t('guide.themesPage.contrastNoteTail') }}
        </p>
      </div>

      <!-- Custom style preset -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.themesPage.stylePresetTitle') }}
        </h2>
        <p class="text-muted-foreground"><app-prose key="guide.themesPage.stylePresetLede" /></p>

        <div
          class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm overflow-x-auto"
        >
          <pre>
:root[data-style='mystyle'] {{ '{' }}
  --radius: 0.5rem;
  --border-width: 1px;
  --border-style: solid;
  --ring-width: 2px;
  --ring-offset-width: 2px;

  --volt-shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 0.05);
  --volt-shadow: 0 1px 3px 0 oklch(0 0 0 / 0.1);
  --volt-shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.1);
  --volt-shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.1);

  --spacing-component: 1;
  --spacing-gap: 0.5rem;

  --volt-font-weight-base: 400;
  --volt-font-weight-heading: 600;
  --volt-font-weight-label: 500;
{{ '}' }}</pre
          >
        </div>

        <p class="text-xs text-muted-foreground">
          <app-prose key="guide.themesPage.styleRegisterNote" />
        </p>
      </div>
    </div>
  `,
})
export default class ThemesPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  /*
   * The five presets, as data. They used to be five near-identical blocks of markup, which
   * is a hundred lines to keep in sync by hand and five places to forget a translation.
   *
   * The colours are fixed brand swatches rather than theme tokens on purpose: this grid
   * has to show a palette the page is not currently using. Tailwind reads these literals
   * straight out of this file, so they are emitted like any class in a template.
   */
  protected readonly presets = [
    {
      id: 'volt',
      name: 'Volt',
      initial: 'V',
      badge: 'bg-blue-500',
      hover: 'group-hover:text-blue-500',
      swatches: ['bg-blue-500', 'bg-blue-600', 'bg-slate-500'],
      descriptionKey: 'guide.themesPage.presets.volt',
    },
    {
      id: 'ember',
      name: 'Ember',
      initial: 'E',
      badge: 'bg-orange-500',
      hover: 'group-hover:text-orange-500',
      swatches: ['bg-orange-500', 'bg-red-500', 'bg-amber-500'],
      descriptionKey: 'guide.themesPage.presets.ember',
    },
    {
      id: 'sage',
      name: 'Sage',
      initial: 'S',
      badge: 'bg-emerald-500',
      hover: 'group-hover:text-emerald-500',
      swatches: ['bg-emerald-500', 'bg-green-600', 'bg-teal-500'],
      descriptionKey: 'guide.themesPage.presets.sage',
    },
    {
      id: 'dusk',
      name: 'Dusk',
      initial: 'D',
      badge: 'bg-violet-500',
      hover: 'group-hover:text-violet-500',
      swatches: ['bg-violet-500', 'bg-purple-600', 'bg-indigo-500'],
      descriptionKey: 'guide.themesPage.presets.dusk',
    },
    {
      id: 'glacier',
      name: 'Glacier',
      initial: 'G',
      badge: 'bg-cyan-500',
      hover: 'group-hover:text-cyan-500',
      swatches: ['bg-cyan-500', 'bg-sky-500', 'bg-blue-400'],
      descriptionKey: 'guide.themesPage.presets.glacier',
    },
  ] as const;

  protected readonly colorKeys = [
    'guide.themesPage.colors.volt',
    'guide.themesPage.colors.ember',
    'guide.themesPage.colors.sage',
    'guide.themesPage.colors.dusk',
    'guide.themesPage.colors.glacier',
  ] as const;

  protected readonly styleKeys = [
    'guide.themesPage.styles.sharp',
    'guide.themesPage.styles.soft',
    'guide.themesPage.styles.brutal',
    'guide.themesPage.styles.ghost',
    'guide.themesPage.styles.retro',
  ] as const;
}
