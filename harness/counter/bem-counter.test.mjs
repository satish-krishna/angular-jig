import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { bemTally, expandedTally } from './bem-counter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const STYLES = join(here, 'fixtures', 'bem', 'styles.css');
const REF = '@reference "../../styles.css";\n';

function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), 'bem-'));
  for (const [p, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), text);
  }
  return dir;
}

const ts = (stem, body = `templateUrl: './${stem}.html',\n  styleUrl: './${stem}.css',`, extra = '') =>
  `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-${stem}',\n  ${body}\n})\nexport class X {}\n${extra}`;

const triad = (stem, html, css, file = stem) => ({
  [`app/${stem}/${file}.ts`]: ts(file),
  [`app/${stem}/${file}.html`]: html,
  [`app/${stem}/${file}.css`]: css,
});

const CLEAN_HTML = [
  '<article class="hero-card" [class.hero-card--retired]="retired">',
  '  <h2 class="hero-card__name">Name</h2>',
  '  <button hlmBtn variant="ghost" class="hero-card__retire">Retire</button>',
  '</article>',
].join('\n');
const CLEAN_CSS = `${REF}\n.hero-card { @apply grid gap-4; }\n.hero-card--retired { @apply opacity-60; }\n.hero-card__name { @apply text-lg font-semibold; }\n.hero-card__retire { @apply ms-auto; }\n`;

const bem = async (files) => {
  const dir = tree(files);
  return bemTally([dir], { root: dir, styles: STYLES });
};
const expanded = (files) => {
  const dir = tree(files);
  return expandedTally([dir], { root: dir });
};

describe('bemTally', () => {
  it('counts zero on a clean triad', async () => {
    const r = await bem(triad('hero-card', CLEAN_HTML, CLEAN_CSS));
    expect(r.violations).toEqual([]);
    expect(r.totals.all).toBe(0);
  });

  it('template-utility-class: utilities in class, [class.x] and [class], sr-only included', async () => {
    const html = '<div class="hero-card flex sm:w-48 sr-only" [class.gap-2]="x" [class]="y ? \'p-2\' : \'hero-card--on\'"></div>';
    const r = await bem(triad('hero-card', html, REF));
    expect(r.totals['template-utility-class']).toBe(5);
    expect(r.totals.all).toBe(5);
  });

  it('foreign-block: another block in the template or the stylesheet', async () => {
    const r = await bem(triad('hero-card', '<div class="hero-card roster__row"></div>', `${REF}.hero-card { @apply grid; }\n.badge-lite { @apply flex; }\n`));
    expect(r.totals['foreign-block']).toBe(2);
    expect(r.violations.map((v) => v.file).sort()).toEqual(['app/hero-card/hero-card.css', 'app/hero-card/hero-card.html']);
  });

  it('maps *.component.ts to the block without the suffix', async () => {
    const files = triad('hero-card', CLEAN_HTML, CLEAN_CSS, 'hero-card.component');
    const r = await bem(files);
    expect(r.violations).toEqual([]);
  });

  it('inline-template and inline-styles, and utilities inside the inline template still count', async () => {
    const r = await bem({ 'app/tiny/tiny.ts': ts('tiny', "template: `<p class=\"flex\">x</p>`,\n  styles: [':host { display: block }'],") });
    expect(r.totals['inline-template']).toBe(1);
    expect(r.totals['inline-styles']).toBe(1);
    expect(r.totals['template-utility-class']).toBe(1);
    expect(r.totals['missing-triad']).toBe(0);
  });

  it('missing-triad: no stylesheet, and a second component in one file', async () => {
    const r = await bem({
      'app/a/a.ts': ts('a', "templateUrl: './a.html',"),
      'app/a/a.html': '<p></p>',
      'app/b/b.ts': ts('b', "templateUrl: './b.html',\n  styleUrl: './b.css',", "\n@Component({ selector: 'app-c', templateUrl: './b.html', styleUrl: './b.css' })\nexport class C {}\n"),
      'app/b/b.html': '<p></p>',
      'app/b/b.css': REF,
    });
    expect(r.totals['missing-triad']).toBe(2);
  });

  it('broken-nesting: Sass-style &__x is counted, and its utilities are not expanded', async () => {
    const css = `${REF}.hero-card {\n  @apply grid;\n  &__name { @apply bg-red-500; }\n}\n`;
    const r = await bem(triad('hero-card', CLEAN_HTML, css));
    expect(r.totals['broken-nesting']).toBe(1);
    expect(r.violations.find((v) => v.kind === 'broken-nesting')).toMatchObject({ file: 'app/hero-card/hero-card.css', line: 4 });
    expect(expanded(triad('hero-card', CLEAN_HTML, css)).layout.totals['raw-palette-color']).toBe(0);
  });

  it('missing-reference: @apply without @reference', async () => {
    const r = await bem(triad('hero-card', '<p class="hero-card"></p>', '.hero-card { @apply grid; }\n'));
    expect(r.totals['missing-reference']).toBe(1);
  });

  it('utility-in-ts: cva strings and host class, not ordinary data strings', async () => {
    const extra = [
      "const variants = { danger: 'bg-red-500 text-white', ok: 'bg-success/15' };",
      "const hero = { name: 'Dr. Nova', role: 'Tank', status: 'on-mission', flag: 'hidden' };",
      "const id = 'h-11';",
    ].join('\n');
    const r = await bem({
      ...triad('hero-card', CLEAN_HTML, CLEAN_CSS),
      'app/hero-card/hero-card.view-model.ts': `${extra}\n`,
      'app/host/host.ts': ts('host', "templateUrl: './host.html',\n  styleUrl: './host.css',\n  host: { class: 'flex gap-2' },"),
      'app/host/host.html': '<p></p>',
      'app/host/host.css': REF,
    });
    const details = r.violations.filter((v) => v.kind === 'utility-in-ts').map((v) => v.detail);
    // 'h-11' is a real utility (height) used as data: a known false positive, kept
    // visible by carrying the literal in detail rather than special-cased away.
    expect(details.sort()).toEqual(['bg-red-500 text-white', 'bg-success/15', 'h-11', 'host class: flex gap-2']);
  });

  it('ignores spec files and import paths', async () => {
    const r = await bem({
      ...triad('hero-card', CLEAN_HTML, CLEAN_CSS),
      'app/hero-card/hero-card.spec.ts': "expect(el.className).toBe('flex gap-2');\n",
      'app/x.ts': "import { a } from 'flex-gap';\nexport const b = 1;\n",
    });
    expect(r.totals.all).toBe(0);
  });

  it('utility-in-ts: host [class.x] and [class] bindings', async () => {
    const r = await bem({
      'app/host/host.ts': ts('host', "templateUrl: './host.html',\n  styleUrl: './host.css',\n  host: { '[class.bg-red-500]': 'on()', '[class.host--on]': 'on()', '[class]': \"'flex gap-2'\" },"),
      'app/host/host.html': '<p></p>',
      'app/host/host.css': REF,
    });
    const details = r.violations.filter((v) => v.kind === 'utility-in-ts').map((v) => v.detail).sort();
    expect(details).toEqual(['host [class.bg-red-500]', 'host [class]: flex gap-2']);
  });

  it('missing-triad: a template or stylesheet under app/ that no component claims', async () => {
    const r = await bem({
      ...triad('hero-card', CLEAN_HTML, CLEAN_CSS),
      'app/ext/orphan.html': '<p class="flex"></p>',
      'app/ext/orphan.css': '.x { color: red; }',
      'index.html': '<body></body>',
    });
    expect(r.violations.filter((v) => v.kind === 'missing-triad').map((v) => v.file).sort()).toEqual(['app/ext/orphan.css', 'app/ext/orphan.html']);
    expect(r.totals.all).toBe(2);
  });

  it('a component claims the files its templateUrl and styleUrl point at, whatever their stem', async () => {
    const r = await bem({
      'app/a/a.ts': ts('a', "templateUrl: './shared.html',\n  styleUrl: './a.css',"),
      'app/a/shared.html': '<p></p>',
      'app/a/a.css': REF,
    });
    expect(r.violations.map((v) => `${v.kind}:${v.file}`)).toEqual(['missing-triad:app/a/a.ts']);
  });

  it('foreign-block: a global stylesheet styling a component block', async () => {
    const files = {
      ...triad('hero-card', CLEAN_HTML, CLEAN_CSS),
      'styles.css': '@import "tailwindcss";\n:root.dark { --x: 1; }\n.hero-card__name { @apply text-gray-700; }\n',
    };
    const r = await bem(files);
    expect(r.violations.filter((v) => v.kind === 'foreign-block')).toMatchObject([{ file: 'styles.css', line: 3 }]);
    expect(r.totals.all).toBe(1);
  });

  const tsKinds = async (extra) => {
    const r = await bem({ 'app/x/x.view-model.ts': `${extra}\n` });
    return r.violations.filter((v) => v.kind === 'utility-in-ts').map((v) => v.detail);
  };

  it('utility-in-ts: computed class strings, template literals and ternaries', async () => {
    expect(await tsKinds("const a = true; const c = computed(() => `flex items-center ${a ? 'heroes__row--x' : ''}`);")).toHaveLength(1);
    expect(await tsKinds("const c = a ? 'heroes__row flex gap-2' : 'heroes__row';")).toHaveLength(1);
  });

  it('utility-in-ts: ordinary words and all-BEM strings are not class lists', async () => {
    expect(await tsKinds("const a = 'show hidden items'; const b = 'heroes__row heroes__row--x';")).toEqual([]);
  });

  it('template-utility-class: a class name built from data is a partial class name', async () => {
    const html = '<div class="hero-card hero-card__status hero-card__status--{{ s }}"></div>';
    const r = await bem(triad('hero-card', html, REF));
    const hits = r.violations.filter((v) => v.kind === 'template-utility-class');
    expect(hits).toHaveLength(1);
    expect(hits[0].detail.startsWith('partial class name:')).toBe(true);
    expect(r.totals.all).toBe(1);
  });

  it('a stylesheet with a Sass-style comment is one broken-nesting, never a throw', async () => {
    const files = triad('hero-card', CLEAN_HTML, `@reference "../../styles.css";\n// header\n.hero-card { @apply grid; }\n`);
    const r = await bem(files);
    expect(r.totals['broken-nesting']).toBe(1);
    expect(r.violations.find((v) => v.kind === 'broken-nesting').detail).toContain('unparseable selector');
    expect(() => expanded(files)).not.toThrow();
  });

  it('a block named after a utility may use its own name', async () => {
    const r = await bem(triad('table', '<div class="table"><p class="table__row"></p></div>', `${REF}.table { @apply grid; }\n.table__row { @apply flex; }\n`));
    expect(r.violations).toEqual([]);
  });

  it('is deterministic', async () => {
    const files = triad('hero-card', '<div class="flex hero-card roster__x"></div>', `${REF}.other { @apply flex; }\n`);
    const dir = tree(files);
    const a = JSON.stringify(await bemTally([dir], { root: dir, styles: STYLES }));
    const b = JSON.stringify(await bemTally([dir], { root: dir, styles: STYLES }));
    expect(a).toBe(b);
  });
});

describe('expandedTally: planted violations hidden behind BEM', () => {
  it('counts zero on a clean triad', () => {
    const r = expanded(triad('hero-card', CLEAN_HTML, CLEAN_CSS));
    expect(r.seal.totals.all).toBe(0);
    expect(r.layout.totals.all).toBe(0);
  });

  it('sees a raw palette color applied to a primitive, at the template line', () => {
    const css = `${REF}.hero-card__retire { @apply bg-red-500; }\n`;
    const r = expanded(triad('hero-card', CLEAN_HTML, css));
    expect(r.layout.totals['raw-palette-color']).toBe(1);
    expect(r.layout.violations[0]).toMatchObject({ file: 'app/hero-card/hero-card.html', line: 3 });
    expect(r.seal.totals['appearance-on-primitive']).toBeGreaterThanOrEqual(1);
  });

  it('sees space-* and a hover-only palette color', () => {
    const css = `${REF}.hero-card { @apply space-y-4; }\n.hero-card__name {\n  &:hover { @apply text-gray-700; }\n}\n`;
    const r = expanded(triad('hero-card', CLEAN_HTML, css));
    expect(r.layout.totals['space-utility']).toBe(1);
    expect(r.layout.totals['raw-palette-color']).toBe(1);
  });

  it('sees a row of flex columns built from BEM classes', () => {
    const html = '<div class="hero-card">\n  <div class="hero-card__col">a</div>\n  <div class="hero-card__col">b</div>\n</div>';
    const css = `${REF}.hero-card { @apply flex; }\n.hero-card__col { @apply flex flex-col; }\n`;
    const r = expanded(triad('hero-card', html, css));
    expect(r.layout.totals['nested-flex-grid']).toBe(1);
  });

  it('still counts a utility written straight into the template', () => {
    const r = expanded(triad('hero-card', '<p class="hero-card bg-blue-50"></p>', REF));
    expect(r.layout.totals['raw-palette-color']).toBe(1);
  });

  it('applies global stylesheet rules to every template, as the browser does', () => {
    const files = {
      ...triad('hero-card', CLEAN_HTML, CLEAN_CSS),
      'styles.css': '@import "tailwindcss";\n.hero-card__name { @apply text-gray-700; }\n',
    };
    const r = expanded(files);
    expect(r.layout.totals['raw-palette-color']).toBe(1);
    expect(r.layout.violations.find((v) => v.kind === 'raw-palette-color')).toMatchObject({ file: 'app/hero-card/hero-card.html', line: 2 });
  });

  it('judges @apply on :host, bare elements and nested descendants, which style no BEM class', () => {
    const css = `${REF}.hero-card { @apply grid; }\n:host { @apply flex space-y-4 bg-red-500; }\n`;
    const r = expanded(triad('hero-card', CLEAN_HTML, css));
    expect(r.layout.totals['space-utility']).toBe(1);
    expect(r.layout.totals['raw-palette-color']).toBe(1);
    for (const v of r.layout.violations) expect(v).toMatchObject({ file: 'app/hero-card/hero-card.css', line: 3 });
  });

  it('judges @apply in the global stylesheet on a bare element', () => {
    const r = expanded({ ...triad('hero-card', CLEAN_HTML, CLEAN_CSS), 'styles.css': '@import "tailwindcss";\nbody { @apply bg-gray-100; }\n' });
    expect(r.layout.totals['raw-palette-color']).toBe(1);
    expect(r.layout.violations[0]).toMatchObject({ file: 'styles.css', line: 2 });
  });

  it('counts zero for clean host and global @apply', () => {
    const css = `${CLEAN_CSS}:host { @apply block; }\n`;
    const r = expanded({ ...triad('hero-card', CLEAN_HTML, css), 'styles.css': '@import "tailwindcss";\nbody { @apply bg-background text-foreground; }\n' });
    expect(r.layout.totals.all).toBe(0);
  });

  it('sees raw palette colors with an opacity or important modifier, not themed ones', () => {
    const run = (u) => expanded(triad('hero-card', CLEAN_HTML, `${REF}.hero-card__name { @apply ${u}; }\n`)).layout.totals['raw-palette-color'];
    expect(run('bg-blue-500/50')).toBe(1);
    expect(run('!bg-red-500')).toBe(1);
    expect(run('bg-primary/50')).toBe(0);
  });

  it('counts inline templates the series 1 way', () => {
    const r = expanded({ 'app/tiny/tiny.ts': ts('tiny', 'template: `<p class="bg-blue-50">x</p>`,') });
    expect(r.layout.totals['raw-palette-color']).toBe(1);
  });
});
