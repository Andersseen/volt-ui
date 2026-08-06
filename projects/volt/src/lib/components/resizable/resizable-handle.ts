import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  Renderer2,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'volt-resizable-handle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'relative flex shrink-0 items-center justify-center bg-border transition-colors hover:bg-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-col-resize',
    '[class.w-1]': "orientation() === 'horizontal'",
    '[class.h-full]': "orientation() === 'horizontal'",
    '[class.h-1]': "orientation() === 'vertical'",
    '[class.w-full]': "orientation() === 'vertical'",
    '[class.cursor-col-resize]': "orientation() === 'horizontal'",
    '[class.cursor-row-resize]': "orientation() === 'vertical'",
    role: 'separator',
    tabindex: '0',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'ariaValueMax()',
    '[attr.aria-valuenow]': 'currentSize()',
  },
  template: `
    @if (orientation() === 'horizontal') {
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
  /** @deprecated Use `resizingChange` instead. Removed in v1.0. */
  readonly resizing = output<boolean>();
  protected readonly currentSize = signal(50);
  protected readonly measuredMaxSize = signal(100);
  protected readonly ariaValueMax = computed(() => this.maxSize() ?? this.measuredMaxSize());

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private startX = 0;
  private startY = 0;
  private startSize = 0;
  private prevElement: HTMLElement | null = null;
  private isResizing = false;

  ngAfterViewInit(): void {
    this.syncMeasurements();
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    event.preventDefault();
    this.isResizing = true;
    this.resizingChange.emit(true);
    this.resizing.emit(true);

    this.elementRef.nativeElement.setPointerCapture?.(event.pointerId);
    this.syncMeasurements();

    if (this.orientation() === 'horizontal') {
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
      this.resizing.emit(false);
      moveUnlistener();
      upUnlistener();
      cancelUnlistener();
    };
    const upUnlistener = this.renderer.listen('document', 'pointerup', stopResizing);
    const cancelUnlistener = this.renderer.listen('document', 'pointercancel', stopResizing);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const horizontal = this.orientation() === 'horizontal';
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
      this.orientation() === 'horizontal'
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
      this.orientation() === 'horizontal' ? (parentRect?.width ?? 0) : (parentRect?.height ?? 0);
    if (measuredMax > 0) {
      this.measuredMaxSize.set(Math.round(measuredMax));
    }

    const previousRect = this.prevElement?.getBoundingClientRect();
    const measuredCurrent =
      this.orientation() === 'horizontal'
        ? (previousRect?.width ?? 0)
        : (previousRect?.height ?? 0);
    if (measuredCurrent > 0) {
      this.currentSize.set(Math.round(measuredCurrent));
    }
  }

  private setPreviousSize(size: number): void {
    if (!this.prevElement) return;

    if (this.orientation() === 'horizontal') {
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
