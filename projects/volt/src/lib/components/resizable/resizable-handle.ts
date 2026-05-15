import {
  ChangeDetectionStrategy,
  Component,
  input,
  ElementRef,
  Renderer2,
  inject,
  HostListener,
  output,
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
  },
  template: `
    @if (orientation() === 'horizontal') {
      <div class="h-4 w-1 rounded-full bg-muted-foreground/50"></div>
    } @else {
      <div class="h-1 w-4 rounded-full bg-muted-foreground/50"></div>
    }
  `,
})
export class VoltResizableHandle {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly resizing = output<boolean>();

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private startX = 0;
  private startY = 0;
  private startSize = 0;
  private prevElement: HTMLElement | null = null;
  private isResizing = false;

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    this.resizing.emit(true);

    const el = this.elementRef.nativeElement;
    this.prevElement = el.previousElementSibling as HTMLElement;

    if (this.orientation() === 'horizontal') {
      this.startX = event.clientX;
      this.startSize = this.prevElement?.getBoundingClientRect().width ?? 0;
    } else {
      this.startY = event.clientY;
      this.startSize = this.prevElement?.getBoundingClientRect().height ?? 0;
    }

    const moveUnlistener = this.renderer.listen('document', 'mousemove', (e: MouseEvent) =>
      this.onMouseMove(e)
    );
    const upUnlistener = this.renderer.listen('document', 'mouseup', () => {
      this.isResizing = false;
      this.resizing.emit(false);
      moveUnlistener();
      upUnlistener();
    });
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isResizing || !this.prevElement) return;

    let newSize: number;
    if (this.orientation() === 'horizontal') {
      const delta = event.clientX - this.startX;
      newSize = this.startSize + delta;
      this.renderer.setStyle(this.prevElement, 'width', `${newSize}px`);
      this.renderer.setStyle(this.prevElement, 'flex', 'none');
    } else {
      const delta = event.clientY - this.startY;
      newSize = this.startSize + delta;
      this.renderer.setStyle(this.prevElement, 'height', `${newSize}px`);
      this.renderer.setStyle(this.prevElement, 'flex', 'none');
    }
  }
}
