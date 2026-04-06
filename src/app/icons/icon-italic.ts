import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'icon-italic',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 4h-9M14 20H5M15 4 9 20" />
    </svg>
  `,
})
export class IconItalic {}
