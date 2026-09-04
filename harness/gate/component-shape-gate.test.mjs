import { describe, it, expect } from 'vitest';
import { Linter } from 'eslint';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';
import shape from './component-shape-index.mjs';
import { countTsSource, countTemplateSource } from '../counter/component-shape-counter.mjs';

const GATED = new Set([
  'hand-set-change-detection',
  'component-subscribe',
  'template-driven-form',
  'restated-validator',
  'presentational-injects-data',
  'reactive-form',
]);

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const fx = (n) => join(repoRoot, 'harness', 'counter', 'fixtures', n);

const TS_RULES = {
  'shape/no-hand-set-change-detection': 'error',
  'shape/no-component-subscribe': 'error',
  'shape/no-forms-module': 'error',
  'shape/no-restated-validator': 'error',
  'shape/no-presentational-inject': 'error',
  'shape/no-reactive-form': 'error',
};

function lintTs(code, filename) {
  return new Linter().verify(
    code,
    {
      files: ['**/*.ts'],
      languageOptions: { parser: tseslint.parser, parserOptions: { project: false } },
      plugins: { shape },
      linterOptions: { noInlineConfig: true },
      rules: TS_RULES,
    },
    { filename },
  );
}

function lintHtml(code) {
  return new Linter().verify(
    code,
    {
      files: ['**/*.html'],
      languageOptions: { parser: angular.templateParser },
      plugins: { shape },
      linterOptions: { noInlineConfig: true },
      rules: { 'shape/no-ng-model': 'error' },
    },
    { filename: 'x.html' },
  );
}

const byId = (ms) => {
  const o = {};
  for (const m of ms) o[m.messageId] = (o[m.messageId] ?? 0) + 1;
  return o;
};

describe('component-shape gate: TS rules', () => {
  const dirty = readFileSync(fx('part3-dirty-ui.ts'), 'utf8');

  it('flags the dirty ui fixture with the exact messageId spread', () => {
    const ms = lintTs(dirty, 'src/app/ui/hero-card.ts');
    expect(ms.some((m) => m.fatal)).toBe(false);
    expect(byId(ms)).toEqual({
      handSetChangeDetection: 1,
      componentSubscribe: 1,
      formsModule: 1,
      restatedValidator: 1,
      presentationalInject: 1,
      reactiveForm: 1,
    });
  });

  it('does not flag inject when the file is not under src/app/ui/', () => {
    expect(byId(lintTs(dirty, 'src/app/heroes/hero-card.ts')).presentationalInject).toBeUndefined();
  });

  it('passes the clean fixture with zero reports', () => {
    expect(lintTs(readFileSync(fx('part3-clean.ts'), 'utf8'), 'src/app/heroes/hero-list.ts')).toEqual([]);
  });
});

describe('component-shape gate: template rule', () => {
  it('flags ngModel and passes the clean template', () => {
    expect(byId(lintHtml(readFileSync(fx('part3-dirty.html'), 'utf8')))).toEqual({ ngModel: 1 });
    expect(lintHtml(readFileSync(fx('part3-clean.html'), 'utf8'))).toEqual([]);
  });
});

describe('component-shape: gate and counter agree (anti-circularity)', () => {
  it('lands on the same gated total for the dirty ui fixture', () => {
    const dirty = readFileSync(fx('part3-dirty-ui.ts'), 'utf8');
    const gate = lintTs(dirty, 'src/app/ui/hero-card.ts').length;
    const counter = countTsSource(dirty, { file: 'src/app/ui/hero-card.ts' }).filter((v) => GATED.has(v.kind)).length;
    expect(gate).toBe(counter);
  });

  it('lands on the same total for the dirty template', () => {
    const dirty = readFileSync(fx('part3-dirty.html'), 'utf8');
    const gate = lintHtml(dirty).length;
    const counter = countTemplateSource(dirty, { file: 'd.html' }).filter((v) => GATED.has(v.kind)).length;
    expect(gate).toBe(counter);
  });
});

describe('component-shape gate: no suppression dial', () => {
  it('ignores an eslint-disable comment (noInlineConfig)', () => {
    const code = [
      "import { ChangeDetectionStrategy, Component } from '@angular/core';",
      '@Component({',
      "  selector: 'app-x',",
      '  // eslint-disable-next-line shape/no-hand-set-change-detection',
      '  changeDetection: ChangeDetectionStrategy.OnPush,',
      "  template: '',",
      '})',
      'export class X {}',
    ].join('\n');
    const ms = lintTs(code, 'src/app/x.ts');
    const errs = ms.filter((m) => m.ruleId === 'shape/no-hand-set-change-detection' && m.severity === 2);
    expect(errs).toHaveLength(1);
  });
});
