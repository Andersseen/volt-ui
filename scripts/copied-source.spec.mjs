// What a Recipes page hands a visitor, checked without compiling: every composition in both modes is
// clean, and the checks catch a missing dependency or a broken transformation (negative cases). The
// compile itself is scripts/check-copied-source.mjs and scripts/check-consumer.mjs.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sourceProblems, specifiers } from './lib/compositions.mjs';
import { COMPOSITIONS } from '../packages/shared/lib/compositions.generated.ts';
import { VOLT_NAMES } from '../packages/shared/lib/volt-names.generated.ts';
import { createDistribution } from '../packages/shared/lib/distribution.ts';
import { toConsumerSource } from '../apps/recipes/src/app/lib/snippets/consumer-source.ts';

const ROOT = process.cwd();
const distribution = createDistribution(VOLT_NAMES);
const libraryNames = new Set([
  ...Object.keys(VOLT_NAMES.exportOwners),
  ...VOLT_NAMES.elements,
  ...VOLT_NAMES.attributes,
]);
const read = (c, file) =>
  toConsumerSource(
    readFileSync(join(ROOT, 'apps/recipes/src/app', c.kind, c.folder, file), 'utf8')
  );
const check = (c, file, mode, overrides = {}) =>
  sourceProblems({
    file: `${c.id} ${file}`,
    source: distribution.sourceFor(read(c, file), mode, '../ui'),
    mode,
    copied: c.components,
    siblings: c.files,
    libraryNames,
    ...overrides,
  });

const byId = id => COMPOSITIONS.find(c => c.id === id);

describe('copyable compositions', () => {
  it('covers blocks, layouts and patterns, including the sidebar layout', () => {
    expect(new Set(COMPOSITIONS.map(c => c.kind))).toEqual(
      new Set(['blocks', 'layouts', 'patterns'])
    );
    expect(byId('layouts/sidebar')?.components).toContain('sidebar');
  });

  it.each(['package', 'copy'])('every composition is clean in %s mode', mode => {
    const problems = COMPOSITIONS.flatMap(c => c.files.flatMap(file => check(c, file, mode)));
    expect(problems).toEqual([]);
  });

  it('copy mode imports exactly the components its install command copies', () => {
    for (const c of COMPOSITIONS) {
      const imported = new Set(
        c.files.flatMap(file =>
          specifiers(distribution.toCopyMode(read(c, file), '../ui'))
            .filter(s => s.startsWith('../ui/'))
            .map(s => s.slice('../ui/'.length).split('/')[0])
        )
      );
      expect([...imported].sort(), c.id).toEqual([...c.components].sort());
    }
  });

  it('lists the npm packages the source imports', () => {
    const contactMap = byId('blocks/contact-map');
    expect(contactMap.files).toEqual(['contact-map.ts', 'contact-map.data.ts']);
    expect(contactMap.packages).toContain('lumen-icons');
  });
});

describe('the checks catch what would break a consumer', () => {
  const table = byId('recipes/data-table');

  it('a component missing from the install command', () => {
    const problems = check(table, 'data-table.ts', 'copy', {
      copied: table.components.filter(name => name !== 'table'),
    });
    expect(problems.join()).toMatch(/does not copy "table"/);
  });

  it('a transformation that leaves a package name behind', () => {
    const broken = distribution
      .toCopyMode(read(table, 'data-table.ts'), '../ui')
      .replace(/UiTable\b/, 'VoltTable');
    const problems = sourceProblems({
      file: 'data-table.ts',
      source: broken,
      mode: 'copy',
      copied: table.components,
      siblings: table.files,
      libraryNames,
    });
    expect(problems.join()).toMatch(/still uses the package name "VoltTable"/);
  });

  it('a package import left in copy mode, the monorepo alias, the websites and a missing sibling', () => {
    const problems = sourceProblems({
      file: 'x.ts',
      mode: 'copy',
      source: [
        "import { VoltCard } from '@voltui/components';",
        "import { VoltBadge } from 'volt';",
        "import { injectAppI18n } from '@shared/i18n/i18n';",
        "import { DATA } from './x.data';",
        "import { helper } from '../elsewhere/helper';",
      ].join('\n'),
      siblings: ['x.ts'],
      libraryNames,
    });
    expect(problems).toEqual([
      expect.stringMatching(/still imports @voltui\/components/),
      expect.stringMatching(/monorepo alias 'volt'/),
      expect.stringMatching(/belongs to the Volt UI websites/),
      expect.stringMatching(/not shipped beside it/),
      expect.stringMatching(/leaves the composition folder/),
      expect.stringMatching(/package name "VoltCard"/),
    ]);
  });

  it('prose that merely mentions a Volt-like name is not a leftover', () => {
    expect(
      sourceProblems({
        file: 'x.ts',
        mode: 'copy',
        source: '// there is no VoltDataTable',
        libraryNames,
      })
    ).toEqual([]);
  });
});
