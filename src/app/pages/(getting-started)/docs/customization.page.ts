import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-customization-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Customization</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Every component you add via
          <code class="px-1.5 py-0.5 bg-muted rounded">npx @voltui/cli add</code> is copied into
          your project as plain source. There is no package to eject from and no override API to
          learn — you edit the file the same way you'd edit any other component you wrote yourself.
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- Editing a copied component -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Editing a copied component</h2>
        <p class="text-muted-foreground">
          After <code class="px-1.5 py-0.5 bg-muted rounded">volt add button</code>, you own
          <code class="px-1.5 py-0.5 bg-muted rounded">src/app/ui/button/button.ts</code> (or
          wherever your CLI config points it). Want a fourth button size? Add it directly — there is
          nothing else to regenerate or sync.
        </p>

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
          The type <code class="px-1.5 py-0.5 bg-muted rounded">ButtonVariants['size']</code> is
          inferred from this object via
          <code class="px-1.5 py-0.5 bg-muted rounded"
            >VariantProps&lt;typeof buttonVariants&gt;</code
          >, so <code class="px-1.5 py-0.5 bg-muted rounded">&lt;volt-button size="xl"&gt;</code>
          is fully typed the moment you save the file — no separate type declaration to update.
        </p>
      </div>

      <!-- CVA variants -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">How CVA variants work here</h2>
        <p class="text-muted-foreground">
          Components with visual variants (button, badge, toast, ...) split styling into a sibling
          <code class="px-1.5 py-0.5 bg-muted rounded">variants.ts</code> using
          <a
            href="https://cva.style/docs"
            target="_blank"
            rel="noopener"
            class="text-primary underline-offset-4 hover:underline"
            >class-variance-authority</a
          >. The component itself only computes which variant is active — it never hardcodes
          conditional classes in the template:
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
          Adding a brand-new variant group (not just a new option in an existing one — e.g. a
          <code class="px-1.5 py-0.5 bg-muted rounded">tone</code> variant alongside
          <code class="px-1.5 py-0.5 bg-muted rounded">variant</code> and
          <code class="px-1.5 py-0.5 bg-muted rounded">size</code>) is the same pattern: add the key
          to <code class="px-1.5 py-0.5 bg-muted rounded">variants</code> in
          <code>variants.ts</code>, then add
          <code class="px-1.5 py-0.5 bg-muted rounded"
            >readonly tone = input&lt;...&gt;('default')</code
          >
          and pass it through in the <code>computed()</code> above.
        </p>
      </div>

      <!-- cn() -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Overriding classes with cn()</h2>
        <p class="text-muted-foreground">
          Most components expose a
          <code class="px-1.5 py-0.5 bg-muted rounded">class</code> input that flows through
          <code class="px-1.5 py-0.5 bg-muted rounded">cn()</code>
          — <code>clsx</code> for conditional joining,
          <code class="px-1.5 py-0.5 bg-muted rounded">tailwind-merge</code> to resolve conflicts so
          the last utility wins instead of both ending up in the class list:
        </p>

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
          Because it's <code>tailwind-merge</code> underneath,
          <code class="px-1.5 py-0.5 bg-muted rounded">class="bg-red-500"</code> reliably overrides
          the variant's own background utility instead of producing two conflicting
          <code>bg-*</code> classes in the final output.
        </p>
      </div>

      <!-- Theming vs. component edits -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Colors and shape vs. structure</h2>
        <p class="text-muted-foreground">
          Before editing a component's Tailwind classes to change a color or a border-radius, check
          whether a
          <a routerLink="/docs/themes" class="text-primary underline-offset-4 hover:underline"
            >theme preset</a
          >
          already covers it — <code>bg-primary</code>, <code>rounded-md</code>, and
          <code>shadow-lg</code> all resolve through <code>--volt-*</code> tokens that already vary
          per color/style preset. Hardcoding
          <code class="px-1.5 py-0.5 bg-muted rounded">bg-indigo-600</code> in a copied component
          opts that one component out of theme switching; reach for a custom color or style preset
          instead when the change should apply everywhere. Component edits are for
          <strong class="text-foreground">structural</strong> changes — new variants, new slots,
          different markup — that no token could express.
        </p>
      </div>
    </div>
  `,
})
export default class CustomizationPage {}
