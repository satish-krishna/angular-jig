import { appendFileSync } from 'node:fs';

// Per-run capture of gate firings, so "did the gate fire, and what did it say"
// is a recorded fact rather than an inference. The run driver sets HOOK_LOG to a
// path outside the repo and folds the file into the run record; when HOOK_LOG is
// unset (an ordinary interactive edit), this is a no-op, so the hooks behave
// identically off-harness. Logging never throws into the gate.
export function logFiring(hook, file, messages) {
  const path = process.env.HOOK_LOG;
  if (!path) return;
  try {
    appendFileSync(
      path,
      JSON.stringify({ hook, file, count: messages.length, messages, ts: new Date().toISOString() }) + '\n',
    );
  } catch {
    // Never let logging break a gate.
  }
}
