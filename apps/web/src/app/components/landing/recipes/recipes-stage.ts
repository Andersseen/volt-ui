import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BlockMini } from './block-mini';
import { LayoutMini } from './layout-mini';
import { RecipeMini } from './recipe-mini';
import { StageWindow } from './stage-window';

/**
 * Three windows in layers — a layout behind, a block to one side, a recipe in front — that drift
 * apart with the pointer, each by its own depth.
 *
 * Decorative: the host is `inert` and `aria-hidden`, since the section's heading and links say what
 * it shows. The movement is two custom properties written on `pointermove`; the transforms themselves are
 * CSS, so the server renders the resting pose and reduced motion simply never attaches the listener.
 * Below `lg` the windows stack flat instead.
 */
@Component({
  selector: 'app-recipes-stage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StageWindow, BlockMini, LayoutMini, RecipeMini],
  host: { inert: '', 'aria-hidden': 'true', class: 'block select-none' },
  template: `
    <div class="stage">
      <div class="scene">
        <app-stage-window class="pane pane-layout" file="layouts/admin-dashboard.ts">
          <app-layout-mini />
        </app-stage-window>
        <app-stage-window class="pane pane-block" file="blocks/hero-spotlight.ts">
          <app-block-mini />
        </app-stage-window>
        <app-stage-window class="pane pane-recipe" file="recipes/async-search.ts">
          <app-recipe-mini />
        </app-stage-window>
      </div>
    </div>
  `,
  styles: `
    .scene {
      display: grid;
      gap: 1rem;
    }

    @media (min-width: 1024px) {
      /* --mx / --my run from -1 to 1 with the pointer. Each pane moves by its own depth, so the
         layers separate; the scene itself only leans a few degrees, flat, so panes never intersect. */
      .stage {
        --mx: 0;
        --my: 0;
        perspective: 1800px;
      }

      .scene {
        position: relative;
        display: block;
        height: 27rem;
        transform: rotateX(calc(var(--my) * -3deg + 4deg)) rotateY(calc(var(--mx) * 4deg));
        transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      .pane {
        position: absolute;
        /* An idle drift on its own property, so it never fights the pointer's translate. */
        animation: drift var(--drift, 7s) ease-in-out infinite alternate;
        translate: calc(var(--mx) * var(--depth) * 1px) calc(var(--my) * var(--depth) * 1px);
        transition: translate 700ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      .pane-layout {
        --depth: 8;
        left: 50%;
        top: 0;
        width: 56%;
        margin-left: -28%;
        z-index: 1;
      }

      .pane-block {
        --depth: 20;
        --drift: 6s;
        left: 0;
        top: 5.5rem;
        width: 35%;
        z-index: 2;
      }

      .pane-recipe {
        --depth: 32;
        --drift: 8s;
        right: 0;
        top: 8rem;
        width: 30%;
        z-index: 3;
      }
    }

    @keyframes drift {
      from {
        transform: translateY(-6px);
      }
      to {
        transform: translateY(6px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .scene,
      .pane {
        transition: none;
        animation: none;
      }
    }
  `,
})
export class RecipesStage {
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    afterNextRender(() => {
      if (!isBrowser) return;
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      if (still || coarse) return;

      // The host is inert, so the listener sits on the section around it.
      const target = host.parentElement ?? host;
      const stage = host.querySelector<HTMLElement>('.stage');
      if (!stage) return;

      const move = (event: PointerEvent) => {
        const box = target.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        stage.style.setProperty('--mx', (x * 2).toFixed(3));
        stage.style.setProperty('--my', (y * 2).toFixed(3));
      };
      const reset = () => {
        stage.style.setProperty('--mx', '0');
        stage.style.setProperty('--my', '0');
      };

      target.addEventListener('pointermove', move, { passive: true });
      target.addEventListener('pointerleave', reset);
      destroyRef.onDestroy(() => {
        target.removeEventListener('pointermove', move);
        target.removeEventListener('pointerleave', reset);
      });
    });
  }
}
