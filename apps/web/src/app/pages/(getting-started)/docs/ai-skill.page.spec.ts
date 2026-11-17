import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import AiSkillPage from './ai-skill.page';

/** The skills the installer ships, one folder each under cli/agent/skills. */
const SHIPPED = readdirSync(join(process.cwd(), 'cli/agent/skills'), { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);

describe('Agent Skills page', () => {
  // The page reads the skill files with import.meta.glob. A path one directory short (left over
  // from the move to apps/web) matched nothing, and the page published "0 skills".
  it('lists every skill the installer ships', async () => {
    await render(AiSkillPage);

    expect(SHIPPED.length).toBeGreaterThan(0);
    expect(screen.getByText(`${SHIPPED.length} skills, one responsibility each`)).toBeVisible();
    for (const name of SHIPPED) {
      expect(screen.getByText(name, { selector: 'li code' })).toBeInTheDocument();
    }
  });
});
