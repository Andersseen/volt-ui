import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
} from 'volt';

@Component({
  selector: 'app-introduction-page',
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
        <h1 class="text-3xl font-bold tracking-tight">Introduction</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Volt UI is a collection of reusable, accessible Angular components built on top of
          ng-primitives. Inspired by shadcn/ui, you can copy and customize components to match your
          needs.
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- Installation Options -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Installation Options</h2>
        <p class="text-muted-foreground">
          There are two ways to use Volt UI components in your project:
        </p>

        <div class="grid gap-4 md:grid-cols-3">
          <!-- Option 1: npm install -->
          <volt-card>
            <volt-card-header>
              <volt-card-title>Option 1: npm package</volt-card-title>
              <volt-card-description>
                Install the library directly from npm and import components in your project.
              </volt-card-description>
            </volt-card-header>
            <volt-card-content class="space-y-3">
              <div class="flex items-center gap-2 p-3 rounded-lg bg-muted font-mono text-sm">
                npm install &#64;voltui/components
              </div>
              <p class="text-sm text-muted-foreground">
                Then import:
                <code class="px-1 py-0.5 bg-muted rounded text-xs"
                  >from '&#64;voltui/components'</code
                >
              </p>
            </volt-card-content>
          </volt-card>

          <!-- Option 2: CLI -->
          <volt-card>
            <volt-card-header>
              <volt-card-title>Option 2: CLI (shadcn-style)</volt-card-title>
              <volt-card-description>
                Copy component source files into your project with ui-* prefix. Full customization.
              </volt-card-description>
            </volt-card-header>
            <volt-card-content class="space-y-3">
              <div class="flex items-center gap-2 p-3 rounded-lg bg-muted font-mono text-sm">
                npx &#64;voltui/cli add button
              </div>
              <p class="text-sm text-muted-foreground">
                Initialize first with:
                <code class="px-1 py-0.5 bg-muted rounded text-xs">npx &#64;voltui/cli init</code>
              </p>
            </volt-card-content>
          </volt-card>

          <!-- Option 3: Manual -->
          <volt-card>
            <volt-card-header>
              <volt-card-title>Option 3: Copy & Paste</volt-card-title>
              <volt-card-description>
                Browse component demos and copy the source code directly. Full control over the
                implementation.
              </volt-card-description>
            </volt-card-header>
            <volt-card-content>
              <a
                routerLink="/docs/components"
                class="inline-flex items-center text-primary hover:underline"
              >
                Browse Components →
              </a>
            </volt-card-content>
          </volt-card>
        </div>
      </div>

      <!-- Prerequisites -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Prerequisites</h2>
        <p class="text-muted-foreground">
          Before using Volt UI components, ensure you have the following dependencies installed:
        </p>

        <div class="space-y-3">
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <span class="font-medium">npm package</span>
            <p class="text-xs text-muted-foreground mt-1">
              All dependencies included automatically.
            </p>
            <code class="text-sm font-mono text-muted-foreground block mt-2">
              npm install &#64;voltui/components
            </code>
          </div>

          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <span class="font-medium">CLI / Copy & Paste — manual deps</span>
            <code class="text-sm font-mono text-muted-foreground block mt-2">
              npm install ng-primitives class-variance-authority
            </code>
          </div>

          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <span class="font-medium">Tailwind CSS v4</span>
            <code class="text-sm font-mono text-muted-foreground block mt-2">
              npm install -D tailwindcss @tailwindcss/postcss
            </code>
          </div>
        </div>
      </div>

      <!-- Project Structure -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Project Structure</h2>
        <p class="text-muted-foreground">
          When using the CLI, components are added to your project's ui folder:
        </p>

        <div class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm">
          <div class="text-muted-foreground">src/app/</div>
          <div class="pl-4">ui/</div>
          <div class="pl-8 text-muted-foreground">button/</div>
          <div class="pl-12 text-muted-foreground">button.ts</div>
          <div class="pl-12 text-muted-foreground">index.ts</div>
          <div class="pl-8 text-muted-foreground">card/</div>
          <div class="pl-12 text-muted-foreground">card.component.ts</div>
          <div class="pl-12 text-muted-foreground">index.ts</div>
          <div class="pl-4">...</div>
        </div>
      </div>

      <!-- Usage -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Usage</h2>
        <p class="text-muted-foreground">
          After adding a component, import and use it in your Angular components:
        </p>

        <div
          class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm overflow-x-auto"
        >
          <div>import {{ '{' }} UiButton {{ '}' }} from './ui/button';<br /><br /></div>
          <div>&#64;Component({{ '{' }})<br /></div>
          <div>&nbsp;&nbsp;selector: 'app-my-component',<br /></div>
          <div>&nbsp;&nbsp;imports: [UiButton],<br /></div>
          <div>
            &nbsp;&nbsp;template: '&lt;ui-button variant=&quot;solid&quot;&gt;Click
            me&lt;/ui-button&gt;'<br />
          </div>
          <div>{{ '}' }})<br /><br /></div>
          <div>export class MyComponent {{ '{' }} {{ '}' }}</div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Next Steps</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <a
            routerLink="/docs/themes"
            class="group p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <h3 class="font-medium group-hover:text-primary">Themes →</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Learn how to customize colors, typography, and dark mode.
            </p>
          </a>
          <a
            routerLink="/docs/components"
            class="group p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <h3 class="font-medium group-hover:text-primary">Components →</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Explore all available components with examples and source code.
            </p>
          </a>
        </div>
      </div>
    </div>
  `,
})
export default class IntroductionPage {}
