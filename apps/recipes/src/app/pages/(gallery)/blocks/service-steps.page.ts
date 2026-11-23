import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ServiceSteps } from '../../../blocks/service-steps/service-steps';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { SERVICE_STEPS_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-service-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, ServiceSteps],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-service-steps />
    </app-block-showcase>
  `,
})
export default class DocsBlockServiceSteps {
  protected readonly block = blockBySlug('service-steps');
  protected readonly code = SERVICE_STEPS_BLOCK;
}
