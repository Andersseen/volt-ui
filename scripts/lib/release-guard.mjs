/**
 * Decides whether a Release workflow run may publish. Pure: the workflow script feeds it facts.
 *
 * Publication only follows validated CI on this repository's own main:
 *   - the CI run is from this repository (a fork's branch called "main" does not count),
 *   - on the branch main, from a trusted event (never a pull request),
 *   - it concluded successfully,
 *   - and its commit is still the tip of main - a stale run never publishes an older artifact
 *     because a newer commit has its own CI and its own Release run.
 * A manual dispatch gets no shortcut: it must run on main at a commit that already has a
 * successful CI run.
 */

export const TRUSTED_CI_EVENTS = ['push', 'workflow_dispatch', 'schedule'];

/** @returns {{ verdict: 'allow'|'skip'|'deny', sha?: string, reason: string }} */
export function evaluateTrigger({
  eventName,
  repository,
  ref,
  sha,
  tipSha,
  workflowRun,
  ciRunsForSha = [],
}) {
  const deny = reason => ({ verdict: 'deny', reason });

  let candidate;
  if (eventName === 'workflow_run') {
    const run = workflowRun;
    if (!run) return deny('workflow_run event without a run payload');
    if (run.head_repository?.full_name !== repository) {
      return deny(`CI ran in ${run.head_repository?.full_name}, not in ${repository}`);
    }
    if (run.head_branch !== 'main') return deny(`CI ran on "${run.head_branch}", not on main`);
    if (!TRUSTED_CI_EVENTS.includes(run.event)) {
      return deny(`CI was triggered by "${run.event}", which may not publish`);
    }
    if (run.path && !run.path.endsWith('.github/workflows/ci.yml')) {
      return deny(`triggering workflow is ${run.path}, not ci.yml`);
    }
    if (run.conclusion !== 'success') return deny(`CI concluded "${run.conclusion}"`);
    candidate = run.head_sha;
  } else if (eventName === 'workflow_dispatch') {
    if (ref !== 'refs/heads/main') return deny(`manual release must run on main, not ${ref}`);
    const validated = ciRunsForSha.some(
      run =>
        run.head_sha === sha &&
        run.head_branch === 'main' &&
        run.head_repository?.full_name === repository &&
        TRUSTED_CI_EVENTS.includes(run.event) &&
        run.conclusion === 'success'
    );
    if (!validated)
      return deny(`no successful CI run on main for ${sha?.slice(0, 8)}; run CI first`);
    candidate = sha;
  } else {
    return deny(`event "${eventName}" may not publish`);
  }

  if (!/^[0-9a-f]{40}$/.test(candidate ?? ''))
    return deny('the validated commit is not a full SHA');
  if (candidate !== tipSha) {
    return {
      verdict: 'skip',
      reason: `${candidate.slice(0, 8)} is no longer the tip of main (${tipSha?.slice(0, 8)}); the newer commit has its own CI and Release run`,
    };
  }
  return { verdict: 'allow', sha: candidate, reason: 'validated CI on the tip of main' };
}
