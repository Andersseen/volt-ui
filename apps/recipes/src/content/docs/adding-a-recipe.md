---
title: Adding a recipe
description: The steps for contributing a block, a layout or a recipe to Volt UI Recipes.
group: Contributing
order: 1
---

A new entry is three small pieces; the catalog derives routes, cards, the sitemap and the redirects from them.

1. **Source.** `apps/recipes/src/app/{blocks,layouts,recipes}/<name>/<name>.ts`. Import Volt from `'volt'` and nothing from the application.
2. **Metadata.** An entry in the matching `lib/*-metadata.ts` file: slug, path and the Volt components it uses.
3. **Page.** `pages/(gallery)/<kind>/<slug>.page.ts` with the matching showcase component.

Then run the checks that guard the promise of "copy it and it works":

```bash
pnpm check:copied-source
pnpm test:e2e:recipes
```

`check:copied-source` compiles every entry against the built `@voltui/components` package in a clean consumer workspace.
