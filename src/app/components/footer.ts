import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
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
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path
                d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.33 9.33 0 0 1 12 6.88c.85 0 1.7.12 2.5.36 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.82-4.57 5.07.36.33.68.98.68 1.98 0 1.43-.01 2.58-.01 2.93 0 .27.18.59.69.48A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"
              />
            </svg>
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
