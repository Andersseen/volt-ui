import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { VoltCheckbox, VoltLabel } from '@voltui/components';

/** A "select all" parent whose mixed state is derived from its children. */
@Component({
  selector: 'app-checkbox-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCheckbox, VoltLabel],
  template: `
    <div class="mx-auto max-w-sm space-y-6">
      <div class="flex items-start gap-3">
        <volt-checkbox id="terms" [(checked)]="terms" />
        <div class="grid gap-1.5 leading-none">
          <volt-label htmlFor="terms" class="cursor-pointer"
            >Accept terms and conditions</volt-label
          >
          <p class="text-sm text-muted-foreground">You agree to our Terms of Service.</p>
        </div>
      </div>

      <fieldset class="space-y-3">
        <legend class="sr-only">Notifications</legend>
        <div class="flex items-center gap-3">
          <volt-checkbox
            id="all"
            [checked]="allChecked()"
            [indeterminate]="someChecked()"
            (checkedChange)="setAll($event)"
          />
          <volt-label htmlFor="all">All notifications</volt-label>
        </div>
        @for (channel of channels(); track channel.id) {
          <div class="flex items-center gap-3 pl-7">
            <volt-checkbox
              [id]="channel.id"
              [checked]="channel.on"
              (checkedChange)="toggle(channel.id, $event)"
            />
            <volt-label [htmlFor]="channel.id">{{ channel.label }}</volt-label>
          </div>
        }
      </fieldset>
    </div>
  `,
})
export class CheckboxExample {
  readonly terms = signal(false);
  readonly channels = signal([
    { id: 'email', label: 'Email', on: true },
    { id: 'sms', label: 'SMS', on: false },
    { id: 'push', label: 'Push', on: false },
  ]);

  readonly allChecked = computed(() => this.channels().every(channel => channel.on));
  readonly someChecked = computed(
    () => !this.allChecked() && this.channels().some(channel => channel.on)
  );

  setAll(on: boolean): void {
    this.channels.update(channels => channels.map(channel => ({ ...channel, on })));
  }

  toggle(id: string, on: boolean): void {
    this.channels.update(channels =>
      channels.map(channel => (channel.id === id ? { ...channel, on } : channel))
    );
  }
}
