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
          How to install dependencies and structure your app.
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
        <p class="text-muted-foreground">
          If your project doesn't have Tailwind 4, install it via the latest packages:
        </p>
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
          included as library dependencies.
        </p>
        <div
          class="relative bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm overflow-x-auto text-zinc-300"
        >
          <code>npm install volt</code>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          4. Add CSS Variables
        </h2>
        <p class="text-muted-foreground">
          Add the following CSS variables to your global stylesheet (e.g., <code>app.css</code>) to
          enable the ShadCN theme:
        </p>
        <div
          class="relative bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm overflow-x-auto text-zinc-300 whitespace-pre"
        >
          <code
            >@theme {{ '{' }} --color-background: var(--background); --color-foreground:
            var(--foreground); --color-primary: var(--primary); --color-primary-foreground:
            var(--primary-foreground); --color-muted: var(--muted); --color-muted-foreground:
            var(--muted-foreground); --color-border: var(--border); --color-input: var(--input);
            --color-ring: var(--ring); --radius: var(--radius); &#125; :root {{ '{' }} --background:
            #ffffff; --foreground: #09090b; --primary: #18181b; --primary-foreground: #fafafa;
            --muted: #f4f4f5; --muted-foreground: #71717a; --border: #e4e4e7; --input: #e4e4e7;
            --ring: #18181b; --radius: 0.5rem; &#125; .dark {{ '{' }} --background: #09090b;
            --foreground: #fafafa; --primary: #fafafa; --primary-foreground: #18181b; --muted:
            #27272a; --muted-foreground: #a1a1aa; --border: #27272a; --input: #27272a; --ring:
            #d4d4d8; &#125;</code
          >
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight border-b border-border/50 pb-2">
          5. Start using components
        </h2>
        <p class="text-muted-foreground">
          Copy the component files into your project, or import them directly from your feature
          library: <code>import &#123; VoltButton &#125; from 'volt';</code>
        </p>
      </div>
    </div>
  `,
})
export class InstallationDocs {}
