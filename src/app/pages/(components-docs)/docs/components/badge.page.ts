import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VoltBadge } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { BADGE_SNIPPET } from '../../../../lib/snippets';
import { BADGE_USAGE } from '../../../../lib/snippets/usage';
import { BADGE_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-badge-demo',
  standalone: true,
  imports: [VoltBadge, CodePanel, ApiReference],
  templateUrl: './badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BadgeDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly badgeApi = BADGE_API;
  readonly badgeCode = BADGE_SNIPPET;
  readonly badgeUsage = BADGE_USAGE;
}
