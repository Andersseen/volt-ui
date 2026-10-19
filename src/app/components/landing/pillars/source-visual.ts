import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeWindow } from '../code-window';

/** What `volt add` leaves behind: plain files in your own `src/app/ui`. */
@Component({
  selector: 'app-source-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeWindow],
  template: `
    <app-code-window>
      <div class="font-mono">
        <p><span class="text-primary">$</span> npx &#64;voltui/cli add dialog form-field</p>
        <p><span class="text-success">✓</span> resolved {{ files.length }} files</p>
        <div class="mt-4 space-y-1.5 border-t border-border/60 pt-4">
          @for (file of files; track file) {
            <p class="truncate"><span class="text-muted-foreground">src/app/ui/</span>{{ file }}</p>
          }
        </div>
      </div>
    </app-code-window>
  `,
})
export class SourceVisual {
  protected readonly files = [
    'dialog/dialog.ts',
    'dialog/variants.ts',
    'form-field/form-field.ts',
    'utils.ts',
  ];
}
