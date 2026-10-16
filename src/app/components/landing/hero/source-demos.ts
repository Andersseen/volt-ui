import type { PlainTranslationKey } from '../../../i18n/i18n';

export type DemoId = 'button' | 'badge' | 'switch';

/** One component the hero shows as code and as the real thing. */
export interface SourceDemo {
  readonly id: DemoId;
  /** The attribute the visitor can change, and its values (first is the default). */
  readonly attribute: string;
  readonly options: readonly string[];
  /** The label rendered inside the component, also echoed in the code. */
  readonly labelKey: PlainTranslationKey;
  /** The template, with `$value` where the chosen option goes and `$label` for the label. */
  readonly template: string;
}

export const SOURCE_DEMOS: readonly SourceDemo[] = [
  {
    id: 'button',
    attribute: 'variant',
    options: ['solid', 'outline', 'ghost', 'link'],
    labelKey: 'landing.hero.save',
    template: '<volt-button variant="$value">\n  $label\n</volt-button>',
  },
  {
    id: 'badge',
    attribute: 'variant',
    options: ['solid', 'secondary', 'outline', 'success'],
    labelKey: 'landing.hero.live',
    template: '<volt-badge variant="$value">\n  $label\n</volt-badge>',
  },
  {
    id: 'switch',
    attribute: 'checked',
    options: ['true', 'false'],
    labelKey: 'landing.hero.autoSync',
    template: '<volt-switch\n  [checked]="$value"\n  aria-label="$label" />',
  },
];

/** The template split around the chosen value, so the value alone can be highlighted. */
export function codeParts(
  demo: SourceDemo,
  value: string,
  label: string
): [string, string, string] {
  const filled = demo.template.replace('$label', label);
  const [before, after] = filled.split('$value');
  return [before, value, after ?? ''];
}
