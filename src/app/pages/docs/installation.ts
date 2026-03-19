import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-installation-docs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="space-y-8 max-w-3xl">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Installation</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Install Volt UI and apply a theme preset without manually copying CSS variables.
        </p>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          1. Prerequisites
        </h2>
        <p class="text-muted-foreground">
          Volt UI requires
          <code class="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">Angular 21+</code>
          and
          <code class="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">Tailwind CSS 4+</code
          >.
        </p>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          2. Install Tailwind v4
        </h2>
        <p class="text-muted-foreground">Your project still needs Tailwind v4 installed.</p>
        <div
          class="relative bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm overflow-x-auto text-zinc-300"
        >
          <code>npm install -D tailwindcss@^4.0.0 @tailwindcss/postcss postcss</code>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          3. Install Volt UI
        </h2>
        <p class="text-muted-foreground">
          Install Volt once. <code>ng-primitives</code> and <code>@floating-ui/dom</code> are
          included automatically through Volt dependencies.
        </p>
        <div
          class="relative bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm overflow-x-auto text-zinc-300"
        >
          <code>npm install volt</code>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          4. Import One Theme Preset
        </h2>
        <p class="text-muted-foreground">Import exactly one preset in your global stylesheet.</p>
        <div
          class="relative bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm overflow-x-auto text-zinc-300 whitespace-pre"
        >
          <code>@import 'volt/themes/presets/sage-soft.css';</code>
        </div>
        <p class="text-sm text-muted-foreground">
          Preset format: <code>volt/themes/presets/&lt;color&gt;-&lt;style&gt;.css</code>.
        </p>
        <p class="text-sm text-muted-foreground">
          Default alias: <code>@import 'volt/themes.css';</code> uses <code>volt-sharp</code>.
        </p>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          5. Match The Root Attributes
        </h2>
        <p class="text-muted-foreground">
          Set matching attributes on the root <code>html</code> element for the preset you imported.
        </p>
        <p class="text-sm text-muted-foreground">
          Colors: <code>volt</code>, <code>ember</code>, <code>sage</code>, <code>dusk</code>,
          <code>glacier</code>. Styles: <code>sharp</code>, <code>soft</code>, <code>brutal</code>,
          <code>ghost</code>, <code>retro</code>.
        </p>
        <div
          class="relative bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm overflow-x-auto text-zinc-300"
        >
          <code>&lt;html data-color="sage" data-style="soft"&gt;</code>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          6. Set Theme With Angular Provider (Optional)
        </h2>
        <p class="text-muted-foreground">
          If you prefer Angular Material-like setup, use the provider once in
          <code>app.config.ts</code>.
        </p>
        <div
          class="relative bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm overflow-x-auto text-zinc-300 whitespace-pre"
        >
          <code
            >import &#123; ApplicationConfig &#125; from '@angular/core'; import &#123;
            provideVoltTheme &#125; from 'volt'; export const appConfig: ApplicationConfig = &#123;
            providers: [ provideVoltTheme(&#123; color: 'sage', style: 'soft', dark: false &#125;),
            ], &#125;;</code
          >
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          7. Start Using Components
        </h2>
        <p class="text-muted-foreground">Import and use components directly from the library.</p>
        <div
          class="relative bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm overflow-x-auto text-zinc-300"
        >
          <code>import &#123; VoltButton &#125; from 'volt';</code>
        </div>
      </div>
    </div>
  `,
})
export class InstallationDocs {}
