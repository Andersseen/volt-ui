import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgpTooltip } from 'ng-primitives/tooltip';

@Component({
  selector: 'volt-tooltip-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpTooltip],
  animations: [
    trigger('tooltipEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.92)' }),
        animate(
          '{{ duration }}ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'scale(1)' }),
        ),
      ]),
      transition(':leave', [
        animate('{{ outDuration }}ms ease-in', style({ opacity: 0, transform: 'scale(0.92)' })),
      ]),
    ]),
  ],
  host: {
    '[@tooltipEnter]':
      '{ value: "", params: { duration: animationDuration(), outDuration: animationOutDuration() } }',
    class:
      'z-50 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--foreground)] px-[var(--spacing-component)] py-1.5 text-xs font-[var(--font-weight-label)] text-[var(--background)] shadow-[var(--shadow-md)] max-w-xs block',
  },
  template: `<ng-content />`,
})
export class VoltTooltipContent {
  protected readonly prefersReducedMotion = signal(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  protected readonly animationDuration = signal(this.prefersReducedMotion() ? 0 : 120);
  protected readonly animationOutDuration = signal(this.prefersReducedMotion() ? 0 : 80);
}
