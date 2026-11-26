import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  VoltButton,
  VoltCombobox,
  VoltDialog,
  VoltDialogContent,
  VoltDialogOverlay,
  VoltDialogTitle,
  VoltDrawer,
  VoltDrawerContent,
  VoltDrawerOverlay,
  VoltDrawerTitle,
  VoltInput,
  VoltPopoverContent,
  VoltPopoverTrigger,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
} from '@voltui/components';

/**
 * Select and Combobox bound to Forms inside the overlays a real form lives in: a dialog, a drawer,
 * a popover, and a scrolling panel. The inner list is a layer of its own: Escape and an outside
 * click close it without closing the overlay around it, focus returns to the control, and the
 * control reports one value change per pick and becomes touched only when focus leaves it.
 */
@Component({
  selector: 'app-overlay-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    VoltButton,
    VoltCombobox,
    VoltDialog,
    VoltDialogContent,
    VoltDialogOverlay,
    VoltDialogTitle,
    VoltDrawer,
    VoltDrawerContent,
    VoltDrawerOverlay,
    VoltDrawerTitle,
    VoltPopoverContent,
    VoltPopoverTrigger,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
  ],
  template: `
    <div class="flex flex-wrap gap-3">
      <button voltButton [voltDialog]="dialogTpl">Open form dialog</button>
      <button voltButton variant="outline" [voltDrawer]="drawerTpl">Open form drawer</button>
      <button voltButton variant="outline" [voltPopover]="popoverTpl">Open form popover</button>
    </div>

    <div id="scroller" class="mt-4 h-40 overflow-auto border p-2">
      <div class="h-64"></div>
      <volt-select ariaLabel="Scrolled fruit" [formControl]="scrolled">
        <volt-select-content>
          <volt-select-item value="apple">Apple</volt-select-item>
          <volt-select-item value="pear">Pear</volt-select-item>
        </volt-select-content>
      </volt-select>
      <div class="h-64"></div>
    </div>

    <output id="state">{{ state() }}</output>

    <ng-template #dialogTpl let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Form dialog</h2>
        <volt-select ariaLabel="Dialog fruit" [formControl]="fruit">
          <volt-select-content>
            <volt-select-item value="apple">Apple</volt-select-item>
            <volt-select-item value="banana" disabled>Banana</volt-select-item>
            <volt-select-item value="cherry">Cherry</volt-select-item>
          </volt-select-content>
        </volt-select>
        <volt-combobox label="Dialog framework" [formControl]="framework" [items]="frameworks">
          <ng-template let-item>{{ item }}</ng-template>
        </volt-combobox>
        <button voltButton variant="outline" id="dialog-done" (click)="close()">Done</button>
      </div>
    </ng-template>

    <ng-template #drawerTpl let-close="close">
      <div voltDrawerOverlay></div>
      <div voltDrawerContent side="right">
        <h2 voltDrawerTitle>Form drawer</h2>
        <volt-select ariaLabel="Drawer fruit" [formControl]="fruit">
          <volt-select-content>
            <volt-select-item value="apple">Apple</volt-select-item>
            <volt-select-item value="cherry">Cherry</volt-select-item>
          </volt-select-content>
        </volt-select>
        <button voltButton variant="outline" (click)="close()">Close form drawer</button>
      </div>
    </ng-template>

    <ng-template #popoverTpl>
      <volt-popover-content>
        <volt-select ariaLabel="Popover fruit" [formControl]="fruit">
          <volt-select-content>
            <volt-select-item value="apple">Apple</volt-select-item>
            <volt-select-item value="cherry">Cherry</volt-select-item>
          </volt-select-content>
        </volt-select>
      </volt-popover-content>
    </ng-template>
  `,
})
export class OverlayFormsFixture {
  protected readonly frameworks = ['Angular', 'React', 'Vue'];
  protected readonly fruit = new FormControl('apple', { nonNullable: true });
  protected readonly framework = new FormControl<string | null>(null);
  protected readonly scrolled = new FormControl('apple', { nonNullable: true });
  private fruitChanges = 0;
  private frameworkChanges = 0;
  /**
   * value|touched|dirty|changes of each control. Read through `events`, which also fires for
   * touched and dirty: an OnPush template reading `control.touched` directly would not repaint.
   */
  protected readonly state = signal('');

  constructor() {
    const render = () =>
      this.state.set(
        [
          this.fruit.value,
          this.fruit.touched,
          this.fruit.dirty,
          this.fruitChanges,
          this.framework.value ?? 'none',
          this.framework.touched,
          this.frameworkChanges,
          this.scrolled.value,
        ].join('|')
      );
    render();
    for (const control of [this.fruit, this.framework, this.scrolled]) {
      control.events.subscribe(render);
    }
    // `events` reports a value change before `valueChanges` fires: count, then repaint.
    this.fruit.valueChanges.subscribe(() => (this.fruitChanges++, render()));
    this.framework.valueChanges.subscribe(() => (this.frameworkChanges++, render()));
  }
}

/**
 * A form inside a dialog, a dialog opened from that dialog, and a dialog opened from a drawer.
 * Escape closes only the topmost layer and focus goes back to the control that opened that layer;
 * a form in a dialog submits once per Enter or click.
 */
@Component({
  selector: 'app-nested-overlays',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    VoltButton,
    VoltDialog,
    VoltDialogContent,
    VoltDialogOverlay,
    VoltDialogTitle,
    VoltDrawer,
    VoltDrawerContent,
    VoltDrawerOverlay,
    VoltDrawerTitle,
    VoltInput,
  ],
  template: `
    <div class="flex flex-wrap gap-3">
      <button voltButton [voltDialog]="formTpl">Open profile</button>
      <button voltButton variant="outline" [voltDrawer]="drawerTpl">Open settings drawer</button>
    </div>
    <output id="submits">{{ submits() }}</output>

    <ng-template #formTpl let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Profile</h2>
        <form (submit)="submit($event)">
          <volt-input aria-label="Display name" [formControl]="name" />
          <button voltButton type="submit">Save profile</button>
          <button voltButton variant="outline" type="button" [voltDialog]="confirmTpl">
            Delete account
          </button>
        </form>
      </div>
    </ng-template>

    <ng-template #confirmTpl let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Delete account?</h2>
        <button voltButton variant="outline" (click)="close()">Keep account</button>
      </div>
    </ng-template>

    <ng-template #drawerTpl>
      <div voltDrawerOverlay></div>
      <div voltDrawerContent side="right">
        <h2 voltDrawerTitle>Settings drawer</h2>
        <button voltButton variant="outline" [voltDialog]="confirmTpl">Reset settings</button>
      </div>
    </ng-template>
  `,
})
export class NestedOverlaysFixture {
  protected readonly name = new FormControl('Ada', { nonNullable: true });
  protected readonly submits = signal(0);

  protected submit(event: Event): void {
    event.preventDefault();
    this.submits.update(n => n + 1);
  }
}
