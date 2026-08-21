import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ServiceList } from '../../../../blocks/service-list/service-list';
import { BlockShowcase } from '../../../../components/block-showcase';
import { blockBySlug } from '../../../../lib/blocks-metadata';
import { SERVICE_LIST_BLOCK } from '../../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-services',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, ServiceList],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-service-list />
    </app-block-showcase>
  `,
})
export default class DocsBlockServices {
  protected readonly block = blockBySlug('services');
  protected readonly code = SERVICE_LIST_BLOCK;
}
