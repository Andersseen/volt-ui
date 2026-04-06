import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconGithub } from '../icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [IconGithub],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      class="mt-20 py-8 border-t border-border/40 bg-background/50 backdrop-blur-sm relative z-10"
    >
      <div
        class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground"
      >
        <div>&copy; {{ currentYear }} Volt UI. All rights reserved.</div>
        <div class="flex items-center gap-4">
          <a href="#" class="hover:text-foreground transition-colors">Twitter</a>
          <a
            href="https://github.com/Andersseen/volt-ui"
            target="_blank"
            rel="noreferrer"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 hover:text-foreground transition-colors"
            aria-label="GitHub repository"
          >
            <icon-github class="w-4 h-4" />
          </a>
          <a href="#" class="hover:text-foreground transition-colors">Discord</a>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {
  currentYear = new Date().getFullYear();
}
