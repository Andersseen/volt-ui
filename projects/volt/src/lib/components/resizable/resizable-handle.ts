import {
  AfterViewInit,
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  Injector,
  Renderer2,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { VoltResizable } from './resizable';

@Component({
  selector: 'volt-resizable-handle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'relative flex shrink-0 items-center justify-center bg-border transition-colors hover:bg-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    '[class.w-1]': "resolvedOrientation() === 'horizontal'",
    '[class.h-full]': "resolvedOrientation() === 'horizontal'",
    '[class.h-1]': "resolvedOrientation() === 'vertical'",
    '[class.w-full]': "resolvedOrientation() === 'vertical'",
    '[class.cursor-col-resize]': "resolvedOrientation() === 'horizontal'",
    '[class.cursor-row-resize]': "resolvedOrientation() === 'vertical'",
    role: 'separator',
    tabindex: '0',
    '[attr.aria-orientation]': 'resolvedOrientation()',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'ariaValueMax()',
    '[attr.aria-valuenow]': 'currentSize()',
  },
  template: `
    @if (resolvedOrientation() === 'horizontal') {
      <div class="h-4 w-1 rounded-full bg-muted-foreground/50"></div>
    } @else {
      <div class="h-1 w-4 rounded-full bg-muted-foreground/50"></div>
    }
  `,
})
export class VoltResizableHandle implements AfterViewInit {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly maxSize = input<number | undefined, unknown>(undefined, {
    transform: value =>
      value === undefined || value === null || value === '' ? undefined : numberAttribute(value),
  });
  readonly resizingChange = output<boolean>();
  protected readonly currentSize = signal(50);
  protected readonly measuredMaxSize = signal(100);
  protected readonly ariaValueMax = computed(() => this.maxSize() ?? this.measuredMaxSize());

  private readonly group = inject(VoltResizable, { optional: true });

  /**
   * The enclosing group's orientation always wins. A handle whose axis disagrees with
   * its group can only ever resize the wrong dimension, so there is no case where
   * honoring a conflicting `orientation` input would be correct. The input stays as the
   * fallback for a handle used outside a `volt-resizable` group.
   */
  protected readonly resolvedOrientation = computed(
    () => this.group?.orientation() ?? this.orientation()
  );

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);
  private startX = 0;
  private startY = 0;
  private startSize = 0;
  private prevElement: HTMLElement | null = null;
  private isResizing = false;

  ngAfterViewInit(): void {
    // getBoundingClientRect() is browser-only; ngAfterViewInit itself still runs
    // during SSR, so the initial measurement must wait for afterNextRender.
    afterNextRender(() => this.syncMeasurements(), { injector: this.injector });
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    event.preventDefault();
    this.isResizing = true;
    this.resizingChange.emit(true);

    this.elementRef.nativeElement.setPointerCapture?.(event.pointerId);
    this.syncMeasurements();

    if (this.resolvedOrientation() === 'horizontal') {
      this.startX = event.clientX;
    } else {
      this.startY = event.clientY;
    }
    this.startSize = this.currentSize();

    const moveUnlistener = this.renderer.listen('document', 'pointermove', (e: PointerEvent) =>
      this.onPointerMove(e)
    );
    const stopResizing = () => {
      this.isResizing = false;
      this.resizingChange.emit(false);
      moveUnlistener();
      upUnlistener();
      cancelUnlistener();
    };
    const upUnlistener = this.renderer.listen('document', 'pointerup', stopResizing);
    const cancelUnlistener = this.renderer.listen('document', 'pointercancel', stopResizing);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const horizontal = this.resolvedOrientation() === 'horizontal';
    const decrease = horizontal ? event.key === 'ArrowLeft' : event.key === 'ArrowUp';
    const increase = horizontal ? event.key === 'ArrowRight' : event.key === 'ArrowDown';
    if (!decrease && !increase) return;

    event.preventDefault();
    this.syncMeasurements();
    if (!this.prevElement) return;

    const nextSize = this.clampSize(this.currentSize() + (increase ? 10 : -10));
    this.setPreviousSize(nextSize);
  }

  private onPointerMove(event: PointerEvent): void {
    if (!this.isResizing || !this.prevElement) return;

    const delta =
      this.resolvedOrientation() === 'horizontal'
        ? event.clientX - this.startX
        : event.clientY - this.startY;
    const newSize = this.clampSize(this.startSize + delta);
    this.setPreviousSize(newSize);
  }

  private syncMeasurements(): void {
    const el = this.elementRef.nativeElement;
    this.prevElement = el.previousElementSibling as HTMLElement | null;
    const parentElement = el.parentElement;

    const parentRect = parentElement?.getBoundingClientRect();
    const measuredMax =
      this.resolvedOrientation() === 'horizontal'
        ? (parentRect?.width ?? 0)
        : (parentRect?.height ?? 0);
    if (measuredMax > 0) {
      this.measuredMaxSize.set(Math.round(measuredMax));
    }

    const previousRect = this.prevElement?.getBoundingClientRect();
    const measuredCurrent =
      this.resolvedOrientation() === 'horizontal'
        ? (previousRect?.width ?? 0)
        : (previousRect?.height ?? 0);
    if (measuredCurrent > 0) {
      this.currentSize.set(Math.round(measuredCurrent));
    }
  }

  private setPreviousSize(size: number): void {
    if (!this.prevElement) return;

    if (this.resolvedOrientation() === 'horizontal') {
      this.renderer.setStyle(this.prevElement, 'width', `${size}px`);
    } else {
      this.renderer.setStyle(this.prevElement, 'height', `${size}px`);
    }
    this.renderer.setStyle(this.prevElement, 'flex', 'none');
    this.currentSize.set(Math.round(size));
  }

  private clampSize(size: number): number {
    return Math.max(0, Math.min(size, this.ariaValueMax()));
  }
}
