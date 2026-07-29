import { fireEvent, render, screen } from '@testing-library/angular';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeSwitcher } from './theme-switcher';

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
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

  it('uses Volt sharp light defaults when no preference is stored', async () => {
    await render(ThemeSwitcher);

    expect(document.documentElement).toHaveAttribute('data-color', 'volt');
    expect(document.documentElement).toHaveAttribute('data-style', 'sharp');
    expect(document.documentElement).not.toHaveClass('dark');
  });
});
