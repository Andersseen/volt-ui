import { render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { AvailabilityNote } from './availability-note';
import { RELEASE_CAPABILITIES } from '../lib/release-capabilities';

// npm has caught up with everything (and, separately, a registry that was never read).
vi.mock('../lib/release-availability.generated', () => ({
  RELEASES: {
    '@voltui/components': { source: '99.0.0', published: '99.0.0' },
    '@voltui/cli': { source: '99.0.0', published: '99.0.0' },
    '@voltui/agent': { source: '99.0.0', published: null },
  },
}));

describe('AvailabilityNote once npm has the release', () => {
  it('renders nothing for a published capability', async () => {
    const ids = RELEASE_CAPABILITIES.filter(c => c.package !== '@voltui/agent').map(c => c.id);
    const { container } = await render(AvailabilityNote, { inputs: { capabilities: ids } });
    expect(container.querySelector('volt-alert')).toBeNull();
  });

  it('says availability could not be confirmed when npm was never read', async () => {
    const agent = RELEASE_CAPABILITIES.find(c => c.package === '@voltui/agent')!;
    const { container } = await render(AvailabilityNote, { inputs: { capabilities: [agent.id] } });
    expect(container.querySelector('[data-availability="unknown"]')).not.toBeNull();
    expect(container.textContent).toContain(agent.since);
  });
});
