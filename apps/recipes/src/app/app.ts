import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header';
import { Footer } from './components/footer';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer],
  template: `
    <div
      class="relative flex min-h-screen flex-col bg-background font-sans text-foreground transition-colors duration-200 selection:bg-primary/20"
    >
      <app-header />
      <main class="flex-grow">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
})
export class App {}
