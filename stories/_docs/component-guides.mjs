/**
 * Hand-written prose for the generated Storybook component pages.
 *
 * Everything that can be derived is NOT here: the API tables (`api-reference.generated.ts`), the
 * usage example (`snippets/usage.ts`), the status and group (`component-metadata.ts`) and the
 * keyboard/focus/forms rows (`COMPONENT_STATUS.md`) are read by
 * `scripts/generate-storybook-docs.mjs`. This file only holds what no other source has:
 * a plain-language summary, when to reach for the component, and accessibility notes.
 *
 * Keep accessibility notes to behaviour the component really implements (see its spec and
 * `COMPONENT_STATUS.md`). Do not add WCAG claims.
 */

/** English group titles, keyed by the `catalog.groups.*` key suffix used in `component-metadata.ts`. */
export const GROUP_TITLES = {
  forms: 'Forms & Inputs',
  controls: 'Controls',
  navigation: 'Navigation',
  overlays: 'Overlays',
  display: 'Display',
  layout: 'Layout',
};

/**
 * @type {Record<string, { title: string; group: keyof typeof GROUP_TITLES; summary: string; when: string[]; a11y: string[] }>}
 */
export const COMPONENT_GUIDES = {
  button: {
    title: 'Button',
    group: 'forms',
    summary:
      'Triggers an action or navigates. Use the `voltButton` attribute on a native `<button>` or `<a>`, or the `<volt-button>` element.',
    when: [
      'Submitting, confirming or starting an action: `variant="solid"` for the primary action, `outline` or `ghost` for secondary ones.',
      'Navigation that should look like a button: put `voltButton` on a real `<a>`, never an `<a>` around a `<button>`.',
      'Destructive actions: `variant="destructive"`, ideally behind a confirmation dialog.',
    ],
    a11y: [
      'The native attribute form keeps the element you wrote: the focused and announced element is a real `<button>` or `<a>`.',
      'Icon-only buttons (`size="icon"`) need an `aria-label`; hide the icon itself with `aria-hidden`.',
      '`disabled` removes the button from the tab order. `aria-disabled="true"` only dims it and keeps focus, so a pending button can stay focused and explain itself with `aria-describedby`. Volt does not block clicks on an `aria-disabled` button: guard the handler.',
    ],
  },
  input: {
    title: 'Input',
    group: 'forms',
    summary:
      'A single-line text field styled for Volt, with size and validation-state variants. Works with Angular forms.',
    when: [
      'Short free text: names, emails, search terms, numbers.',
      'Wrap it in a Form Field to get a label, hint and error wired to the control.',
    ],
    a11y: [
      'Renders a native `<input>`: label it with a `<label for>` or `aria-label`.',
      'The `error` state marks the control invalid; pair it with a visible message (`volt-error` inside a Form Field).',
    ],
  },
  search: {
    title: 'Search',
    group: 'forms',
    summary: 'A search field wrapper with an icon slot and a clear button around a native input.',
    when: ['Filtering a list or table, or a site search box.'],
    a11y: [
      'The inner control is a native input: give it an accessible name.',
      'The clear button takes an `aria-label`; set it in the user’s language.',
    ],
  },
  autofill: {
    title: 'Autofill',
    group: 'forms',
    summary:
      'A directive that reports when the browser autofills an input, so styles and state can react.',
    when: [
      'Floating labels or validation that must know a value arrived from the browser, not the keyboard.',
    ],
    a11y: [
      'Purely observational: it adds no semantics, so keep using native `autocomplete` tokens on the input.',
    ],
  },
  textarea: {
    title: 'Textarea',
    group: 'forms',
    summary: 'A multi-line text field with variant, size, state and resize options.',
    when: ['Comments, descriptions, messages: anything longer than one line.'],
    a11y: [
      'Renders a native `<textarea>`: label it with a `<label for>` or `aria-label`.',
      'Use the `error` state together with visible error text.',
    ],
  },
  'form-field': {
    title: 'Form Field',
    group: 'forms',
    summary:
      'Groups a control with its label, hint and error message and wires them together without hand-written ids.',
    when: ['Any form control that needs a visible label, helper text or validation message.'],
    a11y: [
      'The label, description and error are associated with the projected control, so assistive technology announces them with it.',
      'Outside a Form Field, point a label at the control yourself with `htmlFor`.',
    ],
  },
  checkbox: {
    title: 'Checkbox',
    group: 'forms',
    summary: 'A checked, unchecked or indeterminate toggle that works with Angular forms.',
    when: [
      'Independent yes/no options and “select all” parents (indeterminate).',
      'Prefer a Switch for settings that apply immediately.',
    ],
    a11y: [
      'Built on the ng-primitives checkbox, which provides the role and state; the checkbox needs a label (`aria-label` or an associated label).',
      'Supports the full forms contract (value, touched, disabled).',
    ],
  },
  switch: {
    title: 'Switch',
    group: 'forms',
    summary: 'An on/off control for a setting that takes effect immediately.',
    when: [
      'Enabling or disabling a feature, such as notifications or dark mode.',
      'Use a Checkbox when the choice is submitted later with a form.',
    ],
    a11y: [
      'Built on the ng-primitives switch (role `switch`). Name it with `ariaLabel` or an associated label.',
      'Supports the full forms contract.',
    ],
  },
  radio: {
    title: 'Radio',
    group: 'forms',
    summary: 'A group of mutually exclusive options.',
    when: ['Choosing exactly one option out of a short, visible list (about seven or fewer).'],
    a11y: [
      'Built on the ng-primitives radio group: one tab stop for the group, arrow keys move and select.',
      'Label the group (for example with a `fieldset`/legend or `aria-label`) as well as each item.',
    ],
  },
  select: {
    title: 'Select',
    group: 'forms',
    summary:
      'A custom listbox-based select with single and multiple selection, plus a styled native `<select>` directive.',
    when: [
      'Choosing from a list that is too long for radios.',
      'Use the native select directive when you want the platform picker (for example on mobile).',
    ],
    a11y: [
      'Built on the ng-primitives select: keyboard navigation and listbox semantics come from the primitive.',
      'Provide `ariaLabel` (or a label) so the trigger has a name.',
    ],
  },
  combobox: {
    title: 'Combobox',
    group: 'forms',
    summary:
      'A text input with a filterable popup list. Supports local filtering, manual (server-side) filtering, loading state and multiple selection.',
    when: [
      'Picking from long lists where typing narrows the options.',
      'Set `filterMode="manual"` and drive `items` yourself for server-side search.',
    ],
    a11y: [
      'Built on the ng-primitives combobox; dropdown keyboard and focus behaviour is covered by unit tests.',
      'Result counts and loading/empty text are exposed as text you can localise (`resultsText`, `loadingText`, `emptyText`).',
    ],
  },
  'input-otp': {
    title: 'Input OTP',
    group: 'forms',
    summary: 'A segmented one-time-password field with paste support and a completion event.',
    when: ['Entering verification codes of a fixed length.'],
    a11y: [
      'Typing, paste and the `pattern` filter are covered by tests.',
      'The group has an `ariaLabel` (default “One-time password”); localise it.',
    ],
  },
  'file-upload': {
    title: 'File Upload',
    group: 'forms',
    summary:
      'A file picker directive and a drag-and-drop dropzone that report selected and rejected files.',
    when: [
      'Letting people attach files, with optional type restrictions, multiple files or directories.',
    ],
    a11y: [
      'Built around the native file input, so keyboard activation and screen-reader behaviour are the platform’s.',
      'Drag and drop is an enhancement only: make sure the picker button is always available.',
    ],
  },
  slider: {
    title: 'Slider',
    group: 'forms',
    summary: 'Selects a single number in a range.',
    when: [
      'Approximate values where the exact number matters less than the position: volume, price range.',
    ],
    a11y: [
      'Built on the ng-primitives slider: thumb keyboard control comes from the primitive. Provide `ariaLabel`.',
    ],
  },
  'range-slider': {
    title: 'Range Slider',
    group: 'forms',
    summary: 'Selects a low and a high value in a range.',
    when: ['Filtering by a range, such as price or date span.'],
    a11y: ['Each thumb needs its own name: set `ariaLabelLow` and `ariaLabelHigh`.'],
  },
  toggle: {
    title: 'Toggle',
    group: 'controls',
    summary: 'A two-state button that stays pressed, such as bold in a text editor.',
    when: ['A formatting or view option that is on or off and looks like a button.'],
    a11y: ['Exposes its state with `aria-pressed`. Icon-only toggles need `ariaLabel`.'],
  },
  'toggle-group': {
    title: 'Toggle Group',
    group: 'controls',
    summary: 'A set of toggles with single or multiple selection.',
    when: ['Alignment, view mode or filter chips where options belong together.'],
    a11y: [
      'Roving focus comes from the ng-primitives toggle group. Icon-only items need `aria-label`.',
    ],
  },
  toolbar: {
    title: 'Toolbar',
    group: 'controls',
    summary:
      'A container that groups related controls into one tab stop with arrow-key navigation.',
    when: ['Editor or table actions with many small controls.'],
    a11y: [
      'One tab stop, arrow keys move between items (roving focus via the primitive). Label the toolbar.',
    ],
  },
  pagination: {
    title: 'Pagination',
    group: 'controls',
    summary: 'Page navigation with first/previous/next/last controls and numbered pages.',
    when: ['Browsing a long list split into pages.'],
    a11y: ['Built from native buttons or links. Give the surrounding `nav` an accessible name.'],
  },
  'date-picker': {
    title: 'Date Picker',
    group: 'controls',
    summary:
      'A calendar for choosing a single date or a date range, with min/max and disabled-date rules.',
    when: ['Booking, scheduling and filtering by date.'],
    a11y: [
      'Built on the ng-primitives date picker; calendar grid selection is covered by tests. The month label is a polite live region.',
    ],
  },
  listbox: {
    title: 'Listbox',
    group: 'controls',
    summary: 'An always-visible list of options with single or multiple selection.',
    when: [
      'Selection from a list that stays on screen, such as a settings sidebar or a multi-select list.',
    ],
    a11y: [
      'Listbox semantics and arrow-key/Enter handling come from ng-primitives; the active option is covered by tests.',
    ],
  },
  'navigation-menu': {
    title: 'Navigation Menu',
    group: 'navigation',
    summary: 'A site navigation bar whose items can open rich submenu panels.',
    when: ['Top-level site navigation with grouped destinations.'],
    a11y: [
      'Escape closes submenus; opening and swapping submenus is covered by tests. Links should be real anchors.',
    ],
  },
  tabs: {
    title: 'Tabs',
    group: 'navigation',
    summary: 'Switches between related panels, one visible at a time.',
    when: ['Splitting a page into sibling views that share a context.'],
    a11y: [
      'Tab list semantics and arrow-key navigation come from ng-primitives; `activateOnFocus` selects on arrow focus.',
    ],
  },
  breadcrumbs: {
    title: 'Breadcrumbs',
    group: 'navigation',
    summary: 'Shows the path to the current page.',
    when: ['Deep hierarchies where people need to go up a level.'],
    a11y: [
      'Renders a labelled navigation landmark (`ariaLabel`, default “breadcrumb”) with link semantics; the current page is not a link.',
    ],
  },
  dialog: {
    title: 'Dialog',
    group: 'overlays',
    summary:
      'A modal window. Open it from a trigger, control it with `[(open)]`, or open it from code and await the result with `VoltDialogService`.',
    when: [
      'Confirmations and short focused tasks that must interrupt the page.',
      'Use `role="alertdialog"` for destructive confirmations, and `initialFocus` to start on the safe action.',
    ],
    a11y: [
      'Focus is trapped while open and returns to the trigger on close; Escape and an outside click dismiss it (covered by e2e tests).',
      'Always include a `voltDialogTitle`; add `voltDialogDescription` for supporting text.',
      '`[dismissible]="false"` blocks Escape and overlay clicks while work is pending; `close()` still works.',
    ],
  },
  drawer: {
    title: 'Drawer',
    group: 'overlays',
    summary: 'A modal panel that slides in from an edge of the screen.',
    when: ['Mobile navigation, filters and detail panels that should not leave the page.'],
    a11y: [
      'Same dialog behaviour as the Dialog: focus trap and return, Escape and outside click (covered by e2e tests). Include a title.',
    ],
  },
  popover: {
    title: 'Popover',
    group: 'overlays',
    summary: 'A floating panel anchored to a trigger, for rich, non-modal content.',
    when: ['Contextual forms, details and settings that do not need to block the page.'],
    a11y: [
      'Escape and outside click close it (configurable); open/close and positioning are covered by tests.',
    ],
  },
  'dropdown-menu': {
    title: 'Dropdown Menu',
    group: 'overlays',
    summary: 'A menu of actions opened from a trigger, with labels, separators and submenus.',
    when: ['A list of commands attached to a button, such as an account or row-actions menu.'],
    a11y: [
      'Arrow, Home, End and Enter navigation; Escape, outside click and focus return are covered by tests.',
    ],
  },
  tooltip: {
    title: 'Tooltip',
    group: 'overlays',
    summary: 'A short hint shown on hover or keyboard focus.',
    when: ['Naming an icon button or adding brief, non-essential information.'],
    a11y: [
      'Shows on hover and focus, hides on blur or Escape, and is linked with `aria-describedby`. Never put essential or interactive content in a tooltip.',
    ],
  },
  toast: {
    title: 'Toast',
    group: 'overlays',
    summary: 'Short, transient notifications raised from code with `VoltToastService`.',
    when: ['Confirming a background result: saved, copied, failed.'],
    a11y: [
      'Error toasts are announced with `role="alert"`; the close control, pause-on-hover and keyboard dismissal are covered by tests. Do not rely on a toast alone for information people must act on.',
    ],
  },
  accordion: {
    title: 'Accordion',
    group: 'display',
    summary: 'Vertically stacked sections that expand and collapse.',
    when: ['FAQs and settings where most sections are not needed at once.'],
    a11y: [
      'Header buttons expose expanded state and keyboard behaviour through ng-primitives. Keep trigger text descriptive.',
    ],
  },
  avatar: {
    title: 'Avatar',
    group: 'display',
    summary: 'A user image with a fallback (usually initials).',
    when: ['Identifying people in lists, comments and menus.'],
    a11y: [
      'Give the image meaningful `alt` text, or empty `alt` when the name is already adjacent. The fallback appears after an optional `delay`.',
    ],
  },
  badge: {
    title: 'Badge',
    group: 'display',
    summary: 'A small label for status, counts or categories.',
    when: ['Status such as “New” or “Beta”, and counts next to a label.'],
    a11y: ['A badge is plain text: do not rely on colour alone to convey its meaning.'],
  },
  card: {
    title: 'Card',
    group: 'display',
    summary:
      'A surface that groups related content with optional header, content and footer parts.',
    when: ['Grouping a unit of content: a project, a plan, a settings section.'],
    a11y: [
      'Static content with no role of its own. Use a real heading in the title, and make a whole-card link a single anchor.',
    ],
  },
  meter: {
    title: 'Meter',
    group: 'display',
    summary: 'A gauge for a value within a known range, such as disk usage.',
    when: ['A measurement, not task progress (use Progress for that).'],
    a11y: [
      'Exposes `min`, `max` and the current value to assistive technology; supply a `valueLabel` for a human-readable reading.',
    ],
  },
  progress: {
    title: 'Progress',
    group: 'display',
    summary: 'Shows how far a task has advanced, or that one is running when the value is unknown.',
    when: ['Uploads, multi-step flows and long operations.'],
    a11y: [
      'Built on the ng-primitives progress, which exposes the value range; a `null` value means the amount is unknown. Label it with `volt-progress-label` or `aria-label`.',
    ],
  },
  separator: {
    title: 'Separator',
    group: 'display',
    summary: 'A horizontal or vertical divider.',
    when: ['Dividing groups of related content or toolbar controls.'],
    a11y: ['Rendered as a separator with its orientation. It is not focusable.'],
  },
  skeleton: {
    title: 'Skeleton',
    group: 'display',
    summary: 'A placeholder that mimics content while it loads.',
    when: ['Content whose layout is known before the data arrives.'],
    a11y: [
      'Decorative. Mark the loading region with `aria-busy` and make sure the real content is announced when it appears.',
    ],
  },
  table: {
    title: 'Table',
    group: 'display',
    summary: 'Styled table parts for tabular data: header, body, footer, rows, cells and caption.',
    when: ['Comparing records across several attributes.'],
    a11y: [
      'Uses native table semantics through ARIA table roles; add a `volt-table-caption` to name the table.',
    ],
  },
  alert: {
    title: 'Alert',
    group: 'display',
    summary: 'A callout for information, success, warnings or errors that sits in the page flow.',
    when: ['Messages tied to a page area or form, not transient ones (use Toast for those).'],
    a11y: [
      'Static content has no live-region role. Opt in with `role="status"` or `role="alert"` when the alert appears after an action.',
      'Do not rely on colour alone: keep a clear title.',
    ],
  },
  spinner: {
    title: 'Spinner',
    group: 'display',
    summary: 'An indeterminate loading indicator in three sizes.',
    when: ['Short waits where progress is unknown, such as a button in a pending state.'],
    a11y: [
      'Decorative by default. Set `label` to make it a named status; do not label it when adjacent text already says what is loading.',
    ],
  },
  'empty-state': {
    title: 'Empty State',
    group: 'display',
    summary:
      'A placeholder for an empty collection or a search with no results, with room for an action.',
    when: ['First-use screens and “no results” views.'],
    a11y: ['Plain content with no live-region role. Offer a way forward (an action or a link).'],
  },
  resizable: {
    title: 'Resizable',
    group: 'layout',
    summary: 'Panels separated by draggable, keyboard-operable handles.',
    when: ['Split views such as an editor and a preview.'],
    a11y: [
      'Handles expose a separator role with ARIA value attributes and respond to arrow keys on both axes (covered by tests).',
    ],
  },
  sidebar: {
    title: 'Sidebar',
    group: 'layout',
    summary: 'A collapsible application sidebar with header, groups, items and footer.',
    when: ['App navigation with many destinations.'],
    a11y: [
      'Items are native links; Escape handling and the tooltip dependency are covered by tests.',
    ],
  },
};

/**
 * Where a component stops and its neighbours start. Read by the MCP `find_components` tool and the
 * generated catalog in the `volt-ui-component-selection` agent skill, so an assistant choosing
 * between two similar components has the same answer the Storybook pages give a person.
 *
 * Only components that are routinely confused with another need an entry.
 *
 * @type {Record<string, { notFor: string[]; related: string[] }>}
 */
export const COMPONENT_RELATIONS = {
  button: {
    notFor: ['A link to another page that is not styled as an action: use a plain anchor.'],
    related: ['toggle', 'dropdown-menu'],
  },
  select: {
    notFor: [
      'A short fixed list where a native control is enough: use the native select directive.',
      'A list the user searches by typing or that comes from a server: use Combobox.',
    ],
    related: ['combobox', 'listbox', 'radio'],
  },
  combobox: {
    notFor: [
      'A fixed list the application only needs a native select for.',
      'Choosing a command: use Dropdown Menu.',
    ],
    related: ['select', 'listbox', 'search'],
  },
  listbox: {
    notFor: ['A value inside a form that collapses after choosing: use Select.'],
    related: ['select', 'combobox'],
  },
  checkbox: {
    notFor: ['A setting that takes effect immediately: use Switch.'],
    related: ['switch', 'toggle', 'radio'],
  },
  switch: {
    notFor: ['A choice submitted with a form or an "I agree": use Checkbox.'],
    related: ['checkbox', 'toggle'],
  },
  radio: {
    notFor: ['More than a handful of options: use Select.'],
    related: ['select', 'checkbox', 'toggle-group'],
  },
  toggle: {
    notFor: ['An on/off setting: use Switch. A value in a form: use Checkbox.'],
    related: ['toggle-group', 'switch', 'checkbox'],
  },
  'toggle-group': {
    notFor: ['Switching between views of a page: use Tabs.'],
    related: ['toggle', 'radio', 'toolbar', 'tabs'],
  },
  slider: {
    notFor: ['A low–high pair: use Range Slider.'],
    related: ['range-slider', 'progress'],
  },
  'range-slider': {
    notFor: ['A single number: use Slider.'],
    related: ['slider'],
  },
  tabs: {
    notFor: [
      'Navigation where the URL owns the selection (deep links, middle-click): use real anchors.',
      'Panels that are really separate pages.',
    ],
    related: ['navigation-menu', 'toggle-group', 'accordion'],
  },
  accordion: {
    notFor: ['Switching between mutually exclusive views: use Tabs.'],
    related: ['tabs'],
  },
  'navigation-menu': {
    notFor: ['Persistent application chrome with sections: use Sidebar.'],
    related: ['sidebar', 'tabs', 'breadcrumbs'],
  },
  sidebar: {
    notFor: ['A top-level menu with flyout content: use Navigation Menu.'],
    related: ['navigation-menu', 'drawer'],
  },
  dialog: {
    notFor: [
      'Content that does not need a decision: use a Popover or inline content.',
      'A secondary panel or small-screen navigation: use Drawer.',
    ],
    related: ['drawer', 'popover', 'alert'],
  },
  drawer: {
    notFor: ['A decision that must block the page: use Dialog.'],
    related: ['dialog', 'sidebar'],
  },
  popover: {
    notFor: [
      'A hint that only names a control: use Tooltip.',
      'A command list: use Dropdown Menu.',
    ],
    related: ['tooltip', 'dropdown-menu', 'dialog'],
  },
  tooltip: {
    notFor: ['Essential information, or anything interactive: put it on the page or use Popover.'],
    related: ['popover'],
  },
  'dropdown-menu': {
    notFor: ['Choosing a value for a field: use Select.'],
    related: ['select', 'popover'],
  },
  toast: {
    notFor: ['An error the user must read or act on: use Alert or a Dialog.'],
    related: ['alert'],
  },
  alert: {
    notFor: ['A transient "saved" confirmation: use Toast.'],
    related: ['toast', 'empty-state', 'dialog'],
  },
  spinner: {
    notFor: ['Content with a known layout: use Skeleton.'],
    related: ['skeleton', 'progress'],
  },
  skeleton: {
    notFor: ['An unknown-duration wait with no shape: use Spinner.'],
    related: ['spinner'],
  },
  progress: {
    notFor: ['A measured quantity within a known range (disk usage): use Meter.'],
    related: ['meter', 'spinner'],
  },
  meter: {
    notFor: ['Progress toward completion: use Progress.'],
    related: ['progress'],
  },
  badge: {
    notFor: ['A full sentence of status: use text or Alert.'],
    related: ['alert', 'avatar'],
  },
  'empty-state': {
    notFor: ['An error or warning about the page: use Alert.'],
    related: ['alert', 'skeleton'],
  },
  table: {
    notFor: ['Sorting, filtering, paging and selection logic: that belongs to the application.'],
    related: ['pagination'],
  },
  pagination: {
    notFor: ['Endless lists that load as you scroll.'],
    related: ['table'],
  },
  'form-field': {
    notFor: ['Anything that is not a labelled form control.'],
    related: ['input', 'textarea', 'select'],
  },
  input: {
    notFor: ['A choice from a list: use Select, Combobox or Radio.'],
    related: ['textarea', 'form-field', 'search'],
  },
  search: {
    notFor: ['Searching a server-backed list for a value: use Combobox with manual filtering.'],
    related: ['input', 'combobox'],
  },
};
