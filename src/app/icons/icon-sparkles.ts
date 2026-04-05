import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'icon-sparkles',
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
      <path d="M12 2v4" />
      <path d="m5 5 2.8 2.8" />
      <path d="m19 5-2.8 2.8" />
      <path d="M12 12v8" />
      <path d="m5 19 2.8-2.8" />
      <path d="m19 19-2.8-2.8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  `,
})
export class IconSparkles {}
