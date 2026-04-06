import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'icon-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect width="18" height="14" x="3" y="5" rx="2" />
      <path d="M3 10h18" />
    </svg>
  `,
})
export class IconCard {}
