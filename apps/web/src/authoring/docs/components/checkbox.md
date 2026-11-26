---
title: 'Checkbox'
description: 'A control that allows the user to toggle between checked and not checked.'
group: 'Forms'
order: 12
---

## Example

::demo[checkbox-example]

The example above is this file, rendered live:

::source{file="apps/web/src/app/doqs/examples/checkbox-example.ts" title="checkbox-example.ts"}

## Playground

Change the inputs and interact with the preview: the events panel shows what the component emits, and the code follows your settings.

::playground[checkbox]

## Forms and accessibility

- `<volt-checkbox>` renders a native `<button role="checkbox">`; `id` and `aria-label` move to it. Name it with a `<volt-label htmlFor>` pointing at its `id`, or with `aria-label`.
- `aria-checked` is `true`, `false` or `mixed` (`indeterminate`). Space activates it; activating a mixed checkbox makes it checked and reports `indeterminateChange(false)`.
- With Forms, the control value is the `checked` boolean. A user activation reports it once and marks the control dirty; a value written by your code does not.
- `indeterminate` stays yours: a Forms write of the value the checkbox already has (the setup write, a "select all" parent re-syncing) keeps it; a write that changes the value resolves it.
- Touched on blur; `aria-invalid="true"` once the control is invalid and touched. `required` sets `aria-required`.
- Without an `id`, a generated one is numbered per application, so server rendering and hydration agree.
- The experimental Quartz entry point (`@voltui/components/quartz`) passes the same contract tests.

::demo[availability-quartz]

## API Reference

::demo[api-checkbox]

## Installation

Copy the source into your project:

```bash
npx @voltui/cli add checkbox
```

Or import it from the package:

```bash
npm install @voltui/components
```

## Source

Copy this code to your project. The component uses `ng-primitives/checkbox`.

::source{file="packages/volt/src/lib/components/checkbox/checkbox.ts" title="checkbox.ts"}
