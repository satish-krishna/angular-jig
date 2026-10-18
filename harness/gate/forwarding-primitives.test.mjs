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
    ['a static class attribute', '<hlm-select-trigger class="settings__select" />', /class attribute lands on the host/],
    ['an interpolated class', '<hlm-select-trigger class="a {{ b }}" />', /\[class\] binding lands only on the inner/],
    ['a [class] binding', '<hlm-select-trigger [class]="cls" />', /\[class\] binding lands only on the inner/],
    ['a [class.x] binding', '<hlm-select-trigger [class.settings__select]="on" />', /styles only the host/],
    ['an [ngClass] binding', '<hlm-select-trigger [ngClass]="{ a: on }" />', /styles only the host/],
    ['an [attr.class] binding', '<hlm-select-trigger [attr.class]="cls" />', /styles only the host/],
    ['a static class on the switch', '<hlm-switch class="settings__switch" />', /class attribute lands on the host/],
    ['a sidebar-style named attribute', '<hlm-sidebar sidebarContainerClass="app__rail" />', /sidebarContainerClass/],
    ['a sidebar-style named binding', '<hlm-sidebar [sidebarContainerClass]="rail" />', /sidebarContainerClass/],
    ['a paginated list tabListClass', '<hlm-paginated-tabs-list tabListClass="x" />', /tabListClass/],
    ['a paginated list paginationButtonClass binding', '<hlm-paginated-tabs-list [paginationButtonClass]="x" />', /paginationButtonClass/],
  ];
  it.each(dirty)('reports %s', (_label, html, why) => {
    const messages = lint(html);
    expect(messages.some((m) => m.fatal)).toBe(false);
    expect(messages.map((m) => m.messageId)).toEqual(['classOnForwardingPrimitive']);
    expect(messages[0].message).toMatch(why);
  });

  it('names what to use instead', () => {
    expect(lint('<hlm-select-trigger class="x" />')[0].message).toMatch(/`width`/);
    expect(lint('<hlm-switch class="x" />')[0].message).toMatch(/`size`/);
    expect(lint('<hlm-sidebar sidebarContainerClass="x" />')[0].message).toMatch(/`side`/);
  });

  it('passes the primitives driven through their inputs, and classes on other elements', () => {
    const clean = [
      '<hlm-select-trigger buttonId="a" width="full" size="sm" />',
      '<hlm-switch size="sm" [checked]="on" />',
      '<hlm-sidebar side="left" variant="inset" />',
      '<hlm-paginated-tabs-list />',
      '<div class="settings__row"><hlm-select class="settings__select" /></div>',
      '<hlm-sidebar-wrapper class="app__shell" />',
      '<button hlmBtn class="settings__save"></button>',
    ];
    for (const html of clean) expect(lint(html)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Drift guard. It does not depend on how an input is spelled. For every
// component in libs/ui it finds the inputs whose value lands on a class binding
// inside the component's OWN template, and requires the map to list exactly
// those inputs under the component's selector.
//
// An input "lands inward" when a member bound with [class] / [ngClass] /
// [attr.class] in the template takes it as a bare argument
// (`hlm(..., this.userClass())`). An input only read in a condition
// (`this.width() === 'full'`) picks from the primitive's own classes; it does
// not forward the consumer's, so it does not count.
//
// A second check covers the other direction: an input named or aliased
// *class (case-insensitive) that does not land inward must not exist
// unexplained, so a lookalike never passes by being ignored.
// ---------------------------------------------------------------------------
const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

/** Source of `name = ...;` (or a getter) up to its balanced end. */
function memberSource(src, name) {
  const start = src.search(new RegExp('\\b' + name + '\\s*=\\s*|\\bget\\s+' + name + '\\s*\\('));
  if (start < 0) return '';
  let depth = 0;
  let i = start;
  for (; i < src.length; i++) {
    const c = src[i];
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === ';' && depth <= 0) break;
  }
  return src.slice(start, i);
}

/** Every input of a component: the property and the template-facing name (alias or property). */
function inputsOf(src) {
  const out = [];
  const re = /(?:readonly\s+)?(\w+)\s*=\s*input(?:\.required)?\s*(?:<[^()]*?>)?\s*\(/g;
  for (const m of src.matchAll(re)) {
    const decl = memberSource(src, m[1]);
    out.push({ prop: m[1], exposed: decl.match(/alias:\s*['"]([^'"]+)['"]/)?.[1] ?? m[1] });
  }
  for (const m of src.matchAll(/@Input\(\s*(?:['"]([^'"]+)['"])?\s*\)\s*(?:set\s+)?(?:readonly\s+)?(\w+)/g)) {
    out.push({ prop: m[2], exposed: m[1] ?? m[2] });
  }
  return out;
}

function templateOf(file, src) {
  const inline = src.match(/template:\s*`([\s\S]*?)`/);
  if (inline) return inline[1];
  const url = src.match(/templateUrl:\s*['"]([^'"]+)['"]/);
  return url ? readFileSync(join(dirname(file), url[1]), 'utf8') : null;
}

export function scanComponent(file, src) {
  if (!/@Component\(/.test(src)) return null;
  const template = templateOf(file, src);
  if (template === null) return null;
  const selectorMatch = src.match(/selector:\s*['"`]([^'"`]+)['"`]/);
  if (!selectorMatch) {
    throw new Error(file + ': @Component without a string-literal selector; teach the drift scan to read it');
  }
  const selectors = selectorMatch[1].split(',').map((s) => s.trim()).filter((s) => /^[a-z][a-z0-9-]*$/.test(s));
  const inputs = inputsOf(src);
  const exprs = [...template.matchAll(/\[(?:class|ngClass|attr\.class)\]\s*=\s*"([^"]*)"/g)].map((m) => m[1]);
  const members = exprs.flatMap((e) => [...e.matchAll(/\b(\w+)\s*\(/g)].map((m) => m[1]));
  const sources = exprs.concat(members.map((name) => memberSource(src, name)));
  const inward = inputs.filter(({ prop }) => sources.some((code) => new RegExp('\\b' + prop + '\\s*\\(\\)\\s*[,)]').test(code)));
  const lookalikes = inputs.filter(({ prop, exposed }) => /class$/i.test(exposed) || /class$/i.test(prop));
  return {
    selectors,
    inward: inward.map((i) => i.exposed).sort(),
    lookalikes: lookalikes.map((i) => i.exposed).sort(),
  };
}

function scanLibs() {
  const found = {};
  const unexplained = [];
  for (const file of walk(libsUi).filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'))) {
    const r = scanComponent(file, readFileSync(file, 'utf8'));
    if (!r) continue;
    if (r.inward.length) for (const sel of r.selectors) found[sel] = r.inward;
    const stray = r.lookalikes.filter((n) => !r.inward.includes(n));
    if (stray.length) unexplained.push(file + ': ' + stray.join(', '));
  }
  return { found, unexplained };
}

describe('FORWARDING_PRIMITIVES stays in step with libs/ui', () => {
  it('lists exactly the components, and the inputs, that forward a class inward', () => {
    const listed = Object.fromEntries(
      Object.entries(FORWARDING_PRIMITIVES).map(([k, v]) => [k, [...v.inputs].sort()]),
    );
    expect(listed).toEqual(scanLibs().found);
  });

  it('finds every known forwarder, so an empty match cannot pass vacuously', () => {
    expect(Object.keys(scanLibs().found).sort()).toEqual([
      'hlm-paginated-tabs-list',
      'hlm-select-trigger',
      'hlm-sidebar',
      'hlm-switch',
    ]);
  });

  it('has no class-named input the scan cannot place', () => {
    expect(scanLibs().unexplained).toEqual([]);
  });
});

describe('the drift scan itself', () => {
  const BT = String.fromCharCode(96);
  const component = (template, members, meta = '') =>
    '@Component({ selector: "hlm-x", ' + meta + ' template: ' + BT + template + BT + ' })' + String.fromCharCode(10) +
    'export class X { ' + members + ' }';
  const f = join(libsUi, 'x', 'x.ts');

  it('sees a sidebar-style named input', () => {
    const r = scanComponent(
      f,
      component(
        '<div [class]="_c()"></div>',
        "readonly railClass = input<ClassValue>(''); _c = computed(() => hlm('a', this.railClass()));",
      ),
    );
    expect(r.inward).toEqual(['railClass']);
  });

  it('sees a component written unlike the known ones: another input name, another binding form, clsx', () => {
    const r = scanComponent(
      f,
      component(
        '<span [ngClass]="cls()"></span>',
        "readonly extra = input<string>(''); cls = computed(() => clsx('base', this.extra()));",
      ),
    );
    expect(r.inward).toEqual(['extra']);
  });

  it('reports an aliased input under its alias whatever the property is called', () => {
    const r = scanComponent(
      f,
      component(
        '<b [class]="k()"></b>',
        "readonly whatever = input<ClassValue>('', { alias: 'class' }); k = computed(() => hlm(this.whatever()));",
      ),
    );
    expect(r.inward).toEqual(['class']);
  });

  it("does not count an input used only to choose from the primitive's own classes", () => {
    const r = scanComponent(
      f,
      component(
        '<b [class]="k()"></b>',
        "readonly width = input('fit'); k = computed(() => hlm('base', this.width() === 'full' ? 'w-full' : 'w-fit'));",
      ),
    );
    expect(r.inward).toEqual([]);
  });

  it('does not count a class input that styles the host (the older upstream shape)', () => {
    const r = scanComponent(
      f,
      component(
        '<ng-content />',
        "readonly userClass = input('', { alias: 'class' }); c = computed(() => hlm('a', this.userClass()));",
        "host: { '[class]': 'c()' },",
      ),
    );
    expect(r.inward).toEqual([]);
    expect(r.lookalikes).toEqual(['class']);
  });

  it('fails loudly on a selector it cannot read', () => {
    expect(() =>
      scanComponent(f, '@Component({ selector: SEL, template: ' + BT + '<p></p>' + BT + ' }) export class Z {}'),
    ).toThrow(/selector/);
  });
});
