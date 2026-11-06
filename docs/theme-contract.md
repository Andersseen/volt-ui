# Theme contract

What Volt's palettes, styles and density promise, and which part of which component reads each
token. The rule: **a component consumes roles, a preset decides their values.** A token with no reader
does not belong here.

Sources: [`packages/volt/src/themes/`](../packages/volt/src/themes/). `tokens.css` is the contract,
`core.css` adds the global rules, `colors/*` and `styles/*` set values.

| Import                                          | Gives you                                                     |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `@voltui/components/themes.css`                 | Volt + Sharp, with body colours and scrollbars                |
| `@voltui/components/themes/presets/<c>-<s>.css` | One fixed pair, the same global rules                         |
| `@voltui/components/themes/all.css`             | Every palette and style, for runtime switching and scopes     |
| `@voltui/components/themes/tokens.css`          | The contract with no global rules; add `colors/*`, `styles/*` |

CLI copies read the same tokens: keep `@voltui/components` (or a copy of `themes/`) at the version you
copied the components from. New components against an old stylesheet lose their token utilities.

## Colour roles

Set by a palette, per light and dark. `surface-elevated` and `track` are derived, so a palette that
does not know them still works.

| Token                                 | Responsibility                                          | Read by                                          |
| ------------------------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| `background`, `foreground`            | The page and its text                                   | Everything; inputs fill with `background`        |
| `surface`                             | Cards and panels at rest                                | Card, Alert, Sidebar                             |
| `surface-elevated`                    | Raised layers. Equals `surface` in light, lifts in dark | Popover, Menu, Select, Combobox, Dialog, Drawer  |
| `muted`, `muted-foreground`           | Quiet fills, secondary text                             | Tabs list, hover and accent fills, hints         |
| `border`                              | Structure                                               | Surfaces, dividers                               |
| `input`                               | The outline of a control, 3:1 against the page          | Input, Select, Checkbox, Radio, Switch off       |
| `ring`                                | Focus                                                   | Every focusable part                             |
| `primary`                             | The action and the selection                            | Solid button, checked and selected states, fills |
| `secondary`                           | A quiet tinted fill. **Never a second accent**          | Consumers; the library no longer paints with it  |
| `track`                               | The unfilled part of a measure, quiet in every palette  | Progress, Meter, Slider, Range Slider            |
| `success`, `warning`, `error`, `info` | Status only: never selection or progress                | Badge, Alert, Input state, Toast                 |
| `destructive`                         | A dangerous action. Same values as `error`              | Destructive button, Badge, Alert                 |

## Style tokens

Set by a style, per `data-style`.

| Token                                            | Controls                                                  | Sharp       | Soft         | Brutal         | Ghost                | Retro         |
| ------------------------------------------------ | --------------------------------------------------------- | ----------- | ------------ | -------------- | -------------------- | ------------- |
| `--radius`                                       | Corners; `rounded-sm/lg/xl` are multiples of it           | 0.375rem    | 0.875rem     | 0rem           | 0.5rem               | 0.625rem      |
| `--volt-radius-pill`                             | Badge, Switch, tracks, thumbs (`rounded-pill`)            | full        | full         | 0              | full                 | 0.625rem      |
| `--border-width`                                 | Surfaces                                                  | 1px         | 1px          | 2px            | 0                    | 2px           |
| `--volt-control-border-width`                    | Controls; never 0, it is how an input is recognised       | 1px         | 1px          | 2px            | 1px                  | 2px           |
| `--volt-divider-width`                           | Table rows, accordion items                               | 1px         | 1px          | 2px            | 1px                  | 1px           |
| `--volt-border-emphasis`                         | How far borders lean towards the text colour              | 0%          | 0%           | 100%           | 0%                   | 35%           |
| `--volt-surface-tint`                            | How far cards lean towards `muted`                        | 0%          | 0%           | 0%             | 65%                  | 0%            |
| `--volt-control-solid-border`                    | The outline of a filled button                            | none        | none         | text colour    | none                 | mixed         |
| `--ring-width`, `--ring-offset-width`            | Focus indicator                                           | 2/2         | 3/2          | 3/2            | 2/2                  | 3/2           |
| `--volt-shadow-sm` … `-xl`                       | Elevation. Never `none`: it voids the focus ring          | crisp       | diffuse      | hard offset    | hairline on overlays | stepped       |
| `--volt-press-x`, `-y`, `-scale`                 | What a press does to a button                             | scale       | scale        | sinks 2px      | scale                | drops 3px     |
| `--spacing-component`                            | The style's metric factor                                 | 1           | 1.0625       | 1              | 1.125                | 1             |
| `--spacing-gap`                                  | Stacks: form fields, radio groups, OTP (`gap-stack`)      | 0.5rem      | 0.625rem     | 0.5rem         | 0.75rem              | 0.625rem      |
| `--volt-track-size`, `--volt-track-border-width` | Thickness of Progress, Meter, Slider tracks               | 0.5rem / 0  | 0.625rem / 0 | 0.875rem / 2px | 0.25rem / 0          | 0.75rem / 2px |
| `--volt-thumb-size`                              | Slider thumbs                                             | 1.25rem     | 1.375rem     | 1.375rem       | 1.125rem             | 1.375rem      |
| `--volt-font-weight-base`, `-label`, `-heading`  | `font-normal`, `font-medium`, `font-semibold`/`font-bold` | 400/500/600 | 400/500/600  | 500/700/800    | 400/500/500          | 500/600/700   |

`--border-style` is **deprecated**: no style sets another value and nothing reads it. It stays declared
through 1.x. `--radius` must be a length (`0rem`): `calc(0 * 1.333)` is a number, not a radius.

## Metrics and density

`--volt-density` is `0.875`, `1` or `1.125` from `data-density="compact | comfortable | spacious"`, set by
`provideVoltTheme`, `applyVoltTheme`, `voltTheme` or by hand on any container.

| Utility                               | Base                            | Used for                                             |
| ------------------------------------- | ------------------------------- | ---------------------------------------------------- |
| `h-control-xs`/`sm`/`dense`/`md`/`lg` | 1.75 / 2 / 2.25 / 2.5 / 2.75rem | The `sm`, `md`, `lg` of controls; `dense` for nested |
| `px-inset-xs`/`sm`/`md`/`lg`          | 0.5 / 0.75 / 1 / 2rem           | Inline padding of controls                           |
| `py-item-y`                           | 0.375rem                        | Rows in lists and menus                              |
| `p-panel`, `p-card`                   | 1 / 1.5rem                      | Popovers and toasts, cards and dialogs               |
| `gap-stack`                           | `--spacing-gap`                 | Stacks                                               |
| `h-track`, `size-thumb`               | style tokens                    | Tracks and thumbs; density leaves these alone        |

Each value is `base × --spacing-component × --volt-density`, written into the utility by `@theme inline`.
So it resolves on the element that paints: a density on a container reaches everything inside it, and a
nested density **replaces** the outer one. `max()` floors keep a control at 24px or more whatever the
product (WCAG 2.2 target size). `size="sm"` and friends stay explicit and predictable: density shifts the
whole scale, it never swaps one size for another.

`cn()` knows these utilities, so a consumer's `h-12` or `rounded-none` replaces them as it would a plain
Tailwind class.

## Scopes

`[voltTheme]="{ color, style, dark, density }"` applies a theme to one element and renders on the server.
Selectors include `[data-volt-theme]`, so a custom palette needs both:

```css
:root[data-color='mine'],
[data-volt-theme][data-color='mine'] { … }

.dark[data-color='mine'],
.dark [data-volt-theme][data-color='mine']:not([data-mode='light']) { … }
```

The Theme Studio exports exactly this.

| Rendered                                                                           | Theme                                                          |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Inside the element                                                                 | The scope                                                      |
| Popover, Dropdown Menu, Tooltip, Select, Combobox, Dialog, Drawer, Navigation Menu | The scope, through `VoltThemeInherit`, when declared inside it |
| A dialog opened from a service with a component                                    | The page, unless you pass `injector` from inside the scope     |
| Quartz Select                                                                      | The scope: it renders in place, so CSS inheritance is enough   |
| Toast                                                                              | The page                                                       |
| Your own portalled content                                                         | The page, unless you add `voltThemeInherit`                    |

**Limits.** A scope that sets `color` but not `style` keeps the page's offset-shadow ink under Brutal and
Retro, because a shadow is drawn in the palette of the element that sets the style. Omitted `dark` follows
the page; a scope that forces a mode without a `color` falls back to Volt or the surrounding scope.

## Shapes that do not follow the presets

Kept on purpose, not because nobody got to them:

| Part                                  | Why                                                               |
| ------------------------------------- | ----------------------------------------------------------------- |
| Radio and its dot                     | Round is what tells a radio from a checkbox                       |
| Avatar, Skeleton `circle`             | The shape is the content                                          |
| Spinner                               | Rotation needs a circle                                           |
| Resizable grip                        | A grip mark, not a surface                                        |
| Slider thumb border                   | 2px in every style: it is the thumb's only edge against the track |
| Checkbox, Radio, Switch size          | Fixed indicators; density does not resize them                    |
| Sidebar padding, Breadcrumbs ellipsis | Page layout rather than a control                                 |
