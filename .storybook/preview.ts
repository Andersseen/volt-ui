import type { Preview } from '@storybook/angular-vite';
import { addons } from 'storybook/preview-api';
import { applyVoltTheme } from 'volt';
import '../src/styles.css';
import './preview.css';
import { VoltDocsContainer } from './docs-container';
import { APPEARANCES, COLORS, STYLES } from './themes';

const toolbarItems = (values: readonly string[]) =>
  values.map(value => ({ value, title: value[0].toUpperCase() + value.slice(1) }));

/** Docs pages that are only MDX have no story, so no decorator runs for them: follow the globals on the channel. */
function syncTheme(globals: Record<string, unknown>) {
  applyVoltTheme({
    color: globals['voltColor'] as never,
    style: globals['voltStyle'] as never,
    dark: globals['voltAppearance'] === 'dark',
  });
}
const channel = addons.getChannel();
channel.on('setGlobals', ({ globals }) => syncTheme(globals));
channel.on('globalsUpdated', ({ globals }) => syncTheme(globals));

const preview: Preview = {
  globalTypes: {
    voltColor: {
      description: 'Volt colour preset (data-color)',
      toolbar: {
        title: 'Colour preset',
        icon: 'paintbrush',
        items: toolbarItems(COLORS),
        dynamicTitle: true,
      },
    },
    voltStyle: {
      description: 'Volt style preset (data-style)',
      toolbar: {
        title: 'Style preset',
        icon: 'component',
        items: toolbarItems(STYLES),
        dynamicTitle: true,
      },
    },
    voltAppearance: {
      description: 'Light or dark appearance (.dark class)',
      toolbar: {
        title: 'Appearance',
        icon: 'sun',
        items: toolbarItems(APPEARANCES),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { voltColor: 'volt', voltStyle: 'sharp', voltAppearance: 'light' },
  decorators: [
    (story, context) => {
      // The library's own helper, so Storybook flips exactly the attributes a consumer's app does.
      applyVoltTheme({
        color: context.globals['voltColor'],
        style: context.globals['voltStyle'],
        dark: context.globals['voltAppearance'] === 'dark',
      });
      return story();
    },
  ],
  parameters: {
    controls: { expanded: true, sort: 'requiredFirst' },
    viewport: {
      options: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' }, type: 'mobile' },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
      },
    },
    docs: {
      toc: { headingSelector: 'h2, h3', title: 'On this page' },
      container: VoltDocsContainer,
    },
    options: {
      storySort: {
        order: [
          'Foundations',
          ['Introduction', 'Installation', 'Package vs Copy-and-own', 'Theming', 'Accessibility'],
          'Components',
          ['Forms & Inputs', 'Controls', 'Navigation', 'Overlays', 'Display', 'Layout'],
        ],
      },
    },
  },
};

export default preview;
