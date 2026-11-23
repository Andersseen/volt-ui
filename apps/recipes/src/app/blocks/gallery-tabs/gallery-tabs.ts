import {
  IMAGE_LOADER,
  type ImageLoaderConfig,
  NgOptimizedImage,
  NgTemplateOutlet,
} from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { LmnImageIcon, LmnPauseIcon, LmnPlayIcon, LmnXIcon } from 'lumen-icons';
import {
  VoltButton,
  VoltDialogContent,
  VoltDialogOverlay,
  VoltDialogRoot,
  VoltDialogTitle,
  VoltNativeButton,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
  VoltToggleGroup,
  VoltToggleGroupItem,
  VoltTooltip,
  VoltTooltipContent,
} from 'volt';

interface Photo {
  /** Unsplash photo id; replace with your own. */
  readonly id: string;
  readonly title: string;
  /** CSS object-position that keeps the subject in frame when the photo is cropped. */
  readonly focus: string;
}

interface Category {
  readonly key: string;
  readonly label: string;
  readonly photos: readonly Photo[];
}

const CATEGORIES: readonly Category[] = [
  {
    key: 'land',
    label: 'Landscapes',
    photos: [
      {
        id: 'photo-1426604966848-d7adac402bff',
        title: 'A granite wall above a pine meadow',
        focus: '60% 50%',
      },
      {
        id: 'photo-1500530855697-b586d89ba3ee',
        title: 'A desert road running toward red mountains',
        focus: '50% 60%',
      },
      {
        id: 'photo-1472214103451-9374bd1c798e',
        title: 'A stone circle in a green valley at sunset',
        focus: '50% 65%',
      },
      {
        id: 'photo-1434725039720-aaad6dd32dfe',
        title: 'Grassland in the last of the evening light',
        focus: '40% 60%',
      },
    ],
  },
  {
    key: 'water',
    label: 'Water',
    photos: [
      {
        id: 'photo-1433086966358-54859d0ed716',
        title: 'A waterfall dropping through a mossy gorge',
        focus: '50% 40%',
      },
      {
        id: 'photo-1518837695005-2083093ee35b',
        title: 'Open water at first light',
        focus: '50% 50%',
      },
      {
        id: 'photo-1475924156734-496f6cac6ec1',
        title: 'A pink sunset over a rocky shore',
        focus: '50% 55%',
      },
      {
        id: 'photo-1504893524553-b855bce32c67',
        title: 'A river cutting through a canyon under grey sky',
        focus: '55% 60%',
      },
    ],
  },
  {
    key: 'forest',
    label: 'Forests',
    photos: [
      {
        id: 'photo-1441974231531-c6227db76b6e',
        title: 'A sunlit path through a tall forest',
        focus: '50% 70%',
      },
      {
        id: 'photo-1418065460487-3e41a6c84dc5',
        title: 'Fog settling over a pine forest',
        focus: '50% 45%',
      },
      {
        id: 'photo-1511497584788-876760111969',
        title: 'Peaks and pines at dusk',
        focus: '50% 55%',
      },
    ],
  },
];

/** Unsplash resizes on the fly, so NgOptimizedImage can build a real srcset from one id. */
function unsplashLoader({ src, width }: ImageLoaderConfig): string {
  return `https://images.unsplash.com/${src}?auto=format&fit=crop&q=75&w=${width ?? 1600}`;
}

/**
 * A gallery with a tab per category: a featured photo that opens full size, a caption, and
 * half-colour thumbnails that stay quiet until chosen, so the featured photo keeps the eye.
 *
 * Autoplay walks every photo and then on to the next tab, and after the last tab back to the
 * first. Under the photo there is one segment per photo, stories-style; the running segment's
 * CSS animation is the clock (`animationend` advances), so the bar and the photos never drift
 * apart. It waits while the pointer or keyboard focus is in the gallery, while it is off
 * screen, or while a photo is open, can be paused for good, and never starts under
 * `prefers-reduced-motion`.
 */
@Component({
  selector: 'app-gallery-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    NgTemplateOutlet,
    VoltButton,
    VoltDialogContent,
    VoltDialogOverlay,
    VoltDialogRoot,
    VoltDialogTitle,
    VoltNativeButton,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
    VoltToggleGroup,
    VoltToggleGroupItem,
    VoltTooltip,
    VoltTooltipContent,
    LmnImageIcon,
    LmnPauseIcon,
    LmnPlayIcon,
    LmnXIcon,
  ],
  providers: [{ provide: IMAGE_LOADER, useValue: unsplashLoader }],
  host: { class: 'block' },
  template: `
    <section
      #gallery
      class="@container bg-background px-4 py-20 @2xl:px-6 @2xl:py-24"
      aria-labelledby="gallery-tabs-title"
      (pointerenter)="hovered.set(true)"
      (pointerleave)="hovered.set(false)"
      (focusin)="focused.set(isKeyboardFocus($event))"
      (focusout)="focused.set(false)"
    >
      <div class="mx-auto max-w-6xl">
        <header class="max-w-3xl">
          <h2
            id="gallery-tabs-title"
            class="text-balance text-3xl font-bold tracking-tight @2xl:text-5xl"
          >
            From the field
          </h2>
          <p class="mt-4 text-base leading-relaxed text-muted-foreground @2xl:text-lg">
            A few of the places we have surveyed, flown and photographed this year.
          </p>
        </header>

        <volt-tabs class="mt-8" [value]="category()" (valueChange)="selectCategory($event)">
          <volt-tabs-list class="h-auto max-w-full flex-wrap justify-start rounded-3xl p-1">
            @for (item of categories; track item.key) {
              <volt-tabs-trigger [value]="item.key" class="rounded-full px-4 py-2">
                {{ item.label }}
              </volt-tabs-trigger>
            }
          </volt-tabs-list>

          @for (item of categories; track item.key) {
            <volt-tabs-content [value]="item.key" class="mt-8">
              @if (item.key === category()) {
                <div class="grid gap-6 @4xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] @4xl:gap-8">
                  <div class="flex min-w-0 flex-col gap-3">
                    <button
                      voltButton
                      type="button"
                      variant="ghost"
                      aria-haspopup="dialog"
                      class="group relative aspect-[4/3] h-auto w-full overflow-hidden rounded-3xl bg-muted p-0 @4xl:aspect-[3/2]"
                      [attr.aria-label]="'Open photo: ' + featured().title"
                      (click)="open.set(featured())"
                    >
                      <!-- The outgoing photo stays until its fade-out ends, so the two cross-fade. -->
                      @for (layer of layers(); track layer.id) {
                        <div
                          class="slide absolute inset-0"
                          [class.leave]="layer !== featured()"
                          [class.enter-photo]="layer === featured() && changed()"
                          (animationend)="settle($event, layer)"
                        >
                          <img
                            [ngSrc]="layer.id"
                            fill
                            sizes="(min-width: 64rem) 60vw, 100vw"
                            alt=""
                            class="object-cover"
                            [style.object-position]="layer.focus"
                          />
                        </div>
                      }
                      <span
                        class="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                        aria-hidden="true"
                      >
                        <lmn-image [size]="16" />
                      </span>
                    </button>

                    <div class="flex items-center gap-3">
                      <!-- One segment per photo. The running one is the autoplay clock. -->
                      <div class="flex flex-1 gap-1.5" aria-hidden="true">
                        @for (thumb of item.photos; track thumb.id; let index = $index) {
                          <span class="segment" [class.done]="index < selected()">
                            @if (index === selected() && playing()) {
                              <span
                                class="segment-run"
                                [class.paused]="paused()"
                                (animationend)="advance()"
                              ></span>
                            }
                          </span>
                        }
                      </div>
                      <button
                        voltButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        class="size-9 shrink-0 rounded-full"
                        [voltTooltip]="tooltip"
                        [context]="playing() ? 'Pause slideshow' : 'Play slideshow'"
                        [attr.aria-label]="playing() ? 'Pause slideshow' : 'Play slideshow'"
                        (click)="playing.set(!playing())"
                      >
                        @if (playing()) {
                          <lmn-pause [size]="16" />
                        } @else {
                          <lmn-play [size]="16" />
                        }
                      </button>
                    </div>
                  </div>

                  <div class="flex flex-col gap-6">
                    <!-- Announced only when the visitor drives it; autoplay would talk every few seconds. -->
                    <div class="min-h-24" [attr.aria-live]="playing() ? 'off' : 'polite'">
                      <p class="text-sm font-semibold tabular-nums">
                        {{ pad(selected() + 1)
                        }}<span class="text-muted-foreground">
                          / {{ pad(item.photos.length) }}</span
                        >
                        <span class="ms-2 font-normal text-muted-foreground"
                          >· {{ item.label }}</span
                        >
                      </p>
                      @for (current of [featured()]; track current.id) {
                        <h3
                          class="mt-3 text-balance text-xl font-semibold leading-snug @2xl:text-2xl"
                          [class.caption-in]="changed()"
                        >
                          {{ current.title }}
                        </h3>
                      }
                    </div>

                    <!-- Declared outside volt-tabs, see the thumbnails template below. -->
                    <ng-container *ngTemplateOutlet="thumbnails" />
                  </div>
                </div>
              }
            </volt-tabs-content>
          }
        </volt-tabs>
      </div>
    </section>

    <!--
      The thumbnails are declared out here, not inside <volt-tabs>, on purpose. A Volt toggle group
      shares the roving focus of the nearest group around it, so inside the tabs its arrow keys
      would move between the tabs instead of the photos. A template takes its injector from where
      it is declared, so rendering it into the panel keeps the photos a group of their own.
    -->
    <ng-template #thumbnails>
      <!-- One photo chosen at a time; the arrow keys move between them. -->
      <volt-toggle-group
        type="single"
        [allowDeselection]="false"
        [value]="selectedValue()"
        (valueChange)="selectValue($event)"
        [attr.aria-label]="current().label + ' photos'"
        class="mt-auto grid grid-cols-4 gap-3 border-0 bg-transparent p-0 shadow-none @4xl:grid-cols-2 @4xl:gap-4"
      >
        @for (thumb of current().photos; track thumb.id; let index = $index) {
          <volt-toggle-group-item
            [value]="thumb.id"
            [aria-label]="thumb.title"
            [attr.data-chosen]="index === selected() ? '' : null"
            class="option aspect-[4/3] w-full rounded-xl @4xl:rounded-2xl [&>button]:relative [&>button]:size-full [&>button]:overflow-hidden [&>button]:rounded-[inherit] [&>button]:p-0 [&>button]:ring-offset-2 [&>button]:ring-offset-background [&>button]:data-[selected]:ring-2 [&>button]:data-[selected]:ring-foreground"
          >
            <img
              [ngSrc]="thumb.id"
              fill
              sizes="(min-width: 64rem) 20vw, 25vw"
              alt=""
              class="thumb object-cover"
              [style.object-position]="thumb.focus"
            />
          </volt-toggle-group-item>
        }
      </volt-toggle-group>
    </ng-template>

    <ng-template
      voltDialogRoot
      [open]="open() !== null"
      (closed)="open.set(null)"
      let-close="close"
    >
      <div voltDialogOverlay></div>
      <div
        voltDialogContent
        class="isolate flex min-h-[min(60svh,34rem)] w-[min(64rem,calc(100vw-2rem))] max-w-none flex-col justify-end overflow-hidden rounded-2xl border-0 bg-muted p-0"
      >
        @if (open(); as photo) {
          <!-- The dialog title already describes the photo; an alt would say it twice. -->
          <img
            [src]="url(photo.id, 1600)"
            [srcset]="srcset(photo.id)"
            sizes="min(64rem, 100vw)"
            alt=""
            class="absolute inset-0 -z-10 size-full object-cover"
            [style.object-position]="photo.focus"
          />
          <div
            class="bg-gradient-to-t from-background/90 to-background/0 px-6 pb-5 pt-16 @2xl:px-8"
          >
            <h2 voltDialogTitle class="text-lg font-bold text-foreground md:text-2xl">
              {{ photo.title }}
            </h2>
          </div>
        }
        <volt-button
          size="icon"
          variant="outline"
          class="absolute right-3 top-3 rounded-full bg-background/80 backdrop-blur-sm"
          aria-label="Close photo"
          (click)="close()"
        >
          <lmn-x [size]="16" />
        </volt-button>
      </div>
    </ng-template>

    <!-- A tooltip's context arrives as a signal, hence label(). -->
    <ng-template #tooltip let-label>
      <volt-tooltip-content>{{ label() }}</volt-tooltip-content>
    </ng-template>
  `,
  styles: `
    .segment {
      position: relative;
      flex: 1;
      height: 3px;
      overflow: hidden;
      border-radius: 999px;
      background: color-mix(in oklab, var(--foreground) 16%, transparent);
    }

    .segment.done {
      background: var(--foreground);
    }

    .segment-run {
      position: absolute;
      inset: 0;
      background: var(--foreground);
      transform-origin: left;
      animation: segment 6s linear both;
    }

    .segment-run.paused {
      animation-play-state: paused;
    }

    /* Quiet but not dead grey: half colour at rest, most of it on hover or focus, all of it
       once chosen. */
    .thumb {
      filter: grayscale(0.5);
      transition:
        filter 240ms ease,
        scale 300ms ease;
    }

    .option:hover .thumb,
    .option:focus-within .thumb {
      filter: grayscale(0.2);
    }

    .option[data-chosen] .thumb {
      filter: none;
    }

    @keyframes segment {
      from {
        transform: scaleX(0);
      }
      to {
        transform: scaleX(1);
      }
    }

    @keyframes photo-in {
      from {
        opacity: 0;
        scale: 1.04;
      }
    }

    @keyframes photo-out {
      to {
        opacity: 0;
      }
    }

    @keyframes caption-in {
      from {
        opacity: 0;
        translate: 0 8px;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .enter-photo {
        animation: photo-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .leave {
        animation: photo-out 600ms ease both;
      }

      .caption-in {
        animation: caption-in 220ms ease-out both;
      }

      .option:hover .thumb {
        scale: 1.06;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .thumb {
        transition: none;
      }
    }
  `,
})
export class GalleryTabs {
  private readonly destroyRef = inject(DestroyRef);
  private readonly gallery = viewChild.required<ElementRef<HTMLElement>>('gallery');

  protected readonly categories = CATEGORIES;
  protected readonly category = signal(CATEGORIES[0].key);
  protected readonly selected = signal(0);
  /** False until the visitor or autoplay changes photo, so the server-rendered one never fades in again. */
  protected readonly changed = signal(false);
  protected readonly open = signal<Photo | null>(null);

  protected readonly current = computed(
    () => CATEGORIES.find(item => item.key === this.category()) ?? CATEGORIES[0]
  );
  protected readonly featured = computed(
    () => this.current().photos[this.selected()] ?? this.current().photos[0]
  );
  private readonly leaving = signal<Photo | null>(null);
  protected readonly layers = computed(() => {
    const leaving = this.leaving();
    return leaving && leaving !== this.featured() ? [leaving, this.featured()] : [this.featured()];
  });
  protected readonly selectedValue = computed(() => [this.featured().id]);

  protected readonly playing = signal(false);
  protected readonly hovered = signal(false);
  protected readonly focused = signal(false);
  private readonly visible = signal(false);
  protected readonly paused = computed(
    () => this.hovered() || this.focused() || !this.visible() || this.open() !== null
  );

  private reducedMotion = true;

  protected readonly url = (id: string, width: number) => unsplashLoader({ src: id, width });
  protected readonly srcset = (id: string) =>
    [960, 1600, 2400].map(width => `${this.url(id, width)} ${width}w`).join(', ');

  constructor() {
    // Browser only: afterNextRender never runs on the server.
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        ([entry]) => this.visible.set(entry?.isIntersecting ?? false),
        { threshold: 0.35 }
      );
      observer.observe(this.gallery().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());

      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!this.reducedMotion) this.playing.set(true);
    });
  }

  /** Keyboard focus pauses autoplay; a mouse click on a thumbnail must not stop it for good. */
  protected isKeyboardFocus(event: FocusEvent): boolean {
    return event.target instanceof Element && event.target.matches(':focus-visible');
  }

  protected pad(value: number): string {
    return String(value).padStart(2, '0');
  }

  /** The next photo, or the first photo of the next tab once this one is done. */
  protected advance(): void {
    const photos = this.current().photos;
    if (this.selected() < photos.length - 1) {
      this.select(this.selected() + 1);
      return;
    }
    const next = CATEGORIES[(CATEGORIES.indexOf(this.current()) + 1) % CATEGORIES.length];
    this.selectCategory(next.key);
  }

  protected selectValue(value: readonly string[]): void {
    const index = this.current().photos.findIndex(photo => photo.id === value[0]);
    if (index >= 0) this.select(index);
  }

  protected selectCategory(value: unknown): void {
    const next = CATEGORIES.find(item => item.key === value);
    if (!next || next.key === this.category()) return;
    this.changed.set(true);
    // A new tab renders a new panel, so there is no outgoing photo to keep.
    this.leaving.set(null);
    this.category.set(next.key);
    this.selected.set(0);
  }

  protected settle(event: AnimationEvent, layer: Photo): void {
    if (event.target === event.currentTarget && layer !== this.featured()) this.leaving.set(null);
  }

  private select(index: number): void {
    if (index === this.selected()) return;
    this.changed.set(true);
    this.leaving.set(this.reducedMotion ? null : this.featured());
    this.selected.set(index);
  }
}
