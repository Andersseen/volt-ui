import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { clonePreset, themeCss } from './theme-draft';
import { parseThemeProject, serializeThemeProject } from './theme-project';

/**
 * The consumer harness (`e2e/consumer/src/themes`, package and CLI-copy modes) themes a real app with
 * a stylesheet exported by the studio. These two files are that export: the project and its CSS.
 * This spec keeps them true to the studio's own serializer, so the browser contracts that use them
 * test what the studio really exports. `WRITE_THEME_FIXTURE=1` rewrites them after a format change.
 */
const DIR = join(process.cwd(), 'e2e/consumer/src/themes');
const PROJECT = join(DIR, 'acme.theme.json');
const CSS = join(DIR, 'acme.css');

function fixtureDraft() {
  const draft = clonePreset('ember', 'acme');
  return {
    ...draft,
    style: 'soft' as const,
    density: 'compact' as const,
    shape: { radius: 10, borderWidth: 2, ringWidth: 3, shadowIntensity: 10, spacing: null },
    light: { ...draft.light, primary: '#6d28d9', primaryForeground: '#ffffff', ring: '#6d28d9' },
    dark: { ...draft.dark, primary: '#c4b5fd', primaryForeground: '#1e1b4b', ring: '#c4b5fd' },
  };
}

describe('exported theme fixture', () => {
  if (process.env['WRITE_THEME_FIXTURE']) {
    writeFileSync(PROJECT, serializeThemeProject(fixtureDraft()));
    writeFileSync(CSS, `${themeCss(fixtureDraft())}\n`);
  }

  it('is exactly what the studio exports for the committed project', () => {
    const project = parseThemeProject(readFileSync(PROJECT, 'utf8'));
    expect(serializeThemeProject(project.draft, project.generator)).toBe(
      readFileSync(PROJECT, 'utf8')
    );
    expect(`${themeCss(project.draft)}\n`).toBe(readFileSync(CSS, 'utf8'));
  });
});
