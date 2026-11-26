import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CONTACT_MAP_BLOCK, CONTACT_MAP_DATA } from '../lib/snippets/blocks';
import { DistributionModeStore } from '@shared/services/distribution-mode';
import { CompositionSource } from './composition-source';

const setup = () =>
  render(CompositionSource, {
    inputs: {
      entryId: 'blocks/contact-map',
      title: 'Block source',
      code: CONTACT_MAP_BLOCK,
      files: [{ name: 'contact-map.data.ts', code: CONTACT_MAP_DATA }],
    },
  });

describe('CompositionSource', () => {
  it('package mode installs the package and every other package the files import', async () => {
    await setup();
    expect(screen.getByText('pnpm add @voltui/components lumen-icons')).toBeInTheDocument();
    expect(screen.queryByText(/src\/app\/contact-map/)).toBeNull();
  });

  it('copy mode: volt add, the other packages, and where the files go', async () => {
    const { fixture } = await setup();
    await userEvent.click(screen.getByText('CLI copy'));
    fixture.detectChanges();
    expect(screen.getByText(/^npx @voltui\/cli add /)).toBeInTheDocument();
    expect(screen.getByText('pnpm add lumen-icons')).toBeInTheDocument();
    expect(screen.getByText('src/app/contact-map/', { selector: 'code' })).toBeInTheDocument();
    // The supporting file follows the same choice, without a second switch.
    expect(screen.getAllByText('CLI copy')).toHaveLength(1);
    expect(fixture.debugElement.injector.get(DistributionModeStore).mode()).toBe('copy');
  });
});
