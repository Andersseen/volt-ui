import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
} from '@angular/core';
import { VoltQuartzIds } from '../../quartz-ids';
import { cn } from '../../utils';
import { VoltListboxSection } from './listbox-section';

@Component({
  selector: 'volt-listbox-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'presentation',
    '[attr.id]': 'resolvedId()',
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltListboxHeader {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('px-inset-xs py-item-y text-xs font-medium text-muted-foreground', this.class())
  );

  readonly id = input<string>();

  private readonly generatedId = inject(VoltQuartzIds).generate('volt-listbox-header');
  protected readonly resolvedId = computed(() => this.id() ?? this.generatedId);

  private readonly section = inject(VoltListboxSection, { optional: true });

  constructor() {
    let previous: string | undefined;
    effect(() => {
      const id = this.resolvedId();
      if (previous) this.section?.removeLabelledBy(previous);
      this.section?.setLabelledBy(id);
      previous = id;
    });
    inject(DestroyRef).onDestroy(() => previous && this.section?.removeLabelledBy(previous));
  }
}
