import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
// `./backend` is the only file that differs between the two fixture apps: it re-exports the same
// five component families from `@voltui/components` (ng-primitives) or `@voltui/components/quartz`.
import {
  VoltCheckbox,
  VoltRadioGroup,
  VoltRadioItem,
  VoltSwitch,
  VoltToggle,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from './backend';

@Component({
  selector: 'app-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    VoltCheckbox,
    VoltSwitch,
    VoltToggle,
    VoltRadioGroup,
    VoltRadioItem,
    VoltToggleGroup,
    VoltToggleGroupItem,
  ],
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
        <volt-radio-group formControlName="fruit" aria-label="Fruit" orientation="horizontal">
          <volt-radio-item value="apple">Apple</volt-radio-item>
          <volt-radio-item value="pear">Pear</volt-radio-item>
          <volt-radio-item value="plum">Plum</volt-radio-item>
        </volt-radio-group>
        <label for="email-radio">Email me</label>
        <volt-radio-group formControlName="contact" aria-label="Contact">
          <volt-radio-item id="email-radio" value="email" />
          <volt-radio-item value="phone">Phone</volt-radio-item>
        </volt-radio-group>
        <volt-toggle-group formControlName="format" type="multiple" aria-label="Format">
          <volt-toggle-group-item value="bold">Bold text</volt-toggle-group-item>
          <volt-toggle-group-item value="italic">Italic text</volt-toggle-group-item>
          <volt-toggle-group-item value="underline">Underline text</volt-toggle-group-item>
        </volt-toggle-group>
        <volt-toggle-group formControlName="align" aria-label="Alignment">
          <volt-toggle-group-item value="left">Left</volt-toggle-group-item>
          <volt-toggle-group-item value="center">Center</volt-toggle-group-item>
          <volt-toggle-group-item value="right">Right</volt-toggle-group-item>
        </volt-toggle-group>
      </form>

      <section aria-label="Group states" class="flex flex-col gap-3">
        <volt-radio-group aria-label="Radio state" orientation="horizontal" value="b">
          <volt-radio-item value="a">Radio A</volt-radio-item>
          <volt-radio-item value="b">Radio B</volt-radio-item>
          <volt-radio-item value="c" disabled>Radio C</volt-radio-item>
        </volt-radio-group>
        <volt-radio-group aria-label="Radio group disabled" disabled value="d">
          <volt-radio-item value="d">Radio D</volt-radio-item>
        </volt-radio-group>
        <volt-toggle-group aria-label="Toggle group state" type="multiple" [value]="['on']">
          <volt-toggle-group-item value="on" variant="outline" size="lg"
            >Group on</volt-toggle-group-item
          >
          <volt-toggle-group-item value="off" variant="outline" size="lg"
            >Group off</volt-toggle-group-item
          >
          <volt-toggle-group-item value="dis" disabled>Group disabled</volt-toggle-group-item>
        </volt-toggle-group>
        <div dir="rtl" class="flex flex-col gap-3">
          <volt-radio-group aria-label="RTL radios" orientation="horizontal" value="r1">
            <volt-radio-item value="r1">RTL one</volt-radio-item>
            <volt-radio-item value="r2">RTL two</volt-radio-item>
            <volt-radio-item value="r3">RTL three</volt-radio-item>
          </volt-radio-group>
          <volt-toggle-group aria-label="RTL toggles" type="multiple">
            <volt-toggle-group-item value="t1">RTL tone</volt-toggle-group-item>
            <volt-toggle-group-item value="t2">RTL ttwo</volt-toggle-group-item>
            <volt-toggle-group-item value="t3">RTL tthree</volt-toggle-group-item>
          </volt-toggle-group>
        </div>
      </section>

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
    fruit: new FormControl<string | null>('pear'),
    contact: new FormControl<string | null>(null),
    format: new FormControl<string[]>(['italic'], { nonNullable: true }),
    align: new FormControl<string[]>([], { nonNullable: true }),
  });
}
