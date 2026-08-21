import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Translations } from '../../../i18n/translations';
import { RouterLink } from '@angular/router';
import { Prose } from '../../../components/prose';

@Component({
  selector: 'app-customization-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Prose, RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('guide.customizationPage.title') }}</h1>
        <p class="text-lg text-muted-foreground mt-2">
          <app-prose key="guide.customizationPage.lede" />
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- Editing a copied component -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.customizationPage.editingTitle') }}
        </h2>
        <p class="text-muted-foreground"><app-prose key="guide.customizationPage.editingLede" /></p>

        <div
          class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm overflow-x-auto"
        >
          <pre>
// ui/button/variants.ts
export const buttonVariants = cva('...', {{ '{' }}
  variants: {{ '{' }}
    size: {{ '{' }}
      sm: 'h-8 rounded-md px-3 text-xs',
      md: 'h-10 rounded-md px-4 text-sm',
      lg: 'h-11 rounded-md px-8 text-base',
      icon: 'h-9 w-9 rounded-md',
      xl: 'h-12 rounded-md px-10 text-base',   // &lt;- added
    {{ '}' }},
  {{ '}' }},
{{ '}' }});</pre
          >
        </div>

        <p class="text-sm text-muted-foreground">
          <app-prose key="guide.customizationPage.inferredType" />
        </p>
      </div>

      <!-- CVA variants -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.customizationPage.cvaTitle') }}
        </h2>
        <p class="text-muted-foreground">
          <app-prose key="guide.customizationPage.cvaLedeHead" />
          <a
            href="https://cva.style/docs"
            target="_blank"
            rel="noopener"
            class="text-primary underline-offset-4 hover:underline"
            >{{ t('guide.customizationPage.cvaLink') }}</a
          >{{ t('guide.customizationPage.cvaLedeTail') }}
        </p>

        <div
          class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm overflow-x-auto"
        >
          <pre>
// button.ts
protected readonly classes = computed(() =&gt;
  cn(buttonVariants({{ '{' }} variant: this.variant(), size: this.size() {{ '}' }}), this.class())
);</pre
          >
        </div>

        <p class="text-sm text-muted-foreground">
          <app-prose key="guide.customizationPage.newGroup" />
        </p>
      </div>

      <!-- cn() -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.customizationPage.cnTitle') }}
        </h2>
        <p class="text-muted-foreground"><app-prose key="guide.customizationPage.cnLede" /></p>

        <div
          class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm overflow-x-auto"
        >
          <pre>
// utils.ts — this ships with every component that imports it
export function cn(...inputs: ClassValue[]): string {{ '{' }}
  return twMerge(clsx(inputs));
{{ '}' }}</pre
          >
        </div>

        <div class="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm">
          &lt;volt-button class="w-full"&gt;Continue&lt;/volt-button&gt;
          <span class="text-muted-foreground"
            >&nbsp;&nbsp;// adds w-full; doesn't fight the variant's own width classes</span
          >
        </div>

        <p class="text-sm text-muted-foreground">
          <app-prose key="guide.customizationPage.cnMerge" />
        </p>
      </div>

      <!-- Theming vs. component edits -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.customizationPage.colorsTitle') }}
        </h2>
        <p class="text-muted-foreground">
          {{ t('guide.customizationPage.colorsLedeHead') }}
          <a
            [routerLink]="path('/docs/themes')"
            class="text-primary underline-offset-4 hover:underline"
            >{{ t('guide.customizationPage.themePresetLink') }}</a
          >
          <app-prose key="guide.customizationPage.colorsLedeTail" />
        </p>
      </div>
    </div>
  `,
})
export default class CustomizationPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;
}
