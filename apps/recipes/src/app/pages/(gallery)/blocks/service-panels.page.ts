import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ServicePanels } from '../../../blocks/service-panels/service-panels';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { SERVICE_PANELS_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-service-panels',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, ServicePanels],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-service-panels />
    </app-block-showcase>
  `,
})
export default class DocsBlockServicePanels {
  protected readonly block = blockBySlug('service-panels');
  protected readonly code = SERVICE_PANELS_BLOCK;
}
