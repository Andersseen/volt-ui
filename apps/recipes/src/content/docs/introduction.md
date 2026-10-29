---
title: Introduction
description: What Volt UI Recipes is, what it publishes and how it relates to the Volt UI component library.
group: Start here
order: 1
---

Volt UI Recipes is the companion site of [Volt UI](https://voltui.dev). Volt UI documents the **components**; Recipes shows what you can **build** with them, as source you copy into your own Angular project.

Every entry has a live preview, its complete source, the packages it needs and links back to the components it is made of.

## What is here

- **Blocks** are finished sections of a page: a hero, pricing, a footer.
- **Layouts** are the shell of an application: dashboard, settings, chat. Unbranded on purpose.
- **Recipes** are compositions that teach behaviour over time: validation, asynchronous search, tables.

Read [Blocks, layouts and recipes](/docs/blocks-layouts-recipes) for the difference, and [Copying a recipe](/docs/copying-a-recipe) to use one.

## Not a second library

Nothing here is published as an npm export. A block that shipped as a dependency would make every product that uses it look the same. You copy the source, change what you need, and keep depending only on `@voltui/components`.
