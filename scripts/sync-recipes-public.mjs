#!/usr/bin/env node
/**
 * Copies the vendored in-browser editor (the code panel's `<vertex-editor-lite>` and its service
 * worker) from the docs site's `public/` into Recipes' own `public/`.
 *
 * The code panel is shared by both apps and loads `/web-editor-lite.min.js` from its own origin,
 * so each app has to serve the file. The 460 kB vendor bundle lives in git once, in `public/`;
 * the copy in `apps/recipes/public/` is generated before every Recipes dev/build and ignored.
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = join(ROOT, 'apps/recipes/public');

mkdirSync(TARGET, { recursive: true });
for (const file of ['web-editor-lite.min.js', 'vertex-sw.js']) {
  copyFileSync(join(ROOT, 'apps/web/public', file), join(TARGET, file));
}
