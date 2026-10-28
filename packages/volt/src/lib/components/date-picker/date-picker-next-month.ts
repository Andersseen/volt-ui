import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { NgpDatePickerNextMonth } from 'ng-primitives/date-picker';
import { cn } from '../../utils';

@Component({
  selector: 'volt-date-picker-next-month',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpDatePickerNextMonth],
  host: {
    '[class]': 'classes()',
    // A custom element, not a <button>: without these it is neither announced as a button nor
    // reachable and operable from the keyboard.
    role: 'button',
    '[attr.tabindex]': 'primitive.disabled() ? -1 : 0',
    '(keydown.enter)': 'activate($event)',
    '(keydown.space)': 'activate($event)',
  },
  template: `<ng-content />`,
})
export class VoltDatePickerNextMonth {
  readonly class = input<string>('');

  protected readonly primitive = inject(NgpDatePickerNextMonth);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  protected activate(event: Event): void {
    event.preventDefault();
    this.element.nativeElement.click();
  }

  protected readonly classes = computed(() =>
    cn(
      'inline-flex size-8 cursor-pointer items-center justify-center rounded-sm border border-input bg-background text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      this.class()
    )
  );
}
