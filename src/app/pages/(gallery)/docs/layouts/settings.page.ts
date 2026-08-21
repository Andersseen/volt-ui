import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsLayout } from '../../../../layouts/settings/settings';
import { LayoutShowcase } from '../../../../components/layout-showcase';
import { layoutBySlug } from '../../../../lib/layouts-metadata';
import { SETTINGS_LAYOUT } from '../../../../lib/snippets/layouts';

@Component({
  selector: 'app-docs-layout-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutShowcase, SettingsLayout],
  template: `
    <app-layout-showcase [layout]="layout" [code]="code">
      <app-settings-layout />
    </app-layout-showcase>
  `,
})
export default class DocsLayoutSettings {
  protected readonly layout = layoutBySlug('settings');
  protected readonly code = SETTINGS_LAYOUT;
}
