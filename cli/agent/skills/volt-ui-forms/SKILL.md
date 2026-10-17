---
name: volt-ui-forms
description: >
  Compose forms and validation with Volt UI in Angular: FormField with Label/Hint/Error, Input,
  Textarea, NativeSelect, Select, Combobox, Checkbox, Radio, Switch, Reactive Forms and
  ControlValueAccessor behaviour, disabled vs aria-disabled, server-backed Combobox, async save.
  Use when building or fixing a form.
---

# Volt forms

Exact selectors and inputs: MCP `get_component` / `get_usage_example`. This skill is about how the
pieces compose.

## Form field

Wrap a control in `FormField` and give it a label, an optional hint and an error. The field wires
the label, `aria-describedby` and `aria-invalid` to the control; do not do it by hand.

- Show the error only after the user could have seen the problem: `touched && invalid`.
- An error message is visible text. Colour alone is not an error.
- Outside a field, a label needs `htmlFor` pointing at the control's `id` (Volt moves a static `id`
  from the host to the native control so `<label for>` resolves).

## Reactive and template-driven forms

Volt controls implement `ControlValueAccessor`: use `[formControl]`, `formControlName` or
`[(ngModel)]` directly. They honour the full contract — value in, value out, `touched` on blur,
`disabled` / `enabled`, `invalid` reflected as `aria-invalid`. Do not mirror the value into a signal
to "sync" it.

- A literal value (`value="a"`) is an initial value; the control stays interactive. Use
  `[(value)]` or a form control when the app needs to read it.
- `ToggleGroup` and `Listbox` hold `string[]` / `T[]` even in single mode.
- Number and boolean inputs coerce (`disabled`, `multiple`): `disabled` without a value is `true`.

## Choosing the control

Use `volt-ui-component-selection` for NativeSelect vs Select vs Combobox, Checkbox vs Switch.

## Disabled vs aria-disabled

- `disabled`: removes the control from the tab order and from the form's value. Use when the field
  is not applicable.
- `aria-disabled="true"` on a `voltButton`: dims it, keeps focus, lets you explain why with
  `aria-describedby`. Volt does not block the click — guard the handler (`if (blocked()) return;`).
  Use it for "Save" while a request is pending or a precondition is unmet.

## Server-backed Combobox

Local list → default. A server decides what matches → `filterMode="manual"`:

- `(queryChange)` is what the user typed — not the value, not the label written back after a pick.
- The app owns the request: debounce, **latest response wins**, handle errors. Volt never fetches.
- Pass results as `[items]` exactly as returned; set `[loading]` while in flight; `emptyText` for an
  empty answer. Never feed server results to the local filter.
- Objects as values need `[itemLabel]`, `[compareWith]` and `[trackByFn]` keyed on a stable id.

## Async save

Keep the submit button enabled-looking but guarded (`aria-disabled` + `aria-busy`) while pending,
show failure in an `Alert`, success in a `Toast`. Do not unmount the form on failure.

## Do not

- Build the field chrome (label + hint + error) from raw elements.
- Use `[value]` and a `[formControl]` on the same control.
- Disable the submit button forever on an invalid form with no message saying why.

<!-- volt:digest:start -->

- Wrap controls in FormField (label, hint, error); show errors after `touched && invalid`, as visible text.
- Volt controls are ControlValueAccessors: use `[formControl]`/`ngModel` directly; a literal `value="a"` is an initial value, not a lock.
- `disabled` leaves the tab order; `aria-disabled` on a `voltButton` keeps focus but you must guard the handler.
- Server search: Combobox `filterMode="manual"`, `(queryChange)` is what was typed, debounce and let the latest response win, pass results as returned, set `[loading]`.

<!-- volt:digest:end -->
