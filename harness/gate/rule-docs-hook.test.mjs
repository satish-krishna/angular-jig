import { describe, it, expect } from 'vitest';
import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import angular from 'angular-eslint';
import seal from './index.mjs';
import { docsPointersFor, agentGuidanceFor } from '../../.claude/hooks/rule-docs.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const config = [{
  files: ['**/*.html'],
  plugins: { seal },
  languageOptions: { parser: angular.templateParser },
  linterOptions: { noInlineConfig: true },
  rules: { 'seal/no-raw-control': 'error', 'seal/no-style-attribute': 'error' },
}];

describe('the hooks can reach a rule doc from a lint result', () => {
  it('recovers a docs pointer that no message field carries', async () => {
    const eslint = new ESLint({ cwd: repoRoot, overrideConfigFile: true, overrideConfig: config });
    const results = await eslint.lintFiles([
      join(repoRoot, 'harness', 'counter', 'fixtures', 'dirty.html'),
    ]);

    // The premise: the message itself has no url.
    expect(results[0].messages[0]).not.toHaveProperty('url');

    const pointers = docsPointersFor(eslint, results);
    expect(pointers.length).toBeGreaterThan(0);
    expect(pointers.map((p) => p.url)).toContain('harness/rules/no-raw-control.md');
  });

  it('reads the agent guidance out of the markdown, deduplicated', async () => {
    const eslint = new ESLint({ cwd: repoRoot, overrideConfigFile: true, overrideConfig: config });
    const results = await eslint.lintFiles([
      join(repoRoot, 'harness', 'counter', 'fixtures', 'dirty.html'),
    ]);
    const blocks = agentGuidanceFor(docsPointersFor(eslint, results));
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.join('\n')).toMatch(/hlmBtn/);
    expect(new Set(blocks).size).toBe(blocks.length);
  });
});
