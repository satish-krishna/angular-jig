#!/usr/bin/env node

import { logFiring } from './_hook-log.mjs';

const PROTECTED = [
  'stylelint.config.mjs',
  'eslint.config.mjs',
  'harness/',
  '.claude/hooks/',
  '.claude/skills/',
  '.claude/settings.json',
  '.claude/settings.local.json',
  '.agents/skills/',
  'components.json',
  'experiments/',
  'package.json',
  'tsconfig.json',
  'tsconfig.app.json',
  '.mcp.json',
];

const DENY_MESSAGE =
  'Enforcement configuration is not editable.\n\n' +
  'This path defines or enforces the project constitution, or measures conformance to it:\n' +
  '  stylelint.config.mjs, eslint.config.mjs, harness/, .claude/hooks/, .claude/skills/,\n' +
  '  .agents/skills/, components.json\n\n' +
  'If a rule is blocking you, the answer is to change the code so it passes, not to change\n' +
  'the rule so it stops asking. If you believe the rule itself is wrong, say so in your final\n' +
  'response and explain why; do not edit it.\n';

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
  process.stderr.write('protect-enforcement: could not parse hook payload; failing closed.\n');
  process.exit(2);
}

const norm = (p) => String(p).replaceAll('\\', '/').replace(/^\.\//, '');

// A path is protected if it IS a protected entry or sits under a protected dir.
// Compared on the tail as well as the whole string, so an absolute path such as
// D:/Repos/angular-jig/harness/gate/index.mjs still matches `harness/`.
function hitsProtected(pathish) {
  const p = norm(pathish);
  return PROTECTED.filter((entry) =>
    entry.endsWith('/')
      ? p === entry.slice(0, -1) || p.includes(entry)
      : p === entry || p.endsWith(`/${entry}`),
  );
}

const toolName = payload.tool_name ?? '';
const input = payload.tool_input ?? {};
let hits = [];

if (toolName === 'Bash' || toolName === 'PowerShell') {
  // A shell command can rewrite a file without ever naming a file-editing tool.
  // Scan the command text for any protected path. This is deliberately blunt:
  // a read-only `cat harness/sealing-spec.md` is denied too, which costs the
  // agent nothing (it can read the specs through Read) and removes the need to
  // parse shell grammar correctly to stay safe.
  const cmd = norm(input.command ?? '');
  hits = PROTECTED.filter((entry) => cmd.includes(entry));
  if (hits.length) {
    // Allow the read-only shapes the harness itself needs, so the agent can run
    // the checks it is told to run. Anything that could write is still denied.
    const readOnly = /^\s*(npm run (check:responsive|test:harness|count|lint|build)|npx vitest|node harness\/counter\/[a-z-]+\.mjs)\b/;
    // Tested against the NORMALIZED command, not the raw one. Otherwise the
    // Windows path form (`node harness\counter\counter.mjs`) is denied while the
    // forward-slash form is allowed, an inconsistency no caller could predict.
    if (readOnly.test(cmd.trim())) hits = [];
  }
} else {
  const file = input.file_path ?? input.filePath ?? input.notebook_path ?? null;
  if (file) hits = hitsProtected(file);
}

if (hits.length === 0) process.exit(0);

logFiring('protect-enforcement', hits.join(', '), [`${toolName} blocked on: ${hits.join(', ')}`]);
process.stderr.write(`${DENY_MESSAGE}\nBlocked: ${toolName} touching ${hits.join(', ')}\n`);
process.exit(2);
