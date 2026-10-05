import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Prose } from './prose';

describe('Prose', () => {
  it('wraps backtick spans in code, so one sentence stays one translation key', async () => {
    await render(Prose, {
      providers: [provideRouter([])],
      componentInputs: { key: 'guide.themesPage.runtimeLede' },
    });

    // The identifiers are marked up, and the sentence around them is one node.
    const code = screen.getByText('@voltui/components');
    expect(code.tagName).toBe('CODE');
    expect(screen.getByText(/control the theme at runtime/)).toBeInTheDocument();
  });

  it('marks up a message the caller translated with params', async () => {
    // The caller's typed `t()` substitutes the params; Prose only splits the result, so a
    // slot can still carry an identifier.
    await render(Prose, {
      providers: [provideRouter([])],
      componentInputs: { text: 'The component uses `ng-primitives/slider`.' },
    });

    const code = screen.getByText('ng-primitives/slider');
    expect(code.tagName).toBe('CODE');
  });
});
