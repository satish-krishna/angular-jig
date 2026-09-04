import { describe, it, expect } from 'vitest';
import { Linter } from 'eslint';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import angular from 'angular-eslint';
import layout from './layout-index.mjs';
import { layoutTally } from '../counter/layout-counter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const fx = (name) => join(repoRoot, 'harness', 'counter', 'fixtures', name);

function lintHtml(code) {
  const linter = new Linter();
  return linter.verify(
    code,
    {
      files: ['**/*.html'],
      plugins: { layout },
      languageOptions: { parser: angular.templateParser },
      linterOptions: { noInlineConfig: true },
      rules: {
        'layout/no-literal-value': 'error',
        'layout/no-presentation-on-raw': 'error',
      },
    },
    { filename: 'x.html' },
  );
}

const byMessageId = (messages) => {
  const out = {};
  for (const m of messages) out[m.messageId] = (out[m.messageId] ?? 0) + 1;
  return out;
};

describe('layout gate: template rules', () => {
  it('flags literal values and presentation on raw with the exact spread', () => {
    const messages = lintHtml(readFileSync(fx('layout-dirty.html'), 'utf8'));
    expect(messages.some((m) => m.fatal)).toBe(false);
    expect(byMessageId(messages)).toEqual({ literalValue: 3, presentationOnRaw: 1 });
  });

  it('passes the clean grammar template', () => {
    expect(lintHtml(readFileSync(fx('layout-clean.html'), 'utf8'))).toEqual([]);
  });

  it('agrees with the independent counter on the template surface', () => {
    // Cross-check on the same fixture bytes, excluding the counter-only
    // nested-flex heuristic and the CSS pass (which the template rules do not cover).
    const gateTotal = lintHtml(readFileSync(fx('layout-dirty.html'), 'utf8')).length;
    const t = layoutTally([fx('layout-dirty.html')]).totals;
    const counterTemplateTotal = t['literal-value'] + t['presentation-on-raw'];
    expect(gateTotal).toBe(counterTemplateTotal);
  });
});
