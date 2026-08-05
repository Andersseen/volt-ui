export type ComponentStability = 'stable' | 'beta' | 'experimental';

export interface ComponentMetadata {
  name: string;
  label: string;
  path: string;
  description: string;
  stability: ComponentStability;
}

export interface ComponentMetadataGroup {
  title: string;
  components: ComponentMetadata[];
}

export const COMPONENT_GROUPS: ComponentMetadataGroup[] = [
  {
    title: 'Forms',
    components: [
      {
        name: 'button',
        label: 'Button',
        path: '/docs/components/button',
        description: 'Interactive buttons',
        stability: 'stable',
      },
      {
        name: 'input',
        label: 'Input',
        path: '/docs/components/input',
        description: 'Text input fields',
        stability: 'stable',
      },
      {
        name: 'search',
        label: 'Search',
        path: '/docs/components/search',
        description: 'Search with clear action',
        stability: 'beta',
      },
      {
        name: 'autofill',
        label: 'Autofill',
        path: '/docs/components/autofill',
        description: 'Browser autofill detection',
        stability: 'beta',
      },
      {
        name: 'textarea',
        label: 'Textarea',
        path: '/docs/components/textarea',
        description: 'Multi-line input',
        stability: 'stable',
      },
      {
        name: 'form-field',
        label: 'Form Field',
        path: '/docs/components/form-field',
        description: 'Labels, hints, and errors',
        stability: 'beta',
      },
      {
        name: 'checkbox',
        label: 'Checkbox',
        path: '/docs/components/checkbox',
        description: 'Boolean selection',
        stability: 'beta',
      },
      {
        name: 'switch',
        label: 'Switch',
        path: '/docs/components/switch',
        description: 'On/off controls',
        stability: 'beta',
      },
      {
        name: 'radio',
        label: 'Radio',
        path: '/docs/components/radio',
        description: 'Single-select options',
        stability: 'beta',
      },
      {
        name: 'select',
        label: 'Select',
        path: '/docs/components/select',
        description: 'Dropdown selection',
        stability: 'beta',
      },
      {
        name: 'combobox',
        label: 'Combobox',
        path: '/docs/components/combobox',
        description: 'Searchable select',
        stability: 'beta',
      },
      {
        name: 'input-otp',
        label: 'Input OTP',
        path: '/docs/components/input-otp',
        description: 'PIN code input',
        stability: 'beta',
      },
      {
        name: 'file-upload',
        label: 'File Upload',
        path: '/docs/components/file-upload',
        description: 'Upload controls',
        stability: 'beta',
      },
      {
        name: 'slider',
        label: 'Slider',
        path: '/docs/components/slider',
        description: 'Range input',
        stability: 'beta',
      },
      {
        name: 'range-slider',
        label: 'Range Slider',
        path: '/docs/components/range-slider',
        description: 'Dual-thumb range selection',
        stability: 'beta',
      },
    ],
  },
  {
    title: 'Controls',
    components: [
      {
        name: 'toggle',
        label: 'Toggle',
        path: '/docs/components/toggle',
        description: 'Pressed state button',
        stability: 'beta',
      },
      {
        name: 'toggle-group',
        label: 'Toggle Group',
        path: '/docs/components/toggle-group',
        description: 'Grouped toggle controls',
        stability: 'beta',
      },
      {
        name: 'toolbar',
        label: 'Toolbar',
        path: '/docs/components/toolbar',
        description: 'Grouped actions',
        stability: 'beta',
      },
      {
        name: 'pagination',
        label: 'Pagination',
        path: '/docs/components/pagination',
        description: 'Page navigation',
        stability: 'beta',
      },
      {
        name: 'date-picker',
        label: 'Date Picker',
        path: '/docs/components/date-picker',
        description: 'Calendar input',
        stability: 'beta',
      },
      {
        name: 'listbox',
        label: 'Listbox',
        path: '/docs/components/listbox',
        description: 'Selection list',
        stability: 'beta',
      },
    ],
  },
  {
    title: 'Navigation',
    components: [
      {
        name: 'navigation-menu',
        label: 'Navigation Menu',
        path: '/docs/components/navigation-menu',
        description: 'Navbar with dropdowns',
        stability: 'beta',
      },
      {
        name: 'tabs',
        label: 'Tabs',
        path: '/docs/components/tabs',
        description: 'Tabbed interface',
        stability: 'beta',
      },
      {
        name: 'breadcrumbs',
        label: 'Breadcrumbs',
        path: '/docs/components/breadcrumbs',
        description: 'Path trail',
        stability: 'stable',
      },
    ],
  },
  {
    title: 'Overlays',
    components: [
      {
        name: 'dialog',
        label: 'Dialog',
        path: '/docs/components/dialog',
        description: 'Modal dialogs',
        stability: 'beta',
      },
      {
        name: 'drawer',
        label: 'Drawer',
        path: '/docs/components/drawer',
        description: 'Slide-in panels',
        stability: 'beta',
      },
      {
        name: 'popover',
        label: 'Popover',
        path: '/docs/components/popover',
        description: 'Floating panels',
        stability: 'beta',
      },
      {
        name: 'dropdown-menu',
        label: 'Dropdown Menu',
        path: '/docs/components/dropdown-menu',
        description: 'Action menus',
        stability: 'beta',
      },
      {
        name: 'tooltip',
        label: 'Tooltip',
        path: '/docs/components/tooltip',
        description: 'Hover information',
        stability: 'beta',
      },
      {
        name: 'toast',
        label: 'Toast',
        path: '/docs/components/toast',
        description: 'Notifications',
        stability: 'beta',
      },
    ],
  },
  {
    title: 'Display',
    components: [
      {
        name: 'accordion',
        label: 'Accordion',
        path: '/docs/components/accordion',
        description: 'Collapsible panels',
        stability: 'beta',
      },
      {
        name: 'avatar',
        label: 'Avatar',
        path: '/docs/components/avatar',
        description: 'User images',
        stability: 'stable',
      },
      {
        name: 'badge',
        label: 'Badge',
        path: '/docs/components/badge',
        description: 'Status indicators',
        stability: 'stable',
      },
      {
        name: 'card',
        label: 'Card',
        path: '/docs/components/card',
        description: 'Content containers',
        stability: 'stable',
      },
      {
        name: 'meter',
        label: 'Meter',
        path: '/docs/components/meter',
        description: 'Known-range values',
        stability: 'stable',
      },
      {
        name: 'progress',
        label: 'Progress',
        path: '/docs/components/progress',
        description: 'Task completion',
        stability: 'stable',
      },
      {
        name: 'separator',
        label: 'Separator',
        path: '/docs/components/separator',
        description: 'Visual dividers',
        stability: 'stable',
      },
      {
        name: 'skeleton',
        label: 'Skeleton',
        path: '/docs/components/skeleton',
        description: 'Loading placeholders',
        stability: 'stable',
      },
      {
        name: 'table',
        label: 'Table',
        path: '/docs/components/table',
        description: 'Data tables',
        stability: 'beta',
      },
    ],
  },
  {
    title: 'Layout',
    components: [
      {
        name: 'resizable',
        label: 'Resizable',
        path: '/docs/components/resizable',
        description: 'Resizable panels',
        stability: 'beta',
      },
    ],
  },
];

export const COMPONENTS = COMPONENT_GROUPS.flatMap(group => group.components);
