#!/usr/bin/env node
// PostToolUse applied-appearance gate (series 2, harness/bem-phase-2-gate-spec.md).
// When the agent edits a component template or stylesheet under src/, lint the
// template with the `applied` rule, which follows each class on a primitive into
// the sibling stylesheet. A stylesheet edit re-checks its sibling template,
// because changing an @apply changes what lands on the template's primitives.
//
// Self-contained, like check-layout.mjs: it builds its own eslint config and
// does not load the repo's eslint.config.mjs, so no other hook fires this rule.
// The rule is also listed in eslint.config.mjs so `npm run lint` enforces it for a
// human; .claude/settings.json registers this hook as the edit-time gate.
//
// Fails closed on an unparseable payload or an eslint failure.

import { ESLint } from 'eslint';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import angular from 'angular-eslint';
import applied from '../../harness/gate/applied-index.mjs';
import { logFiring } from './_hook-log.mjs';
import { docsPointersFor, agentGuidanceFor, formatDocPointerBlock } from './rule-docs.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const config = [
  { ignores: ['dist/**', '.angular/**', 'node_modules/**', 'coverage/**', 'libs/**'] },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { applied },
    linterOptions: { noInlineConfig: true },
    rules: { 'applied/no-applied-appearance-on-primitive': 'error' },
  },
];

async function main() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.stderr.write('check-applied-appearance: could not parse hook payload; failing closed.\n');
    process.exit(2);
  }

  const file = payload.tool_input?.file_path ?? payload.tool_input?.filePath ?? null;
  if (!file) process.exit(0);
  const normalized = String(file).replaceAll('\\', '/');
  if (!/(^|\/)src\//.test(normalized)) process.exit(0);
  let template;
  if (normalized.endsWith('.html')) template = file;
  else if (normalized.endsWith('.css')) template = String(file).replace(/\.css$/, '.html');
  else process.exit(0);
  if (!existsSync(template)) process.exit(0);

  let eslint;
  let results;
  try {
    eslint = new ESLint({ cwd: ROOT, overrideConfigFile: true, overrideConfig: config });
    results = await eslint.lintFiles([template]);
  } catch (err) {
    process.stderr.write(`check-applied-appearance: eslint failed (${err?.message ?? err}).\n`);
    process.exit(2);
  }

  const shown = String(template).replaceAll('\\', '/');
  const messages = [];
  for (const r of results) {
    for (const m of r.messages) {
      if (m.severity === 2) messages.push(`${shown}:${m.line}:${m.column}  ${m.message}`);
    }
  }
  if (messages.length === 0) process.exit(0);

  let pointers = [];
  let guidance = [];
  try {
    pointers = docsPointersFor(eslint, results);
    guidance = agentGuidanceFor(pointers);
  } catch {
    pointers = [];
    guidance = [];
  }
  logFiring('check-applied-appearance', normalized, messages, pointers.map((p) => p.ruleId));
  process.stderr.write(
    `Applied-appearance gate blocked this edit: ${messages.length} violation(s).\n` +
      messages.map((m) => `  ${m}`).join('\n') +
      '\n' +
      formatDocPointerBlock(pointers.map((p) => `  ${p.ruleId}  ->  ${p.url}`)) +
      (guidance.length ? `${guidance.join('\n\n')}\n\n` : '') +
      'Fix the above before continuing.\n',
  );
  process.exit(2);
}

main();
