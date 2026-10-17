---
name: volt-ui-component-selection
description: >
  Choose the right Volt UI component for a responsibility: Button vs link, NativeSelect vs Select
  vs Combobox, Checkbox vs Switch vs Toggle, Tabs vs route navigation, Dialog vs Drawer vs
  Popover, Alert vs Toast, Spinner vs Skeleton, Sidebar vs NavigationMenu. Use when two or more
  components could fit.
---

# Choosing a Volt component

This is a responsibility map, not an API reference. For exact selectors and inputs ask the MCP
server (`find_components`, then `get_component`).

## The distinctions that matter

**Actions**

- **Button vs link.** An action that changes state is a `<button voltButton>`. Navigation is
  `<a voltButton routerLink>` — styled like a button, still a link. Never a button in a link.

**Forms and selection**

- **NativeSelect vs Select vs Combobox.** Fixed short list and a native control is fine →
  `NativeSelect` (an attribute on a real `<select>`). Custom-rendered options, groups, multiple →
  `Select`. The user searches by typing, or the list is long or remote → `Combobox`; remote data
  uses `filterMode="manual"` and the app owns the request.
- **Checkbox vs Switch vs Toggle.** A value submitted with a form, or "I agree" → `Checkbox`. An
  immediate on/off setting that takes effect now → `Switch`. A pressed state of a tool (bold) →
  `Toggle`; one of several tools → `ToggleGroup`.
- **Radio vs Select.** Few options that should all be visible → `Radio`; many → `Select`.
- **Slider vs RangeSlider.** One number vs a low–high pair.

**Navigation**

- **Tabs vs route navigation.** Tabs switch panels of one view and own the selection. When the URL
  owns the selection (deep links, middle-click), use real anchors, not `Tabs`.
- **Sidebar vs NavigationMenu.** `Sidebar` is application chrome (a persistent region).
  `NavigationMenu` is a top-level menu with flyout content.
- **Pagination vs infinite scroll.** `Pagination` for page-addressable lists.

**Feedback**

- **Alert vs Toast.** `Alert` is part of the page and stays until the condition clears. `Toast` is
  transient confirmation of something that already happened.
- **Spinner vs Skeleton.** Unknown duration, no shape → `Spinner`. Content with a known layout →
  `Skeleton`.
- **Badge vs status text.** A short label or count → `Badge`; a sentence → text.

**Overlays**

- **Dialog vs Drawer vs Popover.** Needs a decision, blocks the page → `Dialog`. Secondary panel or
  navigation on a small screen → `Drawer`. Small contextual content anchored to a control →
  `Popover`. A hint that names a control → `Tooltip` (never the only way to learn something).
- **Dropdown Menu vs Select.** Commands vs choosing a value.

**Display**

- **Table vs an application data table.** Volt's `Table` is styled markup. Sorting, filtering,
  paging and selection logic belongs to the application (see the data-table recipe).

## Do not use when

- **Combobox**: the app only needs a native fixed list (`NativeSelect`).
- **Dialog**: the content is not a decision — a Popover or inline content is lighter.
- **Tooltip**: the text is essential; put it on the page.
- **Toast**: the user must act on it or it carries an error they must read; use `Alert` or a Dialog.
- **Tabs**: the panels are separate pages.

## Catalog

The list below is generated from the project's component metadata; the MCP `find_components` tool
returns the same fields live.

<!-- volt:catalog:start -->

### Forms & Inputs

- **Button** (`button`, stable) — Triggers an action or navigates. Use the `voltButton` attribute on a native `<button>` or `<a>`, or the `<volt-button>` element.
  - Not for: A link to another page that is not styled as an action: use a plain anchor.
  - See also: `toggle`, `dropdown-menu`
- **Input** (`input`, stable) — A single-line text field styled for Volt, with size and validation-state variants. Works with Angular forms.
  - Not for: A choice from a list: use Select, Combobox or Radio.
  - See also: `textarea`, `form-field`, `search`
- **Search** (`search`, stable) — A search field wrapper with an icon slot and a clear button around a native input.
  - Not for: Searching a server-backed list for a value: use Combobox with manual filtering.
  - See also: `input`, `combobox`
- **Autofill** (`autofill`, stable) — A directive that reports when the browser autofills an input, so styles and state can react.
- **Textarea** (`textarea`, stable) — A multi-line text field with variant, size, state and resize options.
- **Checkbox** (`checkbox`, stable) — A checked, unchecked or indeterminate toggle that works with Angular forms.
  - Not for: A setting that takes effect immediately: use Switch.
  - See also: `switch`, `toggle`, `radio`
- **Radio** (`radio`, stable) — A group of mutually exclusive options.
  - Not for: More than a handful of options: use Select.
  - See also: `select`, `checkbox`, `toggle-group`
- **Switch** (`switch`, stable) — An on/off control for a setting that takes effect immediately.
  - Not for: A choice submitted with a form or an "I agree": use Checkbox.
  - See also: `checkbox`, `toggle`
- **Form Field** (`form-field`, stable) — Groups a control with its label, hint and error message and wires them together without hand-written ids.
  - Not for: Anything that is not a labelled form control.
  - See also: `input`, `textarea`, `select`
- **Select** (`select`, stable) — A custom listbox-based select with single and multiple selection, plus a styled native `<select>` directive.
  - Not for: A short fixed list where a native control is enough: use the native select directive.
  - Not for: A list the user searches by typing or that comes from a server: use Combobox.
  - See also: `combobox`, `listbox`, `radio`
- **Slider** (`slider`, stable) — Selects a single number in a range.
  - Not for: A low–high pair: use Range Slider.
  - See also: `range-slider`, `progress`
- **Range Slider** (`range-slider`, stable) — Selects a low and a high value in a range.
  - Not for: A single number: use Slider.
  - See also: `slider`
- **Input OTP** (`input-otp`, stable) — A segmented one-time-password field with paste support and a completion event.
- **File Upload** (`file-upload`, stable) — A file picker directive and a drag-and-drop dropzone that report selected and rejected files.
- **Combobox** (`combobox`, stable) — A text input with a filterable popup list. Supports local filtering, manual (server-side) filtering, loading state and multiple selection.
  - Not for: A fixed list the application only needs a native select for.
  - Not for: Choosing a command: use Dropdown Menu.
  - See also: `select`, `listbox`, `search`

### Display

- **Badge** (`badge`, stable) — A small label for status, counts or categories.
  - Not for: A full sentence of status: use text or Alert.
  - See also: `alert`, `avatar`
- **Card** (`card`, stable) — A surface that groups related content with optional header, content and footer parts.
- **Avatar** (`avatar`, stable) — A user image with a fallback (usually initials).
- **Separator** (`separator`, stable) — A horizontal or vertical divider.
- **Accordion** (`accordion`, stable) — Vertically stacked sections that expand and collapse.
  - Not for: Switching between mutually exclusive views: use Tabs.
  - See also: `tabs`
- **Progress** (`progress`, stable) — Shows how far a task has advanced, or that one is running when the value is unknown.
  - Not for: A measured quantity within a known range (disk usage): use Meter.
  - See also: `meter`, `spinner`
- **Meter** (`meter`, stable) — A gauge for a value within a known range, such as disk usage.
  - Not for: Progress toward completion: use Progress.
  - See also: `progress`
- **Skeleton** (`skeleton`, stable) — A placeholder that mimics content while it loads.
  - Not for: An unknown-duration wait with no shape: use Spinner.
  - See also: `spinner`
- **Table** (`table`, stable) — Styled table parts for tabular data: header, body, footer, rows, cells and caption.
  - Not for: Sorting, filtering, paging and selection logic: that belongs to the application.
  - See also: `pagination`
- **Alert** (`alert`, stable) — A callout for information, success, warnings or errors that sits in the page flow.
  - Not for: A transient "saved" confirmation: use Toast.
  - See also: `toast`, `empty-state`, `dialog`
- **Spinner** (`spinner`, beta) — An indeterminate loading indicator in three sizes.
  - Not for: Content with a known layout: use Skeleton.
  - See also: `skeleton`, `progress`
- **Empty State** (`empty-state`, beta) — A placeholder for an empty collection or a search with no results, with room for an action.
  - Not for: An error or warning about the page: use Alert.
  - See also: `alert`, `skeleton`

### Controls

- **Toggle** (`toggle`, stable) — A two-state button that stays pressed, such as bold in a text editor.
  - Not for: An on/off setting: use Switch. A value in a form: use Checkbox.
  - See also: `toggle-group`, `switch`, `checkbox`
- **Toggle Group** (`toggle-group`, stable) — A set of toggles with single or multiple selection.
  - Not for: Switching between views of a page: use Tabs.
  - See also: `toggle`, `radio`, `toolbar`, `tabs`
- **Pagination** (`pagination`, stable) — Page navigation with first/previous/next/last controls and numbered pages.
  - Not for: Endless lists that load as you scroll.
  - See also: `table`
- **Date Picker** (`date-picker`, stable) — A calendar for choosing a single date or a date range, with min/max and disabled-date rules.
- **Listbox** (`listbox`, stable) — An always-visible list of options with single or multiple selection.
  - Not for: A value inside a form that collapses after choosing: use Select.
  - See also: `select`, `combobox`
- **Toolbar** (`toolbar`, stable) — A container that groups related controls into one tab stop with arrow-key navigation.

### Overlays

- **Tooltip** (`tooltip`, stable) — A short hint shown on hover or keyboard focus.
  - Not for: Essential information, or anything interactive: put it on the page or use Popover.
  - See also: `popover`
- **Dialog** (`dialog`, stable) — A modal window. Open it from a trigger, control it with `[(open)]`, or open it from code and await the result with `VoltDialogService`.
  - Not for: Content that does not need a decision: use a Popover or inline content.
  - Not for: A secondary panel or small-screen navigation: use Drawer.
  - See also: `drawer`, `popover`, `alert`
- **Drawer** (`drawer`, stable) — A modal panel that slides in from an edge of the screen.
  - Not for: A decision that must block the page: use Dialog.
  - See also: `dialog`, `sidebar`
- **Popover** (`popover`, stable) — A floating panel anchored to a trigger, for rich, non-modal content.
  - Not for: A hint that only names a control: use Tooltip.
  - Not for: A command list: use Dropdown Menu.
  - See also: `tooltip`, `dropdown-menu`, `dialog`
- **Dropdown Menu** (`dropdown-menu`, stable) — A menu of actions opened from a trigger, with labels, separators and submenus.
  - Not for: Choosing a value for a field: use Select.
  - See also: `select`, `popover`
- **Toast** (`toast`, stable) — Short, transient notifications raised from code with `VoltToastService`.
  - Not for: An error the user must read or act on: use Alert or a Dialog.
  - See also: `alert`

### Navigation

- **Tabs** (`tabs`, stable) — Switches between related panels, one visible at a time.
  - Not for: Navigation where the URL owns the selection (deep links, middle-click): use real anchors.
  - Not for: Panels that are really separate pages.
  - See also: `navigation-menu`, `toggle-group`, `accordion`
- **Navigation Menu** (`navigation-menu`, stable) — A site navigation bar whose items can open rich submenu panels.
  - Not for: Persistent application chrome with sections: use Sidebar.
  - See also: `sidebar`, `tabs`, `breadcrumbs`
- **Breadcrumbs** (`breadcrumbs`, stable) — Shows the path to the current page.

### Layout

- **Resizable** (`resizable`, stable) — Panels separated by draggable, keyboard-operable handles.
- **Sidebar** (`sidebar`, stable) — A collapsible application sidebar with header, groups, items and footer.
  - Not for: A top-level menu with flyout content: use Navigation Menu.
  - See also: `navigation-menu`, `drawer`

### Foundations

- **Theme** (`theme`, stable) — Colour and style presets and the functions that apply them: provideVoltTheme at bootstrap, applyVoltTheme at runtime.
  - Not for: Restyling one component: use its variants or `class`.

<!-- volt:catalog:end -->

<!-- volt:digest:start -->

- Action that changes state → Button; navigation → `<a voltButton routerLink>`; never a button inside a link.
- Fixed short list → NativeSelect; custom options/groups → Select; searchable or remote → Combobox (`filterMode="manual"`, the app owns the request).
- Form value / consent → Checkbox; immediate setting → Switch; tool pressed state → Toggle/ToggleGroup.
- Decision that blocks → Dialog; secondary panel → Drawer; anchored contextual content → Popover; hint → Tooltip (never the only copy).
- Persistent page feedback → Alert; transient confirmation → Toast; unknown wait → Spinner; known layout → Skeleton.

<!-- volt:digest:end -->
