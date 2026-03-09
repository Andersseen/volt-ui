import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly isDark = signal(false);

  protected readonly colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  protected readonly colorScales = [
    { name: 'Primary', prefix: 'primary' },
    { name: 'Neutral', prefix: 'neutral' },
    { name: 'Destructive', prefix: 'destructive' },
  ];

  protected readonly semanticTokens = [
    { name: 'background', var: '--background' },
    { name: 'foreground', var: '--foreground' },
    { name: 'surface', var: '--surface' },
    { name: 'muted', var: '--muted' },
    { name: 'muted-foreground', var: '--muted-foreground' },
    { name: 'border', var: '--border' },
    { name: 'ring', var: '--ring' },
    { name: 'input', var: '--input' },
    { name: 'primary', var: '--primary' },
    { name: 'primary-foreground', var: '--primary-foreground' },
    { name: 'destructive', var: '--destructive' },
    { name: 'destructive-foreground', var: '--destructive-foreground' },
  ];

  protected readonly radii = [
    { name: 'sm', var: '--radius-sm' },
    { name: 'default', var: '--radius' },
    { name: 'md', var: '--radius-md' },
    { name: 'lg', var: '--radius-lg' },
    { name: 'xl', var: '--radius-xl' },
    { name: 'full', var: '--radius-full' },
  ];

  protected readonly shadows = [
    { name: 'sm', var: '--shadow-sm' },
    { name: 'default', var: '--shadow' },
    { name: 'md', var: '--shadow-md' },
    { name: 'lg', var: '--shadow-lg' },
  ];

  toggleDark(): void {
    this.isDark.update((v) => !v);
    document.documentElement.classList.toggle('dark');
  }
}
