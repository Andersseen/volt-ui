import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltSkeleton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { SKELETON_SNIPPET } from '../../../../lib/snippets';
import { SKELETON_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-skeleton-demo',
  standalone: true,
  imports: [VoltSkeleton, CodePanel],
  templateUrl: './skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkeletonDemo {
  readonly skeletonCode = SKELETON_SNIPPET;
  readonly skeletonUsage = SKELETON_USAGE;
}
