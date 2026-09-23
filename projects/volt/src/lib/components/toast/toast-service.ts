import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injectable,
  PLATFORM_ID,
  type Provider,
  type TemplateRef,
  type Type,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { injectToastContext, NgpToastManager, provideToastConfig } from 'ng-primitives/toast';
import { VoltToast } from './toast';
import { VoltToastClose } from './toast-close';
import { VoltToastDescription } from './toast-description';
import { VoltToastTitle } from './toast-title';

export type VoltToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export type VoltToastPlacement =
  'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

export interface VoltToastOptions {
  title?: string;
  description?: string;
  /** `error` is announced with `role="alert"`, every other variant with `role="status"`. */
  variant?: VoltToastVariant;
  /** Milliseconds before the toast hides itself. Defaults to the configured duration. */
  duration?: number;
  placement?: VoltToastPlacement;
  /** Shows the close button and allows swipe-to-dismiss. Defaults to `true`. */
  dismissible?: boolean;
  /** Classes for the toast, merged over the variant with `cn()`. */
  class?: string;
}

/** Options for a toast whose content you render yourself with `showTemplate()`. */
export type VoltToastTemplateOptions = Pick<VoltToastOptions, 'duration' | 'placement'>;

export interface VoltToastRef {
  dismiss(): Promise<void>;
}

export interface VoltToastConfig {
  placement: VoltToastPlacement;
  duration: number;
  /** How many toasts are visible at once per placement. */
  maxToasts: number;
  gap: number;
  offsetTop: number;
  offsetBottom: number;
  offsetLeft: number;
  offsetRight: number;
  zIndex: number;
}

/**
 * App-wide defaults for `VoltToastService`. Optional — the service works without it.
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideVoltToast({ placement: 'top-end' })] });
 * ```
 */
export function provideVoltToast(config: Partial<VoltToastConfig> = {}): Provider[] {
  return provideToastConfig(config);
}

type VoltToastContext = Required<Omit<VoltToastOptions, 'duration' | 'placement'>>;

const NOOP_REF: VoltToastRef = { dismiss: () => Promise.resolve() };

/** The toast `VoltToastService` renders. Internal: consumers pass options, not components. */
@Component({
  selector: 'volt-toast-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltToast, VoltToastTitle, VoltToastDescription, VoltToastClose],
  host: { class: 'block' },
  template: `
    <volt-toast [variant]="context.variant" [class]="context.class">
      <div class="grid min-w-0 gap-1">
        @if (context.title) {
          <volt-toast-title>{{ context.title }}</volt-toast-title>
        }
        @if (context.description) {
          <volt-toast-description>{{ context.description }}</volt-toast-description>
        }
      </div>
      @if (context.dismissible) {
        <volt-toast-close />
      }
    </volt-toast>
  `,
})
export class VoltToastMessage {
  protected readonly context = injectToastContext<VoltToastContext>();
}

/**
 * Shows Volt toasts. No setup is required; add `provideVoltToast()` only to change defaults.
 *
 * ```ts
 * private readonly toast = inject(VoltToastService);
 *
 * save() {
 *   this.toast.success('Changes saved', { description: 'Your workspace has been updated.' });
 * }
 * ```
 *
 * Call it from event handlers, not from `effect()` or on the server: toasts render into the
 * document body, so on the server every call is a no-op that returns an inert ref.
 */
@Injectable({ providedIn: 'root' })
export class VoltToastService {
  private readonly manager = inject(NgpToastManager);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  show(options: VoltToastOptions): VoltToastRef {
    if (!this.isBrowser) return NOOP_REF;

    const dismissible = options.dismissible ?? true;
    const context: VoltToastContext = {
      title: options.title ?? '',
      description: options.description ?? '',
      variant: options.variant ?? 'default',
      dismissible,
      class: options.class ?? '',
    };

    return this.manager.show(VoltToastMessage, {
      context,
      duration: options.duration,
      placement: options.placement,
      dismissible,
    });
  }

  success(title: string, options: Omit<VoltToastOptions, 'title' | 'variant'> = {}): VoltToastRef {
    return this.show({ ...options, title, variant: 'success' });
  }

  error(title: string, options: Omit<VoltToastOptions, 'title' | 'variant'> = {}): VoltToastRef {
    return this.show({ ...options, title, variant: 'error' });
  }

  warning(title: string, options: Omit<VoltToastOptions, 'title' | 'variant'> = {}): VoltToastRef {
    return this.show({ ...options, title, variant: 'warning' });
  }

  info(title: string, options: Omit<VoltToastOptions, 'title' | 'variant'> = {}): VoltToastRef {
    return this.show({ ...options, title, variant: 'info' });
  }

  /**
   * Shows custom content. The template or component must render a `<volt-toast>`; put a
   * `<volt-toast-close>` inside it to let the user dismiss it.
   */
  showTemplate(
    content: TemplateRef<void> | Type<unknown>,
    options: VoltToastTemplateOptions = {}
  ): VoltToastRef {
    if (!this.isBrowser) return NOOP_REF;

    return this.manager.show(content, options);
  }

  /** Dismisses every visible toast. */
  async dismissAll(): Promise<void> {
    await Promise.all(this.manager.toasts().map(record => this.manager.dismiss(record.instance)));
  }
}
