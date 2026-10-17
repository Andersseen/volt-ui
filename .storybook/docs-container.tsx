import { DocsContainer } from '@storybook/addon-docs/blocks';
import { addons } from 'storybook/preview-api';
import { themes } from 'storybook/theming';
import { useEffect, useState, type ComponentProps } from 'react';

type Props = ComponentProps<typeof DocsContainer>;

/**
 * Storybook's docs blocks (source, controls, tables) take their colours from one static theme.
 * This container picks the light or dark one from the Appearance switch, so a dark docs page is
 * dark all the way down and not just behind the text.
 */
export function VoltDocsContainer(props: Props) {
  const globals = (
    props.context as unknown as { store: { userGlobals: { get(): Record<string, unknown> } } }
  ).store.userGlobals.get();
  const [dark, setDark] = useState(globals['voltAppearance'] === 'dark');

  useEffect(() => {
    const channel = addons.getChannel();
    const onGlobals = ({ globals: next }: { globals: Record<string, unknown> }) =>
      setDark(next['voltAppearance'] === 'dark');
    channel.on('globalsUpdated', onGlobals);
    return () => channel.off('globalsUpdated', onGlobals);
  }, []);

  return <DocsContainer {...props} theme={dark ? themes.dark : themes.light} />;
}
