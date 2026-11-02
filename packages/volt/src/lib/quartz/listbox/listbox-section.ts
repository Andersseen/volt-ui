import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { cn } from '../../utils';

/*
 * `role="group"` named by the `volt-listbox-header` inside it, only while there is one. Quartz's
 * own group directive always points `aria-labelledby` at a label it expects to exist; Volt's
 * header is optional (and may sit outside any section), so the section keeps the reference itself.
 */
@Component({
  selector: 'volt-listbox-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltListboxSection {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('grid gap-1', this.class()));

  private readonly labelledBy = signal<string | undefined>(undefined);

  setLabelledBy(id: string): void {
    this.labelledBy.set(id);
  }

  removeLabelledBy(id: string): void {
    if (this.labelledBy() === id) this.labelledBy.set(undefined);
  }
}
