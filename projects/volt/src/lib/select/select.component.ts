import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { NgpSelect, NgpSelectPortal } from 'ng-primitives/select';

@Component({
  selector: 'volt-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSelect, NgpSelectPortal],
  template: `
    <button
      ngpSelect
      [ngpSelectValue]="value()"
      [ngpSelectDisabled]="disabled()"
      [ngpSelectMultiple]="multiple()"
      (ngpSelectValueChange)="value.set($event); valueChange.emit($event)"
      class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
    >
      <span class="block text-left truncate flex-1 pointer-events-none">
        @if (value(); as selected) {
          {{ selected }}
        } @else {
          <span class="text-muted-foreground">{{ placeholder() }}</span>
        }
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4 opacity-50 shrink-0 pointer-events-none"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <ng-template ngpSelectPortal>
      <ng-content />
    </ng-template>
  `,
})
export class VoltSelect {
  readonly placeholder = input('Select an option');
  readonly value = model<unknown>(undefined);
  readonly disabled = input(false);
  readonly multiple = input(false);
  readonly valueChange = output<unknown>();
}
