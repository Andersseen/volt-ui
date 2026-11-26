import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { VoltAlert, VoltAlertDescription } from 'volt';
import { injectAppI18n } from '../i18n/i18n';
import {
  RELEASE_CAPABILITIES,
  capabilityStatus,
  type CapabilityStatus,
  type PackageName,
} from '../lib/release-capabilities';
import { RELEASES } from '../lib/release-availability.generated';
import { Prose } from './prose';

interface Notice {
  readonly status: Exclude<CapabilityStatus, 'available'>;
  readonly pkg: PackageName;
  readonly since: string;
  readonly published: string | null;
  readonly features: string;
}

/**
 * A short notice next to documentation that describes something npm does not serve yet.
 *
 * Renders nothing once npm's `latest` (read when the site was built,
 * packages/shared/lib/release-availability.generated.ts) has every listed capability. Otherwise it
 * names the package and version that bring it, and npm's latest at build time — or, when the
 * registry was never read, says that availability could not be confirmed. The versions and code
 * labels are data; only the sentence around them is translated.
 */
@Component({
  selector: 'app-availability-note',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltAlert, VoltAlertDescription, Prose],
  template: `
    @for (notice of notices(); track notice.pkg + notice.since) {
      <volt-alert class="my-4" [attr.data-availability]="notice.status">
        <volt-alert-description>
          @if (notice.status === 'unreleased') {
            <app-prose
              [text]="
                t('ui.availability.unreleased', {
                  features: notice.features,
                  package: notice.pkg,
                  since: notice.since,
                  published: notice.published ?? '',
                })
              "
            />
          } @else {
            <app-prose
              [text]="
                t('ui.availability.unknown', {
                  features: notice.features,
                  package: notice.pkg,
                  since: notice.since,
                })
              "
            />
          }
        </volt-alert-description>
      </volt-alert>
    }
  `,
})
export class AvailabilityNote {
  protected readonly t = injectAppI18n().t;

  /** Ids from RELEASE_CAPABILITIES; an unknown id fails loudly in development and tests. */
  readonly capabilities = input.required<readonly string[]>();

  protected readonly notices = computed<readonly Notice[]>(() => {
    const groups = new Map<string, Notice & { labels: string[] }>();
    for (const id of this.capabilities()) {
      const capability = RELEASE_CAPABILITIES.find(c => c.id === id);
      if (!capability) throw new Error(`Unknown release capability "${id}"`);
      const status = capabilityStatus(capability, RELEASES);
      if (status === 'available') continue;
      const key = `${status}|${capability.package}|${capability.since}`;
      const group = groups.get(key) ?? {
        status,
        pkg: capability.package,
        since: capability.since,
        published: RELEASES[capability.package]?.published ?? null,
        features: '',
        labels: [],
      };
      group.labels.push(`\`${capability.label}\``);
      groups.set(key, group);
    }
    return [...groups.values()].map(({ labels, ...notice }) => ({
      ...notice,
      features: labels.join(', '),
    }));
  });
}
