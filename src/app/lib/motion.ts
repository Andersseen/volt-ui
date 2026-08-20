import type { MoveKeyframes } from 'angular-movement';

/**
 * The docs site's motion signature, in one place.
 *
 * `--ease-out-expo` in `src/styles.css` is the same curve: CSS transitions and
 * angular-movement animations have to decelerate identically or the page feels like two
 * different products depending on which effect happens to fire.
 */
export const MOTION = {
  /** Default animation length. Long enough to read as motion, short enough to stay out of the way. */
  duration: 520,
  /** Matches `--ease-out-expo`. */
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** Entrance length for content revealed on scroll — slightly longer, since it travels further. */
  revealDuration: 620,
  /** Gap between staggered siblings in a list or grid. */
  stagger: 70,
  /**
   * Reveals fire slightly before the element's top edge crosses the fold, so the
   * animation is already underway by the time the visitor is looking at it.
   */
  viewMargin: '0px 0px -12% 0px',
} as const;

/**
 * Shared pointer states.
 *
 * Every call to action on the site reacts identically, which is what makes the
 * interaction feel like one product rather than a pile of individually tuned effects.
 *
 * Both animate `transform`, so the target has to be a block, flex item or grid item —
 * transforms do not apply to inline boxes. Volt's custom elements (`volt-button`,
 * `volt-card`) have no display of their own, so they only qualify once a flex or grid
 * parent blockifies them.
 */
export const HOVER_LIFT: MoveKeyframes = { y: [0, -2], scale: [1, 1.02] };
export const TAP_PRESS: MoveKeyframes = { scale: [1, 0.97] };
export const HOVER_POP: MoveKeyframes = { scale: [1, 1.12], y: [0, -3] };
