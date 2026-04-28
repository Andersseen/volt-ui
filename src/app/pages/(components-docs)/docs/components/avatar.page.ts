import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltAvatar, VoltAvatarFallback, VoltAvatarImage } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { AVATAR_SNIPPET } from '../../../../lib/snippets';
import { AVATAR_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-avatar-demo',
  standalone: true,
  imports: [VoltAvatar, VoltAvatarImage, VoltAvatarFallback, CodePanel],
  templateUrl: './avatar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AvatarDemo {
  readonly avatarCode = AVATAR_SNIPPET;
  readonly avatarUsage = AVATAR_USAGE;
}
