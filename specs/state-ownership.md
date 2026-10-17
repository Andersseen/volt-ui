# State ownership — who owns each value, and what a static or dynamic binding means

ng-primitives (≥ 0.12x) treats a primitive as **controlled the first time its value input is defined,
and for good**. Forwarding a Volt input straight to the primitive therefore pins the component to
the first value it was given: a click emits and waits for a parent that is not listening. Volt avoids
that wherever it can be hit, with one rule:

> **Volt owns the value and writes it into the primitive without emitting. It never binds the
> primitive's own value input.**

`mirrorValue()` (`projects/volt/src/lib/mirror-value.ts`) is the helper for primitives with a
`setValue(value, { emit })` + `valueChange`. Components whose state shape differs (range, dates,
pagination) apply the same idea by hand. `mirrorValue()` is **not** applied mechanically: a primitive
that owns state safely stays untouched.

What a binding means for a mirrored component:

| Binding                              | Meaning                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `value="a"` / `[value]="x"` (static) | the initial value; the user can change it                                                   |
| `[value]="v()"` (dynamic)            | each parent change is written into the primitive; user interaction changes it too and emits |
| `[(value)]="v"`                      | both directions; one interaction → one output                                               |
| forms                                | `writeValue` is written without emitting the primitive's change; user → `onChange`          |

## Audit

| Component                                                    | Owner                                                   | Mechanism                                                                                      | Static value                         | Dynamic value                           | Duplicate emission                              | Regression test                                                |
| ------------------------------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| radio-group                                                  | Volt                                                    | `mirrorValue`                                                                                  | initial, interactive                 | written, then interactive               | none (mirror writes `emit:false`)               | `static-value`, `behavior-contract`                            |
| toggle-group                                                 | Volt                                                    | `mirrorValue`                                                                                  | initial, interactive                 | written, then interactive               | none                                            | same                                                           |
| listbox                                                      | Volt                                                    | `mirrorValue`                                                                                  | initial, interactive                 | written, then interactive               | none                                            | same                                                           |
| slider                                                       | Volt                                                    | `mirrorValue` (form write wins over the default)                                               | initial, interactive                 | written, then interactive               | `valueChange` is user-driven only               | same                                                           |
| range-slider                                                 | Volt                                                    | `writeRange` (orders low/high writes: the primitive clamps one against the other)              | **was frozen**; initial, interactive | written, then interactive               | `lowChange`/`highChange` user-driven only       | `behavior-contract`, `interaction-contract-2`, `e2e/contracts` |
| date-picker                                                  | Volt                                                    | `date`, `focusedDate` mirrored                                                                 | **was frozen**; initial, interactive | written; its month is brought into view | `dateChange` once per pick                      | `behavior-contract`, `interaction-contract-3`                  |
| date-range-picker                                            | Volt                                                    | `startDate`/`endDate`/`focusedDate` mirrored                                                   | **was frozen**                       | written                                 | once per pick                                   | `behavior-contract`                                            |
| pagination                                                   | Volt                                                    | `page` mirrored via the state adapter                                                          | **was frozen**                       | written, then interactive               | `pageChange` once per click                     | `interaction-contract`                                         |
| checkbox / switch / toggle                                   | Volt                                                    | `model()` bound to the primitive (`[ngpCheckboxChecked]`…) and written from the change handler | initial, interactive                 | written, interactive                    | `model` outputs report a change from any source | `behavior-contract`, `interaction-contract`                    |
| select / combobox                                            | Volt                                                    | `model()` bound to `[ngpSelectValue]` / `[ngpComboboxValue]`                                   | initial, interactive                 | written, interactive                    | once per pick                                   | `behavior-contract`, `interaction-contract-2/3`                |
| tabs / accordion / navigation-menu                           | primitive                                               | host-directive `value` input                                                                   | initial, interactive (verified)      | written, interactive                    | host-directive output, user-driven              | `static-value`, `behavior-contract`, `interaction-contract`    |
| input / textarea                                             | native element                                          | `model('')` ↔ native value                                                                     | n/a                                  | written                                 | n/a                                             | `interaction-contract`                                         |
| input-otp                                                    | Volt                                                    | `model` fed to the primitive's function form, `onValueChange` writes back                      | initial                              | written                                 | once; `complete` once                           | `input-otp.spec`, `interaction-contract-2`                     |
| dialog / drawer / popover / dropdown-menu / tooltip          | primitive (trigger) or Volt (`voltDialogRoot [(open)]`) | open state                                                                                     | —                                    | —                                       | `openChange` once per transition                | `e2e/contracts/overlays`, `popover`/`dialog` specs             |
| progress / meter / resizable / toolbar / file-upload / toast | read-only, or output-only                               | —                                                                                              | —                                    | —                                       | —                                               | their specs, `e2e/contracts`                                   |

## Decisions

- **`model()` outputs report any change.** A `model()`-backed output (`checkedChange`, `valueChange` on
  select, …) fires whenever the value changes — user, parent or forms — because that is what an
  Angular `model` is. Only the components with a dedicated user-driven output (`slider`
  `valueChange`, `range-slider` `lowChange`/`highChange`, host-directive outputs) are held to "a
  programmatic write is not a user change". Splitting the two would mean a second internal state in
  every control for a distinction the API does not promise.
- **Date picker follows an externally-set date.** A form write in another month used to select a day
  that was off screen; the displayed month now follows a _programmatic_ date. A pick by the user
  never moves it.
- **Known gap — toggle-group tab stop.** The group's one tab stop is its first item, not the pressed
  one (the APG radio pattern puts it on the checked item). Left as is: it needs the roving-focus
  group's initial item, an upstream seam. Recorded in the plan's open questions.
