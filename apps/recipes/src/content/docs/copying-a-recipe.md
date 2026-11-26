---
title: Copying a recipe
description: Install what a block, layout or pattern needs, copy its source as the npm package or as CLI-copied components, and check it compiles in your project.
group: Start here
order: 2
---

Each page ends with the **source** panel. Above the code, choose how your project uses Volt UI; the code, the copy button and the install commands all follow that choice.

| Mode            | Imports Volt from                 | Names             | Install                                         |
| --------------- | --------------------------------- | ----------------- | ----------------------------------------------- |
| **npm package** | `@voltui/components`              | `Volt*`, `volt-*` | `pnpm add @voltui/components` + listed packages |
| **CLI copy**    | `../ui/<component>` (your copies) | `Ui*`, `ui-*`     | `npx @voltui/cli add …` + listed packages       |

The choice is kept while you move between pages. Both versions of every entry are compiled in CI, in a clean project, against the packages a consumer installs.

## 1. Install what it needs

Run the commands shown under the source. They are read from the source itself, so they cannot go out of date:

- **npm package**: `@voltui/components` and any other package the entry imports (most use `lumen-icons` for icons).
- **CLI copy**: `npx @voltui/cli add` with every Volt component the entry imports. The CLI copies their own dependencies too and lists the npm packages they need (add `--install` to install them). Then the other packages the entry imports.

## 2. Copy the files

Use the **Copy** button. Keep the file name, and copy any supporting file shown under it (for example `contact-map.data.ts`) into the same folder.

- **npm package**: save it where your project keeps features, for example `src/app/pricing-tiers/pricing-tiers.ts`.
- **CLI copy**: save it in `src/app/<folder>/`. Its imports point to `../ui/<component>`, which is `src/app/ui/`, where `volt add` writes by default. If your components live elsewhere, change those import paths.

## 3. Use it

```ts
import { PricingTiers } from './pricing-tiers/pricing-tiers';

@Component({
  imports: [PricingTiers],
  template: `<app-pricing-tiers />`,
})
export class PricingPage {}
```

## 4. Theme it

Entries use theme tokens only (`bg-primary`, `rounded-md`), so your Volt theme and dark mode apply. Nothing is branded.

> [!NOTE]
> Patterns contain a `fake*` function (`fakeSave`, `fakeSearch`, `fakeFetch`) that stands in for your service. Replace it; see [Workflow patterns](/docs/workflow-patterns).
