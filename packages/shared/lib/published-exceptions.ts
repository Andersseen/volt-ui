/**
 * What the sites show that does NOT work with the packages npm serves today, found by
 * `pnpm check:published` and validated by it in both directions: every entry must still fail
 * against the published packages (or the check asks for its removal), and every failure must have
 * an entry (or the check fails). The pages read this list to put a version notice next to the
 * instruction, instead of handing a visitor a command that breaks.
 *
 *   commands      an install command exactly as a code panel shows it in CLI-copy mode
 *   compositions  a Recipes composition (catalog id) that does not compile, per mode
 *
 * No imports: the sites, the MCP server and Node scripts all load it.
 */
import type { DistributionMode } from './distribution';

export interface CommandException {
  /** The command as shown, e.g. `npx @voltui/cli add sidebar tooltip`. */
  readonly command: string;
  /** The release capability (release-capabilities.ts) whose absence breaks it. */
  readonly capability: string;
}

export interface CompositionException {
  readonly id: string;
  readonly mode: DistributionMode;
  readonly capability: string;
}

export const PUBLISHED_COMMAND_EXCEPTIONS: readonly CommandException[] = [];

export const PUBLISHED_COMPOSITION_EXCEPTIONS: readonly CompositionException[] = [];

/** The capability a shown command needs beyond what npm serves, or null. */
export function commandException(command: string): string | null {
  return PUBLISHED_COMMAND_EXCEPTIONS.find(e => e.command === command)?.capability ?? null;
}
