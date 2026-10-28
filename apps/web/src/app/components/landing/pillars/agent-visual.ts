import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltBadge } from 'volt';
import { CodeWindow } from '../code-window';

/** What `@voltui/agent` writes, and the agents that read it. */
@Component({
  selector: 'app-agent-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeWindow, VoltBadge],
  template: `
    <app-code-window>
      <div class="font-mono">
        <p><span class="text-primary">$</span> npx &#64;voltui/agent claude</p>
        <div class="mt-4 space-y-1.5 border-t border-border/60 pt-4">
          @for (file of files; track file) {
            <p class="truncate"><span>created</span> {{ file }}</p>
          }
        </div>
        <div class="mt-4 flex flex-wrap gap-2 text-[11px]">
          @for (agent of agents; track agent) {
            <volt-badge variant="outline">{{ agent }}</volt-badge>
          }
        </div>
      </div>
    </app-code-window>
  `,
})
export class AgentVisual {
  protected readonly files = ['.mcp.json', '.claude/skills/volt-ui/SKILL.md'];
  protected readonly agents = ['Claude Code', 'Cursor', 'Windsurf', 'Copilot'];
}
