export { VoltDialog } from './dialog';
export { VoltDialogOverlay } from './dialog-overlay';
export { VoltDialogContent } from './dialog-content';
export { VoltDialogTitle } from './dialog-title';
export { VoltDialogDescription } from './dialog-description';
export { VoltDialogRoot } from './dialog-root';
export {
  VoltDialogService,
  VoltDialogRef,
  type VoltDialogContext,
  type VoltDialogOptions,
  type VoltDialogRole,
} from './dialog-service';

/**
 * Low-level ng-primitives dialog APIs, kept for 1.x compatibility. `VoltDialogService` and
 * `voltDialogRoot` cover opening dialogs without a trigger without exposing ng-primitives types.
 */
export {
  injectDialogRef,
  injectDialogState,
  NgpDialogManager,
  NgpDialogRef,
  provideDialogConfig,
  provideDialogState,
  type NgpDialogConfig,
} from 'ng-primitives/dialog';
