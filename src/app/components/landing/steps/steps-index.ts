import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { VoltNativeButton } from 'volt';
import { injectAppI18n } from '../../../i18n/i18n';
import type { Step } from './steps';

/** The pinned list of steps beside the workflow: marks the current one, jumps on click. */
@Component({
  selector: 'app-steps-index',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltNativeButton],
  template: `
    <nav [attr.aria-label]="t('landing.steps.nav')">
      <ol class="space-y-1 border-l border-border">
        @for (step of steps(); track step.id; let i = $index) {
          <li>
            <button
              voltButton
              type="button"
              variant="ghost"
              [class]="itemClass(step.id)"
              [attr.aria-current]="active() === step.id ? 'step' : null"
              (click)="selected.emit(step.id)"
            >
              <span class="font-mono text-xs text-muted-foreground">0{{ i + 1 }}</span>
              {{ t(step.labelKey) }}
            </button>
          </li>
        }
      </ol>
    </nav>
  `,
})
export class StepsIndex {
  readonly steps = input.required<readonly Step[]>();
  readonly active = input.required<string>();
  readonly selected = output<string>();

  protected readonly t = injectAppI18n().t;

  /** Goes through `volt-button`'s own `class` input, so it merges with the variant's classes. */
  protected itemClass(id: string): string {
    const base = '-ml-px flex h-auto w-full justify-start gap-3 rounded-l-none border-l-2 py-2.5';
    return this.active() === id
      ? `${base} border-primary text-foreground`
      : `${base} border-transparent text-muted-foreground`;
  }
}
