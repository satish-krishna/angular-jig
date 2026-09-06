import { describe, it, expect } from 'vitest';
import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import angular from 'angular-eslint';
import seal from './index.mjs';
import { docsPointersFor, agentGuidanceFor } from '../../.claude/hooks/rule-docs.mjs';
import { FORMS_RULE_IDS, SHAPE_FORMS_GUIDANCE, MVVM_GUIDANCE, ICON_GUIDANCE, SUBMIT_GUIDANCE } from '../../.claude/hooks/shape-guidance.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const config = [{
  files: ['**/*.html'],
  plugins: { seal },
  languageOptions: { parser: angular.templateParser },
  linterOptions: { noInlineConfig: true },
  rules: { 'seal/no-raw-control': 'error', 'seal/no-style-attribute': 'error' },
}];

// An independent reading of a doc's '## Agent guidance' section, built by
// line-splitting rather than the regex agentGuidanceFor itself uses. Used to
// prove the extraction is correct, not merely that it matches a substring
// that also happens to appear in the doc's "Accepted form" example.
function independentAgentGuidance(mdPath) {
  const raw = readFileSync(mdPath, 'utf8').replace(/\r\n/g, '\n');
  const lines = raw.split('\n');
  const start = lines.indexOf('## Agent guidance');
  const body = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) break;
    body.push(lines[i]);
  }
  while (body.length && body[0] === '') body.shift();
  while (body.length && body[body.length - 1] === '') body.pop();
  return body.join('\n');
}

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

  it('reads the agent guidance out of the markdown, matching an independent extraction', async () => {
    const eslint = new ESLint({ cwd: repoRoot, overrideConfigFile: true, overrideConfig: config });
    const results = await eslint.lintFiles([
      join(repoRoot, 'harness', 'counter', 'fixtures', 'dirty.html'),
    ]);
    const pointers = docsPointersFor(eslint, results);
    const blocks = agentGuidanceFor(pointers);
    expect(blocks.length).toBeGreaterThan(0);

    // Independent, line-split extraction of the same docs, deduplicated the
    // same way (by body), must equal agentGuidanceFor's own output exactly -
    // not merely "contains a word that also appears in the accepted form".
    const seen = new Set();
    const expected = [];
    for (const p of pointers) {
      const body = independentAgentGuidance(join(repoRoot, p.url));
      if (!body || seen.has(body)) continue;
      seen.add(body);
      expected.push(body);
    }
    expect(blocks).toEqual(expected);
    expect(new Set(blocks).size).toBe(blocks.length);
  });

  it('collapses four rules that genuinely share one identical worked example into a single block', () => {
    // FORMS_RULE_IDS is the real case this repo relies on: four distinct
    // rules, each pointing at a doc whose '## Agent guidance' body is the
    // same signal-forms worked example, word for word.
    const pointers = [...FORMS_RULE_IDS].map((ruleId) => ({
      ruleId,
      url: `harness/rules/${ruleId.split('/').pop()}.md`,
    }));
    expect(pointers.length).toBe(4);
    const blocks = agentGuidanceFor(pointers);
    expect(blocks.length).toBe(1);
  });

  it('tolerates CRLF line endings in the doc file (a fresh checkout under core.autocrlf)', () => {
    const lfBlocks = agentGuidanceFor([{ ruleId: 'x', url: 'harness/rules/no-reactive-form.md' }]);
    expect(lfBlocks.length).toBe(1);
    expect(lfBlocks[0].length).toBeGreaterThan(0);

    const lfContent = readFileSync(join(repoRoot, 'harness', 'rules', 'no-reactive-form.md'), 'utf8');
    const crlfContent = lfContent.replace(/\n/g, '\r\n');
    const tmpRelUrl = 'harness/gate/.tmp-crlf-doc.md';
    const tmpAbsPath = join(repoRoot, tmpRelUrl);
    writeFileSync(tmpAbsPath, crlfContent);
    try {
      const crlfBlocks = agentGuidanceFor([{ ruleId: 'x', url: tmpRelUrl }]);
      expect(crlfBlocks.length).toBe(1);
      expect(crlfBlocks[0]).toBe(lfBlocks[0]);
    } finally {
      rmSync(tmpAbsPath, { force: true });
    }
  });
});

describe('shape-guidance.mjs generates its four constants from the docs', () => {
  it('SHAPE_FORMS_GUIDANCE is non-empty and names the house forms pattern', () => {
    expect(SHAPE_FORMS_GUIDANCE.length).toBeGreaterThan(0);
    expect(SHAPE_FORMS_GUIDANCE).toMatch(/validateStandardSchema/);
  });

  it('MVVM_GUIDANCE is non-empty and names the component-scoped ViewModel pattern', () => {
    expect(MVVM_GUIDANCE.length).toBeGreaterThan(0);
    expect(MVVM_GUIDANCE).toMatch(/HeroDetailViewModel/);
  });

  it('ICON_GUIDANCE is non-empty and names provideIcons', () => {
    expect(ICON_GUIDANCE.length).toBeGreaterThan(0);
    expect(ICON_GUIDANCE).toMatch(/provideIcons/);
  });

  it('SUBMIT_GUIDANCE is non-empty and names the one submit path', () => {
    expect(SUBMIT_GUIDANCE.length).toBeGreaterThan(0);
    expect(SUBMIT_GUIDANCE).toMatch(/submit\(this\.form/);
  });
});

describe('a hook actually writes the docs pointer to stderr, not just computes it', () => {
  it('seal-templates prints a harness/rules/*.md pointer on a real violation', () => {
    // A real subprocess run of the hook itself: a hook that computed docLines
    // and forgot to write them would pass every unit test above and still
    // fail here. The probe lives under harness/gate/, inside an ad hoc "src"
    // directory that only exists to satisfy the hook's own src/-path guard -
    // never under the project's actual src/ - and is removed in `finally`
    // regardless of test outcome.
    const probeDir = join(repoRoot, 'harness', 'gate', '.tmp-hook-probe', 'src');
    const probeRelPath = 'harness/gate/.tmp-hook-probe/src/dirty.html';
    mkdirSync(probeDir, { recursive: true });
    try {
      cpSync(join(repoRoot, 'harness', 'counter', 'fixtures', 'dirty.html'), join(probeDir, 'dirty.html'));
      const result = spawnSync(
        process.execPath,
        [join(repoRoot, '.claude', 'hooks', 'seal-templates.mjs')],
        {
          cwd: repoRoot,
          input: JSON.stringify({ tool_input: { file_path: probeRelPath } }),
          encoding: 'utf8',
        },
      );
      expect(result.status).toBe(2);
      expect(result.stderr).toMatch(/harness\/rules\/no-raw-control\.md/);
    } finally {
      rmSync(join(repoRoot, 'harness', 'gate', '.tmp-hook-probe'), { recursive: true, force: true });
    }
  });
});
