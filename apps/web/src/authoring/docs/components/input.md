---
title: 'Input & Forms'
description: 'Displays a form input field or a component that looks like an input field.'
group: 'Forms'
order: 11
---

## Example

::demo[input-example]

The example above is this file, rendered live:

::source{file="apps/web/src/app/doqs/examples/input-example.ts" title="input-example.ts"}

## Playground

Change the inputs and interact with the preview: the events panel shows what the component emits, and the code follows your settings.

::playground[input]

## Forms and accessibility

- `<volt-input>` is a full-width wrapper around one native `<input>`. `id`, `class` and `aria-label` belong to the native element and are removed from the host, so `<label for>` and `<volt-label htmlFor>` reach the control and no id is duplicated.
- `aria-describedby` is applied to the native input too. Inside `<volt-form-field>` its ids are added to the hint and error, not in place of them; outside a field they are the input's description (written in the browser, so a server-rendered page gains it on hydration).
- Without an `id`, the input gets a generated one, numbered per application so the server-rendered page and the hydrated page agree.
- Bind it with `[(value)]`, `formControl` / `formControlName` or `ngModel`. Typing reports the value; a value written by your code (`setValue`, `reset`, a model change) does not echo back as a change.
- It is marked touched when it loses focus. `aria-invalid="true"` appears when the control is invalid **and** touched, or when you set `state="error"`; `state` alone only changes the color.
- `required`, `readonly`, `disabled`, `type`, `name`, `placeholder` and `autocomplete` are written to the native input. A control disabled through Forms is disabled too.

::demo[availability-input-describedby]

## API Reference

::demo[api-input]

## Installation

Copy the source into your project:

```bash
npx @voltui/cli add input
```

Or import it from the package:

```bash
npm install @voltui/components
```

## Source

Copy this code to your project. The component uses `ng-primitives/input`.

::source{file="packages/volt/src/lib/components/input/input.ts" title="input.ts"}
