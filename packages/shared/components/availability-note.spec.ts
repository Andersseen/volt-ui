import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { AvailabilityNote } from './availability-note';
import { RELEASE_CAPABILITIES, capabilityStatus } from '../lib/release-capabilities';
import { RELEASES } from '../lib/release-availability.generated';

const unreleased = RELEASE_CAPABILITIES.filter(c => capabilityStatus(c, RELEASES) === 'unreleased');

describe('AvailabilityNote', () => {
  it.runIf(unreleased.length > 0)(
    'names the package, the version that brings it and npm latest, with the feature as code',
    async () => {
      const capability = unreleased[0];
      const { container } = await render(AvailabilityNote, {
        inputs: { capabilities: [capability.id] },
      });
      const text = container.textContent ?? '';
      expect(text).toContain(capability.package);
      expect(text).toContain(capability.since);
      expect(text).toContain(RELEASES[capability.package].published ?? '');
      expect(screen.getByText(capability.label, { selector: 'code' })).toBeInTheDocument();
      expect(container.querySelector('[data-availability="unreleased"]')).not.toBeNull();
    }
  );

  it('groups capabilities of one package and version into one notice', async () => {
    const cli = unreleased.filter(c => c.package === '@voltui/cli' && c.since === '1.4.0');
    if (cli.length < 2) return;
    const { container } = await render(AvailabilityNote, {
      inputs: { capabilities: cli.map(c => c.id) },
    });
    expect(container.querySelectorAll('volt-alert')).toHaveLength(1);
  });

  it('fails loudly on an unknown capability id', async () => {
    await expect(
      render(AvailabilityNote, { inputs: { capabilities: ['no.such'] } })
    ).rejects.toThrow(/Unknown release capability/);
  });
});
