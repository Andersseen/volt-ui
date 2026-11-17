import { defineDoqConfig, formatDoqUsage, type DoqPreviewSize } from '@doqs/analog/config';
import { doqPaths } from '../../doq.paths';
import { CheckboxExample } from './examples/checkbox-example';
import { FormFieldExample } from './examples/form-field-example';
import { InputExample } from './examples/input-example';
import { NativeSelectExample } from './examples/native-select-example';
import { SelectExample } from './examples/select-example';
import { CheckboxApi, FormFieldApi, InputApi, SelectApi } from './host/api-references';
import { ComponentCatalog } from './host/component-catalog';
import { ThemePresets } from './host/theme-presets';
import { CheckboxPlayground } from './playgrounds/checkbox-playground';
import { FormFieldPlayground } from './playgrounds/form-field-playground';
import { INPUT_SIZES, INPUT_STATES, InputPlayground } from './playgrounds/input-playground';
import { SelectPlayground } from './playgrounds/select-playground';

/** Widths as lengths, so the switcher reads the same in every language. */
const PREVIEW_SIZES: readonly DoqPreviewSize[] = [
  { label: '100%', width: '100%' },
  { label: '360px', width: '360px' },
  { label: '768px', width: '768px' },
];

const options = (values: readonly string[]) => values.map(value => ({ label: value, value }));

/**
 * The documentation region of voltui.dev (https://github.com/Andersseen/doqs).
 *
 * Doqs owns the pages that have a Markdown file below `src/content/docs*` and nothing else:
 * `unmatched: 'continue'` hands every other `/docs/*` URL (and the bare `/docs`) to the host's own
 * file routes, which is what lets pages migrate one at a time without changing a URL. `landmark:
 * 'host'` because `app.html` already renders the one `<main>`. The header, footer, theme and the
 * language switch stay the site's.
 *
 * Demos are real standalone components: the specimens in `examples/` (also shown as source with
 * `::source`) and the host blocks in `host/`. Playground controls are named after the inputs they
 * bind, so the labels need no translation.
 */
export const doqConfig = defineDoqConfig({
  ...doqPaths,
  landmark: 'host',
  unmatched: 'continue',
  // The site's shell (doq-host-layout.ts) draws the navigation and the outline for every page.
  sidebar: 'hidden',
  showTableOfContents: false,
  demos: {
    'input-example': InputExample,
    'checkbox-example': CheckboxExample,
    'form-field-example': FormFieldExample,
    'select-example': SelectExample,
    'native-select-example': NativeSelectExample,
    'api-form-field': FormFieldApi,
    'api-input': InputApi,
    'api-checkbox': CheckboxApi,
    'api-select': SelectApi,
    'component-catalog': ComponentCatalog,
    'theme-presets': ThemePresets,
  },
  playgrounds: {
    input: {
      component: InputPlayground,
      title: 'volt-input',
      previewSizes: PREVIEW_SIZES,
      controls: [
        {
          input: 'size',
          label: 'size',
          kind: 'select',
          options: options(INPUT_SIZES),
          initial: 'md',
        },
        {
          input: 'state',
          label: 'state',
          kind: 'select',
          options: options(INPUT_STATES),
          initial: 'default',
        },
        { input: 'placeholder', label: 'placeholder', kind: 'string', initial: 'you@example.com' },
        { input: 'disabled', label: 'disabled', kind: 'boolean' },
        { input: 'required', label: 'required', kind: 'boolean' },
      ],
      outputs: [{ event: 'valueChange', label: 'valueChange' }],
      code: [
        {
          label: 'HTML',
          language: 'html',
          code: values =>
            formatDoqUsage('volt-input', values, {
              attributes: ['type="email"', '[(value)]="email"'],
              defaults: { size: 'md', state: 'default', disabled: false, required: false },
            }),
        },
      ],
    },
    checkbox: {
      component: CheckboxPlayground,
      title: 'volt-checkbox',
      previewSizes: false,
      controls: [
        { input: 'checked', label: 'checked', kind: 'boolean' },
        { input: 'indeterminate', label: 'indeterminate', kind: 'boolean' },
        { input: 'disabled', label: 'disabled', kind: 'boolean' },
      ],
      outputs: [
        { event: 'checkedChange', label: 'checkedChange' },
        { event: 'indeterminateChange', label: 'indeterminateChange' },
      ],
      code: [
        {
          label: 'HTML',
          language: 'html',
          code: values =>
            formatDoqUsage('volt-checkbox', values, {
              attributes: ['id="releases"'],
              defaults: { checked: false, indeterminate: false, disabled: false },
            }),
        },
      ],
    },
    'form-field': {
      component: FormFieldPlayground,
      title: 'volt-form-field',
      previewSizes: PREVIEW_SIZES,
      controls: [
        {
          input: 'label',
          label: 'volt-label',
          kind: 'string',
          initial: 'Work email',
          required: true,
        },
        {
          input: 'hint',
          label: 'volt-hint',
          kind: 'string',
          initial: 'We only use it for account updates.',
        },
        {
          input: 'error',
          label: 'volt-error',
          kind: 'string',
          initial: 'Enter a valid email address.',
          required: true,
        },
        { input: 'required', label: 'required', kind: 'boolean', initial: true },
        { input: 'disabled', label: 'disabled', kind: 'boolean' },
      ],
      outputs: [
        { event: 'statusChange', label: 'statusChange' },
        { event: 'touchedChange', label: 'touchedChange' },
      ],
      code: [
        {
          label: 'HTML',
          language: 'html',
          code: values =>
            [
              '<volt-form-field>',
              `  <volt-label>${values['label'] ?? ''}</volt-label>`,
              `  <volt-input [formControl]="email" type="email"${values['required'] ? ' required' : ''} />`,
              values['hint'] ? `  <volt-hint>${values['hint']}</volt-hint>` : '',
              '  @if (email.touched && email.invalid) {',
              `    <volt-error>${values['error'] ?? ''}</volt-error>`,
              '  }',
              '</volt-form-field>',
            ]
              .filter(Boolean)
              .join('\n'),
        },
      ],
    },
    select: {
      component: SelectPlayground,
      title: 'volt-select',
      // Its list is appended to <body>: a modal <dialog> would cover it (Doqs 0.15).
      expandedPreview: 'overlay-compatible',
      previewSizes: PREVIEW_SIZES,
      controls: [
        { input: 'placeholder', label: 'placeholder', kind: 'string', initial: 'Choose a plan' },
        { input: 'disabled', label: 'disabled', kind: 'boolean' },
        { input: 'required', label: 'required', kind: 'boolean' },
      ],
      outputs: [{ event: 'valueChange', label: 'valueChange' }],
      code: [
        {
          label: 'HTML',
          language: 'html',
          code: values =>
            [
              formatDoqUsage('volt-select', values, {
                attributes: ['[(value)]="plan"'],
                defaults: { disabled: false, required: false },
              }).replace(/><\/volt-select>$/, '>'),
              '  <volt-select-content>',
              '    <volt-select-item value="free">Free</volt-select-item>',
              '    <volt-select-item value="team" disabled>Team</volt-select-item>',
              '    <volt-select-item value="pro">Pro</volt-select-item>',
              '  </volt-select-content>',
              '</volt-select>',
            ].join('\n'),
        },
      ],
    },
  },
});
