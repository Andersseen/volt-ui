import { fireEvent, render, screen } from '@testing-library/angular';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeSwitcher } from './theme-switcher';

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'volt-theme=; Max-Age=0; Path=/';
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-color');
    document.documentElement.removeAttribute('data-style');
  });

  it('restores the saved theme and toggles dark mode persistently', async () => {
    localStorage.setItem('volt-color', 'sage');
    localStorage.setItem('volt-style', 'soft');
    localStorage.setItem('volt-dark', 'true');

    await render(ThemeSwitcher);

    expect(document.documentElement).toHaveAttribute('data-color', 'sage');
    expect(document.documentElement).toHaveAttribute('data-style', 'soft');
    expect(document.documentElement).toHaveClass('dark');

    fireEvent.click(screen.getByRole('button', { name: 'Toggle dark mode' }));
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('volt-dark')).toBe('false');
  });

  it('lets the shared cookie win over stale local values and writes the next choice back', async () => {
    localStorage.setItem('volt-color', 'ember');
    document.cookie = 'volt-theme=1.sage.brutal.dark.spacious; Path=/';

    await render(ThemeSwitcher);

    expect(document.documentElement).toHaveAttribute('data-color', 'sage');
    expect(document.documentElement).toHaveAttribute('data-style', 'brutal');
    expect(document.documentElement).toHaveAttribute('data-density', 'spacious');
    expect(document.documentElement).toHaveClass('dark');

    fireEvent.click(screen.getByRole('button', { name: 'Toggle dark mode' }));
    expect(document.cookie).toContain('volt-theme=1.sage.brutal.light.spacious');
  });

  it('catches up when the sibling site changed the theme while this tab was hidden', async () => {
    await render(ThemeSwitcher);
    expect(document.documentElement).toHaveAttribute('data-color', 'volt');

    document.cookie = 'volt-theme=1.glacier.ghost.dark.compact; Path=/';
    window.dispatchEvent(new Event('pageshow'));

    expect(document.documentElement).toHaveAttribute('data-color', 'glacier');
    expect(document.documentElement).toHaveAttribute('data-density', 'compact');
  });

  it('does not let a scoped [voltTheme] container be overwritten by the global theme', async () => {
    const scoped = document.createElement('div');
    scoped.setAttribute('data-color', 'glacier');
    document.body.appendChild(scoped);

    document.cookie = 'volt-theme=1.sage.brutal.dark.comfortable; Path=/';
    await render(ThemeSwitcher);

    expect(scoped).toHaveAttribute('data-color', 'glacier');
    scoped.remove();
  });

  it('uses Volt sharp light defaults when no preference is stored', async () => {
    await render(ThemeSwitcher);

    expect(document.documentElement).toHaveAttribute('data-color', 'volt');
    expect(document.documentElement).toHaveAttribute('data-style', 'sharp');
    expect(document.documentElement).not.toHaveClass('dark');
  });
});
