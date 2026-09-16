import { EtymaI18n } from '@etyma/angular';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LanguageSwitcher } from './language-switcher';

/** A promise this test controls the resolution of, standing in for the Glossa fetch. */
function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('LanguageSwitcher', () => {
  it('shows a loading state while the catalog is in flight, and clears it once resolved', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(LanguageSwitcher);
    const translations = fixture.debugElement.injector.get(EtymaI18n);

    const gate = deferred();
    const setLocale = vi.spyOn(translations, 'setLocale').mockReturnValue(gate.promise);

    await user.click(screen.getByTestId('language-trigger'));
    const esOption = await screen.findByTestId('language-option-es');
    await user.click(esOption);
    await fixture.whenStable();

    expect(setLocale).toHaveBeenCalledWith('es');
    const trigger = screen.getByTestId('language-trigger');
    expect(trigger).toHaveAttribute('aria-busy', 'true');
    expect(esOption).toHaveAttribute('aria-disabled', 'true');
    // Not the native `disabled` attribute: it would blur the option a keyboard user just
    // activated, straight to <body>, with nothing to return focus afterwards.
    expect(esOption).not.toBeDisabled();
    expect(esOption).toHaveFocus();

    // Clicking again while a switch is in flight must not start a second one.
    await user.click(esOption);
    expect(setLocale).toHaveBeenCalledTimes(1);

    gate.resolve();
    await gate.promise;
    await fixture.whenStable();

    expect(trigger).toHaveAttribute('aria-busy', 'false');
    expect(esOption).not.toHaveAttribute('aria-disabled');
  });

  it('does not fetch anything for the already-active locale', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(LanguageSwitcher);
    const translations = fixture.debugElement.injector.get(EtymaI18n);
    const setLocale = vi.spyOn(translations, 'setLocale');

    await user.click(screen.getByTestId('language-trigger'));
    const enOption = await screen.findByTestId('language-option-en');
    await user.click(enOption);
    await fixture.whenStable();

    expect(setLocale).not.toHaveBeenCalled();
  });
});
