import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VoltSidebarService {
  /** Tracks whether the sidebar is collapsed (desktop) */
  readonly isCollapsed = signal<boolean>(false);

  /** Tracks whether the sidebar is open as a slide-over (mobile) */
  readonly isMobileOpen = signal<boolean>(false);

  /** Toggles the collapsed state for desktop */
  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }

  /** Toggles the slide-over state for mobile */
  toggleMobile() {
    this.isMobileOpen.update(v => !v);
  }

  /** Explicitly sets the collapsed state */
  setCollapsed(value: boolean) {
    this.isCollapsed.set(value);
  }

  /** Explicitly sets the mobile open state */
  setMobileOpen(value: boolean) {
    this.isMobileOpen.set(value);
  }
}
