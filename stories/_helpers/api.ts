import type { ArgTypes } from '@storybook/angular-vite';
import type { ComponentApi } from '../../src/app/lib/api-reference.generated';

/**
 * Select controls for every CVA variant group, read from the generated API reference so the
 * options Storybook offers can never drift from the ones the component accepts.
 */
export function variantArgTypes(api: ComponentApi): ArgTypes {
  return Object.fromEntries(
    (api.variants ?? []).map(group => [
      group.name,
      {
        control: 'select',
        options: group.options,
        table: { defaultValue: { summary: group.default } },
      },
    ])
  );
}
