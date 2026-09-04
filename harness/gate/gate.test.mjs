import { describe, it, expect } from 'vitest';
import { Linter, ESLint } from 'eslint';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import angular from 'angular-eslint';
import seal from './index.mjs';
import { tally } from '../counter/counter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const fx = (name) => join(repoRoot, 'harness', 'counter', 'fixtures', name);

function lintHtml(code) {
  const linter = new Linter();
  return linter.verify(
    code,
    {
      files: ['**/*.html'],
      plugins: { seal },
      languageOptions: { parser: angular.templateParser },
      linterOptions: { noInlineConfig: true },
      rules: {
        'seal/no-raw-control': 'error',
        'seal/no-class-on-primitive': 'error',
        'seal/no-style-attribute': 'error',
      },
    },
    { filename: 'x.html' },
  );
}

const countByMessageId = (messages) => {
  const out = {};
  for (const m of messages) out[m.messageId] = (out[m.messageId] ?? 0) + 1;
  return out;
};

describe('sealing gate: template rules', () => {
  it('flags the dirty fixture with the exact messageId spread', () => {
    const messages = lintHtml(readFileSync(fx('dirty.html'), 'utf8'));
    expect(messages.some((m) => m.fatal)).toBe(false);
    expect(countByMessageId(messages)).toEqual({
      rawControl: 2,
      classOnPrimitive: 3,
      styleAttribute: 3,
    });
  });

  it('passes the clean fixture with zero reports', () => {
    const messages = lintHtml(readFileSync(fx('clean.html'), 'utf8'));
    expect(messages).toEqual([]);
  });

  it('agrees with the independent counter on the same fixture bytes', () => {
    // Two engines, one spec: the gate (angular-eslint parser) and the counter
    // (@angular/compiler parser) must land on the same total, or the spec is
    // encoded wrong somewhere. This is the anti-circularity cross-check.
    const gateTotal = lintHtml(readFileSync(fx('dirty.html'), 'utf8')).length;
    const counterTotal = tally([fx('dirty.html')]).totals.all;
    expect(gateTotal).toBe(counterTotal);
  });
});

describe('sealing gate: no suppression dial', () => {
  it('ignores an eslint-disable comment (noInlineConfig)', () => {
    const withDisable =
      '<!-- eslint-disable-next-line seal/no-raw-control -->\n<button>Save</button>';
    const messages = lintHtml(withDisable);
    // The rule error survives the disable comment: the escape hatch is dead.
    const errors = messages.filter((m) => m.ruleId === 'seal/no-raw-control' && m.severity === 2);
    expect(errors).toHaveLength(1);
    // And eslint declares the suppression void rather than honoring it.
    expect(messages.some((m) => /noInlineConfig/.test(m.message))).toBe(true);
  });
});

describe('sealing gate: end-to-end through the repo config', () => {
  it('seals inline templates in a .ts component via the processor', async () => {
    const eslint = new ESLint({
      cwd: repoRoot,
      overrideConfigFile: join(repoRoot, 'eslint.config.mjs'),
    });
    const results = await eslint.lintFiles([fx('dirty.component.ts')]);
    const messages = results.flatMap((r) => r.messages);
    // Inline template: <button>Inline</button> (rawControl) + style on input.
    expect(countByMessageId(messages)).toEqual({ rawControl: 1, styleAttribute: 1 });
  });
});
