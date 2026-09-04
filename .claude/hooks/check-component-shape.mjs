#!/usr/bin/env node
// PostToolUse component-shape gate (Part 3). When the agent edits a component
// .ts or an .html template under src/, enforce the component-shape rules: the
// typescript-eslint rules on component classes (no hand-set changeDetection, no
// .subscribe, no FormsModule, no restated validator, no data-service inject in a
// src/app/ui/ component) and the ngModel rule on templates (including inline
// templates via processInlineTemplates). On any violation, exit 2 with a
// corrective message.
//
// Self-contained: it builds its own eslint config for the shape rules and does
// not touch the repo's eslint.config.mjs (which stays the sealing baseline), so
// these rules are enforced only when this hook is registered (gate-on). The
// counter is the independent auditor; this is the enforcement.
//
// Fails closed on an unparseable payload.

import { ESLint } from 'eslint';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';
import shape from '../../harness/gate/component-shape-index.mjs';

const hookDir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(hookDir, '..', '..');

const shapeEslintConfig = [
  { ignores: ['dist/**', '.angular/**', 'node_modules/**', 'coverage/**', 'libs/**'] },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser, parserOptions: { project: false } },
    processor: angular.processInlineTemplates,
    plugins: { shape },
    linterOptions: { noInlineConfig: true },
    rules: {
      'shape/no-hand-set-change-detection': 'error',
      'shape/no-component-subscribe': 'error',
      'shape/no-forms-module': 'error',
      'shape/no-restated-validator': 'error',
      'shape/no-presentational-inject': 'error',
      'shape/no-reactive-form': 'error',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { shape },
    linterOptions: { noInlineConfig: true },
    rules: { 'shape/no-ng-model': 'error' },
  },
];

async function main() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.stderr.write('check-component-shape: could not parse hook payload; failing closed.\n');
    process.exit(2);
  }

  const file = payload.tool_input?.file_path ?? payload.tool_input?.filePath ?? null;
  if (!file) process.exit(0);
  const normalized = String(file).replaceAll('\\', '/');
  if (!/\.(html|ts)$/.test(normalized)) process.exit(0);
  if (!/(^|\/)src\//.test(normalized)) process.exit(0);

  const messages = [];
  try {
    const eslint = new ESLint({ cwd: ROOT, overrideConfigFile: true, overrideConfig: shapeEslintConfig });
    const results = await eslint.lintFiles([file]);
    for (const r of results) {
      for (const m of r.messages) {
        if (m.severity === 2) messages.push(`${normalized}:${m.line}:${m.column}  ${m.message}`);
      }
    }
  } catch (err) {
    process.stderr.write(`check-component-shape: eslint failed (${err?.message ?? err}).\n`);
    process.exit(2);
  }

  if (messages.length === 0) process.exit(0);

  process.stderr.write(
    `Component-shape gate blocked this edit: ${messages.length} violation(s).\n` +
      messages.map((m) => `  ${m}`).join('\n') +
      `\n\nComponent shape (see harness/component-shape-spec.md): no hand-set changeDetection (OnPush is the v22 default), ` +
      `no .subscribe in a component (use the async pipe or toSignal), template-driven forms are not used (no FormsModule, no ngModel), ` +
      `validation lives in the zod schema (validateStandardSchema, not a restated per-field validator), and a presentational ` +
      `(src/app/ui/) component injects no data service. Fix the above before continuing.\n`,
  );
  process.exit(2);
}

main();
