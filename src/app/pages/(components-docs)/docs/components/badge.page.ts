import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltBadge } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { BADGE_SNIPPET } from '../../../../lib/snippets';
import { BADGE_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-badge-demo',
  standalone: true,
  imports: [VoltBadge, CodePanel],
  templateUrl: './badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BadgeDemo {
  readonly badgeCode = BADGE_SNIPPET;
  readonly badgeUsage = BADGE_USAGE;
}
