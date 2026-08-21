import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Translations } from '../../../i18n/translations';
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
        <h1 class="text-3xl font-bold tracking-tight">Themes</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Customize the look and feel of your application with built-in themes, colors, and dark
          mode support.
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- Available Themes -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Available Themes</h2>
        <p class="text-muted-foreground">
          Volt UI comes with several pre-built color themes. Each theme provides a unique palette
          for primary, secondary, accent, and semantic colors.
        </p>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <!-- Volt Theme -->
          <div
            class="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold"
              >
                V
              </div>
              <div>
                <h3 class="font-medium group-hover:text-blue-500">Volt</h3>
                <p class="text-xs text-muted-foreground">Default blue theme</p>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="w-6 h-6 rounded-full bg-blue-500"></div>
              <div class="w-6 h-6 rounded-full bg-blue-600"></div>
              <div class="w-6 h-6 rounded-full bg-slate-500"></div>
            </div>
          </div>

          <!-- Ember Theme -->
          <div
            class="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold"
              >
                E
              </div>
              <div>
                <h3 class="font-medium group-hover:text-orange-500">Ember</h3>
                <p class="text-xs text-muted-foreground">Warm orange theme</p>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="w-6 h-6 rounded-full bg-orange-500"></div>
              <div class="w-6 h-6 rounded-full bg-red-500"></div>
              <div class="w-6 h-6 rounded-full bg-amber-500"></div>
            </div>
          </div>

          <!-- Sage Theme -->
          <div
            class="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold"
              >
                S
              </div>
              <div>
                <h3 class="font-medium group-hover:text-emerald-500">Sage</h3>
                <p class="text-xs text-muted-foreground">Natural green theme</p>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="w-6 h-6 rounded-full bg-emerald-500"></div>
              <div class="w-6 h-6 rounded-full bg-green-600"></div>
              <div class="w-6 h-6 rounded-full bg-teal-500"></div>
            </div>
          </div>

          <!-- Dusk Theme -->
          <div
            class="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center text-white font-bold"
              >
                D
              </div>
              <div>
                <h3 class="font-medium group-hover:text-violet-500">Dusk</h3>
                <p class="text-xs text-muted-foreground">Purple twilight theme</p>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="w-6 h-6 rounded-full bg-violet-500"></div>
              <div class="w-6 h-6 rounded-full bg-purple-600"></div>
              <div class="w-6 h-6 rounded-full bg-indigo-500"></div>
            </div>
          </div>

          <!-- Glacier Theme -->
          <div
            class="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold"
              >
                G
              </div>
              <div>
                <h3 class="font-medium group-hover:text-cyan-500">Glacier</h3>
                <p class="text-xs text-muted-foreground">Cool cyan theme</p>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="w-6 h-6 rounded-full bg-cyan-500"></div>
              <div class="w-6 h-6 rounded-full bg-sky-500"></div>
              <div class="w-6 h-6 rounded-full bg-blue-400"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Theme Setup -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Theme Setup</h2>
        <p class="text-muted-foreground">
          Add the theme provider to your application configuration:
        </p>

        <div class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm">
          import {{ '{' }} provideVoltTheme {{ '}' }} from '&#64;voltui/components'; export const
          appConfig: ApplicationConfig = {{ '{' }} providers: [ provideVoltTheme({{ '{' }} color:
          'volt', style: 'soft', dark: false {{ '}' }}) ] {{ '}' }};
        </div>
      </div>

      <!-- Color Options -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Color Options</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <volt-card>
            <volt-card-header>
              <volt-card-title>Theme Colors</volt-card-title>
              <volt-card-description>Choose your primary color palette</volt-card-description>
            </volt-card-header>
            <volt-card-content>
              <ul class="space-y-2 text-sm">
                <li><code class="px-1.5 py-0.5 bg-muted rounded">'volt'</code> - Blue (default)</li>
                <li><code class="px-1.5 py-0.5 bg-muted rounded">'ember'</code> - Orange/Red</li>
                <li><code class="px-1.5 py-0.5 bg-muted rounded">'sage'</code> - Green</li>
                <li><code class="px-1.5 py-0.5 bg-muted rounded">'dusk'</code> - Purple</li>
                <li><code class="px-1.5 py-0.5 bg-muted rounded">'glacier'</code> - Cyan</li>
              </ul>
            </volt-card-content>
          </volt-card>

          <volt-card>
            <volt-card-header>
              <volt-card-title>Style Variants</volt-card-title>
              <volt-card-description>Choose your component style</volt-card-description>
            </volt-card-header>
            <volt-card-content>
              <ul class="space-y-2 text-sm">
                <li>
                  <code class="px-1.5 py-0.5 bg-muted rounded">'sharp'</code> - Small radius, flat
                  shadows (default)
                </li>
                <li>
                  <code class="px-1.5 py-0.5 bg-muted rounded">'soft'</code> - Large radius, diffuse
                  shadows
                </li>
                <li>
                  <code class="px-1.5 py-0.5 bg-muted rounded">'brutal'</code> - No radius, hard
                  offset shadows, heavy borders
                </li>
                <li>
                  <code class="px-1.5 py-0.5 bg-muted rounded">'ghost'</code> - No borders, no
                  shadows
                </li>
                <li><code class="px-1.5 py-0.5 bg-muted rounded">'retro'</code> - Y2K look</li>
              </ul>
            </volt-card-content>
          </volt-card>
        </div>
      </div>

      <!-- Runtime API -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Runtime API</h2>
        <p class="text-muted-foreground">
          Two functions from
          <code class="px-1.5 py-0.5 bg-muted rounded">&#64;voltui/components</code> control the
          theme at runtime. Both just set
          <code class="px-1.5 py-0.5 bg-muted rounded">data-color</code>,
          <code class="px-1.5 py-0.5 bg-muted rounded">data-style</code> and a
          <code class="px-1.5 py-0.5 bg-muted rounded">.dark</code> class on
          <code class="px-1.5 py-0.5 bg-muted rounded">&lt;html&gt;</code> — there is no hidden
          state, so you can inspect or override the result with plain DOM APIs at any time.
        </p>

        <div class="grid gap-4 md:grid-cols-2">
          <volt-card>
            <volt-card-header>
              <volt-card-title class="font-mono text-base"
                >provideVoltTheme(options)</volt-card-title
              >
              <volt-card-description
                >Environment provider. Call it once in <code>appConfig.providers</code> to set the
                theme at bootstrap, on both server and client.</volt-card-description
              >
            </volt-card-header>
            <volt-card-content>
              <p class="text-sm text-muted-foreground">
                <strong class="text-foreground">SSR-safe.</strong> It reads Angular's
                <code class="px-1.5 py-0.5 bg-muted rounded">DOCUMENT</code> injection token rather
                than the global <code class="px-1.5 py-0.5 bg-muted rounded">document</code>, so the
                theme attributes are present in the server-rendered HTML itself — no flash of the
                default theme while the client bundle hydrates.
              </p>
            </volt-card-content>
          </volt-card>

          <volt-card>
            <volt-card-header>
              <volt-card-title class="font-mono text-base"
                >applyVoltTheme(options, doc?)</volt-card-title
              >
              <volt-card-description
                >Plain function. Call it from a click handler, an effect, or anywhere else you need
                to change the theme after bootstrap (e.g. a theme switcher).</volt-card-description
              >
            </volt-card-header>
            <volt-card-content>
              <p class="text-sm text-muted-foreground">
                Browser-only by default (it no-ops if <code>document</code> is undefined). Pass an
                explicit <code>doc</code> argument to target a different document, e.g. in a test.
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
        <h2 class="text-xl font-semibold tracking-tight">Dark Mode Strategy</h2>
        <p class="text-muted-foreground">
          Dark mode is class-based: adding
          <code class="px-1.5 py-0.5 bg-muted rounded">.dark</code> to
          <code class="px-1.5 py-0.5 bg-muted rounded">&lt;html&gt;</code> switches every component
          to its dark token values (see <code>core.css</code>'s
          <code class="px-1.5 py-0.5 bg-muted rounded">&#64;custom-variant dark</code>). Volt does
          <strong class="text-foreground">not</strong> read
          <code class="px-1.5 py-0.5 bg-muted rounded">prefers-color-scheme</code> automatically —
          <code>dark</code> defaults to light unless you pass <code>dark: true</code> or call
          <code>applyVoltTheme</code> yourself, so the choice is always explicit and won't silently
          change if the visitor's OS theme changes.
        </p>

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
          The docs app itself persists the visitor's choice to
          <code class="px-1.5 py-0.5 bg-muted rounded">localStorage</code> and applies it from a
          small inline script in <code>index.html</code>'s <code>&lt;head&gt;</code>, before any
          stylesheet loads — see
          <code class="px-1.5 py-0.5 bg-muted rounded">src/app/components/theme-switcher.ts</code>
          for a reference implementation if you want the same no-flash behavior client-side.
        </p>
      </div>

      <!-- CSS Variables -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">CSS Variables</h2>
        <p class="text-muted-foreground">
          Every preset sets the same set of semantic tokens as
          <code class="px-1.5 py-0.5 bg-muted rounded">oklch()</code> values. Components consume
          them through Tailwind utilities (<code>bg-primary</code>,
          <code>text-muted-foreground</code>) mapped via <code>&#64;theme inline</code> in
          <code>core.css</code> — never a raw <code>var(--primary)</code>. This is the full list a
          preset can define; see the two guides below for copy-paste templates.
        </p>

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
        <h2 class="text-xl font-semibold tracking-tight">Create a Custom Color Preset</h2>
        <p class="text-muted-foreground">
          A color preset is just a pair of selectors keyed by
          <code class="px-1.5 py-0.5 bg-muted rounded">data-color</code>. Copy this template,
          replace <code>'mytheme'</code> and the values, then import the file after
          <code>&#64;voltui/components/themes.css</code> in your global stylesheet.
        </p>

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
          Keep every foreground/background pair at 4.5:1 contrast or better (3:1 for
          <code>--ring</code> and <code>--input</code> against <code>--background</code>) — see
          <code class="px-1.5 py-0.5 bg-muted rounded">scripts/contrast-audit.mjs</code> in the repo
          for the exact check this project runs against its own presets. The
          <a
            [routerLink]="path('/create-theme')"
            class="text-primary underline-offset-4 hover:underline"
            >Create Theme</a
          >
          tool generates a starting point from a single accent color if you'd rather not hand-pick
          eleven tokens.
        </p>
      </div>

      <!-- Custom style preset -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Create a Custom Style Preset</h2>
        <p class="text-muted-foreground">
          A style preset never touches color — only shape. It's keyed by
          <code class="px-1.5 py-0.5 bg-muted rounded">data-style</code> and applies to every color
          at once.
        </p>

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
          Registration is the same as a color preset: put it in your global stylesheet after
          <code class="px-1.5 py-0.5 bg-muted rounded">&#64;voltui/components/themes.css</code>,
          then set <code>data-style="mystyle"</code> via <code>provideVoltTheme</code> or
          <code>applyVoltTheme</code>.
        </p>
      </div>
    </div>
  `,
})
export default class ThemesPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;
}
