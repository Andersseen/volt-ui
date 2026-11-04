import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
// `./backend` is the only file that differs between the two fixture apps: it re-exports the same
// five component families from `@voltui/components` (ng-primitives) or `@voltui/components/quartz`.
import {
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
  VoltCheckbox,
  VoltListbox,
  VoltListboxHeader,
  VoltListboxOption,
  VoltListboxSection,
  VoltRadioGroup,
  VoltRadioItem,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltSelectSeparator,
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
    FormsModule,
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
    VoltListbox,
    VoltListboxHeader,
    VoltListboxOption,
    VoltListboxSection,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSelectLabel,
    VoltSelectSeparator,
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

      <section aria-label="Selection" class="flex flex-col gap-3" [formGroup]="picks">
        <volt-listbox formControlName="stack" aria-label="Stack">
          <volt-listbox-section>
            <volt-listbox-header>Frameworks</volt-listbox-header>
            <volt-listbox-option value="angular">Angular stack</volt-listbox-option>
            <volt-listbox-option value="react">React stack</volt-listbox-option>
            <volt-listbox-option value="vue" disabled>Vue stack</volt-listbox-option>
          </volt-listbox-section>
          <volt-listbox-option value="svelte">Svelte stack</volt-listbox-option>
        </volt-listbox>
        <volt-listbox formControlName="tags" aria-label="Tags" mode="multiple">
          <volt-listbox-option value="a11y">Tag a11y</volt-listbox-option>
          <volt-listbox-option value="perf">Tag perf</volt-listbox-option>
          <volt-listbox-option value="ssr">Tag ssr</volt-listbox-option>
        </volt-listbox>
        <volt-select formControlName="meta" aria-label="Meta framework" placeholder="Pick one">
          <volt-select-content>
            <volt-select-label>Meta frameworks</volt-select-label>
            <volt-select-item value="next">Next</volt-select-item>
            <volt-select-item value="nuxt">Nuxt</volt-select-item>
            <volt-select-separator />
            <volt-select-item value="remix">Remix</volt-select-item>
            <volt-select-item value="astro" disabled>Astro</volt-select-item>
          </volt-select-content>
        </volt-select>
        <volt-select formControlName="tools" aria-label="Tooling" placeholder="Pick tools" multiple>
          <volt-select-content>
            <volt-select-item value="vite">Vite</volt-select-item>
            <volt-select-item value="esbuild">Esbuild</volt-select-item>
            <volt-select-item value="webpack">Webpack</volt-select-item>
          </volt-select-content>
        </volt-select>
        <volt-select aria-label="Select disabled" placeholder="Nope" disabled>
          <volt-select-content>
            <volt-select-item value="x">Never</volt-select-item>
          </volt-select-content>
        </volt-select>
        <output id="picks-value">{{ picks.getRawValue() | json }}</output>
        <output id="picks-touched">{{ picks.touched }}</output>
      </section>

      <!--
        Programmatic writes, validation and template-driven Forms (e2e/quartz-consumer/forms-state.spec.ts).
        Every name starts with "P " / "TD " so it never collides with a control above.
      -->
      <section aria-label="Programmatic" class="flex flex-col gap-3" [formGroup]="prog">
        <volt-checkbox formControlName="check" ariaLabel="P check" />
        <volt-switch formControlName="sw" ariaLabel="P switch" />
        <volt-toggle formControlName="tog" ariaLabel="P toggle">T</volt-toggle>
        <volt-radio-group formControlName="radio" aria-label="P radio">
          <volt-radio-item value="x">P radio x</volt-radio-item>
          <volt-radio-item value="y">P radio y</volt-radio-item>
        </volt-radio-group>
        <volt-toggle-group formControlName="group" aria-label="P group">
          <volt-toggle-group-item value="x">P group x</volt-toggle-group-item>
          <volt-toggle-group-item value="y">P group y</volt-toggle-group-item>
        </volt-toggle-group>
        <volt-listbox formControlName="list" aria-label="P list">
          <volt-listbox-option value="x">P list x</volt-listbox-option>
          <volt-listbox-option value="y">P list y</volt-listbox-option>
        </volt-listbox>
        <volt-select formControlName="sel" aria-label="P select" placeholder="P pick">
          <volt-select-content>
            <volt-select-item value="x">P select x</volt-select-item>
            <volt-select-item value="y">P select y</volt-select-item>
          </volt-select-content>
        </volt-select>
        <volt-tabs [value]="progTab()">
          <volt-tabs-list aria-label="P tabs">
            <volt-tabs-trigger value="x">P tab x</volt-tabs-trigger>
            <volt-tabs-trigger value="y">P tab y</volt-tabs-trigger>
          </volt-tabs-list>
          <volt-tabs-content value="x">P tab panel x</volt-tabs-content>
          <volt-tabs-content value="y">P tab panel y</volt-tabs-content>
        </volt-tabs>
        <volt-accordion [value]="progOpen()" [collapsible]="true">
          <volt-accordion-item value="x">
            <volt-accordion-trigger>P section x</volt-accordion-trigger>
            <volt-accordion-content>P answer x</volt-accordion-content>
          </volt-accordion-item>
          <volt-accordion-item value="y">
            <volt-accordion-trigger>P section y</volt-accordion-trigger>
            <volt-accordion-content>P answer y</volt-accordion-content>
          </volt-accordion-item>
        </volt-accordion>
        <div class="flex flex-wrap gap-2">
          <button type="button" (click)="setAll()">Set all</button>
          <button type="button" (click)="prog.reset()">Reset all</button>
          <button type="button" (click)="prog.disable()">Disable all</button>
          <button type="button" (click)="prog.enable()">Enable all</button>
          <button type="button" (click)="prog.markAllAsTouched()">Touch all</button>
        </div>
        <output id="prog-value">{{ prog.getRawValue() | json }}</output>
        <output id="prog-dirty">{{ prog.dirty }}</output>
        <output id="prog-changes">{{ progChanges() }}</output>
      </section>

      <section aria-label="Template-driven" class="flex flex-col gap-3">
        <volt-checkbox [(ngModel)]="tdCheck" name="tdCheck" ariaLabel="TD check" />
        <volt-radio-group [(ngModel)]="tdRadio" name="tdRadio" aria-label="TD radio">
          <volt-radio-item value="x">TD radio x</volt-radio-item>
          <volt-radio-item value="y">TD radio y</volt-radio-item>
        </volt-radio-group>
        <volt-select
          [(ngModel)]="tdSelect"
          name="tdSelect"
          aria-label="TD select"
          placeholder="TD pick"
        >
          <volt-select-content>
            <volt-select-item value="x">TD select x</volt-select-item>
            <volt-select-item value="y">TD select y</volt-select-item>
          </volt-select-content>
        </volt-select>
        <button type="button" (click)="tdSetAll()">TD set all</button>
        <output id="td-value">{{ tdCheck() }}|{{ tdRadio() }}|{{ tdSelect() }}</output>
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
  readonly picks = new FormGroup({
    stack: new FormControl<string[]>(['react'], { nonNullable: true }),
    tags: new FormControl<string[]>(['perf'], { nonNullable: true }),
    meta: new FormControl<string | null>('nuxt'),
    tools: new FormControl<string[]>([], { nonNullable: true }),
  });
  // Programmatic section: every control is required, so validation is observable as `aria-invalid`.
  readonly prog = new FormGroup({
    check: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
    sw: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
    tog: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
    radio: new FormControl<string | null>(null, Validators.required),
    group: new FormControl<string[]>([], { nonNullable: true, validators: Validators.required }),
    list: new FormControl<string[]>([], { nonNullable: true, validators: Validators.required }),
    sel: new FormControl<string | null>(null, Validators.required),
  });
  /** valueChanges of the whole group: a user action is one emission, `setAll()` is exactly one. */
  readonly progChanges = signal(0);
  readonly progTab = signal<string | undefined>('x');
  readonly progOpen = signal<string | string[] | null>(null);
  readonly tdCheck = signal(false);
  readonly tdRadio = signal<string | null>(null);
  readonly tdSelect = signal<string | undefined>(undefined);

  constructor() {
    this.prog.valueChanges.subscribe(() => this.progChanges.update(n => n + 1));
  }

  setAll(): void {
    // One programmatic write for the group (one valueChanges), plus the two one-way bindings.
    this.prog.setValue({
      check: true,
      sw: true,
      tog: true,
      radio: 'y',
      group: ['y'],
      list: ['y'],
      sel: 'y',
    });
    this.progTab.set('y');
    this.progOpen.set('y');
  }

  tdSetAll(): void {
    this.tdCheck.set(true);
    this.tdRadio.set('y');
    this.tdSelect.set('y');
  }

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
