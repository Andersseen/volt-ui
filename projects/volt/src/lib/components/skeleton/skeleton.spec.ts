import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import { VoltSkeleton } from './skeleton';

@Component({
  selector: 'app-skeleton-test-wrapper',
  imports: [VoltSkeleton],
  template: `<volt-skeleton [variant]="variant()" [width]="width()" [height]="height()" />`,
})
class SkeletonTestWrapper {
  readonly variant = input<'circle' | 'rectangle' | 'text'>('rectangle');
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');
}

describe('VoltSkeleton', () => {
  it('should render a rectangle skeleton by default', async () => {
    const { container } = await render(SkeletonTestWrapper);

    const skeleton = container.querySelector('volt-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
  });

  it('should render a circle skeleton', async () => {
    const { container } = await render(SkeletonTestWrapper, {
      componentInputs: { variant: 'circle' },
    });

    const skeleton = container.querySelector('volt-skeleton');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('should apply custom width and height', async () => {
    const { container } = await render(SkeletonTestWrapper, {
      componentInputs: { width: '4rem', height: '2rem' },
    });

    const skeleton = container.querySelector('volt-skeleton');
    expect(skeleton).toHaveStyle({ width: '4rem' });
    expect(skeleton).toHaveStyle({ height: '2rem' });
  });
});
