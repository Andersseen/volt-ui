import { describe, expect, it } from 'vitest';
import { copyName, createDistribution } from './distribution';
import { VOLT_NAMES } from './volt-names.generated';

const { toCopyMode, componentsUsed, cliAddCommand, sourceFor } = createDistribution(VOLT_NAMES);

describe('package → CLI-copy transform', () => {
  it('renames the names the CLI renames, as the CLI does', () => {
    expect(copyName('VoltButton')).toBe('UiButton');
    expect(copyName('voltThemeInitScript')).toBe('uiThemeInitScript');
    expect(copyName('volt-card')).toBe('ui-card');
  });

  it('splits a package import into one explicit import per copied component folder', () => {
    const source = [
      "import { Component } from '@angular/core';",
      "import { VoltCard, VoltCardTitle, VoltNativeButton, type VoltDialogContext } from '@voltui/components';",
      '',
    ].join('\n');
    expect(toCopyMode(source)).toBe(
      [
        "import { Component } from '@angular/core';",
        "import { UiCard, UiCardTitle } from './ui/card';",
        "import { UiNativeButton } from './ui/button';",
        "import type { UiDialogContext } from './ui/dialog';",
        '',
      ].join('\n')
    );
    expect(toCopyMode("import { VoltBadge } from '@voltui/components';\n", '../shared/ui')).toBe(
      "import { UiBadge } from '../shared/ui/badge';\n"
    );
  });

  it('renames selectors, attributes and identifiers in templates', () => {
    const template =
      '<volt-card><button voltButton [voltTooltip]="tip">Hi</button></volt-card><volt-card-title />';
    expect(toCopyMode(template)).toBe(
      '<ui-card><button uiButton [uiTooltip]="tip">Hi</button></ui-card><ui-card-title />'
    );
  });

  it('leaves prose, URLs, CSS custom properties and preset names alone', () => {
    const text = [
      '<a href="https://github.com/Andersseen/volt-ui">Volt UI</a>',
      '<div class="[--volt-radius:0] text-volt"></div>',
      ':root { --volt-sidebar-width: 20rem; }',
      "provideVoltTheme({ color: 'volt' }); // volt is the default preset",
      'VOLT_THEME_STORAGE_KEY voltage voltButtonish',
    ].join('\n');
    expect(toCopyMode(text)).toBe(text);
  });

  it('refuses a name the package does not export instead of guessing', () => {
    expect(() => toCopyMode("import { VoltNope } from '@voltui/components';")).toThrow(
      /VoltNope.*not exported/
    );
  });

  it('lists the components a source needs and the CLI command that copies them', () => {
    const source =
      "import { VoltDialog, VoltDialogContent } from '@voltui/components';\nimport { VoltButton } from '@voltui/components';";
    expect(componentsUsed(source)).toEqual(['dialog', 'button']);
    expect(cliAddCommand(source)).toBe('npx @voltui/cli add dialog button');
    expect(cliAddCommand("import { Component } from '@angular/core';")).toBeNull();
  });

  it('package mode is the source as written', () => {
    const source = "import { VoltBadge } from '@voltui/components';";
    expect(sourceFor(source, 'package')).toBe(source);
    expect(sourceFor(source, 'copy')).toBe("import { UiBadge } from './ui/badge';\n");
  });

  describe('characterization for Recipes compositions', () => {
    it('keeps local aliases and inline type modifiers', () => {
      expect(
        toCopyMode(
          "import { VoltButton as Btn, type ButtonVariants } from '@voltui/components';",
          '../ui'
        )
      ).toBe("import { UiButton as Btn, type ButtonVariants } from '../ui/button';\n");
    });

    it('reads multiline imports with comments between the names', () => {
      const source = [
        'import {',
        '  VoltCard,',
        '  // a comment, with a comma',
        '  /* another, too */ VoltBadge,',
        "} from '@voltui/components';",
      ].join('\n');
      expect(toCopyMode(source, '../ui')).toBe(
        "import { UiCard } from '../ui/card';\nimport { UiBadge } from '../ui/badge';\n"
      );
    });

    it('rewrites a re-export like an import', () => {
      expect(toCopyMode("export { VoltCard } from '@voltui/components';", '../ui')).toBe(
        "export { UiCard } from '../ui/card';\n"
      );
    });

    it('refuses the import forms a copy cannot express instead of leaving a package import', () => {
      for (const source of [
        "import * as V from '@voltui/components';",
        "import '@voltui/components';",
        "const m = await import('@voltui/components');",
        "import { x } from '@voltui/components/quartz';",
      ]) {
        expect(() => toCopyMode(source), source).toThrow(/only named imports and re-exports/);
      }
    });

    it('leaves sibling imports, other packages and prose about the package alone', () => {
      const source = [
        "import { DOTS } from './contact-map.data';",
        "import { LmnMailIcon } from 'lumen-icons';",
        "const install = 'npm install @voltui/components';",
      ].join('\n');
      expect(toCopyMode(source, '../ui')).toBe(source);
    });

    it('renames library names inside template strings and generated code, as the CLI does', () => {
      const source =
        'const template = `<volt-alert variant="destructive"><button voltButton>Ok</button></volt-alert>`;';
      expect(toCopyMode(source)).toBe(
        'const template = `<ui-alert variant="destructive"><button uiButton>Ok</button></ui-alert>`;'
      );
    });
  });
});
