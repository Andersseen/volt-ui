import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppOrders } from '../../../blocks/app-orders/app-orders';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { APP_ORDERS_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, AppOrders],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-app-orders />
    </app-block-showcase>
  `,
})
export default class DocsBlockOrders {
  protected readonly block = blockBySlug('orders');
  protected readonly code = APP_ORDERS_BLOCK;
}
