export { VoltToast } from './toast';
export { toastVariants, type ToastVariants } from './variants';
export { VoltToastTitle } from './toast-title';
export { VoltToastDescription } from './toast-description';
export { VoltToastClose } from './toast-close';
export {
  VoltToastService,
  provideVoltToast,
  type VoltToastConfig,
  type VoltToastOptions,
  type VoltToastPlacement,
  type VoltToastRef,
  type VoltToastTemplateOptions,
  type VoltToastVariant,
} from './toast-service';

/**
 * Low-level ng-primitives toast APIs, kept for 1.x compatibility. Prefer `VoltToastService` and
 * `provideVoltToast()`, which cover the same ground without exposing ng-primitives types.
 */
export { NgpToastManager, provideToastConfig } from 'ng-primitives/toast';
