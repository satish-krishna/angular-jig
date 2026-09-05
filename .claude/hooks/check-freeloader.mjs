#!/usr/bin/env node

import { ESLint } from 'eslint';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';
import freeloader from '../../harness/gate/freeloader-index.mjs';
import { logFiring } from './_hook-log.mjs';

const hookDir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(hookDir, '..', '..');

const config = [
  { ignores: ['dist/**', '.angular/**', 'node_modules/**', 'coverage/**', 'libs/**'] },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser, parserOptions: { project: false } },
    processor: angular.processInlineTemplates,
    linterOptions: { noInlineConfig: true },
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { freeloader },
    linterOptions: { noInlineConfig: true },
    rules: {
      'freeloader/no-legacy-control-flow': 'error',
      'freeloader/no-ng-class-style': 'error',
    },
  },
];

async function main() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.stderr.write('check-freeloader: could not parse hook payload; failing closed.\n');
    process.exit(2);
  }

  const file = payload.tool_input?.file_path ?? payload.tool_input?.filePath ?? null;
  if (!file) process.exit(0);
  const normalized = String(file).replaceAll('\\', '/');
  if (!/\.(html|ts)$/.test(normalized)) process.exit(0);
  if (!/(^|\/)src\//.test(normalized)) process.exit(0);

  const messages = [];
  try {
    const eslint = new ESLint({ cwd: ROOT, overrideConfigFile: true, overrideConfig: config });
    const results = await eslint.lintFiles([file]);
    for (const r of results) {
      for (const m of r.messages) {
        if (m.severity === 2) messages.push(`${normalized}:${m.line}:${m.column}  ${m.message}`);
      }
    }
  } catch (err) {
    process.stderr.write(`check-freeloader: eslint failed (${err?.message ?? err}).\n`);
    process.exit(2);
  }

  if (messages.length === 0) process.exit(0);

  logFiring('freeloader', normalized, messages);

  process.stderr.write(
    `Template modernity gate blocked this edit: ${messages.length} violation(s).\n` +
      messages.map((m) => `  ${m}`).join('\n') +
      `\n\nUse native control flow and bindings (Angular's CLAUDE.md). The documented shape:\n` +
      `  Good: @if (x) {} / @for (h of xs; track h.id) {}   [class.active]="isActive()"   [style.width.px]="w()"\n` +
      `  Bad:  *ngIf / *ngFor / *ngSwitch   [ngClass]="..."   [ngStyle]="..."\n` +
      `Fix the above before continuing.\n`,
  );
  process.exit(2);
}

main();
