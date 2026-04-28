// Single-file components
import buttonSource from '../../../../projects/volt/src/lib/components/button/button.ts?raw';
import badgeSource from '../../../../projects/volt/src/lib/components/badge/badge.ts?raw';
import cardSource from '../../../../projects/volt/src/lib/components/card/card.component.ts?raw';
import checkboxSource from '../../../../projects/volt/src/lib/components/checkbox/checkbox.component.ts?raw';
import inputSource from '../../../../projects/volt/src/lib/components/input/input.component.ts?raw';
import progressSource from '../../../../projects/volt/src/lib/components/progress/progress.ts?raw';
import separatorSource from '../../../../projects/volt/src/lib/components/separator/separator.component.ts?raw';
import sliderSource from '../../../../projects/volt/src/lib/components/slider/slider.ts?raw';
import switchSource from '../../../../projects/volt/src/lib/components/switch/switch.component.ts?raw';
import textareaSource from '../../../../projects/volt/src/lib/components/textarea/textarea.ts?raw';
import toggleSource from '../../../../projects/volt/src/lib/components/toggle/toggle.ts?raw';

// Multi-file components
import accordionSource from '../../../../projects/volt/src/lib/components/accordion/accordion.component.ts?raw';
import accordionItemSource from '../../../../projects/volt/src/lib/components/accordion/accordion-item.component.ts?raw';
import accordionTriggerSource from '../../../../projects/volt/src/lib/components/accordion/accordion-trigger.component.ts?raw';
import accordionContentSource from '../../../../projects/volt/src/lib/components/accordion/accordion-content.component.ts?raw';

import avatarSource from '../../../../projects/volt/src/lib/components/avatar/avatar.ts?raw';
import avatarImageSource from '../../../../projects/volt/src/lib/components/avatar/avatar-image.ts?raw';
import avatarFallbackSource from '../../../../projects/volt/src/lib/components/avatar/avatar-fallback.ts?raw';

import breadcrumbsSource from '../../../../projects/volt/src/lib/components/breadcrumbs/breadcrumbs.ts?raw';
import breadcrumbsItemSource from '../../../../projects/volt/src/lib/components/breadcrumbs/breadcrumbs-item.ts?raw';
import breadcrumbsLinkSource from '../../../../projects/volt/src/lib/components/breadcrumbs/breadcrumbs-link.ts?raw';
import breadcrumbsListSource from '../../../../projects/volt/src/lib/components/breadcrumbs/breadcrumbs-list.ts?raw';
import breadcrumbsPageSource from '../../../../projects/volt/src/lib/components/breadcrumbs/breadcrumbs-page.ts?raw';
import breadcrumbsSeparatorSource from '../../../../projects/volt/src/lib/components/breadcrumbs/breadcrumbs-separator.ts?raw';
import breadcrumbsEllipsisSource from '../../../../projects/volt/src/lib/components/breadcrumbs/breadcrumbs-ellipsis.ts?raw';

import dropdownMenuSource from '../../../../projects/volt/src/lib/components/dropdown-menu/dropdown-menu.ts?raw';
import dropdownMenuTriggerSource from '../../../../projects/volt/src/lib/components/dropdown-menu/dropdown-menu-trigger.ts?raw';
import dropdownMenuItemSource from '../../../../projects/volt/src/lib/components/dropdown-menu/dropdown-menu-item.ts?raw';
import dropdownMenuLabelSource from '../../../../projects/volt/src/lib/components/dropdown-menu/dropdown-menu-label.ts?raw';
import dropdownMenuSeparatorSource from '../../../../projects/volt/src/lib/components/dropdown-menu/dropdown-menu-separator.ts?raw';

import navigationMenuSource from '../../../../projects/volt/src/lib/components/navigation-menu/navigation-menu.ts?raw';
import navigationMenuListSource from '../../../../projects/volt/src/lib/components/navigation-menu/navigation-menu-list.ts?raw';
import navigationMenuItemSource from '../../../../projects/volt/src/lib/components/navigation-menu/navigation-menu-item.ts?raw';
import navigationMenuTriggerSource from '../../../../projects/volt/src/lib/components/navigation-menu/navigation-menu-trigger.ts?raw';
import navigationMenuContentSource from '../../../../projects/volt/src/lib/components/navigation-menu/navigation-menu-content.ts?raw';
import navigationMenuLinkSource from '../../../../projects/volt/src/lib/components/navigation-menu/navigation-menu-link.ts?raw';
import navigationMenuContentItemSource from '../../../../projects/volt/src/lib/components/navigation-menu/navigation-menu-content-item.ts?raw';

import popoverTriggerSource from '../../../../projects/volt/src/lib/components/popover/popover-trigger.ts?raw';
import popoverContentSource from '../../../../projects/volt/src/lib/components/popover/popover-content.ts?raw';

import radioGroupSource from '../../../../projects/volt/src/lib/components/radio/radio-group.ts?raw';
import radioItemSource from '../../../../projects/volt/src/lib/components/radio/radio-item.ts?raw';

import selectSource from '../../../../projects/volt/src/lib/components/select/select.component.ts?raw';
import selectContentSource from '../../../../projects/volt/src/lib/components/select/select-content.component.ts?raw';
import selectItemSource from '../../../../projects/volt/src/lib/components/select/select-item.component.ts?raw';
import selectLabelSource from '../../../../projects/volt/src/lib/components/select/select-label.component.ts?raw';
import selectSeparatorSource from '../../../../projects/volt/src/lib/components/select/select-separator.component.ts?raw';

import tabsSource from '../../../../projects/volt/src/lib/components/tabs/tabs.component.ts?raw';
import tabsListSource from '../../../../projects/volt/src/lib/components/tabs/tabs-list.component.ts?raw';
import tabsTriggerSource from '../../../../projects/volt/src/lib/components/tabs/tabs-trigger.component.ts?raw';
import tabsContentSource from '../../../../projects/volt/src/lib/components/tabs/tabs-content.component.ts?raw';

import tooltipSource from '../../../../projects/volt/src/lib/components/tooltip/tooltip.ts?raw';
import tooltipContentSource from '../../../../projects/volt/src/lib/components/tooltip/tooltip-content.ts?raw';

function join(...parts: [filename: string, source: string][]): string {
  return parts.map(([filename, source]) => `// ${filename}\n${source}`).join('\n\n');
}

export const BUTTON_SNIPPET = buttonSource;
export const BADGE_SNIPPET = badgeSource;
export const CARD_SNIPPET = cardSource;
export const CHECKBOX_SNIPPET = checkboxSource;
export const INPUT_SNIPPET = inputSource;
export const PROGRESS_SNIPPET = progressSource;
export const SEPARATOR_SNIPPET = separatorSource;
export const SLIDER_SNIPPET = sliderSource;
export const SWITCH_SNIPPET = switchSource;
export const TEXTAREA_SNIPPET = textareaSource;
export const TOGGLE_SNIPPET = toggleSource;

export const ACCORDION_SNIPPET = join(
  ['accordion.component.ts', accordionSource],
  ['accordion-item.component.ts', accordionItemSource],
  ['accordion-trigger.component.ts', accordionTriggerSource],
  ['accordion-content.component.ts', accordionContentSource]
);

export const AVATAR_SNIPPET = join(
  ['avatar.ts', avatarSource],
  ['avatar-image.ts', avatarImageSource],
  ['avatar-fallback.ts', avatarFallbackSource]
);

export const BREADCRUMBS_SNIPPET = join(
  ['breadcrumbs.ts', breadcrumbsSource],
  ['breadcrumbs-list.ts', breadcrumbsListSource],
  ['breadcrumbs-item.ts', breadcrumbsItemSource],
  ['breadcrumbs-link.ts', breadcrumbsLinkSource],
  ['breadcrumbs-page.ts', breadcrumbsPageSource],
  ['breadcrumbs-separator.ts', breadcrumbsSeparatorSource],
  ['breadcrumbs-ellipsis.ts', breadcrumbsEllipsisSource]
);

export const DROPDOWN_MENU_SNIPPET = join(
  ['dropdown-menu.ts', dropdownMenuSource],
  ['dropdown-menu-trigger.ts', dropdownMenuTriggerSource],
  ['dropdown-menu-item.ts', dropdownMenuItemSource],
  ['dropdown-menu-label.ts', dropdownMenuLabelSource],
  ['dropdown-menu-separator.ts', dropdownMenuSeparatorSource]
);

export const NAVIGATION_MENU_SNIPPET = join(
  ['navigation-menu.ts', navigationMenuSource],
  ['navigation-menu-list.ts', navigationMenuListSource],
  ['navigation-menu-item.ts', navigationMenuItemSource],
  ['navigation-menu-trigger.ts', navigationMenuTriggerSource],
  ['navigation-menu-content.ts', navigationMenuContentSource],
  ['navigation-menu-link.ts', navigationMenuLinkSource],
  ['navigation-menu-content-item.ts', navigationMenuContentItemSource]
);

export const POPOVER_SNIPPET = join(
  ['popover-trigger.ts', popoverTriggerSource],
  ['popover-content.ts', popoverContentSource]
);

export const RADIO_SNIPPET = join(
  ['radio-group.ts', radioGroupSource],
  ['radio-item.ts', radioItemSource]
);

export const SELECT_SNIPPET = join(
  ['select.component.ts', selectSource],
  ['select-content.component.ts', selectContentSource],
  ['select-item.component.ts', selectItemSource],
  ['select-label.component.ts', selectLabelSource],
  ['select-separator.component.ts', selectSeparatorSource]
);

export const TABS_SNIPPET = join(
  ['tabs.component.ts', tabsSource],
  ['tabs-list.component.ts', tabsListSource],
  ['tabs-trigger.component.ts', tabsTriggerSource],
  ['tabs-content.component.ts', tabsContentSource]
);

export const TOOLTIP_SNIPPET = join(
  ['tooltip.ts', tooltipSource],
  ['tooltip-content.ts', tooltipContentSource]
);
