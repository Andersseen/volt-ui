import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  RELEASE_CAPABILITIES,
  capabilityById,
  capabilityStatus,
  compareVersions,
  type PackageName,
  type PackageRelease,
} from './release-capabilities';
import { RELEASES } from './release-availability.generated';
import { VOLT_NAMES } from './volt-names.generated';
import {
  PUBLISHED_COMMAND_EXCEPTIONS,
  PUBLISHED_COMPOSITION_EXCEPTIONS,
} from './published-exceptions';

const SOURCE: Record<PackageName, string> = {
  '@voltui/components': JSON.parse(readFileSync('packages/volt/package.json', 'utf8')).version,
  '@voltui/cli': JSON.parse(readFileSync('cli/package.json', 'utf8')).version,
  '@voltui/agent': JSON.parse(readFileSync('cli/agent/package.json', 'utf8')).version,
};

describe('release capabilities', () => {
  it('ids are unique and every one ships in the next release at the latest', () => {
    const ids = RELEASE_CAPABILITIES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of RELEASE_CAPABILITIES) {
      // `since` can never be a version the source has not reached: that would describe work that is
      // not even in this repository yet.
      expect(compareVersions(c.since, SOURCE[c.package]), c.id).toBeLessThanOrEqual(0);
    }
  });

  it('name only real exports and component folders', () => {
    const folders = new Set(Object.values(VOLT_NAMES.exportOwners));
    for (const c of RELEASE_CAPABILITIES) {
      if (c.probe.kind === 'package-exports') {
        for (const name of c.probe.names)
          expect(VOLT_NAMES.exportOwners[name], `${c.id} ${name}`).toBeDefined();
      }
      for (const folder of c.components ?? [])
        expect(folders.has(folder), `${c.id} ${folder}`).toBe(true);
    }
  });

  it('the generated release file carries the source versions of this commit', () => {
    for (const [name, version] of Object.entries(SOURCE)) {
      expect(RELEASES[name as PackageName].source, name).toBe(version);
    }
  });

  it('status comes from the published (or installed) version, never from the source', () => {
    const diff = capabilityById('cli.diff');
    const releases = (published: string | null) =>
      ({
        '@voltui/components': { source: '9.9.9', published },
        '@voltui/cli': { source: '9.9.9', published },
        '@voltui/agent': { source: '9.9.9', published },
      }) satisfies Record<PackageName, PackageRelease>;
    expect(capabilityStatus(diff, releases('1.3.3'))).toBe('unreleased');
    expect(capabilityStatus(diff, releases('1.4.0'))).toBe('available');
    expect(capabilityStatus(diff, releases(null))).toBe('unknown');
    expect(capabilityStatus(diff, releases('1.3.3'), '1.4.2')).toBe('available');
    expect(() => capabilityById('nope')).toThrow(/Unknown release capability/);
  });

  it('published exceptions point at known capabilities', () => {
    for (const e of [...PUBLISHED_COMMAND_EXCEPTIONS, ...PUBLISHED_COMPOSITION_EXCEPTIONS]) {
      expect(() => capabilityById(e.capability)).not.toThrow();
    }
  });
});
