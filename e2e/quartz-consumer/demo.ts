import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
// `./backend` is the only file that differs between the two fixture apps: it re-exports the same
// three components from `@voltui/components` (ng-primitives) or `@voltui/components/quartz`.
import { VoltCheckbox, VoltSwitch, VoltToggle } from './backend';

@Component({
  selector: 'app-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, JsonPipe, VoltCheckbox, VoltSwitch, VoltToggle],
  template: `
    <main class="mx-auto flex max-w-md flex-col gap-4 p-6">
      <form [formGroup]="form" class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <volt-checkbox id="accept" formControlName="accept" />
          <label for="accept">Accept terms</label>
        </div>
        <div class="flex items-center gap-2">
          <volt-switch id="notify" formControlName="notify" />
          <label for="notify">Notifications</label>
        </div>
        <volt-toggle formControlName="bold" ariaLabel="Bold" variant="outline">B</volt-toggle>
      </form>

      <section aria-label="States" class="flex flex-col gap-3">
        <volt-checkbox ariaLabel="Checked box" [checked]="true" />
        <volt-checkbox ariaLabel="Unchecked box" />
        <volt-checkbox ariaLabel="Mixed box" [indeterminate]="true" />
        <volt-checkbox ariaLabel="Disabled box" disabled />
        <volt-switch ariaLabel="Switch on" [checked]="true" />
        <volt-switch ariaLabel="Switch off" />
        <volt-switch ariaLabel="Switch disabled" disabled />
        <volt-toggle ariaLabel="Toggle on" [pressed]="true" variant="solid">On</volt-toggle>
        <volt-toggle ariaLabel="Toggle off" variant="solid">Off</volt-toggle>
        <volt-toggle ariaLabel="Toggle disabled" disabled>Disabled</volt-toggle>
      </section>

      <output id="value">{{ form.getRawValue() | json }}</output>
      <output id="touched">{{ form.touched }}</output>
      <output id="dirty">{{ form.dirty }}</output>
    </main>
  `,
})
export class Demo {
  readonly form = new FormGroup({
    accept: new FormControl(false, { nonNullable: true }),
    notify: new FormControl(true, { nonNullable: true }),
    bold: new FormControl(false, { nonNullable: true }),
  });
}
