---
title: Blocks, layouts and recipes
description: How a block, a layout and a recipe differ, and when to reach for each.
group: Concepts
order: 1
---

|            | Answers                            | Example                                 |
| ---------- | ---------------------------------- | --------------------------------------- |
| **Block**  | "I need this section on my page."  | Hero, pricing, footer                   |
| **Layout** | "I need the shape of this screen." | Admin dashboard, settings               |
| **Recipe** | "How do I make this behave?"       | Settings form, async search, data table |

A block is **finished**: paste it and ship. A layout is a **skeleton**: paste it and fill it, which is why layouts carry no brand. A recipe is chosen for the **behaviour** it demonstrates.

## A recipe, live

This is the asynchronous search recipe running inside the documentation, exactly as it appears on its own page:

::demo[async-search]

Its source, tests and install command are on the [Async search](/recipes/async-search) page.

## Where the components are documented

Recipes never repeats a component's API. Each entry links to the components it is built from on [voltui.dev](https://voltui.dev/docs/components).
