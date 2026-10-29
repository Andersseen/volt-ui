import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { injectFormFieldState, NgpLabel } from 'ng-primitives/form-field';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

/**
 * Renders a native `<label>`. Inside `<volt-form-field>` it is wired to the field's control
 * automatically; elsewhere pass `htmlFor`. `class` is applied to the `<label>`.
 */
@Component({
  selector: 'volt-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpLabel, NgTemplateOutlet],
  template: `
    <!--
      NgpLabel owns the label inside a form field (id, for, aria-labelledby on the control).
      Outside one it has no control to point at: it would drop the for attribute and cancel the
      native click, so a plain label with htmlFor is rendered instead.
    -->
    @if (formField()) {
      <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
      <label ngpLabel [class]="classes()">
        <ng-container [ngTemplateOutlet]="content" />
      </label>
    } @else {
      <label [class]="classes()" [attr.for]="htmlFor() || null">
        <ng-container [ngTemplateOutlet]="content" />
      </label>
    }
    <ng-template #content><ng-content /></ng-template>
  `,
})
export class VoltLabel {
  protected readonly formField = injectFormFieldState({ optional: true });

  readonly error = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly htmlFor = input<string>('');
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      this.error() && 'text-error',
      this.class()
    )
  );

  constructor() {
    forwardClassFromHost();
  }
}
