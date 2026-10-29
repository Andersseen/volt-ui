import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * The frame around every catalog page. Navigation between Blocks, Layouts and Recipes lives in
 * the header, so this only gives the content a readable column.
 */
@Component({
  selector: 'app-gallery-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `
    <div class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
      <router-outlet />
    </div>
  `,
})
export default class GalleryLayout {}
