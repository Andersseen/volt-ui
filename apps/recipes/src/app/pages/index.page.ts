import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeBlocks } from '../components/home/home-blocks';
import { HomeCta } from '../components/home/home-cta';
import { HomeHero } from '../components/home/home-hero';
import { HomeShells } from '../components/home/home-shells';
import { HomeStats } from '../components/home/home-stats';

/**
 * Where a visitor lands, as a running order. Each section owns its copy and data in
 * `components/home/`, and every figure and card is read off the catalog, so the page cannot
 * promise something the site does not have.
 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeHero, HomeStats, HomeBlocks, HomeShells, HomeCta],
  template: `
    <div class="overflow-x-clip">
      <app-home-hero />
      <app-home-stats />
      <app-home-blocks />
      <app-home-shells />
      <app-home-cta />
    </div>
  `,
})
export default class HomePage {}
