/**
 * Layout sources, read straight off disk by Vite's `?raw` import — see `blocks.ts` for
 * why the code on the page is the code running above it rather than a copy.
 */
import { toConsumerSource } from './consumer-source';
import adminDashboardSource from '../../layouts/admin-dashboard/admin-dashboard.ts?raw';
import analyticsSource from '../../layouts/analytics/analytics.ts?raw';
import chatSource from '../../layouts/chat/chat.ts?raw';
import kanbanSource from '../../layouts/kanban/kanban.ts?raw';
import loginSource from '../../layouts/login/login.ts?raw';
import profileSource from '../../layouts/profile/profile.ts?raw';
import settingsSource from '../../layouts/settings/settings.ts?raw';
import signUpSource from '../../layouts/sign-up/sign-up.ts?raw';
import topNavSource from '../../layouts/top-nav/top-nav.ts?raw';

export const ADMIN_DASHBOARD_LAYOUT = toConsumerSource(adminDashboardSource);
export const TOP_NAV_LAYOUT = toConsumerSource(topNavSource);
export const ANALYTICS_LAYOUT = toConsumerSource(analyticsSource);
export const SETTINGS_LAYOUT = toConsumerSource(settingsSource);
export const PROFILE_LAYOUT = toConsumerSource(profileSource);
export const KANBAN_LAYOUT = toConsumerSource(kanbanSource);
export const CHAT_LAYOUT = toConsumerSource(chatSource);
export const LOGIN_LAYOUT = toConsumerSource(loginSource);
export const SIGN_UP_LAYOUT = toConsumerSource(signUpSource);
