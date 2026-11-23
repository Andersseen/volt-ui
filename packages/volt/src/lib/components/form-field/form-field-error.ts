import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { injectFormFieldState, NgpError } from 'ng-primitives/form-field';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

/**
 * Validation message. It is an alert, so a screen reader announces it when it is *inserted*: render it
 * once the field has been left or the form submitted (`@if (control.touched && control.invalid)`),
 * not on every keystroke. While it is rendered and its validator fails, the field's control lists it
 * in `aria-describedby`. `class` styles the text.
 *
 * Without Angular Forms — a field validated with signals, `<volt-input [state]="…">` — nothing reports a
 * failing validator, so being rendered is the signal: the message describes the control for as long as
 * it is in the DOM.
 */
@Component({
  selector: 'volt-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpError],
  template: `
    <span ngpError role="alert" aria-live="assertive" [class]="classes()">
      <ng-content />
    </span>
  `,
})
export class VoltError {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('text-error text-sm font-medium', this.class()));

  private readonly formField = injectFormFieldState({ optional: true });
  private readonly error = viewChild.required(NgpError);

  constructor() {
    forwardClassFromHost();
    // ng-primitives unregisters an error on destroy only if it is still failing. An error removed
    // because the value became valid is destroyed in the same pass that clears the failure, so its
    // id stayed in the control's aria-describedby, pointing at an element that no longer exists.
    inject(DestroyRef).onDestroy(() => this.formField()?.removeDescription(this.error().id()));

    // With a Forms control the field's status is known (`invalid()` is a boolean) and ngpError registers
    // the message itself while its validator fails. Without one it stays `null` and nobody would.
    effect(() => {
      const field = this.formField();
      if (field && field.invalid() === null) field.addDescription(this.error().id());
    });
  }
}
