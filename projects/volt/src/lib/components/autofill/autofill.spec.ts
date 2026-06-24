import { Component } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import { VoltAutofill } from './autofill';

@Component({
  selector: 'app-autofill-test-wrapper',
  imports: [VoltAutofill],
  template: `<input voltAutofill type="text" data-testid="autofill-input" />`,
})
class AutofillTestWrapper {}

describe('VoltAutofill', () => {
  it('should render the input with the autofill directive', async () => {
    const { container } = await render(AutofillTestWrapper);

    const input = container.querySelector('input[voltAutofill]');
    expect(input).toBeInTheDocument();
  });
});
