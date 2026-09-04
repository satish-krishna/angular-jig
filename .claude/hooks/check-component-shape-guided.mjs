#!/usr/bin/env node
// EXPERIMENT variant of check-component-shape.mjs (Part 3). Identical rules and
// eslint config; the ONLY difference is the corrective message on exit 2, which
// hands the agent the exact signal-forms worked example instead of a prose
// reminder. This isolates one variable: does pointing the rejection at the right
// implementation move the agent from a hand-rolled form onto Angular signal-forms?
// See experiments/part3/detail-form/gate-on-guided vs gate-on.
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

const GUIDANCE = [
  '',
  'Use the house forms pattern: Angular signal-forms driven by a zod schema.',
  'Do NOT hand-roll a form with a plain signal, a manual (change) handler, and a',
  'safeParse on submit; that passes the rules but is not the pattern. Copy this exact shape:',
  '',
  '  // hero.schema.ts',
  "  import { z } from 'zod';",
  '  export const heroSchema = z.object({ name: z.string().min(1) });',
  '  export type HeroModel = z.infer<typeof heroSchema>;',
  '',
  '  // hero-detail.ts',
  "  import { form, submit, validateStandardSchema } from '@angular/forms/signals';",
  '  protected readonly model = signal<HeroModel>({ name: loadedHero.name });',
  '  protected readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroSchema));',
  '',
  '  <!-- template -->',
  '  <input hlmInput [formField]="heroForm.name" />',
  '  @for (e of heroForm.name().errors(); track e.kind) { <hlm-field-error>{{ e.message }}</hlm-field-error> }',
  '',
  "Read the house-style skill's Forms section for the full example. Fix the above before continuing.",
].join('\n');

async function main() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.stderr.write('check-component-shape-guided: could not parse hook payload; failing closed.\n');
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
    process.stderr.write(`check-component-shape-guided: eslint failed (${err?.message ?? err}).\n`);
    process.exit(2);
  }

  if (messages.length === 0) process.exit(0);

  process.stderr.write(
    `Component-shape gate blocked this edit: ${messages.length} violation(s).\n` +
      messages.map((m) => `  ${m}`).join('\n') +
      '\n' +
      GUIDANCE +
      '\n',
  );
  process.exit(2);
}

main();
