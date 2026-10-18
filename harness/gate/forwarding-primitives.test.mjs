import { describe, it, expect } from 'vitest';
import { Linter } from 'eslint';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import angular from 'angular-eslint';
import seal from './index.mjs';
import { FORWARDING_PRIMITIVES } from './rules/forwarding-primitives.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const libsUi = join(repoRoot, 'libs', 'ui');

function lint(code) {
  return new Linter().verify(
    code,
    {
      files: ['**/*.html'],
      plugins: { seal },
      languageOptions: { parser: angular.templateParser },
      linterOptions: { noInlineConfig: true },
      rules: { 'seal/no-class-on-forwarding-primitive': 'error' },
    },
    { filename: 'x.html' },
  );
}

describe('seal/no-class-on-forwarding-primitive', () => {
  const dirty = [
    ['a static class attribute', '<hlm-select-trigger class="settings__select" />'],
    ['a [class] binding', '<hlm-select-trigger [class]="cls" />'],
    ['a [class.x] binding', '<hlm-select-trigger [class.settings__select]="on" />'],
    ['an [ngClass] binding', '<hlm-select-trigger [ngClass]="{ a: on }" />'],
    ['a static class on the switch', '<hlm-switch class="settings__switch" />'],
  ];
  it.each(dirty)('reports %s', (_label, html) => {
    const messages = lint(html);
    expect(messages.some((m) => m.fatal)).toBe(false);
    expect(messages.map((m) => m.messageId)).toEqual(['classOnForwardingPrimitive']);
  });

  it('names the inputs to use instead', () => {
    expect(lint('<hlm-select-trigger class="x" />')[0].message).toMatch(/`width`/);
    expect(lint('<hlm-switch class="x" />')[0].message).toMatch(/`size`/);
  });

  it('passes the primitives driven through their inputs, and classes on other elements', () => {
    const clean = [
      '<hlm-select-trigger buttonId="a" width="full" size="sm" />',
      '<hlm-switch size="sm" [checked]="on" />',
      '<div class="settings__row"><hlm-select class="settings__select" /></div>',
      '<button hlmBtn class="settings__save"></button>',
    ];
    for (const html of clean) expect(lint(html)).toEqual([]);
  });
});

// Drift guard. A component forwards `class` inward when it declares an input
// aliased to `class` (the Helm `userClass` pattern) and has a template. Every
// such component must be in FORWARDING_PRIMITIVES, and every entry must still
// be one, so a primitive added to libs/ui tomorrow cannot escape the rule.
const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const CLASS_INPUT = /alias:\s*['"]class['"]|@Input\(\s*['"]class['"]|\bclass\s*=\s*input\b/;

function forwardingComponents() {
  const found = [];
  for (const file of walk(libsUi).filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'))) {
    const src = readFileSync(file, 'utf8');
    if (!/@Component\(/.test(src) || !CLASS_INPUT.test(src)) continue;
    if (!/\btemplate(Url)?\s*:/.test(src)) continue;
    const selector = src.match(/selector:\s*['"`]([^'"`]+)['"`]/)?.[1];
    found.push(...selector.split(',').map((s) => s.trim()).filter((s) => /^[a-z][a-z0-9-]*$/.test(s)));
  }
  return found.sort();
}

describe('FORWARDING_PRIMITIVES stays in step with libs/ui', () => {
  it('lists exactly the components that forward their class input inward', () => {
    expect(Object.keys(FORWARDING_PRIMITIVES).sort()).toEqual(forwardingComponents());
  });

  it('the scan finds something, so an empty match cannot pass vacuously', () => {
    expect(forwardingComponents().length).toBeGreaterThan(0);
  });
});
