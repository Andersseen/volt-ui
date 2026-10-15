import { describe, expect, it } from 'vitest';
import * as blocks from './blocks';
import * as layouts from './layouts';
import * as recipes from './recipes';
import {
  externalPackages,
  importSpecifiers,
  packageName,
  toConsumerSource,
} from './consumer-source';

/**
 * What the copy button hands a visitor must work in a project that has none of this
 * repository's context. `scripts/check-copied-source.mjs` proves it by compiling the output;
 * this suite is the fast version that fails in the unit run.
 */
const ALLOWED_PACKAGES = new Set(['@voltui/components', 'lumen-icons', 'angular-movement']);

const SOURCES = [
  ...Object.entries(blocks),
  ...Object.entries(layouts),
  ...Object.entries(recipes),
] as [string, string][];

describe('consumer-ready block, layout and recipe source', () => {
  it('covers every block, layout and recipe', () => {
    expect(SOURCES.length).toBeGreaterThanOrEqual(23);
  });

  it.each(SOURCES)('%s imports only public packages', (_name, source) => {
    for (const specifier of importSpecifiers(source)) {
      expect(specifier, `${_name} imports ${specifier}`).not.toBe('volt');
      expect(specifier.startsWith('.'), `${_name} has relative import ${specifier}`).toBe(false);
      expect(specifier).not.toMatch(/^(src|app)\//);
      if (!specifier.startsWith('@angular/')) {
        expect(ALLOWED_PACKAGES, `${_name} imports ${specifier}`).toContain(packageName(specifier));
      }
    }
  });

  it.each(SOURCES)('%s uses no docs-app services', (_name, source) => {
    expect(source).not.toMatch(/injectAppI18n|Translations|etyma/i);
  });
});

describe('toConsumerSource', () => {
  it('rewrites only the docs alias', () => {
    expect(toConsumerSource(`import { A } from 'volt';\nimport { B } from "volt";`)).toBe(
      `import { A } from '@voltui/components';\nimport { B } from "@voltui/components";`
    );
    expect(toConsumerSource(`import { A } from 'volt-extras';`)).toContain("'volt-extras'");
    expect(toConsumerSource(`const volt = 1; // from the volt team`)).toBe(
      `const volt = 1; // from the volt team`
    );
  });

  it('lists packages beyond Angular', () => {
    expect(
      externalPackages(
        `import { a } from '@angular/core';\nimport { b } from '@voltui/components';\nimport { c } from 'lumen-icons';\nimport { d } from '@scope/pkg/deep';`
      )
    ).toEqual(['@voltui/components', 'lumen-icons', '@scope/pkg']);
  });
});
