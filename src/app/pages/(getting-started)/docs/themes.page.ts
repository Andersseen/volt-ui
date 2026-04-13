import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  imports: [VoltCard, VoltCardHeader, VoltCardTitle, VoltCardDescription, VoltCardContent],
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
                  <code class="px-1.5 py-0.5 bg-muted rounded">'soft'</code> - Rounded corners
                  (default)
                </li>
                <li>
                  <code class="px-1.5 py-0.5 bg-muted rounded">'sharp'</code> - Square corners
                </li>
                <li>
                  <code class="px-1.5 py-0.5 bg-muted rounded">'brutal'</code> - Heavy borders
                </li>
                <li>
                  <code class="px-1.5 py-0.5 bg-muted rounded">'ghost'</code> - Minimal borders
                </li>
                <li><code class="px-1.5 py-0.5 bg-muted rounded">'retro'</code> - Classic look</li>
              </ul>
            </volt-card-content>
          </volt-card>
        </div>
      </div>

      <!-- Dark Mode -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Dark Mode</h2>
        <p class="text-muted-foreground">
          Volt UI supports dark mode out of the box. Enable it in your theme configuration or toggle
          it dynamically.
        </p>

        <div class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm">
          <div class="text-muted-foreground">// Enable dark mode by default</div>
          <div>provideVoltTheme({{ '{' }} color: 'volt', dark: true {{ '}' }})</div>
          <br />
          <div class="text-muted-foreground">// Or toggle dynamically</div>
          <div>import {{ '{' }} applyVoltTheme {{ '}' }} from '&#64;voltui/components';</div>
          <br />
          <div>applyVoltTheme({{ '{' }} dark: true {{ '}' }});</div>
        </div>
      </div>

      <!-- CSS Variables -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">CSS Variables</h2>
        <p class="text-muted-foreground">
          Volt UI uses CSS variables for theming. You can customize them in your global styles
        </p>

        <div
          class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm overflow-x-auto"
        >
          <pre>
:root {{ '{' }}
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
{{ '}' }}</pre
          >
        </div>
      </div>
    </div>
  `,
})
export default class ThemesPage {}
