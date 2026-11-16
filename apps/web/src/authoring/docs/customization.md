---
title: 'Customization'
description: "Every component you add via `npx @voltui/cli add` is copied into your project as plain source. There is no package to eject from and no override API to learn — you edit the file the same way you'd edit any other component you wrote yourself."
group: 'Getting Started'
order: 3
---

## Editing a copied component

After `volt add button`, you own `src/app/ui/button/button.ts` (or wherever your CLI config points it). Want a fourth button size? Add it directly — there is nothing else to regenerate or sync.

```ts
// ui/button/variants.ts
export const buttonVariants = cva('...', {
  variants: {
    size: {
      sm: 'h-8 rounded-md px-3 text-xs',
      md: 'h-10 rounded-md px-4 text-sm',
      lg: 'h-11 rounded-md px-8 text-base',
      icon: 'h-9 w-9 rounded-md',
      xl: 'h-12 rounded-md px-10 text-base', // <- added
    },
  },
});
```

The type `ButtonVariants['size']` is inferred from this object via `VariantProps<typeof buttonVariants>`, so `<volt-button size="xl">` is fully typed the moment you save the file — no separate type declaration to update.

## How CVA variants work here

Components with visual variants (button, badge, toast, ...) split styling into a sibling `variants.ts` using [class-variance-authority](https://cva.style/docs). The component itself only computes which variant is active — it never hardcodes conditional classes in the template:

```ts
// button.ts
protected readonly classes = computed(() =>
  cn(buttonVariants({ variant: this.variant(), size: this.size() }), this.class())
);
```

Adding a brand-new variant group (not just a new option in an existing one — e.g. a `tone` variant alongside `variant` and `size`) is the same pattern: add the key to `variants` in `variants.ts`, then add `readonly tone = input<...>('default')` and pass it through in the `computed()` above.

## Overriding classes with cn()

Most components expose a `class` input that flows through `cn()` — `clsx` for conditional joining, `tailwind-merge` to resolve conflicts so the last utility wins instead of both ending up in the class list:

::source{file="packages/volt/src/lib/utils.ts" title="utils.ts"}

```html
<!-- adds w-full; doesn't fight the variant's own width classes -->
<volt-button class="w-full">Continue</volt-button>
```

Because it's `tailwind-merge` underneath, `class="bg-red-500"` reliably overrides the variant's own background utility instead of producing two conflicting `bg-*` classes in the final output.

## Colors and shape vs. structure

Before editing a component's Tailwind classes to change a color or a border-radius, check whether a [theme preset](/docs/themes) already covers it — `bg-primary`, `rounded-md`, and `shadow-lg` all resolve through `--volt-*` tokens that already vary per color/style preset. Hardcoding `bg-indigo-600` in a copied component opts that one component out of theme switching; reach for a custom color or style preset instead when the change should apply everywhere. Component edits are for **structural** changes — new variants, new slots, different markup — that no token could express.
