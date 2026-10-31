import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const core = require('../lib/core.js');
const CLI = resolve(__dirname, '../bin/volt');
const QUARTZ = ['accordion', 'checkbox', 'radio', 'switch', 'tabs', 'toggle', 'toggle-group'];

/** Runs the real binary in a throwaway project root, as a consumer would. */
function volt(cwd, ...args) {
  const result = spawnSync('node', [CLI, ...args], { cwd, encoding: 'utf-8' });
  return { status: result.status, out: `${result.stdout}${result.stderr}` };
}

function sources(dir) {
  const files = [];
  const walk = d => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  };
  walk(dir);
  return files;
}

describe('headless bases', () => {
  let project;
  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), 'volt-base-'));
    writeFileSync(join(project, 'package.json'), '{"name":"app"}');
  });
  afterEach(() => rmSync(project, { recursive: true, force: true }));

  const ui = () => join(project, 'src/app/ui');

  describe('manifest', () => {
    it('records the Quartz implementation of exactly the five supported components', () => {
      const manifest = core.getLocalManifest();
      expect(manifest.backends.quartz.components).toEqual(QUARTZ);
      expect(core.componentsForBase(manifest, 'quartz')).toEqual(QUARTZ);
      for (const name of QUARTZ)
        expect(manifest.components[name].backends.quartz.files.length).toBeGreaterThan(0);
      // The default source of every component is untouched.
      expect(manifest.components.checkbox.files).toContain('components/checkbox/checkbox.ts');
      expect(manifest.components.button.backends).toBeUndefined();
    });

    it('lists the shared Toggle variants so a copy is self-contained', () => {
      const { files } = core.getLocalManifest().components.toggle.backends.quartz;
      expect(files).toContain('quartz/toggle/toggle.ts');
      expect(files).toContain('components/toggle/variants.ts');
    });

    it('declares the Quartz package ranges from the library peer ranges', () => {
      const { packages } = core.getLocalManifest().backends.quartz;
      expect(packages.map(p => p.replace(/@\^.*/, ''))).toEqual([
        '@quartz-headless/core',
        '@quartz-headless/primitives',
      ]);
    });
  });

  describe('default behaviour is unchanged', () => {
    it('a project without volt.json copies the ng-primitives source and writes no config', () => {
      expect(volt(project, 'init', ui()).status).toBe(0);
      expect(existsSync(join(project, 'volt.json'))).toBe(false);
      const result = volt(project, 'add', 'checkbox', ui());
      expect(result.status).toBe(0);
      expect(readFileSync(join(ui(), 'checkbox/checkbox.ts'), 'utf-8')).toContain(
        "'ng-primitives/checkbox'"
      );
      expect(result.out).toContain('ng-primitives');
      expect(existsSync(join(project, 'volt.json'))).toBe(false);
    });

    it('an explicit --base=ng-primitives is accepted and remembered', () => {
      expect(volt(project, 'add', 'switch', ui(), '--base=ng-primitives').status).toBe(0);
      expect(JSON.parse(readFileSync(join(project, 'volt.json'), 'utf-8'))).toEqual({
        base: 'ng-primitives',
      });
    });
  });

  describe('quartz', () => {
    it('init --base=quartz records the base and says what is supported', () => {
      const result = volt(project, 'init', ui(), '--base=quartz');
      expect(result.status).toBe(0);
      expect(JSON.parse(readFileSync(join(project, 'volt.json'), 'utf-8'))).toEqual({
        base: 'quartz',
      });
      expect(result.out).toContain(
        'accordion, checkbox, radio, switch, tabs, toggle, toggle-group'
      );
      expect(result.out).toContain('experimental');
    });

    it('adds every supported component, with Quartz imports and no ng-primitives import anywhere', () => {
      const result = volt(project, 'add', ...QUARTZ, ui(), '--base=quartz');
      expect(result.status).toBe(0);
      const files = sources(ui());
      expect(files.map(f => f.slice(ui().length + 1)).sort()).toEqual(
        [
          'accordion/accordion-content.ts',
          'accordion/accordion-item.ts',
          'accordion/accordion-trigger.ts',
          'accordion/accordion.ts',
          'accordion/index.ts',
          'checkbox/checkbox.ts',
          'checkbox/index.ts',
          'form-control-state.ts',
          'host-forwarding.ts',
          'index.ts',
          'quartz-attributes.ts',
          'quartz-ids.ts',
          'radio/index.ts',
          'radio/radio-group.ts',
          'radio/radio-item.ts',
          'switch/index.ts',
          'switch/switch.ts',
          'tabs/index.ts',
          'tabs/tabs-content.ts',
          'tabs/tabs-list.ts',
          'tabs/tabs-trigger.ts',
          'tabs/tabs.ts',
          'toggle-group/index.ts',
          'toggle-group/toggle-group-item.ts',
          'toggle-group/toggle-group.ts',
          'toggle-group/variants.ts',
          'toggle/index.ts',
          'toggle/toggle.ts',
          'toggle/variants.ts',
          'utils.ts',
        ].sort()
      );
      const all = files.map(f => readFileSync(f, 'utf-8')).join('\n');
      expect(all).not.toMatch(/from\s+['"]ng-primitives/);
      expect(all).not.toMatch(/\bVolt[A-Z]|selector:\s*'volt-/);
      expect(all).toContain("from '@quartz-headless/primitives'");
      expect(readFileSync(join(ui(), 'checkbox/checkbox.ts'), 'utf-8')).toContain(
        "selector: 'ui-checkbox'"
      );
      // Toggle's variants resolve next to it, not through a components/ folder that was not copied.
      expect(readFileSync(join(ui(), 'toggle/toggle.ts'), 'utf-8')).toContain(
        "from '../toggle/variants'"
      );
      expect(JSON.parse(readFileSync(join(project, 'volt.json'), 'utf-8')).base).toBe('quartz');
    });

    it('adds radio and toggle-group alone with their helpers and no ng-primitives', () => {
      const result = volt(project, 'add', 'radio', 'toggle-group', ui(), '--base=quartz');
      expect(result.status).toBe(0);
      const copied = sources(ui())
        .map(f => f.slice(ui().length + 1))
        .sort();
      expect(copied).toEqual(
        [
          'form-control-state.ts',
          'host-forwarding.ts',
          'index.ts',
          'quartz-attributes.ts',
          'quartz-ids.ts',
          'radio/index.ts',
          'radio/radio-group.ts',
          'radio/radio-item.ts',
          'toggle-group/index.ts',
          'toggle-group/toggle-group-item.ts',
          'toggle-group/toggle-group.ts',
          'toggle-group/variants.ts',
          'utils.ts',
        ].sort()
      );
      const all = copied.map(f => readFileSync(join(ui(), f), 'utf-8')).join('\n');
      expect(all).not.toMatch(/from\s+['"]ng-primitives/);
      expect(all).toContain("from '../quartz-ids'");
      expect(readFileSync(join(ui(), 'radio/radio-item.ts'), 'utf-8')).toContain(
        "selector: 'ui-radio-item'"
      );
      expect(readFileSync(join(ui(), 'toggle-group/toggle-group-item.ts'), 'utf-8')).toContain(
        "from '../toggle-group/variants'"
      );
    });

    it('adds tabs and accordion alone: every part, the id helper, no ng-primitives', () => {
      const result = volt(project, 'add', 'tabs', 'accordion', ui(), '--base=quartz');
      expect(result.status).toBe(0);
      const copied = sources(ui())
        .map(f => f.slice(ui().length + 1))
        .sort();
      expect(copied).toEqual(
        [
          'accordion/accordion-content.ts',
          'accordion/accordion-item.ts',
          'accordion/accordion-trigger.ts',
          'accordion/accordion.ts',
          'accordion/index.ts',
          'index.ts',
          'quartz-attributes.ts',
          'quartz-ids.ts',
          'tabs/index.ts',
          'tabs/tabs-content.ts',
          'tabs/tabs-list.ts',
          'tabs/tabs-trigger.ts',
          'tabs/tabs.ts',
          'utils.ts',
        ].sort()
      );
      const all = copied.map(f => readFileSync(join(ui(), f), 'utf-8')).join('\n');
      expect(all).not.toMatch(/from\s+['"]ng-primitives/);
      expect(all).not.toMatch(/\bVolt[A-Z]|selector:\s*'volt-/);
      expect(all).toContain("from '@quartz-headless/primitives'");
      expect(readFileSync(join(ui(), 'tabs/tabs-trigger.ts'), 'utf-8')).toContain(
        "selector: 'ui-tabs-trigger'"
      );
      expect(readFileSync(join(ui(), 'accordion/accordion-trigger.ts'), 'utf-8')).toContain(
        "from './accordion'"
      );
    });

    it('does not copy the Quartz id helpers for components that do not use them', () => {
      volt(project, 'add', 'checkbox', 'toggle', ui(), '--base=quartz');
      expect(existsSync(join(ui(), 'quartz-ids.ts'))).toBe(false);
      expect(existsSync(join(ui(), 'quartz-attributes.ts'))).toBe(false);
    });

    it('persists the base: later adds need no flag', () => {
      volt(project, 'add', 'checkbox', ui(), '--base=quartz');
      const result = volt(project, 'add', 'switch', ui());
      expect(result.status).toBe(0);
      expect(readFileSync(join(ui(), 'switch/switch.ts'), 'utf-8')).toContain(
        '@quartz-headless/primitives'
      );
    });

    it('--dry-run writes nothing, not even volt.json', () => {
      const result = volt(project, 'add', 'toggle', ui(), '--base=quartz', '--dry-run');
      expect(result.status).toBe(0);
      expect(result.out).toContain('toggle/variants.ts');
      expect(existsSync(ui())).toBe(false);
      expect(existsSync(join(project, 'volt.json'))).toBe(false);
    });

    it('never overwrites copied files without --force', () => {
      volt(project, 'add', 'checkbox', ui(), '--base=quartz');
      writeFileSync(join(ui(), 'checkbox/checkbox.ts'), '// my edit\n');
      const refused = volt(project, 'add', 'checkbox', ui());
      expect(refused.status).toBe(1);
      expect(refused.out).toContain('Refusing to overwrite');
      expect(readFileSync(join(ui(), 'checkbox/checkbox.ts'), 'utf-8')).toBe('// my edit\n');
      expect(volt(project, 'add', 'checkbox', ui(), '--force').status).toBe(0);
      expect(readFileSync(join(ui(), 'checkbox/checkbox.ts'), 'utf-8')).toContain(
        '@quartz-headless/primitives'
      );
    });

    it('installs only what the copied source needs — never ng-primitives', () => {
      const manifest = core.getLocalManifest();
      const dependencies = components =>
        components.flatMap(name =>
          core.runtimeDependenciesFor(
            'quartz',
            manifest,
            manifest.components[name].backends.quartz.files.map(f =>
              readFileSync(join(resolve(__dirname, '../../packages/volt/src/lib'), f), 'utf-8')
            )
          )
        );
      const deps = [...new Set(dependencies(QUARTZ))];
      expect(deps).toContain('@quartz-headless/primitives@^0.16.0');
      expect(deps).toContain('@quartz-headless/core@^0.16.0');
      expect(deps.some(d => d.startsWith('ng-primitives'))).toBe(false);
      // Checkbox alone needs neither the variants library nor the class-merging helpers' CVA.
      const checkboxOnly = core.runtimeDependenciesFor('quartz', manifest, [
        readFileSync(
          resolve(__dirname, '../../packages/volt/src/lib/quartz/checkbox/checkbox.ts'),
          'utf-8'
        ),
      ]);
      expect(checkboxOnly.some(d => d.startsWith('class-variance-authority'))).toBe(false);
    });

    it('--install --dry-run reports the Quartz command, not the ng-primitives one', () => {
      const result = volt(
        project,
        'add',
        'switch',
        ui(),
        '--base=quartz',
        '--install',
        '--dry-run'
      );
      expect(result.status).toBe(0);
      expect(result.out).toContain('Runtime dependencies would be installed');
    });

    it('the default base keeps installing the historical list', () => {
      const manifest = core.getLocalManifest();
      expect(core.runtimeDependenciesFor('ng-primitives', manifest)).toEqual(
        core.RUNTIME_DEPENDENCIES
      );
    });
  });

  describe('safety', () => {
    it('rejects an unknown base', () => {
      const result = volt(project, 'add', 'checkbox', ui(), '--base=headlessui');
      expect(result.status).toBe(1);
      expect(result.out).toContain('Unknown --base "headlessui"');
      expect(existsSync(ui())).toBe(false);
    });

    it('rejects a valueless --base', () => {
      const result = volt(project, 'add', 'checkbox', ui(), '--base');
      expect(result.status).toBe(1);
      expect(result.out).toContain('--base needs a value');
    });

    it('rejects an unsupported component, explains, and writes nothing — even in a mixed request', () => {
      const result = volt(project, 'add', 'checkbox', 'button', ui(), '--base=quartz');
      expect(result.status).toBe(1);
      expect(result.out).toContain('does not support: button');
      expect(result.out).toContain(
        'accordion, checkbox, radio, switch, tabs, toggle, toggle-group'
      );
      expect(result.out).toContain('without --base');
      expect(existsSync(ui())).toBe(false);
      expect(existsSync(join(project, 'volt.json'))).toBe(false);
    });

    it('rejects a flag that contradicts volt.json', () => {
      volt(project, 'add', 'checkbox', ui(), '--base=quartz');
      const result = volt(project, 'add', 'switch', ui(), '--base=ng-primitives');
      expect(result.status).toBe(1);
      expect(result.out).toContain('configured for the "quartz" base');
      expect(existsSync(join(ui(), 'switch'))).toBe(false);
    });

    it('a quartz-configured project rejects components Quartz does not have', () => {
      volt(project, 'init', ui(), '--base=quartz');
      const result = volt(project, 'add', 'card', ui());
      expect(result.status).toBe(1);
      expect(result.out).toContain('does not support: card');
    });

    it('does not mix Quartz into a directory that already holds ng-primitives copies', () => {
      volt(project, 'add', 'checkbox', ui());
      const result = volt(project, 'add', 'switch', ui(), '--base=quartz');
      expect(result.status).toBe(1);
      expect(result.out).toContain(
        'already contains components copied with the ng-primitives base'
      );
      expect(existsSync(join(ui(), 'switch'))).toBe(false);
      expect(existsSync(join(project, 'volt.json'))).toBe(false);
    });

    it('a corrupted volt.json is reported, not ignored', () => {
      writeFileSync(join(project, 'volt.json'), '{ nope');
      const result = volt(project, 'add', 'checkbox', ui());
      expect(result.status).toBe(1);
      expect(result.out).toContain('volt.json is not valid JSON');
    });
  });

  describe('list', () => {
    it('--base=quartz lists exactly the supported components', () => {
      const result = volt(project, 'list', '--base=quartz', '--json');
      expect(result.status).toBe(0);
      expect(
        JSON.parse(result.out)
          .map(c => c.name)
          .sort()
      ).toEqual(QUARTZ);
    });

    it('every component reports its bases', () => {
      const all = JSON.parse(volt(project, 'list', '--json').out);
      expect(all.find(c => c.name === 'button').bases).toEqual(['ng-primitives']);
      expect(all.find(c => c.name === 'checkbox').bases).toEqual(['ng-primitives', 'quartz']);
    });

    it('rejects an unknown base', () => {
      expect(volt(project, 'list', '--base=nope').status).toBe(1);
    });
  });
});
