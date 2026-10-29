import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltAvatar, VoltAvatarFallback, VoltBadge, VoltButton } from 'volt';

/**
 * A block in miniature: a hero section with the spotlight that drifts across it.
 *
 * A specimen, not copy: it stands for the Hero Spotlight block on Volt UI Recipes, so its words are
 * the block's sample words and are not translated (see `no-hardcoded-copy.spec.ts`).
 */
@Component({
  selector: 'app-block-mini',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltAvatar, VoltAvatarFallback, VoltBadge, VoltButton],
  host: { class: 'block' },
  template: `
    <div class="mini relative flex flex-col items-center px-6 py-8 text-center">
      <div class="spotlight pointer-events-none absolute inset-0"></div>
      <volt-badge variant="outline" class="relative text-[10px]">● Now in public beta</volt-badge>
      <p class="relative mt-4 text-xl font-bold leading-tight tracking-tight">
        Interfaces that feel <span class="text-primary">alive</span><br />the moment they load.
      </p>
      <p class="relative mt-2 max-w-[16rem] text-[11px] text-muted-foreground">
        Drop-in Angular sections built from accessible primitives.
      </p>
      <div class="relative mt-4 flex gap-2">
        <volt-button size="sm" class="h-7 px-3 text-[11px]">Start building →</volt-button>
        <volt-button size="sm" variant="outline" class="h-7 px-3 text-[11px]">Browse</volt-button>
      </div>
      <div class="relative mt-4 flex -space-x-1.5">
        @for (initials of people; track initials) {
          <volt-avatar class="h-7 w-7 border-2 border-background text-[9px]">
            <volt-avatar-fallback>{{ initials }}</volt-avatar-fallback>
          </volt-avatar>
        }
      </div>
    </div>
  `,
  styles: `
    .spotlight {
      background: radial-gradient(
        16rem circle at var(--x, 30%) 30%,
        color-mix(in oklch, var(--primary) 28%, transparent),
        transparent 70%
      );
      animation: drift 7s ease-in-out infinite alternate;
    }

    @property --x {
      syntax: '<percentage>';
      inherits: false;
      initial-value: 30%;
    }

    @keyframes drift {
      to {
        --x: 75%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .spotlight {
        animation: none;
      }
    }
  `,
})
export class BlockMini {
  protected readonly people = ['AR', 'MK', 'JT', 'SL'];
}
