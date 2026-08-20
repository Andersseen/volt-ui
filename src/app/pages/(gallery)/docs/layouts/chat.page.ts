import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChatLayout } from '../../../../layouts/chat/chat';
import { LayoutShowcase } from '../../../../components/layout-showcase';
import { layoutBySlug } from '../../../../lib/layouts-metadata';
import { CHAT_LAYOUT } from '../../../../lib/snippets/layouts';

@Component({
  selector: 'app-docs-layout-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutShowcase, ChatLayout],
  template: `
    <app-layout-showcase [layout]="layout" [code]="code">
      <app-chat-layout />
    </app-layout-showcase>
  `,
})
export default class DocsLayoutChat {
  protected readonly layout = layoutBySlug('chat');
  protected readonly code = CHAT_LAYOUT;
}
