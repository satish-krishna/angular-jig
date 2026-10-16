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

  it('counts inline templates the series 1 way', () => {
    const r = expanded({ 'app/tiny/tiny.ts': ts('tiny', 'template: `<p class="bg-blue-50">x</p>`,') });
    expect(r.layout.totals['raw-palette-color']).toBe(1);
  });
});
