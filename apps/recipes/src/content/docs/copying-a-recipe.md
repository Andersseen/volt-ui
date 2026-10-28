---
title: Copying a recipe
description: Install the packages a block, layout or recipe needs, copy its source and check it compiles in your project.
group: Start here
order: 2
---

Each page ends with the **source** panel and an install command. The source is already rewritten for a normal project: it imports Volt from `@voltui/components`, never from a private alias.

## 1. Install the packages

```bash
pnpm add @voltui/components
```

The command under the source lists anything else that entry imports. It is read from the source itself, so it cannot go out of date.

## 2. Copy the file

Use the **Copy** button and save the component where your project keeps features, for example `src/app/blocks/pricing-tiers/pricing-tiers.ts`. A block or layout is one standalone component.

## 3. Use it

```ts
import { PricingTiers } from './blocks/pricing-tiers/pricing-tiers';

@Component({
  imports: [PricingTiers],
  template: `<app-pricing-tiers />`,
})
export class PricingPage {}
```

## 4. Theme it

Entries use theme tokens only (`bg-primary`, `rounded-md`), so your Volt theme and dark mode apply. Nothing is branded.

> [!NOTE]
> If you prefer to own Volt's components too, `npx @voltui/cli add <component>` copies them into your project instead of installing the package.
