#!/usr/bin/env node
// PostToolUse sealing gate. When the agent edits a template-bearing file under
// src/, run the sealing eslint config on it; on any violation, exit 2 and hand
// the agent a corrective message so it self-corrects. eslint-disable does not
// work (the config sets noInlineConfig), so there is no escape.
//
// This script is inert until registered as a PostToolUse hook. It is NOT wired
// into the committed .claude/settings.json, because doing so would make the gate
// always on and destroy the gate-off baseline. The run driver registers it (via
// `claude -p --settings harness/gate/gate-on.settings.json`) in the gate-on
// condition only. Present-but-unregistered in gate-off, registered in gate-on:
// that is the single variable the experiment moves.
//
// Fails closed: a payload it cannot parse exits 2 rather than waving an edit
// through, matching the repo's hook convention.

import { ESLint } from 'eslint';

async function readStdin() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  return raw;
}

const raw = await readStdin();

let payload;
try {
  payload = JSON.parse(raw);
} catch {
  process.stderr.write('seal-templates: could not parse hook payload; failing closed.\n');
  process.exit(2);
}

const input = payload.tool_input ?? {};
const file = input.file_path ?? input.filePath ?? null;

// Not a file-editing tool, or no path: nothing to gate.
if (!file) process.exit(0);

const normalized = String(file).replaceAll('\\', '/');

// Only gate the application the agent builds: template-bearing files under src/.
if (!/\.(html|ts)$/.test(normalized)) process.exit(0);
if (!/(^|\/)src\//.test(normalized)) process.exit(0);

// Claude Code runs PostToolUse hooks from the project root, so process.cwd()
// locates eslint.config.mjs and resolves the edited path reliably.
const cwd = process.cwd();

let results;
try {
  const eslint = new ESLint({ cwd });
  results = await eslint.lintFiles([file]);
} catch (err) {
  process.stderr.write(`seal-templates: eslint failed to run (${err?.message ?? err}).\n`);
  process.exit(2);
}

const errors = results
  .flatMap((r) => r.messages.map((m) => ({ ...m, filePath: r.filePath })))
  .filter((m) => m.severity === 2);

if (errors.length === 0) process.exit(0);

const lines = errors.map((m) => `  ${normalized}:${m.line}:${m.column}  ${m.message}`);
process.stderr.write(
  `Sealing gate blocked this edit: ${errors.length} violation(s).\n` +
    `${lines.join('\n')}\n\n` +
    `The primitive vocabulary is sealed (see harness/sealing-spec.md). ` +
    `Compose from spartan primitives, keep classes and inline styles off them, ` +
    `and fix the above before continuing. eslint-disable has no effect here.\n`,
);
process.exit(2);
