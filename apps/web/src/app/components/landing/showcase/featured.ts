import { COMPONENTS, type ComponentMetadata } from '../../../lib/component-metadata';

/** Names shown in the landing carousel, in order: one strong example from each group. */
const FEATURED = [
  'combobox',
  'date-picker',
  'tabs',
  'input-otp',
  'slider',
  'toast',
  'select',
  'table',
  'file-upload',
] as const;

/** Catalog entries for the featured components; the catalog stays the single source. */
export const FEATURED_COMPONENTS: readonly ComponentMetadata[] = FEATURED.map(name => {
  const entry = COMPONENTS.find(component => component.name === name);
  if (!entry) {
    throw new Error(`Featured component "${name}" is not in the catalog.`);
  }
  return entry;
});
