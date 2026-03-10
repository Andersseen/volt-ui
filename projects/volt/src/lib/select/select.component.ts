import { Component, ChangeDetectionStrategy, Input, inject, HostListener } from '@angular/core';
import { NgpSelect, NgpSelectPortal } from 'ng-primitives/select';

@Component({
  selector: 'volt-select',
  standalone: true,
  imports: [NgpSelectPortal],
  hostDirectives: [
    {
      directive: NgpSelect,
      inputs: ['ngpSelectValue: value', 'ngpSelectDisabled: disabled', 'ngpSelectMultiple: multiple'],
      outputs: ['ngpSelectValueChange: valueChange']
    }
  ],
  host: {
    'class': 'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
    'tabindex': '0'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="block text-left truncate flex-1 pointer-events-none">
      @if (selectedValue()) {
        {{ displayValue || selectedValue() }}
      } @else {
        <span class="text-muted-foreground">{{ placeholder }}</span>
      }
    </span>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 opacity-50 shrink-0 pointer-events-none"><path d="m6 9 6 6 6-6"/></svg>

    <ng-template ngpSelectPortal>
      <ng-content></ng-content>
    </ng-template>
  `
})
export class VoltSelect {
  private readonly selectDir = inject(NgpSelect);
  
  @Input() displayValue?: string;
  @Input() placeholder = 'Select an option';

  @HostListener('click', ['$event'])
  async onClick(event: Event) {
    console.log('[VoltSelect] Clicked! Is portal registered?', !!this.selectDir.portal());
    // Also explicitly try to open or toggle since ng-primitives might need help:
    if (!this.selectDir.open()) {
       await this.selectDir.toggleDropdown();
    } else {
       this.selectDir.closeDropdown();
    }
  }

  @HostListener('keydown', ['$event'])
  async onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      await this.selectDir.toggleDropdown();
    }
  }

  selectedValue() {
    return this.selectDir.value();
  }
}
