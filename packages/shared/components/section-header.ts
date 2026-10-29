import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VoltBadge } from 'volt';
import { Prose } from './prose';
import { Reveal } from './reveal';

/**
 * The eyebrow, display heading and lede that open a landing section, on either site.
 *
 * Takes already-translated strings so each section stays in charge of its own keys. The lede
 * goes through `<app-prose>`, so a message with `code` marks renders them as code.
 */
@Component({
  selector: 'app-landing-section-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Prose, Reveal, VoltBadge],
  template: `
    <div appReveal class="max-w-3xl">
      <volt-badge variant="outline" class="mb-5">{{ eyebrow() }}</volt-badge>
      <h2 class="landing-display text-balance text-4xl font-bold sm:text-6xl">{{ title() }}</h2>
      <app-prose
        class="mt-6 block max-w-2xl text-lg leading-8 text-muted-foreground"
        [text]="lede()"
      />
    </div>
  `,
})
export class LandingSectionHeader {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly lede = input.required<string>();
}
