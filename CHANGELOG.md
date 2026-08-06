# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-06

**Volt UI is stable.** The public API frozen at 0.9.0 is now locked for the `1.x` line —
see [`specs/api-freeze-0.9.md`](./specs/api-freeze-0.9.md) for the full inventory and the
new [Versioning & Stability](https://volt-ui.andersseen.dev/docs/versioning) docs page for
the ongoing semver promise (breaking changes only in majors, features in minors, fixes in
patches).

### Removed (BREAKING)

The three aliases deprecated in 0.9.0 are gone, with no further warning period — see
[`MIGRATION.md`](./MIGRATION.md) if you haven't already moved off them:

| Removed                                        | Replacement (already available since 0.9.0) | Component(s)                         |
| ---------------------------------------------- | ------------------------------------------- | ------------------------------------ |
| `volt-navigation-menu-link` attribute selector | `voltNavigationMenuLink`                    | `VoltNavigationMenuLink`             |
| `(resizing)` output                            | `(resizingChange)`                          | `VoltResizableHandle`                |
| `(dragOver)` output                            | `(dragOverChange)`                          | `VoltFileUpload`, `VoltFileDropzone` |

No components were removed or renamed, and no CLI-copied file paths changed — this is the
complete list of breaking changes between 0.9.0 and 1.0.0.

### Fixed

- **`VoltResizableHandle` crashed on every SSR render** of a page containing it:
  `ngAfterViewInit()` called `getBoundingClientRect()` unconditionally, and that hook
  still runs during SSR (it's not browser-only), so every server render of
  `/docs/components/resizable` threw and the handle's ARIA value attributes were stuck
  at their hardcoded defaults in the server-rendered HTML. Fixed by deferring the initial
  measurement to `afterNextRender()`. Verified against the SSR dev server directly and
  confirmed CLS 0.00 on a production build (no hydration-mismatch layout shift from the
  fix).
- The docs site's Component Catalog (introduction page and components index) listed nine
  components — `autofill`, `combobox`, `date-picker`, `file-upload`, `listbox`,
  `navigation-menu`, `resizable`, `sidebar`, `theme` — as "experimental," but
  `COMPONENT_STATUS.md` has had zero experimental components since well before this
  release; all nine are `beta`. Fixed the stale grouping on both pages.
- **The live sidebar and components grid showed 7 components as `beta` that
  `COMPONENT_STATUS.md` has listed as `stable` for a while**: `form-field`, `checkbox`,
  `switch`, `radio`, `slider`, `toggle`, `toggle-group`. The site's
  `component-metadata.ts` (a separate hand-maintained file) had drifted out of sync with
  the actual source of truth — verified each of the seven has full
  `ControlValueAccessor` + 145-236 lines of real spec coverage before relabeling. This
  was the majority of what made the catalog look mostly-beta; it wasn't that these
  components needed more hardening, the site just wasn't reflecting reality.
- Four demo pages (Tabs' Account/Password example, and the Login, Sign Up, and Settings
  layout demos) had `type="password"` inputs outside a `<form>`, which Chrome flags with
  a DOM advisory since password managers rely on form boundaries. Wrapped each in a
  `<form>` with submission prevented.
- **The homepage hero's decorative background collage overlapped the real terminal
  command bar** at common desktop widths — reproduced and confirmed broken at 1024px,
  1366px, and 1920px, where the decorative "terminal" panel rendered directly on top of
  the real copy-install-command control, and at 1024px the headline text itself
  collided with the decorative panel. The decorative panels were positioned from
  `100vw` with hand-tuned rem constants that didn't leave real clearance from the
  content column at any width; repositioned them relative to the same `max-w-7xl`
  container the real content uses, and raised the breakpoint that hides the decorative
  scene entirely from 900px to 1279px (there isn't reliably enough width between 900
  and 1280px for both the full-size headline and the collage). Verified clean at 1024,
  1279, 1280, 1366, and 1920px in both themes.
- **The homepage hero's two lower decorative panels overlapped each other**, leaving the
  "Workspace" card covering all but a ~30px strip of the "terminal" card at every desktop
  width. Both were anchored independently to the bottom-right corner with hand-tuned
  offsets and no layout relationship, so nothing kept them apart. Replaced the absolute
  anchoring with a single flow-laid flex column (`.scene-stack`), which makes overlap
  structurally impossible at any size, and dropped the decorative terminal panel — the
  hero already shows a real, working `npx @voltui/cli add …` command bar two columns
  over, so the fake one was duplicating the page's own message.
- **The demo preview frame pinned width-constrained demos to the left edge** instead of
  centering them, on every component page whose demo sets its own `max-w-*` (`search`,
  `autofill`, `combobox`, `select`, and others). The frame's `justify-center` had no
  effect because the content wrapper inside it was `w-full`. This is the misalignment
  reported during 1.0 QA and previously recorded as "could not reproduce"; it was fully
  deterministic, not a stale-HMR artifact. Now covered by an e2e assertion that the
  gutters either side of a `max-w-md` demo stay equal.
- Demo previews taller than 400px (`button`, `input`, `tabs`, `card`, `table`,
  `date-picker`, `navigation-menu`) were centered inside a fixed-height scroll box, which
  put the top of the demo above the scroll origin where it could not be reached. The
  frame now grows with its content instead of scrolling internally.
- **The landing hero overflowed the viewport on phones** and was silently clipped by
  `overflow-hidden` on `<main>`: the hero column is a flex item, so it refused to shrink
  below the install command's intrinsic width and the `truncate` on that command never
  engaged. The existing mobile e2e test could not catch this because it only asserted the
  document has no horizontal scroll — which the clipping guaranteed. Added `min-w-0`, and
  extended the test to assert the command bar's far edge stays inside the viewport.
- Same `min-width: auto` clipping fixed on the Create Theme page (the generated-CSS block
  pushed the whole column past a phone screen) and in the `table` demo (its scroll
  container was stretched instead of scrolling).
- The `navigation-menu` demo's menu bar was clipped rather than scrollable at phone
  widths; its dropdown content renders in a body-level portal, so the demo frame can
  scroll horizontally without cutting the open panel.
- The `chat` layout demo's conversation list squeezed the message pane off the edge of a
  phone screen, and the `kanban` demo's avatar stack pushed its "New Task" button past the
  frame. Both now collapse below `sm`, matching how the sidebar layout already goes
  off-canvas at that width.

### Added

- `dialog`/`drawer` now have an end-to-end test asserting the ARIA contract
  (`role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the title) when
  opened — previously nothing in the suite actually opened them to check. `toast`'s error
  variant (`role="alert"`) is now covered too; previously only the default `role="status"`
  variant had any test anywhere.
- New `/docs/versioning` page: the semver promise, what `stable`/`beta`/`experimental`
  mean going forward, and the Angular-major support policy.

### Changed

- **20 components moved from `beta` to `stable`**: `accordion`, `autofill`, `combobox`,
  `dialog`, `drawer`, `dropdown-menu`, `listbox`, `native-select`, `pagination`,
  `popover`, `range-slider`, `search`, `select`, `sidebar`, `table`, `tabs`, `theme`,
  `toast`, `toolbar`, `tooltip`. No behavior changed — these had been carrying a `beta`
  label whose stated reason ("needs more forms, keyboard or focus coverage") was already
  satisfied: the form controls have full Reactive Forms value/disabled/touched specs, and
  the overlays have Escape, outside-click, focus-return and positioning covered by the
  Playwright consumer suite. Two rows in `COMPONENT_STATUS.md` that claimed gaps
  contradicted by their own specs were corrected (`toolbar` has an arrow-key focus test;
  `select` delegates keyboard handling to ng-primitives rather than partially
  implementing it), and `range-slider` — listed in the release groups but missing from
  the table entirely — now has a row.
  The five components still `beta` each have a specific outstanding gap, now documented
  in `COMPONENT_STATUS.md`: `date-picker` (calendar grid untested), `file-upload`
  (drag/drop never exercised in a browser), `input-otp` (per-slot focus movement not
  asserted), `navigation-menu` (nested submenus untested), `resizable` (keyboard arrow
  resizing untested).
- `SDD.md` §12 "Roadmap to v1" replaced with a permanent Stability Policy section; the
  roadmap's history now lives in this changelog's `[0.5.0]`–`[1.0.0]` entries instead of
  being duplicated.
- `specs/SPEC.md`: the 0.5.0→1.0.0 release ladder is marked complete; routine post-1.0
  work follows ordinary semver instead of a per-minor plan.
- Removed "pre-v1"/"release candidate"/"may change before v1" language from `README.md`,
  `COMPONENT_STATUS.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CLI.md`, and the docs site
  (introduction, components index, AI-tool pages, homepage stats, header version badge).
- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `1.0.0`.

## [0.9.0] - 2026-08-06

**Release candidate for 1.0.** The public API is frozen as of this release: input,
output, and selector names below will not change again before 1.0 except for the
removal of the deprecated aliases listed in "Upgrade to 1.0". See
[`MIGRATION.md`](./MIGRATION.md) for the full 0.x → 1.0 upgrade guide.

### Upgrade to 1.0

Three deprecated aliases were added this release, all still working today, all
**removed in 1.0.0**:

| Deprecated (works today, warns in dev)         | Replacement              | Component(s)                         |
| ---------------------------------------------- | ------------------------ | ------------------------------------ |
| `volt-navigation-menu-link` attribute selector | `voltNavigationMenuLink` | `VoltNavigationMenuLink`             |
| `(resizing)` output                            | `(resizingChange)`       | `VoltResizableHandle`                |
| `(dragOver)` output                            | `(dragOverChange)`       | `VoltFileUpload`, `VoltFileDropzone` |

No components were removed or renamed. No CLI-copied file paths changed. Consumers on
0.8.x need no code changes to stay on the deprecated names through 1.0 — only to adopt
the replacements before then. Full detail in `MIGRATION.md`.

### Fixed

- **Docs site "API Reference" panel showed fabricated CVA variant options** for
  `toggle`, `pagination`, `toggle-group`, and `textarea`: the generator script's variant
  parser matched any `word:` pattern inside a class-string value (e.g. Tailwind's
  `hover:`, `focus-visible:`, `data-[selected]:` prefixes), not just real option keys —
  `toggle` showed 8 options instead of its real 4. Fixed the parser and re-verified every
  CVA-based component's options against its actual `variants.ts`.
- **`VoltNavigationMenuLink`'s selector was kebab-case** (`a[volt-navigation-menu-link]`),
  the only attribute selector in the library not using camelCase, carrying an
  unexplained lint suppression. Renamed to `a[voltNavigationMenuLink]`; the old
  attribute still works (multi-selector) with a dev-mode deprecation warning, removed in
  v1.0. Also fixed two bugs this surfaced: the component's own unit test used the
  camelCase name against the kebab-only selector, so the directive silently never
  attached and the test never really exercised it; and the public usage snippet showed
  `<volt-navigation-menu-link>...</volt-navigation-menu-link>` as an element with
  open/close tags, which never worked since the selector has always been attribute-only.
- **`VoltResizableHandle.resizing` / `VoltFileUpload`/`VoltFileDropzone.dragOver`**
  renamed to `resizingChange`/`dragOverChange` for consistency with every other
  continuous-boolean-state output (`checkedChange`, `pressedChange`, ...); the old names
  keep emitting in parallel, removed in v1.0. Found along the way:
  `hostDirectives.outputs` cannot map one primitive output to two public aliases (both
  silently go dead), so the dual-emit is bridged by injecting the host directive
  instance directly and forwarding its real output to both public names.

### Added

- `specs/api-freeze-0.9.md`: generated public API inventory (41 components, 87
  directives, 301 inputs, 42 outputs) — the v0.9 API-freeze reference. Generator logic
  (`scripts/generate-api-freeze.mjs`) shares its extraction module
  (`scripts/lib/api-extract.mjs`) with the existing docs-app API reference generator, so
  the two can't drift from each other.
- `MIGRATION.md`: 0.x → 1.0 upgrade guide.

### Changed

- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `0.9.0`.

## [0.8.4] - 2026-08-05

### Added

- **Range Slider** (`range-slider`): dual-thumb slider for selecting a `[low, high]`
  value pair, built on `ng-primitives/slider`'s `NgpRangeSlider`. Reactive Forms and
  template-driven forms support via `ControlValueAccessor`.
- **Native Select** (`select/native-select.ts`, `VoltNativeSelect`) is now a documented,
  tested part of the public surface: a lightweight alternative to `volt-select` that
  applies to a real `<select>` element (`<select voltNativeSelect>`).

### Fixed

- **`VoltNativeSelect` had no forms support at all**: it wrapped a `<select>` inside its
  own component template, which prevents Angular's built-in native-select
  `ControlValueAccessor` from ever attaching — `[formControl]`/`[(ngModel)]` silently did
  nothing. Rewritten to match `ng-primitives`' own reference pattern: an attribute
  selector (`select[voltNativeSelect]`) applied directly to the native `<select>`, using
  a `@Directive` instead of a `@Component` (no template/view needed, consistent with
  `combobox-input.ts`/`avatar-image.ts`). Forms support now works for free via Angular's
  built-in accessor. Existed in source and was copied by `volt add select` before this
  fix, but was never exported, documented, or tested.
- **`VoltDropdownMenuItem` had no `disabled` input**: `hostDirectives: [NgpMenuItem]` had
  no `inputs` mapping, so `ngpMenuItemDisabled` was unreachable — a menu item could never
  be marked disabled. Added the input and guarded the component's own
  Enter/Space-to-click keyboard handling against it.
- **`VoltInputOtp`'s `disabled` input never reached the `NgpInputOtp` primitive**: the
  `hostDirectives` alias forwarded to a dead `isDisabled` binding that nothing ever set
  (the class's own same-named field is a `computed()`, not bindable). The native
  `<input>` was still correctly disabled through a separate binding, but the primitive's
  own disabled state (and therefore the OTP slots' click-to-focus guard) never engaged.
  Fixed the alias to `disabled`, matching the working pattern already used by
  `slider`/`radio-group`/`toggle-group`.
- Homepage test-count stat (`241`) was stale; updated to the current suite size (`264`).
- **CLI: shared library files never copied for `volt add`**: `utils.ts` and
  `form-control-state.ts` (imported by 14 of 41 components, including `button`,
  `checkbox`, `input`, `select`, and `switch`) were never tracked as dependencies,
  copied, or import-rewritten by `volt add`, so consumers received component files that
  imported a path that didn't exist in their project. The CLI now detects and copies
  these shared files and rewrites their import paths.
- **CLI: `sidebar`'s relative import to `tooltip` never rewritten**: `volt add sidebar`
  correctly copied its `tooltip` dependency but left the copied file's import pointing
  at the original `../../components/tooltip` source path instead of the sibling
  directory the CLI actually creates. Cross-component relative imports are now
  collapsed to the CLI's flat layout.
- Added a new CLI-driven consumer fixture (`e2e/consumer-cli/`,
  `pnpm test:e2e:consumer-cli`) that runs `volt init` + `volt add` for every component
  and builds the result, catching the two issues above; wired into CI alongside the
  existing npm-import consumer fixture.
- `volt init` now prints Tailwind CSS v4 setup guidance when it doesn't detect
  `tailwindcss` configured in the target project.

### Changed

- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `0.8.4`.

## [0.8.3] - 2026-08-03

### Fixed

- Resolved v1 library readiness blockers across form controls, overlays and primitives:
  custom class merging, textarea auto-resize, search clear states, disabled styling,
  drawer escape handling, combobox/select object labels, OTP slot focus styles,
  resizable handle ARIA/pointer support, and SSR-safe date picker focused dates.
- Added accessible `meter` and `progress` label/value wrappers and documented the
  remaining upstream `ng-primitives` ARIA caveats for non-default ranges.
- Added regression coverage for the component behavior fixed in this patch.

### Changed

- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `0.8.3`.

## [0.8.1] - 2026-08-02

### Fixed

- **Select dropdown mispositioning**: `volt-select-content` never bound `width:
var(--ngp-select-width)` (the CSS variable ng-primitives exposes so the dropdown can
  match the trigger's width — the sibling `combobox-dropdown` already does this
  correctly). Without it, the panel sized itself to its content (~128px) instead of the
  trigger's width, and floating-ui's default center-aligned `bottom` placement then
  anchored the panel's left edge to the trigger's horizontal center, pushing most of the
  panel outside the trigger's bounds. Fixed by binding the width (matching Combobox's
  pattern) and switching `NgpSelect`'s placement to `bottom-start`, which aligns by the
  trigger's left edge and doesn't depend on measuring the floating panel's width at all.
- **`VoltBadge` silently dropping custom classes**: the component computed its host
  `[class]` purely from `badgeVariants({variant})`, never merging in a caller-provided
  `class` attribute through `cn()`/`twMerge` (every other component with variants —
  `Button`, `Table*`, `Dialog`, etc. — does). A custom override like `text-background`
  ended up sitting in the DOM next to the variant's own `text-foreground` with no
  dedup; whichever utility Tailwind happened to generate later in the stylesheet won,
  independent of the caller's intent. Added a `class` input merged via `cn()`, matching
  the rest of the library.
- **Self-referential layout demos showing every sidebar item as "active"**: the Sidebar
  Layout and Admin Dashboard demo pages point every nav item at the same literal route
  (they're single-page mockups), so Angular's `routerLinkActive` matched all of them
  regardless of the `exact` input — every item rendered with the active/highlighted
  style simultaneously. Added a `queryParams` input to `VoltSidebarItem` (forwarded to
  `[queryParams]`, which Angular resolves as real query parameters, unlike embedding
  `?query=` directly in the `routerLink` string) and gave each non-current demo item a
  distinguishing value, so only the current item matches.
- **Tabs active indicator invisible in dark mode**: `data-[state=active]` used
  `bg-background`, which is _darker_ than the tab list's own `bg-muted` in the dark
  palette (background 0.05 vs muted 0.15 lightness) — the "active" tab rendered as a
  recessed patch rather than a raised one, distinguishable only by text color. Added a
  `border-input` border to the active state, which reliably contrasts against both the
  fill and the list background in every preset and mode.
- **Docs pages leaking a native browser tooltip across the whole content area**: the
  three docs shells (`Layouts`, `Components`, `Getting Started`) passed their `title` as
  a plain string attribute (`title="Layouts"`) to `<app-docs-page-shell>`. Angular
  applies a static string attribute to a matching component input _and_ leaves it as a
  literal DOM attribute — since `title` is a global HTML attribute, this made the
  browser show a native tooltip reading "Layouts"/"Components"/"Getting Started"
  anywhere you hovered inside that shell (nav sidebar and the entire demo/content pane),
  landing wherever the cursor happened to be. Switched to property binding
  (`[title]="'Layouts'"`), which binds only the component input.
- **Landing CTA section always inverting relative to the site theme**: the "Copy
  components into your project" section used `bg-foreground text-background`
  unconditionally, so in dark mode — where `--foreground` is light — it rendered as a
  bright section in the middle of an otherwise dark page, defeating the point of dark
  mode. Switched to `bg-muted`/`text-foreground`/`text-muted-foreground`, which respects
  whichever theme is active like the rest of the page. The terminal mockup inside it
  (intentionally always dark, `bg-black/40`) had its own text colored via
  `text-background/*`, which depended on the same inversion; changed to fixed
  `text-white/*` values since the terminal's background no longer flips with it.
- **Hero heading crowding descenders**: `tracking-[-0.055em]` and `leading-[0.98]` on
  the display heading were tight enough to crowd descenders (the 'y' in "you") against
  the line above at large viewport widths. Loosened to `tracking-[-0.02em]` /
  `leading-[1.05]`. Also added the `-webkit-background-clip`/`-webkit-text-fill-color`
  pair to the animated gradient-text style, which some WebKit versions require for
  `background-clip: text` to render at all during a `background-position` animation.

### Changed

- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `0.8.1`.

## [0.8.0] - 2026-08-02

### Added

- Added `scripts/contrast-audit.mjs`: computes real WCAG contrast ratios (oklch -> linear
  sRGB -> relative luminance) for every semantic color pair across all 5 color presets x
  light/dark. `pnpm check:contrast` runs it; wired as a repeatable check, not a one-off.
- Added `scripts/docs-completeness-check.mjs` (`pnpm check:docs-completeness`): compares
  `public-api.ts` exports against source snippets, usage snippets, and demo pages.
- Added `scripts/generate-api-reference.mjs` (`pnpm generate:api-reference`): generates
  `src/app/lib/api-reference.generated.ts` from the actual component source (inputs,
  outputs, CVA variants) instead of hand-written tables that would drift.
- Added an **API Reference** section (inputs/outputs/variants) to every component demo
  page and the sidebar layout page, rendered by a new shared `<app-api-reference>`
  component.
- Added `/docs/customization`: editing a copied component, extending CVA variants,
  overriding classes with `cn()`, and when to reach for a theme preset instead.
- Added `/docs/migration-notes`: 0.x changes that actually require touching template
  code, sourced from this changelog.
- Added a Runtime API section, a Dark Mode Strategy section, and copy-paste templates
  for custom color and style presets to `/docs/themes`.
- Added `e2e/theme-presets.spec.ts`: drives the real header color/style pickers and
  dark-mode toggle on a live page and asserts computed tokens change.

### Fixed

- **Contrast**: fixed 67 color pairs across every preset that failed WCAG AA — buttons
  and status surfaces as low as 2.4:1 against their foreground text, and every preset's
  form-field border (`--input`) at ~1.1-1.4:1 against the page background (SC 1.4.11).
  Every fix is a hue/chroma-preserving lightness adjustment; brand identity is
  unchanged. All 130 checks (5 colors x light/dark x 13 pairs) now pass.
- **Theme drift**: `src/styles.css` carried a ~370-line hand-duplicated fork of every
  color and style preset, completely disconnected from
  `projects/volt/src/themes/` — the actual root cause of why the contrast bugs were
  invisible in the deployed docs site even after a library-side fix. Replaced it with
  `@import` of the same source files `@voltui/components/themes.css` ships.
- **SSR theme flash**: `provideVoltTheme()` read the global `document`, which is
  undefined during SSR, so its environment initializer silently no-op'd on the server.
  SSR consumers got default-theme HTML that flashed to their configured theme on
  hydration. Fixed by reading Angular's `DOCUMENT` injection token instead.
- **Docs-app theme flash**: the docs app's own saved theme (localStorage) was only
  applied from a component constructor, well after first paint. Added a synchronous
  inline script in `index.html`'s `<head>`, before any stylesheet, that applies it
  before the browser paints anything.
- Fixed the dialog demo page, which rendered raw `ng-primitives/dialog` directives with
  hand-duplicated Tailwind classes instead of the real `VoltDialog*` components, and
  showed a fabricated "Component Source" stub missing the real host classes entirely
  (no backdrop styling, no animation classes). Rewritten to use the real components,
  mirroring the (correct) drawer demo.
  - Added `DIALOG_SNIPPET`, `SIDEBAR_SNIPPET`/`SIDEBAR_USAGE`.
  - Moved `search`/`autofill`'s existing inline usage examples into the shared
    `snippets/usage.ts` convention every other component follows.
- Fixed the sidebar layout page's "Installation" section, which was an unfinished
  placeholder in Spanish pointing at a source path that doesn't exist
  (`src/app/layout/sidebar/`); replaced with proper Usage/Component Source panels.
- Fixed README.md's component count (said 40 in three places; the catalog table below
  it, and `public-api.ts`, both say 41).
- Fixed `scripts/generate-api-reference.mjs` truncating function-typed inputs
  (combobox's `compareWith`, `scrollToOption`, `itemLabel`, `trackByFn`) at nested
  commas and `=>` arrows in their type signatures.

### Changed

- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `0.8.0`.
- Removed `test_tooltip.js`, `test_playwright.js`, `update.js` from the repo root
  (unrunnable/dead one-off scripts from early scaffolding).
- Moved `ANALOGJS_USAGE.md` and `ANGULAR_USAGE.md` into `docs/`.
- Dropped `@analogjs/content` and `front-matter` as direct dependencies — both are
  already transitive dependencies of `@analogjs/router`/`@analogjs/platform` and
  nothing imports them directly.

## [0.7.0] - 2026-07-29

### Added

- Added full-source coverage enforcement with ratcheted thresholds and made coverage part
  of CI and the release gate.
- Added behavior tests for date-picker, file-upload, listbox, navigation-menu, resizable,
  table and sidebar; the suite now covers every component family in the v1 surface.
- Added Reactive Forms support to listbox and input-OTP while retaining their existing
  model-binding APIs.
- Added Reactive Forms, disabled, touched, filtering and selection coverage for combobox.
- Added keyboard resizing and ARIA value semantics to resizable separators.
- Added security, contribution, pull-request, issue and dependency-update policies.

### Changed

- Fixed the v1 component surface: all 40 components are now either stable or beta, with no
  experimental entries remaining.
- Updated usage snippets to recommend Reactive Forms for combobox, date-picker, input-OTP
  and listbox.
- CI and automated releases now verify AI-doc synchronization, coverage, all publishable
  tarballs, docs E2E and the packaged consumer fixture before publishing.
- Added complete npm metadata for the components, CLI and MCP installer packages.
- Bumped the root package, `@voltui/components` and `@voltui/cli` to `0.7.0`.

### Fixed

- Added ARIA table, row-group, row, header and cell semantics to custom table elements.
- Propagated native and ARIA disabled state through file-upload, listbox and input-OTP.
- Corrected stale stability metadata in the docs application.
- Replaced outdated testing and contributing instructions with the current repository
  paths and quality gates.

## [0.6.0] - 2026-07-04

### Added

- Added shared Playwright overlay helpers for visible layout, Escape dismissal, outside-click dismissal, focus return, and focus trap checks.
- Expanded consumer e2e overlay coverage for popover outside click, dropdown keyboard navigation, tooltip hover/focus, dialog/drawer focus trap and focus return, nested overlays, and toast dismissal.
- Added overlay unit coverage for drawer, dropdown menu, popover, toast, and tooltip primitives.

### Changed

- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `0.6.0`.
- Updated docs/demo select usage to prefer `[(value)]` model binding for `volt-select`.
- Updated `volt-dropdown-menu-item` to attach `NgpMenuItem` on the host so roving focus can register menu items correctly.
- Dropdown menu triggers now support keyboard opening with Enter and ArrowDown by default.
- Promoted dialog, drawer, dropdown-menu, popover, toast, and tooltip to beta in the component status matrix.
- Updated toast docs and snippets to use a stable `TemplateRef` query for Angular 21.

### Fixed

- Fixed `VoltSelect` declaring `valueChange` twice; `value = model(...)` now owns the generated `valueChange` output.
- Fixed keyboard-opened dropdown menus not moving focus to the first visible menu item.
- Fixed `volt-toast-close` so click, Enter, and Space dismiss the active toast.
- Fixed nested dropdown Escape handling in dialog demos by exposing `closeOnEscape` on `voltDialog`.

## [0.5.0] - 2026-07-04

### Added

- Added full Forms contract tests for `input`, `textarea`, `checkbox`, `radio`, `switch`, `toggle`, `toggle-group`, `slider`, and `select`.
- Added `ControlValueAccessor` support to `VoltRadioGroup` and `VoltToggleGroup`.
- Added template-driven forms smoke coverage for CVA-backed form controls.
- Added form-field tests for label association, hint/error wiring, and projected input/select/textarea controls.
- Added Reactive Forms usage snippets for promoted form controls.

### Changed

- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `0.5.0`.
- Promoted form controls with the full CVA contract in `COMPONENT_STATUS.md`.
- Promoted `select` from experimental to beta now that its Forms contract is covered; overlay hardening remains scheduled separately.
- Kept `search` as a structural wrapper around `NgpSearch`; use `volt-input type="search"` for CVA-backed search inputs.

### Fixed

- Forms-driven disabled state now composes with attribute-driven disabled state for `radio`, `toggle-group`, and `slider`.
- CVA-backed controls now expose `aria-invalid="true"` when their Angular form control is invalid and touched.
- Radio and toggle-group items now inherit group-level disabled state.

## [0.4.0] - 2026-07-03

### Added

- Added shared component metadata for docs grouping and release stability labels.
- Added `stable`, `beta`, and `experimental` badges to the components index and sidebar.
- Added stability metadata to the generated CLI manifest.
- Added grouped `volt list` output with descriptions, `--status=<stable|beta|experimental>` filtering, and `--json`.
- Added `pack:lib`, `release:check`, and `release:minor` scripts for the minor release path.
- Added dedicated `variants.ts` files for CVA-based components so variant styling can be maintained separately from component behavior.

### Changed

- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `0.4.0`.
- Updated README and component status guidance to recommend stable components while keeping all components available.
- Aligned component status labels around release confidence instead of hiding experimental components.
- Updated package dry-run scripts to use a repo-local npm cache so release checks do not depend on the user's global npm cache permissions.
- Updated docs source snippets and CLI manifest output to include component `variants.ts` files.

### Fixed

- `VoltButton` now defaults to `type="button"` and accepts an explicit `type` input for submit/reset usage.
- Button-like controls now render `type="button"` internally to avoid accidental form submissions.

## [0.2.0] - 2026-06-18

### Added

- Added `AGENTS.md` with project conventions and contribution guidelines for AI assistants.
- Added real Angular unit tests for `VoltButton`, `VoltCheckbox`, `VoltInput`, `VoltSwitch`, `VoltRadio`, `VoltTabs`, `VoltSlider`, `VoltSelect`, and `VoltDialog` using `@testing-library/angular` and `TestBed`.
- Added `cn()` utility in `projects/volt/src/lib/utils.ts` for merging Tailwind classes.
- CLI now copies components from the local filesystem instead of downloading from GitHub raw URLs.
- CLI now resolves and copies transitive component dependencies automatically.
- CLI now detects the project's package manager and prints the install command for runtime dependencies.
- CLI supports `--install` to install runtime dependencies automatically.
- CLI creates/updates an `index.ts` barrel file in the target directory.

### Changed

- Adopted a shadcn/ui-style architecture: components are intended to be copied into consumer projects and owned there.
- Removed embedded `styles:` CSS from components (`avatar`, `separator`, `progress`, `checkbox`, `switch`, `radio`, `select`, `slider`, `meter`) so they rely purely on Tailwind utilities.
- Refactored theme CSS to avoid recursive CSS variables: source tokens now use the `--volt-*` prefix (e.g. `--volt-shadow-sm`).
- Updated components to use Tailwind utilities directly (`shadow-lg`, `rounded-md`, `font-medium`, `bg-foreground`) instead of `var(--...)` escapes.
- Standardized all boolean inputs to use `booleanAttribute` transform (`disabled`, `readonly`, `required`, `multiple`, `trackPosition`, `showOnOverflow`, `useTextContent`).
- Refactored `VoltToast` and `VoltDialogContent` to use `class-variance-authority` / `cn()` consistently.
- Bumped root and CLI package versions to `0.2.0` to align with `@voltui/components`.
- Updated `tsconfig.spec.json` to include library component tests.
- Updated `README.md` and `CLI.md` to reflect the new shadcn-style workflow.

### Fixed

- Fixed CLI manifest generation to exclude `.spec.ts` and `.test.ts` files from component bundles.
- Corrected source-string tests that asserted the old `input(false)` and embedded-critical-styles patterns.

## [0.1.0] - 2026-06-07

### Added

- Initial alpha release of Volt UI component library
- 40+ accessible components built on ng-primitives
- CLI for adding components (`volt add`)
- MCP support for AI assistants (Claude, Cursor, Copilot, VS Code, Windsurf)
- Dark mode and theming system with 5 colors × 5 styles (25 presets)
- Documentation site powered by AnalogJS with SSR
- Layout showcase pages (admin, analytics, chat, kanban, etc.)
- CI/CD pipeline with GitHub Actions + Cloudflare Pages deploy
- ESLint flat config, Prettier, Husky, and lint-staged

### Changed

- Unified file naming: removed `.component` suffix from all component files for consistency
- `package.json`: moved `@types/node` to devDependencies, removed `node` and `cva` from production dependencies
- `wrangler.toml`: aligned build output directory with CI (`dist/analog/public`)

### Fixed

- Corrected package version from `0.0.0` to `0.1.0`
- Added `engines` requirement (`node >= 20`, `pnpm >= 9`)
