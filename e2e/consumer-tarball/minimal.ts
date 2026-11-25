import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { VoltNativeButton } from '@voltui/components';

/** Bundle baseline: the smallest real use of the package — one button. */
@Component({
  selector: 'app-root',
  imports: [VoltNativeButton],
  template: `<button voltButton type="button">Save</button>`,
})
class Minimal {}

bootstrapApplication(Minimal, { providers: [provideZonelessChangeDetection()] }).catch(e =>
  console.error(e)
);
