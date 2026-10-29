import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LandingSteps } from './landing-steps';
import { STEPS } from './steps';

describe('landing workflow steps', () => {
  it('renders every step with its code sample', async () => {
    await render(LandingSteps, { providers: [provideRouter([])] });

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(STEPS.length);
    expect(screen.getByText(/npx @voltui\/agent claude/)).toBeInTheDocument();
  });

  it('marks the first step current and jumps to a step from the index', async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const { fixture } = await render(LandingSteps, { providers: [provideRouter([])] });

    const nav = screen.getByRole('navigation', { name: 'Workflow steps' });
    expect(nav.querySelector('[aria-current="step"]')?.textContent).toContain('Install');

    await user.click(screen.getByRole('button', { name: /Automate/ }));
    await fixture.whenStable();

    expect(scrollIntoView).toHaveBeenCalled();
    expect(fixture.componentInstance.active()).toBe('agents');
    expect(nav.querySelector('[aria-current="step"]')?.textContent).toContain('Automate');
  });
});
