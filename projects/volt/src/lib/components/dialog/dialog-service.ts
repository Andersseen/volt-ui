import {
  inject,
  Injectable,
  type Injector,
  type TemplateRef,
  type Type,
  type ViewContainerRef,
} from '@angular/core';
import { NgpDialogManager, type NgpDialogRef } from 'ng-primitives/dialog';

export type VoltDialogRole = 'dialog' | 'alertdialog';

export interface VoltDialogOptions<T = unknown> {
  /** Available to the content as `ref.data` (template) or `injectDialogRef().data` (component). */
  data?: T;
  /** `alertdialog` for confirmations that interrupt the user. Defaults to `dialog`. */
  role?: VoltDialogRole;
  /** Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Close when the overlay (`voltDialogOverlay`) is clicked. Defaults to `true`. */
  closeOnClick?: boolean;
  /** Close on router navigation and browser back/forward. */
  closeOnNavigation?: boolean;
  /** Unique dialog id. Generated when omitted. */
  id?: string;
  /** Injector for component content. Defaults to the application injector. */
  injector?: Injector;
  /**
   * Where to attach the dialog when the app has no bootstrapped root component (Angular
   * Elements, tests). Ignored otherwise: dialogs attach to the root so they outlive their opener.
   */
  viewContainerRef?: ViewContainerRef;
}

/**
 * Template context of dialog content. Declare `let-close="close"` to get the close function.
 */
export interface VoltDialogContext<R = unknown> {
  close: (result?: R) => void;
}

/** Handle to an open dialog. */
export class VoltDialogRef<R = unknown> {
  /** Resolves with the result passed to `close()` (or `undefined`) once the dialog is closed. */
  readonly closed: Promise<R | undefined>;

  constructor(private readonly ref: NgpDialogRef<unknown, R>) {
    this.closed = new Promise(resolve => {
      ref.closed.subscribe(({ result }) => resolve(result));
    });
  }

  get id(): string {
    return this.ref.id;
  }

  close(result?: R): Promise<void> {
    return this.ref.close(result);
  }
}

/**
 * Opens dialogs without a trigger element — from a keyboard shortcut, a table row action or
 * application state. Content is the same markup a `[voltDialog]` template uses:
 *
 * ```html
 * <ng-template #confirm let-close="close">
 *   <div voltDialogOverlay></div>
 *   <div voltDialogContent role="alertdialog">
 *     <h2 voltDialogTitle>Delete project?</h2>
 *     <button voltButton (click)="close(true)">Delete</button>
 *   </div>
 * </ng-template>
 * ```
 *
 * ```ts
 * const confirmed = await this.dialog.open<boolean>(this.confirm(), { role: 'alertdialog' }).closed;
 * ```
 *
 * Focus moves into the dialog and returns to the element that had it when `open()` was called.
 * For state-driven dialogs, `<ng-template voltDialogRoot [(open)]="…">` wraps this service.
 */
@Injectable({ providedIn: 'root' })
export class VoltDialogService {
  private readonly manager = inject(NgpDialogManager);

  open<R = unknown, T = unknown>(
    content: TemplateRef<VoltDialogContext<R>> | Type<unknown>,
    options: VoltDialogOptions<T> = {}
  ): VoltDialogRef<R> {
    const ref = this.manager.open(content as TemplateRef<never>, {
      ...options,
      data: options.data as T,
    }) as NgpDialogRef<unknown, R>;

    return new VoltDialogRef<R>(ref);
  }

  /** Closes every open dialog, innermost first. */
  closeAll(): void {
    this.manager.closeAll();
  }
}
