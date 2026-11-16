---
title: 'Select'
description: 'Displays a list of options for the user to pick from—triggered by a button.'
group: 'Forms'
order: 13
---

## Example

::demo[select-example]

The example above is this file, rendered live:

::source{file="apps/web/src/app/doqs/examples/select-example.ts" title="select-example.ts"}

### Native Select

A lighter alternative to `volt-select` for simple cases: it's the real native `<select>` element (full mobile/native picker behavior, works with `formControl`/`ngModel` for free), styled to match the theme.

::demo[native-select-example]

::source{file="apps/web/src/app/doqs/examples/native-select-example.ts" title="native-select-example.ts"}

## Playground

Change the inputs and interact with the preview: the events panel shows what the component emits, and the code follows your settings.

::playground[select]

## Forms and accessibility

- The trigger is a native `<button role="combobox">` with `aria-expanded` and, while open, `aria-controls` pointing at the `role="listbox"` popup and `aria-activedescendant` at the active `role="option"`. Selected options carry `aria-selected="true"`; disabled ones `aria-disabled="true"`.
- Name it with a `<volt-label>` inside `<volt-form-field>` or with `aria-label`. `required` sets `aria-required`.
- Keyboard: Arrow keys open it and move through the options (skipping disabled ones), Home and End jump to the first and last while it is open, Enter or Space selects, Escape closes, and focus returns to the trigger. Typing a letter does not jump to an option (no typeahead); use Listbox or Combobox when the list is long.
- The popup is appended to `<body>` (`container`) and flips to stay in the viewport (`flip`); it is removed when the select closes or is destroyed.
- With Forms, a selection reports the value once. The control is marked touched when focus leaves the select — not when a pointer press moves focus into the popup — so a required select does not flash its error while the reader is choosing.
- The trigger shows the value through `displayWith` (by default `String(value)`), because the option labels are not rendered while the popup is closed. Pass `displayWith` to show a label.
- Quartz entry point: same contract, without `container`, `scrollToOption` and `allOptions`.

## API Reference

::demo[api-select]

## Installation

Copy the source into your project:

```bash
npx @voltui/cli add select
```

Or import it from the package:

```bash
npm install @voltui/components
```

## Source

Copy this code to your project. The component uses `ng-primitives/select`.

::source{file="packages/volt/src/lib/components/select/select.ts" title="select.ts"}

::source{file="packages/volt/src/lib/components/select/select-content.ts" title="select-content.ts"}

::source{file="packages/volt/src/lib/components/select/select-item.ts" title="select-item.ts"}
