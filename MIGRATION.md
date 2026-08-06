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
