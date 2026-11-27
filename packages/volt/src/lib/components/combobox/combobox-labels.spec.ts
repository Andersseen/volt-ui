import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { VoltCombobox } from './combobox';

@Component({
  imports: [VoltCombobox],
  template: `<volt-combobox label="Ciudad" [items]="items" toggleLabel="Mostrar ciudades" />`,
})
class Localized {
  items = ['Madrid', 'Kyiv'];
}

@Component({
  imports: [VoltCombobox],
  template: `<volt-combobox label="City" [items]="items" />`,
})
class Defaults {
  items = ['Madrid', 'Kyiv'];
}

describe('Combobox built-in names', () => {
  it('keeps the English toggle name by default', async () => {
    await render(Defaults);
    expect(screen.getByRole('button', { name: 'Toggle dropdown' })).toBeInTheDocument();
  });

  it('takes a translated toggle name', async () => {
    await render(Localized);
    expect(screen.getByRole('button', { name: 'Mostrar ciudades' })).toBeInTheDocument();
  });
});
