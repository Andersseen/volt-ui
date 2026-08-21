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

  it('substitutes params before splitting, so a slot can carry an identifier', async () => {
    await render(Prose, {
      providers: [provideRouter([])],
      componentInputs: {
        key: 'ui.codePanel.copyNoteDep',
        params: { dep: 'ng-primitives/slider' },
      },
    });

    expect(screen.getByText(/ng-primitives\/slider/)).toBeInTheDocument();
  });
});
