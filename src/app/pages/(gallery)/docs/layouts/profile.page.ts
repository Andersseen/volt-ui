import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProfileLayout } from '../../../../layouts/profile/profile';
import { LayoutShowcase } from '../../../../components/layout-showcase';
import { layoutBySlug } from '../../../../lib/layouts-metadata';
import { PROFILE_LAYOUT } from '../../../../lib/snippets/layouts';

@Component({
  selector: 'app-docs-layout-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutShowcase, ProfileLayout],
  template: `
    <app-layout-showcase [layout]="layout" [code]="code">
      <app-profile-layout />
    </app-layout-showcase>
  `,
})
export default class DocsLayoutProfile {
  protected readonly layout = layoutBySlug('profile');
  protected readonly code = PROFILE_LAYOUT;
}
