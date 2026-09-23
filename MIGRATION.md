# Upgrade notes — 1.0 → 1.1

1.1.0 is a minor release: nothing is removed or renamed, and existing templates compile unchanged.
A few behaviours changed because they were bugs. Check these if you relied on them.

## Behaviour fixes you may notice

| Before (1.0)                                                                                                                                                                       | After (1.1)                                                                                                                                      | What to do                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<volt-input class="…">`, `<volt-textarea class>`, `<volt-select class>`, `<volt-label/hint/error class>` styled the wrapper host. Width and padding usually lost to the defaults. | `class` is merged with `cn()` onto the native control, and the host keeps only its own classes.                                                  | Nothing for sizing/padding/borders — they now work. **Grid/flex placement** (`col-span-2`, `order-*`, `self-end`) put on these hosts must move to a wrapping element or `<volt-form-field>`. |
| Card parts, Badge, Table, Tabs, … appended `class` to the defaults; conflicting utilities lost (`<volt-card-content class="p-3">` kept `p-6 pt-0`).                                | `class` is merged with `cn()`, so the consumer utility replaces the conflicting default.                                                         | Nothing — this is what the class already asked for. If a class never did anything before, it now does.                                                                                       |
| `id="x"` on `<volt-input>`, `<volt-textarea>`, `<volt-checkbox>`, `<volt-switch>` was duplicated on the host and the control.                                                      | The id exists only on the native control, so `<label for="x">` works.                                                                            | Code that queried the **host** by that id (`getElementById`, `#x` CSS) now gets the native control.                                                                                          |
| `<volt-label htmlFor="x">` outside `<volt-form-field>` lost its `for` and swallowed the click.                                                                                     | It renders a plain `<label for="x">` that focuses the control.                                                                                   | Nothing.                                                                                                                                                                                     |
| Inside `<volt-form-field>`, `<volt-input>` / `<volt-textarea>` without an id rendered `id=""`, so clicking the label did nothing.                                                  | They get a generated id; the label is wired automatically.                                                                                       | Nothing.                                                                                                                                                                                     |
| Form controls only updated `aria-invalid` after their own blur.                                                                                                                    | They also update after `form.markAllAsTouched()` or other programmatic status changes. Input/Textarea draw the error border when `aria-invalid`. | Nothing. Touched + invalid controls now look invalid, which is the Angular convention.                                                                                                       |
| `aria-label`, `aria-expanded`, … on `<volt-button>` stayed on the non-interactive host.                                                                                            | Seven ARIA attributes are forwarded to the native `<button>` and removed from the host.                                                          | Bind them as `aria-expanded="…"` / `[aria-expanded]`. `[attr.aria-*]` still targets the host — switch it, or use `<button voltButton>`.                                                      |
| `volt add toast`, `input-otp`, `combobox`: copied templates kept `<volt-*>` child tags while selectors became `ui-*`.                                                              | The CLI rewrites element tags too.                                                                                                               | Re-run `volt add <name> --force` for copied `input-otp` / `combobox` if their slots/options did not render.                                                                                  |

## Recommended, not required

| Instead of                                                               | Prefer (1.1)                                                                    |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `<a routerLink="/docs"><volt-button>Docs</volt-button></a>`              | `<a voltButton routerLink="/docs">Docs</a>` — no nested interactive elements.   |
| `<volt-button customClass="…">`                                          | `class="…"`. `customClass` is **deprecated** and will be removed in 2.0.        |
| `inject(NgpToastManager).show(template)` + a hand-written `<volt-toast>` | `inject(VoltToastService).success('Saved')`. The re-exports stay for 1.x.       |
| `provideToastConfig({...})`                                              | `provideVoltToast({...})`.                                                      |
| A hand-rolled modal driven by an `isOpen` signal                         | `<ng-template voltDialogRoot [(open)]="isOpen">` or `VoltDialogService.open()`. |
| Raw Tailwind feedback panels and spinners                                | `<volt-alert>` and `<volt-spinner>`.                                            |

## Candidates for 2.0 (not changed in 1.x)

- `VoltToggleGroup` in `type="single"` keeps `value: string[]`; a `string | undefined` value is a 2.0 candidate.
- `<volt-button>` keeps applying a static `class` to both host and native button for compatibility.
- `VoltButton.customClass` removal.

---

# Migration Guide — 0.x → 1.0

Volt UI's public API is **frozen as of 0.9.0** (the 1.0 release candidate). This guide
covers everything a 0.x consumer needs to change to be ready for `1.0.0`. There is
nothing to change _today_ — every deprecated name listed below keeps working until
`1.0.0` ships; this guide exists so you can migrate ahead of time.

## How to check what you're using

If you installed components via the CLI, search your project for the deprecated
names below. If you installed `@voltui/components` from npm, the same search applies
to your own template code — the deprecated bindings still work, TypeScript won't flag
them, so a text search is the reliable way to find them.

## Deprecated in 0.9.0, removed in 1.0.0

### `VoltNavigationMenuLink` selector: `volt-navigation-menu-link` → `voltNavigationMenuLink`

The attribute selector was kebab-case (`a[volt-navigation-menu-link]`), inconsistent
with every other attribute selector in the library (`voltComboboxInput`,
`voltNativeSelect`, `voltDropdownMenu`, ...), all of which use camelCase.

```html
<!-- Before (deprecated, still works, warns in dev mode) -->
<a volt-navigation-menu-link href="/docs">Documentation</a>

<!-- After -->
<a voltNavigationMenuLink href="/docs">Documentation</a>
```

If you copied this component via the CLI, the transformed name in your project is
`ui-navigation-menu-link` → `uiNavigationMenuLink`.

### `VoltResizableHandle`: `(resizing)` → `(resizingChange)`

Renamed for consistency with every other continuous-boolean-state output in the
library (`(checkedChange)`, `(pressedChange)`, ...).

```html
<!-- Before (deprecated, still emits, no replacement needed on the value itself) -->
<volt-resizable-handle (resizing)="onResizing($event)" />

<!-- After -->
<volt-resizable-handle (resizingChange)="onResizing($event)" />
```

### `VoltFileUpload` / `VoltFileDropzone`: `(dragOver)` → `(dragOverChange)`

Same rationale as `resizing` above — both emit the identical boolean value under the
old and new names.

```html
<!-- Before (deprecated, still emits) -->
<div voltFileUpload (dragOver)="onDragOver($event)">...</div>
<volt-file-dropzone (dragOver)="onDragOver($event)">...</volt-file-dropzone>

<!-- After -->
<div voltFileUpload (dragOverChange)="onDragOver($event)">...</div>
<volt-file-dropzone (dragOverChange)="onDragOver($event)">...</volt-file-dropzone>
```

## Not affected

- **No components were removed.** Every component present in 0.9.0 ships in 1.0.0.
- **No CLI-copied file paths or `volt add <name>` commands changed.**
- **v0.7's "composite components" work was purely additive** — Reactive Forms support
  was added to `listbox`, `input-otp`, and `combobox` while keeping their existing
  model-binding APIs; nothing to migrate there.
- **Every input name, CVA variant key, and the remaining ~90 selectors** were reviewed
  against the full API inventory (`specs/api-freeze-0.9.md`) during the 0.9.0 freeze and
  found already consistent — the three items above are the complete list of breaking
  renames between 0.x and 1.0.

## After 1.0.0

Once `1.0.0` ships, the three deprecated aliases above are deleted outright (no
further warning period) — update before upgrading past `0.9.x`. From `1.0.0` onward,
breaking API changes only happen in major version bumps; see the "Stability & Roadmap"
section of [`README.md`](./README.md) for the post-1.0 policy.
