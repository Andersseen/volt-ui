import { addons } from 'storybook/manager-api';
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events';
import { dark, light } from './theme';

addons.setConfig({ theme: light });

// The manager chrome follows the Appearance switch too, so dark mode is dark everywhere.
addons.register('volt/appearance', api => {
  const apply = ({ globals }: { globals: Record<string, unknown> }) =>
    api.setOptions({ theme: globals['voltAppearance'] === 'dark' ? dark : light });
  api.on(SET_GLOBALS, apply);
  api.on(GLOBALS_UPDATED, apply);
});
