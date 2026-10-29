import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroInstall } from './hero-install';

describe('HeroInstall', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders the copy and the facts it is given', async () => {
    await render(HeroInstall, {
      inputs: {
        headline: 'Forms that',
        accent: 'validate.',
        facts: [
          { value: '12', label: 'validators' },
          { value: '0', label: 'dependencies' },
        ],
      },
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Forms that validate.' })).toBeVisible();
    expect(screen.getByText('validators')).toBeInTheDocument();
    expect(screen.getByText('dependencies')).toBeInTheDocument();
  });

  it('writes the install command in the package manager the visitor picks', async () => {
    await render(HeroInstall, { inputs: { packageName: 'acme-motion' } });

    expect(screen.getByText('npm install acme-motion')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'pnpm' }));
    expect(screen.getByText('pnpm add acme-motion')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'bun' }));
    expect(screen.getByText('bun add acme-motion')).toBeInTheDocument();
  });

  it('keeps a manager selected when the active one is pressed again', async () => {
    await render(HeroInstall, { inputs: { packageName: 'acme-motion' } });

    await userEvent.click(screen.getByRole('radio', { name: 'npm' }));

    expect(screen.getByText('npm install acme-motion')).toBeInTheDocument();
  });

  it('copies the visible command and says so', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const copiedCommand = vi.fn();
    await render(HeroInstall, { inputs: { packageName: 'acme-motion' }, on: { copiedCommand } });

    await user.click(screen.getByRole('radio', { name: 'yarn' }));
    await user.click(screen.getByRole('button', { name: 'Copy install command' }));

    expect(writeText).toHaveBeenCalledWith('yarn add acme-motion');
    expect(copiedCommand).toHaveBeenCalledWith('yarn add acme-motion');
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
    expect(screen.getByText('Install command copied')).toBeInTheDocument();
  });

  it('does not claim a copy the clipboard refused', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    const copiedCommand = vi.fn();
    await render(HeroInstall, { on: { copiedCommand } });

    await user.click(screen.getByRole('button', { name: 'Copy install command' }));

    expect(copiedCommand).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Copy install command' })).toBeInTheDocument();
  });

  it('emits from its two actions instead of navigating', async () => {
    const primary = vi.fn();
    const secondary = vi.fn();
    await render(HeroInstall, { on: { primary, secondary } });

    await userEvent.click(screen.getByRole('button', { name: 'Get started' }));
    await userEvent.click(screen.getByRole('button', { name: 'Explore demos' }));

    expect(primary).toHaveBeenCalledTimes(1);
    expect(secondary).toHaveBeenCalledTimes(1);
  });
});
