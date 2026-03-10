import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VoltButton, VoltBadge } from 'volt';
import { ThemeSwitcherComponent } from './components/theme-switcher.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    VoltButton,
    VoltBadge,
    ThemeSwitcherComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly isDark = signal(false);

  toggleDark(): void {
    this.isDark.update((v) => !v);
    document.documentElement.classList.toggle('dark');
  }
}
