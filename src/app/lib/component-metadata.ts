import type { TranslationKey } from '../i18n/translations';

export type ComponentStability = 'stable' | 'beta' | 'experimental';

/*
 * Translation keys rather than text, for the same reason the gallery catalog carries
 * keys: this is data, and data that holds English strings can only ever render in
 * English. The label is the component's own page title, so the sidebar, the catalog card
 * and the page heading cannot drift apart.
 */
export interface ComponentMetadata {
  name: string;
  labelKey: TranslationKey;
  path: string;
  descriptionKey: TranslationKey;
  /** Set only where the full name does not fit a sidebar row. */
  shortLabelKey?: TranslationKey;
  stability: ComponentStability;
}

export interface ComponentMetadataGroup {
  titleKey: TranslationKey;
  components: ComponentMetadata[];
}

export const COMPONENT_GROUPS: ComponentMetadataGroup[] = [
  {
    titleKey: 'catalog.groups.forms',
    components: [
      {
        name: 'button',
        labelKey: 'components.button.title',
        path: '/docs/components/button',
        descriptionKey: 'catalog.button.description',
        stability: 'stable',
      },
      {
        name: 'input',
        labelKey: 'catalog.input.label',
        path: '/docs/components/input',
        descriptionKey: 'catalog.input.description',
        stability: 'stable',
      },
      {
        name: 'search',
        labelKey: 'components.search.title',
        path: '/docs/components/search',
        descriptionKey: 'catalog.search.description',
        stability: 'stable',
      },
      {
        name: 'autofill',
        labelKey: 'components.autofill.title',
        path: '/docs/components/autofill',
        descriptionKey: 'catalog.autofill.description',
        stability: 'stable',
      },
      {
        name: 'textarea',
        labelKey: 'components.textarea.title',
        path: '/docs/components/textarea',
        descriptionKey: 'catalog.textarea.description',
        stability: 'stable',
      },
      {
        name: 'form-field',
        labelKey: 'components.formField.title',
        path: '/docs/components/form-field',
        descriptionKey: 'catalog.formField.description',
        stability: 'stable',
      },
      {
        name: 'checkbox',
        labelKey: 'components.checkbox.title',
        path: '/docs/components/checkbox',
        descriptionKey: 'catalog.checkbox.description',
        stability: 'stable',
      },
      {
        name: 'switch',
        labelKey: 'components.switch.title',
        path: '/docs/components/switch',
        descriptionKey: 'catalog.switch.description',
        stability: 'stable',
      },
      {
        name: 'radio',
        labelKey: 'components.radio.title',
        path: '/docs/components/radio',
        descriptionKey: 'catalog.radio.description',
        stability: 'stable',
      },
      {
        name: 'select',
        labelKey: 'components.select.title',
        path: '/docs/components/select',
        descriptionKey: 'catalog.select.description',
        stability: 'stable',
      },
      {
        name: 'combobox',
        labelKey: 'components.combobox.title',
        path: '/docs/components/combobox',
        descriptionKey: 'catalog.combobox.description',
        stability: 'stable',
      },
      {
        name: 'input-otp',
        labelKey: 'components.inputOtp.title',
        path: '/docs/components/input-otp',
        descriptionKey: 'catalog.inputOtp.description',
        stability: 'stable',
      },
      {
        name: 'file-upload',
        labelKey: 'components.fileUpload.title',
        path: '/docs/components/file-upload',
        descriptionKey: 'catalog.fileUpload.description',
        stability: 'stable',
      },
      {
        name: 'slider',
        labelKey: 'components.slider.title',
        path: '/docs/components/slider',
        descriptionKey: 'catalog.slider.description',
        stability: 'stable',
      },
      {
        name: 'range-slider',
        labelKey: 'components.rangeSlider.title',
        path: '/docs/components/range-slider',
        descriptionKey: 'catalog.rangeSlider.description',
        stability: 'stable',
      },
    ],
  },
  {
    titleKey: 'catalog.groups.controls',
    components: [
      {
        name: 'toggle',
        labelKey: 'components.toggle.title',
        path: '/docs/components/toggle',
        descriptionKey: 'catalog.toggle.description',
        stability: 'stable',
      },
      {
        name: 'toggle-group',
        labelKey: 'components.toggleGroup.title',
        path: '/docs/components/toggle-group',
        descriptionKey: 'catalog.toggleGroup.description',
        stability: 'stable',
      },
      {
        name: 'toolbar',
        labelKey: 'components.toolbar.title',
        path: '/docs/components/toolbar',
        descriptionKey: 'catalog.toolbar.description',
        stability: 'stable',
      },
      {
        name: 'pagination',
        labelKey: 'components.pagination.title',
        path: '/docs/components/pagination',
        descriptionKey: 'catalog.pagination.description',
        stability: 'stable',
      },
      {
        name: 'date-picker',
        labelKey: 'components.datePicker.title',
        path: '/docs/components/date-picker',
        descriptionKey: 'catalog.datePicker.description',
        stability: 'stable',
      },
      {
        name: 'listbox',
        labelKey: 'components.listbox.title',
        path: '/docs/components/listbox',
        descriptionKey: 'catalog.listbox.description',
        stability: 'stable',
      },
    ],
  },
  {
    titleKey: 'catalog.groups.navigation',
    components: [
      {
        name: 'navigation-menu',
        labelKey: 'components.navigationMenu.title',
        path: '/docs/components/navigation-menu',
        descriptionKey: 'catalog.navigationMenu.description',
        shortLabelKey: 'catalog.navigationMenu.short',
        stability: 'stable',
      },
      {
        name: 'tabs',
        labelKey: 'components.tabs.title',
        path: '/docs/components/tabs',
        descriptionKey: 'catalog.tabs.description',
        stability: 'stable',
      },
      {
        name: 'breadcrumbs',
        labelKey: 'components.breadcrumbs.title',
        path: '/docs/components/breadcrumbs',
        descriptionKey: 'catalog.breadcrumbs.description',
        stability: 'stable',
      },
    ],
  },
  {
    titleKey: 'catalog.groups.overlays',
    components: [
      {
        name: 'dialog',
        labelKey: 'components.dialog.title',
        path: '/docs/components/dialog',
        descriptionKey: 'catalog.dialog.description',
        stability: 'stable',
      },
      {
        name: 'drawer',
        labelKey: 'components.drawer.title',
        path: '/docs/components/drawer',
        descriptionKey: 'catalog.drawer.description',
        stability: 'stable',
      },
      {
        name: 'popover',
        labelKey: 'components.popover.title',
        path: '/docs/components/popover',
        descriptionKey: 'catalog.popover.description',
        stability: 'stable',
      },
      {
        name: 'dropdown-menu',
        labelKey: 'components.dropdownMenu.title',
        path: '/docs/components/dropdown-menu',
        descriptionKey: 'catalog.dropdownMenu.description',
        stability: 'stable',
      },
      {
        name: 'tooltip',
        labelKey: 'components.tooltip.title',
        path: '/docs/components/tooltip',
        descriptionKey: 'catalog.tooltip.description',
        stability: 'stable',
      },
      {
        name: 'toast',
        labelKey: 'components.toast.title',
        path: '/docs/components/toast',
        descriptionKey: 'catalog.toast.description',
        stability: 'stable',
      },
    ],
  },
  {
    titleKey: 'catalog.groups.display',
    components: [
      {
        name: 'accordion',
        labelKey: 'components.accordion.title',
        path: '/docs/components/accordion',
        descriptionKey: 'catalog.accordion.description',
        stability: 'stable',
      },
      {
        name: 'avatar',
        labelKey: 'components.avatar.title',
        path: '/docs/components/avatar',
        descriptionKey: 'catalog.avatar.description',
        stability: 'stable',
      },
      {
        name: 'badge',
        labelKey: 'components.badge.title',
        path: '/docs/components/badge',
        descriptionKey: 'catalog.badge.description',
        stability: 'stable',
      },
      {
        name: 'card',
        labelKey: 'components.card.title',
        path: '/docs/components/card',
        descriptionKey: 'catalog.card.description',
        stability: 'stable',
      },
      {
        name: 'meter',
        labelKey: 'components.meter.title',
        path: '/docs/components/meter',
        descriptionKey: 'catalog.meter.description',
        stability: 'stable',
      },
      {
        name: 'progress',
        labelKey: 'components.progress.title',
        path: '/docs/components/progress',
        descriptionKey: 'catalog.progress.description',
        stability: 'stable',
      },
      {
        name: 'separator',
        labelKey: 'components.separator.title',
        path: '/docs/components/separator',
        descriptionKey: 'catalog.separator.description',
        stability: 'stable',
      },
      {
        name: 'skeleton',
        labelKey: 'components.skeleton.title',
        path: '/docs/components/skeleton',
        descriptionKey: 'catalog.skeleton.description',
        stability: 'stable',
      },
      {
        name: 'table',
        labelKey: 'components.table.title',
        path: '/docs/components/table',
        descriptionKey: 'catalog.table.description',
        stability: 'stable',
      },
    ],
  },
  {
    titleKey: 'catalog.groups.layout',
    components: [
      {
        name: 'resizable',
        labelKey: 'components.resizable.title',
        path: '/docs/components/resizable',
        descriptionKey: 'catalog.resizable.description',
        stability: 'stable',
      },
    ],
  },
];

export const COMPONENTS = COMPONENT_GROUPS.flatMap(group => group.components);
