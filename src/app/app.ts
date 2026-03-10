import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltButton } from 'volt';
import { VoltBadge } from 'volt';
import { VoltInput, VoltTextarea, VoltLabel } from 'volt';
import {
  VoltCard,
  VoltCardHeader,
  VoltCardTitle,
  VoltCardDescription,
  VoltCardContent,
  VoltCardFooter,
} from 'volt';
import { VoltSeparator } from 'volt';
import { VoltCheckbox, VoltSwitch, VoltAvatar, VoltAvatarImage, VoltAvatarFallback } from 'volt';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltBadge,
    VoltInput,
    VoltTextarea,
    VoltLabel,
    VoltCard,
    VoltCardHeader,
    VoltCardTitle,
    VoltCardDescription,
    VoltCardContent,
    VoltCardFooter,
    VoltSeparator,
    VoltCheckbox,
    VoltSwitch,
    VoltAvatar,
    VoltAvatarImage,
    VoltAvatarFallback,
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
