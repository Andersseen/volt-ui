#!/usr/bin/env node
/**
 * Release trigger guard (see scripts/lib/release-guard.mjs for the rules).
 * Reads the trigger from the environment, asks GitHub for the facts it cannot see in the payload,
 * and writes `authorized` and `sha` to $GITHUB_OUTPUT. A denied trigger fails the job; a stale one
 * is a clean skip.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { evaluateTrigger } from './lib/release-guard.mjs';

const { EVENT_NAME, REPOSITORY, REF, SHA, WORKFLOW_RUN_JSON, GITHUB_OUTPUT } = process.env;
const gh = args => JSON.parse(execFileSync('gh', ['api', ...args], { encoding: 'utf8' }));

const tip = gh([`repos/${REPOSITORY}/commits/main`]).sha;
let ciRunsForSha = [];
if (EVENT_NAME === 'workflow_dispatch') {
  ciRunsForSha = gh([
    `repos/${REPOSITORY}/actions/workflows/ci.yml/runs?head_sha=${SHA}&status=success&per_page=30`,
  ]).workflow_runs;
}

const decision = evaluateTrigger({
  eventName: EVENT_NAME,
  repository: REPOSITORY,
  ref: REF,
  sha: SHA,
  tipSha: tip,
  workflowRun: WORKFLOW_RUN_JSON ? JSON.parse(WORKFLOW_RUN_JSON) : undefined,
  ciRunsForSha,
});

console.log(`${decision.verdict}: ${decision.reason}`);
const out = line => GITHUB_OUTPUT && appendFileSync(GITHUB_OUTPUT, `${line}\n`);
out(`authorized=${decision.verdict === 'allow'}`);
if (decision.sha) out(`sha=${decision.sha}`);
if (decision.verdict === 'skip') console.log(`::notice::Release skipped: ${decision.reason}`);
if (decision.verdict === 'deny') {
  console.log(`::error::Release denied: ${decision.reason}`);
  process.exit(1);
}
