import '@angular/compiler';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Initialize Angular TestBed with zoneless change detection
import { getTestBed } from '@angular/core/testing';
import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { provideEtyma } from '@etyma/angular';
import { appI18n, LOCALES } from './src/app/i18n/i18n';
import en from './src/app/i18n/__fixtures__/en.json';
import es from './src/app/i18n/__fixtures__/es.json';
import uk from './src/app/i18n/__fixtures__/uk.json';

/**
 * A real snapshot of Glossa's catalogs, frozen at whatever `pnpm manifest`/checkout last
 * synced. Production never reads these files - see `i18n.ts`, which is remote-only - but
 * the component suite has years of specs that render real UI copy and assert on it, and
 * Etyma has no lighter-weight seam for handing a unit test synchronous, known content than
 * satisfying the same HTTP loader its production config uses. Mocking `fetch` with this
 * fixture is that seam; nothing here reaches `glossa.andersseen.dev`.
 */
const FIXTURE_CATALOGS: Readonly<Record<string, unknown>> = { en, es, uk };

const realFetch = globalThis.fetch?.bind(globalThis);

vi.stubGlobal(
  'fetch',
  vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const locale = LOCALES.find(candidate => url.endsWith(`/i18n/volt-ui/${candidate}.json`));

    if (locale !== undefined) {
      return new Response(JSON.stringify(FIXTURE_CATALOGS[locale]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (realFetch === undefined) {
      throw new Error(`Unmocked fetch in a unit test: ${url}`);
    }

    return realFetch(input, init);
  })
);

@NgModule({
  providers: [
    provideZonelessChangeDetection(),
    // Every test gets the source locale pre-loaded from the fixture above, matching the old
    // static-mode behaviour where `t()` worked the instant a component rendered.
    provideEtyma(appI18n, { initialLocale: 'en' }),
  ],
})
class ZonelessTestModule {}

getTestBed().initTestEnvironment(
  [BrowserTestingModule, ZonelessTestModule],
  platformBrowserTesting()
);

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
});

// Mock IntersectionObserver — jsdom does not implement it, and scroll-reveal directives
// construct one during afterNextRender. Without this every render that mounts one logs a
// ReferenceError to stderr. Specs that assert on observation stub their own richer version.
class IntersectionObserverMock {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

// Mock Element.prototype.getAnimations for jsdom (used by ng-primitives overlay animations)
Object.defineProperty(Element.prototype, 'getAnimations', {
  writable: true,
  configurable: true,
  value: vi.fn().mockReturnValue([]),
});
