import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
// `./backend` is the only file that differs between the two fixture apps: it re-exports the same
// five component families from `@voltui/components` (ng-primitives) or `@voltui/components/quartz`.
import {
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
  VoltCheckbox,
  VoltRadioGroup,
  VoltRadioItem,
  VoltSwitch,
  VoltToggle,
  VoltToggleGroup,
  VoltToggleGroupItem,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
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
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTabsContent,
    VoltAccordion,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltAccordionContent,
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

      <section aria-label="Disclosure" class="flex flex-col gap-3">
        <volt-tabs [(value)]="tab">
          <volt-tabs-list aria-label="Account sections">
            <volt-tabs-trigger value="profile">Profile</volt-tabs-trigger>
            <volt-tabs-trigger value="security">Security</volt-tabs-trigger>
            <volt-tabs-trigger value="billing">Billing</volt-tabs-trigger>
          </volt-tabs-list>
          <volt-tabs-content value="profile"
            ><button type="button">Edit profile</button></volt-tabs-content
          >
          <volt-tabs-content value="security"
            ><button type="button">Change password</button></volt-tabs-content
          >
          <volt-tabs-content value="billing"
            ><button type="button">Update card</button></volt-tabs-content
          >
        </volt-tabs>
        <volt-tabs value="m1" [activateOnFocus]="false">
          <volt-tabs-list aria-label="Manual sections">
            <volt-tabs-trigger value="m1">Manual one</volt-tabs-trigger>
            <volt-tabs-trigger value="m2">Manual two</volt-tabs-trigger>
          </volt-tabs-list>
          <volt-tabs-content value="m1">Manual panel one</volt-tabs-content>
          <volt-tabs-content value="m2">Manual panel two</volt-tabs-content>
        </volt-tabs>
        <div dir="rtl">
          <volt-tabs value="r1">
            <volt-tabs-list aria-label="RTL sections">
              <volt-tabs-trigger value="r1">RTL first</volt-tabs-trigger>
              <volt-tabs-trigger value="r2">RTL second</volt-tabs-trigger>
            </volt-tabs-list>
            <volt-tabs-content value="r1">RTL panel one</volt-tabs-content>
            <volt-tabs-content value="r2">RTL panel two</volt-tabs-content>
          </volt-tabs>
        </div>
        <volt-accordion [(value)]="section" [collapsible]="true">
          <volt-accordion-item value="shipping">
            <volt-accordion-trigger>Shipping</volt-accordion-trigger>
            <volt-accordion-content
              ><button type="button">Track parcel</button></volt-accordion-content
            >
          </volt-accordion-item>
          <volt-accordion-item value="returns">
            <volt-accordion-trigger>Returns</volt-accordion-trigger>
            <volt-accordion-content
              ><button type="button">Start return</button></volt-accordion-content
            >
          </volt-accordion-item>
        </volt-accordion>
        <volt-accordion type="multiple">
          <volt-accordion-item value="faq-1">
            <volt-accordion-trigger>Faq one</volt-accordion-trigger>
            <volt-accordion-content>Faq answer one</volt-accordion-content>
          </volt-accordion-item>
          <volt-accordion-item value="faq-2">
            <volt-accordion-trigger>Faq two</volt-accordion-trigger>
            <volt-accordion-content>Faq answer two</volt-accordion-content>
          </volt-accordion-item>
        </volt-accordion>
        <output id="tab-value">{{ tab() }}</output>
        <output id="section-value">{{ section() ?? 'none' }}</output>
      </section>

      <output id="value">{{ form.getRawValue() | json }}</output>
      <output id="touched">{{ form.touched }}</output>
      <output id="dirty">{{ form.dirty }}</output>
    </main>
  `,
})
export class Demo {
  readonly tab = model<string | undefined>('profile');
  readonly section = model<string | string[] | null>(null);
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
