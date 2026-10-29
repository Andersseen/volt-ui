import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LmnCheckIcon, LmnCopyIcon, LmnRefreshCwIcon } from 'lumen-icons';
import {
  VoltButton,
  VoltCard,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSlider,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from 'volt';

export type MotionPreset = 'fade-up' | 'fade-in' | 'scale-in' | 'slide-left' | 'blur-in';
export type MotionEasing = 'ease-out' | 'ease-in-out' | 'linear';

/**
 * Where each preset starts from. The end state is always "as authored" — full opacity, no
 * transform, no filter — so a preset is one object, and both the live preview and the
 * generated CSS are read off it. They cannot disagree because there is nothing to sync.
 */
const PRESETS: Record<MotionPreset, Readonly<Record<string, string>>> = {
  'fade-up': { opacity: '0', transform: 'translateY(16px)' },
  'fade-in': { opacity: '0' },
  'scale-in': { opacity: '0', transform: 'scale(0.92)' },
  'slide-left': { opacity: '0', transform: 'translateX(24px)' },
  'blur-in': { opacity: '0', filter: 'blur(8px)' },
};

const RESTING: Readonly<Record<string, string>> = {
  opacity: '1',
  transform: 'none',
  filter: 'none',
};

const EASINGS: readonly MotionEasing[] = ['ease-out', 'ease-in-out', 'linear'];
const COPIED_FOR_MS = 1800;

/**
 * A configurator: change a setting, watch the result, copy the code that produces it.
 *
 * The settings are three signals. The preview plays them through the Web Animations API on a
 * real element, and the snippet is plain CSS generated from the same three values — so what
 * the visitor copies is exactly what they just watched, not a description of it.
 *
 * - Picking a preset or an easing replays the preview straight away; dragging the duration
 *   does not (that would restart it on every step of the drag). Replay is always there.
 * - Under `prefers-reduced-motion: reduce` nothing plays on its own; Replay still works,
 *   because the visitor asked for that motion explicitly.
 * - `element.animate` is only reached from event handlers, so server rendering never sees it.
 */
@Component({
  selector: 'app-config-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltCard,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSlider,
    VoltToggleGroup,
    VoltToggleGroupItem,
    LmnCheckIcon,
    LmnCopyIcon,
    LmnRefreshCwIcon,
  ],
  host: { class: 'block' },
  template: `
    <section class="@container bg-background px-4 py-16 @2xl:px-6 @2xl:py-24">
      <div class="mx-auto max-w-6xl">
        <h2 class="max-w-2xl text-balance text-3xl font-bold tracking-tight @3xl:text-5xl">
          {{ heading() }}
        </h2>
        <p class="mt-4 max-w-2xl text-lg text-muted-foreground">{{ description() }}</p>

        <div class="mt-12 grid gap-6 @4xl:grid-cols-2">
          <volt-card class="space-y-6 p-6">
            <div class="space-y-2">
              <p class="text-sm font-medium">Preset</p>
              <volt-select
                [value]="preset()"
                (valueChange)="choosePreset($event)"
                ariaLabel="Preset"
                class="w-full"
              >
                <volt-select-content>
                  @for (option of presets; track option) {
                    <volt-select-item [value]="option">{{ option }}</volt-select-item>
                  }
                </volt-select-content>
              </volt-select>
            </div>

            <div class="space-y-2">
              <p class="text-sm font-medium">Easing</p>
              <volt-toggle-group
                type="single"
                [allowDeselection]="false"
                [value]="[easing()]"
                (valueChange)="chooseEasing($event)"
                aria-label="Easing"
              >
                @for (option of easings; track option) {
                  <volt-toggle-group-item [value]="option" size="sm">
                    {{ option }}
                  </volt-toggle-group-item>
                }
              </volt-toggle-group>
            </div>

            <div class="space-y-3">
              <p class="text-sm font-medium tabular-nums">Duration: {{ duration() }}ms</p>
              <volt-slider
                [value]="duration()"
                (valueChange)="duration.set($event)"
                [min]="100"
                [max]="1200"
                [step]="50"
                ariaLabel="Duration in milliseconds"
              />
            </div>

            <div
              class="stage flex flex-col items-center gap-5 rounded-lg border border-border py-10"
            >
              <div
                #preview
                class="rounded-xl border border-primary/40 bg-card px-8 py-5 text-center shadow-[0_0_40px_-12px_var(--primary)]"
              >
                <p class="font-semibold">{{ preset() }}</p>
                <p class="mt-1 text-sm tabular-nums text-muted-foreground">played {{ plays() }}×</p>
              </div>
              <volt-button variant="outline" size="sm" (click)="play()">
                <lmn-refresh-cw slot="leading" [size]="14" />
                Replay
              </volt-button>
            </div>
          </volt-card>

          <volt-card class="flex flex-col overflow-hidden">
            <div class="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
              <p class="font-mono text-xs text-muted-foreground">{{ fileName() }}</p>
              <volt-button
                variant="ghost"
                size="sm"
                [aria-label]="copied() ? 'Copied' : 'Copy CSS'"
                (click)="copy()"
              >
                @if (copied()) {
                  <lmn-check slot="leading" [size]="14" class="text-success" />
                } @else {
                  <lmn-copy slot="leading" [size]="14" />
                }
                {{ copied() ? 'Copied' : 'Copy' }}
              </volt-button>
            </div>
            <pre
              class="flex-1 overflow-x-auto bg-muted/30 p-5 font-mono text-sm leading-6"
            ><code>{{ css() }}</code></pre>
          </volt-card>
        </div>
      </div>
    </section>
  `,
  styles: `
    .stage {
      background-image: radial-gradient(
        color-mix(in oklch, var(--muted-foreground) 25%, transparent) 1px,
        transparent 1px
      );
      background-size: 18px 18px;
    }
  `,
})
export class ConfigPlayground {
  readonly heading = input('Change a setting, see the motion, copy the code');
  readonly description = input(
    'This is the real animation, not a recording. The CSS is generated from the same values you are editing.'
  );
  /** The class the generated CSS targets. */
  readonly selector = input('.card');
  readonly fileName = input('card.css');

  /** The exact CSS that reached the clipboard. */
  readonly copiedCss = output<string>();

  readonly preset = signal<MotionPreset>('fade-up');
  readonly easing = signal<MotionEasing>('ease-out');
  readonly duration = signal(500);

  protected readonly presets = Object.keys(PRESETS) as MotionPreset[];
  protected readonly easings = EASINGS;
  protected readonly plays = signal(0);
  protected readonly copied = signal(false);

  protected readonly css = computed(() => {
    const name = this.preset();
    const from = Object.entries(PRESETS[name])
      .map(([property, value]) => `    ${property}: ${value};`)
      .join('\n');

    return [
      `${this.selector()} {`,
      `  animation: ${name} ${this.duration()}ms ${this.easing()} both;`,
      `}`,
      ``,
      `@keyframes ${name} {`,
      `  from {`,
      from,
      `  }`,
      `}`,
    ].join('\n');
  });

  private readonly preview = viewChild.required<ElementRef<HTMLElement>>('preview');
  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.resetTimer));
  }

  protected choosePreset(value: unknown): void {
    this.preset.set(value as MotionPreset);
    this.autoplay();
  }

  protected chooseEasing(value: readonly string[]): void {
    const next = value[0] as MotionEasing | undefined;
    if (!next) return;
    this.easing.set(next);
    this.autoplay();
  }

  /** Plays the current settings on the preview. */
  play(): void {
    const element = this.preview().nativeElement;
    // Older engines (and jsdom) have no Web Animations API; the snippet is still right.
    if (typeof element.animate === 'function') {
      const from = PRESETS[this.preset()];
      const to = Object.fromEntries(
        Object.keys(from).map(property => [property, RESTING[property]])
      );
      element.getAnimations().forEach(animation => animation.cancel());
      element.animate([from, to], { duration: this.duration(), easing: this.easing() });
    }
    this.plays.update(count => count + 1);
  }

  protected async copy(): Promise<void> {
    const css = this.css();
    try {
      await navigator.clipboard.writeText(css);
    } catch {
      return;
    }

    this.copiedCss.emit(css);
    this.copied.set(true);
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.copied.set(false), COPIED_FOR_MS);
  }

  private autoplay(): void {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.play();
  }
}
