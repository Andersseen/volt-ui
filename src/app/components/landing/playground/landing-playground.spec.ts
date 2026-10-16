import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { COLOR_PRESETS, STYLE_PRESETS } from '../../../lib/theme-presets';
import { LandingPlayground } from './landing-playground';

async function setup() {
  const view = await render(LandingPlayground, { providers: [provideRouter([])] });
  await view.fixture.whenStable();
  return view;
}

describe('landing theme playground', () => {
  it('offers every color and style preset as a single-choice option', async () => {
    await setup();

    for (const name of [...COLOR_PRESETS, ...STYLE_PRESETS]) {
      expect(screen.getByRole('radio', { name })).toBeInTheDocument();
    }
  });

  it('re-themes the preview and the config line when a palette is picked', async () => {
    const user = userEvent.setup();
    const { fixture } = await setup();

    await user.click(screen.getByRole('radio', { name: 'sage' }));
    await fixture.whenStable();

    expect(fixture.componentInstance.color()).toBe('sage');
    expect(screen.getByText('sage · soft')).toBeInTheDocument();
    expect(fixture.nativeElement.querySelector('.preview').getAttribute('style')).toContain(
      '--primary'
    );
  });

  it('stops the tour as soon as the visitor makes a choice', async () => {
    const user = userEvent.setup();
    const { fixture } = await setup();
    fixture.componentInstance.touring.set(true);

    await user.click(screen.getByRole('radio', { name: 'brutal' }));

    expect(fixture.componentInstance.touring()).toBe(false);
    expect(fixture.componentInstance.shape()).toBe('brutal');
  });

  it('walks the palettes and steps the shape after a full lap', async () => {
    const { fixture } = await setup();
    const playground = fixture.componentInstance;
    playground.color.set('glacier');
    playground.shape.set('soft');

    playground.advance();

    expect(playground.color()).toBe('volt');
    expect(playground.shape()).toBe('brutal');
  });
});
