import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltAvatar, VoltAvatarFallback, VoltAvatarImage } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { AVATAR_SNIPPET } from '../../../../lib/snippets';
import { AVATAR_USAGE } from '../../../../lib/snippets/usage';
import { AVATAR_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-avatar-demo',
  standalone: true,
  imports: [VoltAvatar, VoltAvatarImage, VoltAvatarFallback, CodePanel, ApiReference],
  templateUrl: './avatar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AvatarDemo {
  readonly avatarApi = AVATAR_API;
  readonly avatarCode = AVATAR_SNIPPET;
  readonly avatarUsage = AVATAR_USAGE;
}
