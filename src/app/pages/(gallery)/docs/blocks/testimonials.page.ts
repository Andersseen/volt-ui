import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestimonialMarquee } from '../../../../blocks/testimonial-marquee/testimonial-marquee';
import { BlockShowcase } from '../../../../components/block-showcase';
import { blockBySlug } from '../../../../lib/blocks-metadata';
import { TESTIMONIAL_MARQUEE_BLOCK } from '../../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-testimonials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, TestimonialMarquee],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-testimonial-marquee />
    </app-block-showcase>
  `,
})
export default class DocsBlockTestimonials {
  protected readonly block = blockBySlug('testimonials');
  protected readonly code = TESTIMONIAL_MARQUEE_BLOCK;
}
