import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'icon-input',
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
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <path d="M6 10h.01" />
      <path d="M6 14h.01" />
    </svg>
  `,
})
export class IconInput {}
