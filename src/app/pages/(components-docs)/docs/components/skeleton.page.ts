import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VoltSkeleton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { SKELETON_SNIPPET } from '../../../../lib/snippets';
import { SKELETON_USAGE } from '../../../../lib/snippets/usage';
import { SKELETON_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-skeleton-demo',
  standalone: true,
  imports: [VoltSkeleton, CodePanel, ApiReference],
  templateUrl: './skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkeletonDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly skeletonApi = SKELETON_API;
  readonly skeletonCode = SKELETON_SNIPPET;
  readonly skeletonUsage = SKELETON_USAGE;
}
