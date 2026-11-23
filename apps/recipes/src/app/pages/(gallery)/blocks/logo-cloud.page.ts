import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogoCloud } from '../../../blocks/logo-cloud/logo-cloud';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { LOGO_CLOUD_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-logo-cloud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, LogoCloud],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-logo-cloud />
    </app-block-showcase>
  `,
})
export default class DocsBlockLogoCloud {
  protected readonly block = blockBySlug('logo-cloud');
  protected readonly code = LOGO_CLOUD_BLOCK;
}
