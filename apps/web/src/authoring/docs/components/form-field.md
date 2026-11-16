---
title: 'Form Field'
description: 'Accessible form wrapper with label, hint, and error text.'
group: 'Forms'
order: 10
---

## Example

::demo[form-field-example]

The example above is this file, rendered live:

::source{file="apps/web/src/app/doqs/examples/form-field-example.ts" title="form-field-example.ts"}

## Playground

Change the inputs and interact with the preview: the events panel shows what the component emits, and the code follows your settings.

::playground[form-field]

## Forms and accessibility

- Inside `<volt-form-field>`, `<volt-label>` labels the control through `aria-labelledby`, and clicking it focuses the control. No ids are needed; outside a form field, use `<volt-label htmlFor>`.
- `<volt-hint>` is always part of the control's description (`aria-describedby`).
- `<volt-error>` joins the description while it is rendered and the control's validators fail, and leaves it when it is removed: no reference to a removed message is left behind.
- `aria-invalid="true"` is set on the control (not on a wrapper) once it is invalid and touched, so the error is not conveyed by color alone.
- **Error announcement:** `<volt-error>` is an alert, announced when it is inserted. Render it once the field has been left or the form submitted (`@if (control.touched && control.invalid)`), as in the example, rather than on every keystroke. For validation that should wait until the reader leaves the field, use Angular's `updateOn: 'blur'`.
- One control per form field. Works with `volt-input`, `volt-textarea`, `volt-select` and native controls with `ngpInput`.

## API Reference

::demo[api-form-field]

## Installation

Copy the source into your project:

```bash
npx @voltui/cli add form-field
```

Or import it from the package:

```bash
npm install @voltui/components
```

## Source

Copy this code to your project. The component uses `ng-primitives/form-field`.

::source{file="packages/volt/src/lib/components/form-field/form-field.ts" title="form-field.ts"}

::source{file="packages/volt/src/lib/components/form-field/form-field-label.ts" title="form-field-label.ts"}

::source{file="packages/volt/src/lib/components/form-field/form-field-hint.ts" title="form-field-hint.ts"}

::source{file="packages/volt/src/lib/components/form-field/form-field-error.ts" title="form-field-error.ts"}
