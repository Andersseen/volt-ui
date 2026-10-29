/**
 * One entry of a site's primary navigation, already translated and localized by the app.
 *
 * `path` is a route in this application; `href` an absolute URL on the sibling site (the docs and
 * Volt UI Recipes link to each other). Exactly one of the two is set.
 */
export interface SiteNavLink {
  readonly label: string;
  readonly path?: string;
  readonly href?: string;
  /** Active only on an exact match (the home link). */
  readonly exact?: boolean;
  /** The one call-out per site (Create Theme, Components): tinted, with an optional badge. */
  readonly highlight?: boolean;
  readonly badge?: string;
}
