import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The site is Volt UI's showcase (AGENTS.md "Docs site rules"): the chrome every page shares is
 * built from Volt atoms, not hand-styled anchors and buttons. A link or button in these files has
 * to carry a Volt directive; layout and typography around them are free.
 */
const CHROME = [
  'header.ts',
  'footer.ts',
  'mobile-menu.ts',
  'docs/docs-nav-list.ts',
  // Shared with Recipes.
  '../../../../../packages/shared/components/language-switcher.ts',
  '../../../../../packages/shared/components/theme-switcher.ts',
  // Recipes' own chrome.
  '../../../../recipes/src/app/components/header.ts',
  '../../../../recipes/src/app/components/footer.ts',
];
const VOLT_DIRECTIVE =
  /\b(voltButton|voltNavigationMenuLink|voltDrawerClose|voltFileUpload)\b|<volt-(drawer-close|sidebar-item|toggle-group-item|dropdown-menu-item)\b/;

describe('site chrome is built from Volt atoms', () => {
  for (const file of CHROME) {
    it(`${file}: every <a> and <button> is a Volt atom`, () => {
      const source = readFileSync(join(__dirname, file), 'utf8');
      const template = source.slice(source.indexOf('template: `'));
      const bare = [...template.matchAll(/<(a|button)\b[^>]*>/g)]
        .map(match => match[0])
        // The brand mark's home link and logo are composed from the same atoms; anything else must declare one.
        .filter(tag => !VOLT_DIRECTIVE.test(tag));

      expect(bare, `hand-styled elements in ${file}`).toEqual([]);
    });
  }
});
