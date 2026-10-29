/**
 * Recipe sources, read straight off disk by Vite's `?raw` import — the same single-source
 * approach as `blocks.ts`, so the code on the page is the code the tests exercise.
 */
import { toConsumerSource } from './consumer-source';
import asyncSearchSource from '../../recipes/async-search/async-search.ts?raw';
import dataTableSource from '../../recipes/data-table/data-table.ts?raw';
import livePlaygroundSource from '../../recipes/live-playground/live-playground.ts?raw';
import componentExplorerSource from '../../recipes/component-explorer/component-explorer.ts?raw';
import settingsFormSource from '../../recipes/settings-form/settings-form.ts?raw';

export const SETTINGS_FORM_RECIPE = toConsumerSource(settingsFormSource);
export const ASYNC_SEARCH_RECIPE = toConsumerSource(asyncSearchSource);
export const DATA_TABLE_RECIPE = toConsumerSource(dataTableSource);
export const LIVE_PLAYGROUND_RECIPE = toConsumerSource(livePlaygroundSource);
export const COMPONENT_EXPLORER_RECIPE = toConsumerSource(componentExplorerSource);
