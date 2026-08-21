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
        <h1 class="text-3xl font-bold tracking-tight">{{ t('guide.intro.title') }}</h1>
        <p class="text-lg text-muted-foreground mt-2">{{ t('guide.intro.lede') }}</p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- AI Tools -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">{{ t('guide.intro.aiTitle') }}</h2>
        <p class="text-muted-foreground">{{ t('guide.intro.aiLede') }}</p>

        <div class="grid gap-4 md:grid-cols-3">
          <a
            [routerLink]="path('/docs/ai-skill')"
            class="group p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <h3 class="font-medium group-hover:text-primary">{{ t('guide.intro.skillLink') }}</h3>
            <p class="text-sm text-muted-foreground mt-1">{{ t('guide.intro.skillBody') }}</p>
          </a>

          <a
            [routerLink]="path('/docs/ai-mcp')"
            class="group p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <h3 class="font-medium group-hover:text-primary">{{ t('guide.intro.mcpLink') }}</h3>
            <p class="text-sm text-muted-foreground mt-1">{{ t('guide.intro.mcpBody') }}</p>
          </a>

          <a
            [routerLink]="path('/docs/ai-prompt')"
            class="group p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <h3 class="font-medium group-hover:text-primary">{{ t('guide.intro.promptLink') }}</h3>
            <p class="text-sm text-muted-foreground mt-1">{{ t('guide.intro.promptBody') }}</p>
          </a>
        </div>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- Installation Options -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">{{ t('guide.intro.installTitle') }}</h2>
        <p class="text-muted-foreground">{{ t('guide.intro.installLede') }}</p>

        <div class="grid gap-4 md:grid-cols-3">
          <!-- Option 1: npm install -->
          <volt-card>
            <volt-card-header>
              <volt-card-title>{{ t('guide.intro.option1') }}</volt-card-title>
              <volt-card-description>{{ t('guide.intro.option1Body') }}</volt-card-description>
            </volt-card-header>
            <volt-card-content class="space-y-3">
              <div class="flex items-center gap-2 p-3 rounded-lg bg-muted font-mono text-sm">
                npm install &#64;voltui/components
              </div>
              <div class="flex items-center gap-2 p-3 rounded-lg bg-muted font-mono text-sm">
                &#64;import '&#64;voltui/components/themes.css';
              </div>
              <p class="text-sm text-muted-foreground">
                {{ t('guide.intro.thenImport')
                }}<code class="px-1 py-0.5 bg-muted rounded text-xs"
                  >from '&#64;voltui/components'</code
                >
              </p>
            </volt-card-content>
          </volt-card>

          <!-- Option 2: CLI -->
          <volt-card>
            <volt-card-header>
              <volt-card-title>{{ t('guide.intro.option2') }}</volt-card-title>
              <volt-card-description>{{ t('guide.intro.option2Body') }}</volt-card-description>
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
              <volt-card-title>{{ t('guide.intro.option3') }}</volt-card-title>
              <volt-card-description>{{ t('guide.intro.option3Body') }}</volt-card-description>
            </volt-card-header>
            <volt-card-content>
              <a
                [routerLink]="path('/docs/components')"
                class="inline-flex items-center text-primary hover:underline"
                >{{ t('guide.intro.browse') }}</a
              >
            </volt-card-content>
          </volt-card>
        </div>
      </div>

      <!-- Naming conventions -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">{{ t('guide.intro.namingTitle') }}</h2>
        <p class="text-muted-foreground">{{ t('guide.intro.namingLede') }}</p>

        <div class="p-4 rounded-lg border border-border bg-muted/30 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-muted-foreground border-b border-border">
                <th class="pb-2 font-medium">{{ t('guide.intro.context') }}</th>
                <th class="pb-2 font-medium">{{ t('guide.intro.selector') }}</th>
                <th class="pb-2 font-medium">{{ t('guide.intro.className') }}</th>
                <th class="pb-2 font-medium">{{ t('guide.intro.importPath') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-border/50">
                <td class="py-2">{{ t('guide.intro.librarySource') }}</td>
                <td class="py-2 font-mono">volt-* / [voltXxx]</td>
                <td class="py-2 font-mono">VoltXxx</td>
                <td class="py-2 font-mono">'volt'</td>
              </tr>
              <tr>
                <td class="py-2">{{ t('guide.intro.cliOutput') }}</td>
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
        <h2 class="text-xl font-semibold tracking-tight">{{ t('guide.intro.prereqTitle') }}</h2>
        <p class="text-muted-foreground">{{ t('guide.intro.prereqLede') }}</p>

        <div class="space-y-3">
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <span class="font-medium">{{ t('guide.intro.npmPackage') }}</span>
            <p class="text-xs text-muted-foreground mt-1">{{ t('guide.intro.npmBody') }}</p>
            <code class="text-sm font-mono text-muted-foreground block mt-2">
              npm install &#64;voltui/components
            </code>
            <code class="text-sm font-mono text-muted-foreground block mt-2">
              &#64;import '&#64;voltui/components/themes.css';
            </code>
          </div>

          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <span class="font-medium">{{ t('guide.intro.cliDeps') }}</span>
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
        <h2 class="text-xl font-semibold tracking-tight">{{ t('guide.intro.themeTitle') }}</h2>
        <p class="text-muted-foreground">{{ t('guide.intro.themeLede') }}</p>

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
        <h2 class="text-xl font-semibold tracking-tight">{{ t('guide.intro.structureTitle') }}</h2>
        <p class="text-muted-foreground">{{ t('guide.intro.structureLede') }}</p>

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
        <p class="text-muted-foreground">{{ t('guide.intro.afterAdding') }}</p>

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
        <h2 class="text-xl font-semibold tracking-tight">{{ t('guide.intro.overlayTitle') }}</h2>
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
        <h2 class="text-xl font-semibold tracking-tight">{{ t('guide.intro.catalogTitle') }}</h2>
        <p class="text-muted-foreground">
          Every component in Volt UI 1.0.0 is
          <span class="text-green-600 font-medium">stable</span> — a settled API, tests that assert
          the component's own behavior, and documented usage. The
          <span class="font-medium">beta</span> label stays in the system for components added after
          1.0; nothing carries it today. See
          <a [routerLink]="path('/docs/versioning')" class="underline hover:text-foreground"
            >Versioning &amp; stability</a
          >
          for the full policy.
        </p>

        <div class="p-4 rounded-lg border border-border bg-muted/30">
          <h3 class="font-medium text-green-600 mb-2">{{ t('guide.intro.stableLabel') }}</h3>
          <p class="text-sm text-muted-foreground mb-2">{{ t('guide.intro.stableBody') }}</p>
          <div class="font-mono text-xs text-muted-foreground">
            accordion, autofill, avatar, badge, breadcrumbs, button, card, checkbox, combobox,
            date-picker, dialog, drawer, dropdown-menu, file-upload, form-field, input, input-otp,
            listbox, meter, native-select, navigation-menu, pagination, popover, progress, radio,
            range-slider, resizable, search, select, separator, sidebar, skeleton, slider, switch,
            table, tabs, textarea, theme, toast, toggle, toggle-group, toolbar, tooltip
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">{{ t('guide.intro.nextTitle') }}</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <a
            [routerLink]="path('/docs/themes')"
            class="group p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <h3 class="font-medium group-hover:text-primary">{{ t('guide.intro.nextThemes') }}</h3>
            <p class="text-sm text-muted-foreground mt-1">{{ t('guide.intro.nextThemesBody') }}</p>
          </a>
          <a
            [routerLink]="path('/docs/components')"
            class="group p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <h3 class="font-medium group-hover:text-primary">
              {{ t('guide.intro.nextComponents') }}
            </h3>
            <p class="text-sm text-muted-foreground mt-1">
              {{ t('guide.intro.nextComponentsBody') }}
            </p>
          </a>
          <a
            [routerLink]="path('/docs/mcp')"
            class="group p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <h3 class="font-medium group-hover:text-primary">{{ t('guide.intro.nextAi') }}</h3>
            <p class="text-sm text-muted-foreground mt-1">{{ t('guide.intro.nextAiBody') }}</p>
          </a>
        </div>
      </div>
    </div>
  `,
})
export default class IntroductionPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;
}
