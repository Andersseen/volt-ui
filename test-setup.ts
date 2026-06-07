import '@angular/compiler';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Initialize Angular TestBed with zoneless change detection
import { getTestBed } from '@angular/core/testing';
import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

@NgModule({
  providers: [provideZonelessChangeDetection()],
})
class ZonelessTestModule {}

getTestBed().initTestEnvironment(
  [BrowserDynamicTestingModule, ZonelessTestModule],
  platformBrowserDynamicTesting()
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
