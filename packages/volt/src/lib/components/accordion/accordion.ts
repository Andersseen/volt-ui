import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  computed,
  ElementRef,
  inject,
} from '@angular/core';
import type { NgpAccordionType } from 'ng-primitives/accordion';
import { NgpAccordion, provideAccordionState } from 'ng-primitives/accordion';
import { cn } from '../../utils';

@Component({
  selector: 'volt-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideAccordionState()],
  host: {
    '[class]': 'classes()',
    '(keydown)': 'onKeydown($event)',
  },
  hostDirectives: [
    {
      directive: NgpAccordion,
      inputs: [
        'ngpAccordionType: type',
        'ngpAccordionCollapsible: collapsible',
        'ngpAccordionValue: value',
        'ngpAccordionDisabled: disabled',
        'ngpAccordionOrientation: orientation',
      ],
      outputs: ['ngpAccordionValueChange: valueChange'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltAccordion {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('w-full block', this.class()));

  readonly type = input<NgpAccordionType>('single');
  readonly collapsible = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly value = model<string | string[] | null>(null);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * WAI-ARIA accordion keys between headers: ↓/↑ (→/← when horizontal) move to the next/previous
   * trigger, wrapping, Home/End to the first/last; disabled triggers are skipped. Tab order is
   * unchanged (every trigger stays tabbable). The Quartz backend does the same.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement | null;
    const triggers = this.triggers();
    const index = target ? triggers.indexOf(target) : -1;
    if (index === -1) return;

    const horizontal = this.orientation() === 'horizontal';
    const next = horizontal ? 'ArrowRight' : 'ArrowDown';
    const previous = horizontal ? 'ArrowLeft' : 'ArrowUp';
    let to: number;
    if (event.key === next) to = (index + 1) % triggers.length;
    else if (event.key === previous) to = (index - 1 + triggers.length) % triggers.length;
    else if (event.key === 'Home') to = 0;
    else if (event.key === 'End') to = triggers.length - 1;
    else return;

    event.preventDefault();
    triggers[to].focus();
  }

  /** This accordion's enabled triggers in DOM order; a nested accordion's are its own. */
  private triggers(): HTMLElement[] {
    return Array.from(this.host.querySelectorAll<HTMLElement>('[ngpAccordionTrigger]')).filter(
      trigger =>
        trigger.closest('volt-accordion') === this.host &&
        !trigger.hasAttribute('disabled') &&
        !trigger.hasAttribute('data-disabled')
    );
  }
}
