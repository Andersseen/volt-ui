import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { injectAppI18n } from '../../../i18n/i18n';
import { Prose } from '../../prose';
import { CodeWindow } from '../code-window';
import type { Step } from './steps';

/** One workflow step: number and label, heading, explanation, and its code sample. */
@Component({
  selector: 'app-step-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeWindow, Prose],
  host: { class: 'grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-center xl:gap-10' },
  template: `
    <div>
      <p class="flex items-center gap-2 text-sm font-semibold text-primary">
        <span class="font-mono">0{{ position() }}</span>
        <span aria-hidden="true" class="h-px w-6 bg-primary/50"></span>
        {{ t(step().labelKey) }}
      </p>
      <h3 class="landing-display mt-3 text-balance text-3xl font-bold sm:text-4xl">
        {{ t(step().titleKey) }}
      </h3>
      <app-prose
        class="mt-4 block text-base leading-7 text-muted-foreground"
        [text]="t(step().bodyKey)"
      />
    </div>
    <app-code-window [file]="step().file">
      <pre class="font-mono"><code>{{ step().code }}</code></pre>
    </app-code-window>
  `,
})
export class StepItem {
  readonly step = input.required<Step>();
  /** 1-based. */
  readonly position = input.required<number>();

  protected readonly t = injectAppI18n().t;
}
