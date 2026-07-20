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

      <!-- AI Tools -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">AI Tools for Consumers</h2>
        <p class="text-muted-foreground">
          Volt UI ships with three complementary ways to give AI assistants full context about its
          components, selectors, and conventions.
        </p>

        <div class="grid gap-4 md:grid-cols-3">
          <a
            routerLink="/docs/ai-skill"
            class="group p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <h3 class="font-medium group-hover:text-primary">Local Skill →</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Auto-discovered by OpenCode / Claude Code. Component catalog, naming, and usage rules.
            </p>
          </a>

          <a
            routerLink="/docs/ai-mcp"
            class="group p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <h3 class="font-medium group-hover:text-primary">MCP Server →</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Hosted MCP tools for listing components, getting examples, and generating CLI
              commands.
            </p>
          </a>

          <a
            routerLink="/docs/ai-prompt"
            class="group p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <h3 class="font-medium group-hover:text-primary">Prompt Reference →</h3>
            <p class="text-sm text-muted-foreground mt-1">
              A single-file prompt to paste into any LLM chat for correct selectors and examples.
            </p>
          </a>
        </div>
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
              <div class="flex items-center gap-2 p-3 rounded-lg bg-muted font-mono text-sm">
                &#64;import '&#64;voltui/components/themes.css';
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
                npx &#64;voltui/cli init
              </div>
              <div class="flex items-center gap-2 p-3 rounded-lg bg-muted font-mono text-sm">
                npx &#64;voltui/cli add button card input
              </div>
              <p class="text-sm text-muted-foreground">
                Use
                <code class="px-1 py-0.5 bg-muted rounded text-xs">--dry-run</code>
                to preview files and
                <code class="px-1 py-0.5 bg-muted rounded text-xs">--force</code>
                to overwrite edited components.
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

      <!-- Naming conventions -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Naming Conventions</h2>
        <p class="text-muted-foreground">
          Volt UI uses different prefixes for library source and CLI-generated output.
        </p>

        <div class="p-4 rounded-lg border border-border bg-muted/30 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-muted-foreground border-b border-border">
                <th class="pb-2 font-medium">Context</th>
                <th class="pb-2 font-medium">Selector</th>
                <th class="pb-2 font-medium">Class name</th>
                <th class="pb-2 font-medium">Import path</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-border/50">
                <td class="py-2">Library source</td>
                <td class="py-2 font-mono">volt-* / [voltXxx]</td>
                <td class="py-2 font-mono">VoltXxx</td>
                <td class="py-2 font-mono">'volt'</td>
              </tr>
              <tr>
                <td class="py-2">CLI output</td>
                <td class="py-2 font-mono">ui-* / [uiXxx]</td>
                <td class="py-2 font-mono">UiXxx</td>
                <td class="py-2 font-mono">'./ui/&lt;component&gt;'</td>
              </tr>
            </tbody>
          </table>
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
              Runtime dependencies are included automatically. Import the theme CSS once in your
              global stylesheet.
            </p>
            <code class="text-sm font-mono text-muted-foreground block mt-2">
              npm install &#64;voltui/components
            </code>
            <code class="text-sm font-mono text-muted-foreground block mt-2">
              &#64;import '&#64;voltui/components/themes.css';
            </code>
          </div>

          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <span class="font-medium">CLI / Copy & Paste — runtime deps</span>
            <code class="text-sm font-mono text-muted-foreground block mt-2">
              npm install ng-primitives class-variance-authority clsx tailwind-merge
            </code>
          </div>

          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <span class="font-medium">Tailwind CSS v4</span>
            <p class="text-xs text-muted-foreground mt-1">
              Volt components ship critical layout CSS, so npm consumers do not need an
              <code class="px-1 py-0.5 bg-muted rounded text-xs">&#64;source</code> directive for
              <code class="px-1 py-0.5 bg-muted rounded text-xs">node_modules</code>.
            </p>
            <code class="text-sm font-mono text-muted-foreground block mt-2">
              npm install -D tailwindcss &#64;tailwindcss/postcss
            </code>
          </div>
        </div>
      </div>

      <!-- Theme -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Theme System</h2>
        <p class="text-muted-foreground">
          Volt UI provides semantic Tailwind tokens via CSS custom properties. Configure the theme
          in your app config.
        </p>

        <div
          class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm overflow-x-auto"
        >
          <div>
            import {{ '{' }} provideVoltTheme {{ '}' }} from '&#64;voltui/components';<br /><br />
          </div>
          <div>
            bootstrapApplication(AppComponent, {{ '{' }}<br />
            &nbsp;&nbsp;providers: [<br />
            &nbsp;&nbsp;&nbsp;&nbsp;provideVoltTheme({{ '{' }}<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;color: 'volt', &nbsp;&nbsp;// volt | ember | sage |
            dusk | glacier<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;style: 'sharp', // sharp | soft | brutal | ghost |
            retro<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dark: false<br />
            &nbsp;&nbsp;&nbsp;&nbsp;{{ '}' }})<br />
            &nbsp;&nbsp;]<br />
            {{ '}' }});<br />
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
          <div class="pl-12 text-muted-foreground">card.ts</div>
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

      <!-- Overlay pattern -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Overlay Components</h2>
        <p class="text-muted-foreground">
          Dialog, drawer, popover, tooltip, and dropdown-menu use an attribute-directive trigger
          that references an
          <code class="px-1 py-0.5 bg-muted rounded text-xs">&lt;ng-template&gt;</code>
          containing the overlay content.
        </p>

        <div
          class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm overflow-x-auto"
        >
          <div>&lt;button [uiDialog]="dialogTpl"&gt;Open Dialog&lt;/button&gt;<br /><br /></div>
          <div>&lt;ng-template #dialogTpl let-close="close"&gt;<br /></div>
          <div>&nbsp;&nbsp;&lt;div uiDialogOverlay&gt;&lt;/div&gt;<br /></div>
          <div>&nbsp;&nbsp;&lt;div uiDialogContent&gt;<br /></div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&lt;h2 uiDialogTitle&gt;Confirm&lt;/h2&gt;<br /></div>
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;&lt;p uiDialogDescription&gt;Are you sure?&lt;/p&gt;<br />
          </div>
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;&lt;ui-button (click)="close()"&gt;Confirm&lt;/ui-button&gt;<br />
          </div>
          <div>&nbsp;&nbsp;&lt;/div&gt;<br /></div>
          <div>&lt;/ng-template&gt;</div>
        </div>
      </div>

      <!-- Component catalog -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Component Catalog</h2>
        <p class="text-muted-foreground">
          Volt UI is pre-v1. Components are labeled
          <span class="text-green-600 font-medium">stable</span>,
          <span class="text-yellow-600 font-medium">beta</span>, or
          <span class="text-orange-600 font-medium">experimental</span>
          to communicate confidence, not availability.
        </p>

        <div class="grid gap-6 md:grid-cols-3">
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium text-green-600 mb-2">Stable</h3>
            <p class="text-sm text-muted-foreground mb-2">
              Ready for early adoption. Meaningful tests, documented API, and CVA coverage where
              applicable.
            </p>
            <div class="font-mono text-xs text-muted-foreground">
              avatar, badge, breadcrumbs, button, card, checkbox, form-field, input, meter,
              progress, radio, separator, skeleton, slider, switch, textarea, toggle, toggle-group
            </div>
          </div>

          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium text-yellow-600 mb-2">Beta</h3>
            <p class="text-sm text-muted-foreground mb-2">
              Usable, but may still gain more forms, keyboard, accessibility, or edge-case coverage.
            </p>
            <div class="font-mono text-xs text-muted-foreground">
              accordion, dialog, drawer, dropdown-menu, input-otp, pagination, popover, search,
              select, table, tabs, toast, toolbar, tooltip
            </div>
          </div>

          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium text-orange-600 mb-2">Experimental</h3>
            <p class="text-sm text-muted-foreground mb-2">
              Useful demos exist, but the API or behavior may change before v1.
            </p>
            <div class="font-mono text-xs text-muted-foreground">
              autofill, combobox, date-picker, file-upload, listbox, navigation-menu, resizable,
              sidebar, theme
            </div>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Next Steps</h2>
        <div class="grid gap-4 md:grid-cols-3">
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
          <a
            routerLink="/docs/mcp"
            class="group p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <h3 class="font-medium group-hover:text-primary">AI Integration →</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Configure the MCP server and IDE snippets for Claude, Cursor, Copilot, and more.
            </p>
          </a>
        </div>
      </div>
    </div>
  `,
})
export default class IntroductionPage {}
