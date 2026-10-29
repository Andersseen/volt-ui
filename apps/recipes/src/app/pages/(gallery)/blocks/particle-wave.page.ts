import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BgParticleWave } from '../../../blocks/bg-particle-wave/bg-particle-wave';
import { BlockShowcase } from '../../../components/block-showcase';
import { blockBySlug } from '../../../lib/blocks-metadata';
import { BG_PARTICLE_WAVE_BLOCK } from '../../../lib/snippets/blocks';

@Component({
  selector: 'app-docs-block-particle-wave',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockShowcase, BgParticleWave],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <app-bg-particle-wave />
    </app-block-showcase>
  `,
})
export default class DocsBlockParticleWave {
  protected readonly block = blockBySlug('particle-wave');
  protected readonly code = BG_PARTICLE_WAVE_BLOCK;
}
