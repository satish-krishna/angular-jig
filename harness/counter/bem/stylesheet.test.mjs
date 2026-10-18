import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BEM_RE, blockOf, loadClassifier } from './classify.mjs';
import { parseStylesheet } from './stylesheet.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const STYLES = join(here, '..', 'fixtures', 'bem', 'styles.css');

describe('classify', () => {
  it('asks Tailwind which tokens are utilities', async () => {
    const { isUtility } = await loadClassifier(STYLES);
    for (const t of ['flex', 'w-full', 'sm:w-48', 'bg-success/15', 'bg-red-500', 'sr-only', 'space-x-2', '!font-bold', 'container']) {
      expect(isUtility(t), t).toBe(true);
    }
    for (const t of ['hero-card', 'hero-card__name', 'roster--active', 'Tank', 'on-mission']) {
      expect(isUtility(t), t).toBe(false);
    }
  });

  it('recognizes BEM names and their block', () => {
    for (const t of ['roster', 'roster__row', 'roster__row--retired', 'hero-card--retired', 'hero-detail__power-meter']) {
      expect(BEM_RE.test(t), t).toBe(true);
    }
    for (const t of ['Roster', 'roster___row', 'sm:w-48', 'roster__', 'bg-red-500/10']) {
      expect(BEM_RE.test(t), t).toBe(false);
    }
    expect(blockOf('hero-card__name--big')).toBe('hero-card');
    expect(blockOf('hero-card--retired')).toBe('hero-card');
    expect(blockOf('roster')).toBe('roster');
  });
});

describe('parseStylesheet', () => {
  const css = [
    '@reference "../../styles.css";',
    '',
    ':host { @apply block; }',
    '.roster { @apply grid gap-6; }',
    '.roster__filters { @apply flex flex-wrap gap-3; }',
    '.roster__retire {',
    '  @apply ms-auto;',
    '  &:hover { @apply bg-red-500; }',
    '}',
    '.roster__search {',
    '  @media (width >= 40rem) { @apply w-64; }',
    '}',
    '.roster__row {',
    '  &__name { @apply flex; }',
    '}',
    '.badge-lite { color: var(--primary); }',
  ].join('\n');

  it('maps each class to the utilities it applies, through pseudo-class nesting and @media', () => {
    const { utilities } = parseStylesheet(css);
    expect(utilities.get('roster')).toEqual(['grid', 'gap-6']);
    expect(utilities.get('roster__filters')).toEqual(['flex', 'flex-wrap', 'gap-3']);
    expect(utilities.get('roster__retire')).toEqual(['ms-auto', 'bg-red-500']);
    expect(utilities.get('roster__search')).toEqual(['w-64']);
  });

  it('treats Sass-style &__x as broken: it maps nothing, names no class, and is reported', () => {
    const { utilities, selectorClasses, brokenNesting } = parseStylesheet(css);
    expect(utilities.has('roster__row')).toBe(false);
    expect(utilities.has('roster__row__name')).toBe(false);
    expect(utilities.has('roster__name')).toBe(false);
    expect(selectorClasses.some((s) => s.line === 14)).toBe(false);
    expect(brokenNesting).toEqual([{ selector: '&__name', line: 14 }]);
  });

  it('lists every selector class with its line, and :host contributes none', () => {
    const { selectorClasses } = parseStylesheet(css);
    const names = [...new Set(selectorClasses.map((s) => s.cls))].sort();
    expect(names).toEqual(['badge-lite', 'roster', 'roster__filters', 'roster__retire', 'roster__row', 'roster__search']);
    expect(selectorClasses.find((s) => s.cls === 'badge-lite').line).toBe(16);
  });

  it('detects @apply and @reference', () => {
    expect(parseStylesheet(css)).toMatchObject({ hasApply: true, hasReference: true });
    expect(parseStylesheet('.a { @apply flex; }')).toMatchObject({ hasApply: true, hasReference: false });
    expect(parseStylesheet('@reference "../../styles.css";\n')).toMatchObject({ hasApply: false, hasReference: true });
  });

  it('reads only the styled element: paren-aware, ignores :not/:has/:host() arguments and attribute values', () => {
    const { utilities, selectorClasses } = parseStylesheet([
      '.c:nth-child(2n+1) { @apply grid; }',
      '.j:is(.k, .l) { @apply flex; }',
      '.a:not(.b) { @apply gap-2; }',
      ':host(.x) { @apply block; }',
      'a[href$=".pdf"].m { @apply underline; }',
      '.sm\\:w-48 { @apply w-48; }',
      '.e { @apply flex; }',
      '.e:hover { @apply flex font-bold !important; }',
    ].join('\n'));
    expect(utilities.get('c')).toEqual(['grid']);
    expect(utilities.get('j')).toEqual(['flex']);
    expect(utilities.get('k')).toEqual(['flex']);
    expect(utilities.get('l')).toEqual(['flex']);
    expect(utilities.get('a')).toEqual(['gap-2']);
    expect(utilities.has('b')).toBe(false);
    expect(utilities.has('x')).toBe(false);
    expect(utilities.has('pdf')).toBe(false);
    expect(utilities.get('m')).toEqual(['underline']);
    expect(utilities.get('sm:w-48')).toEqual(['w-48']);
    expect(utilities.get('e')).toEqual(['flex', 'font-bold']);
    expect(selectorClasses.map((s) => s.cls)).toContain('b');
    expect(selectorClasses.map((s) => s.cls)).not.toContain('pdf');
  });

  it('flags &__x at the root too, and ignores & inside attribute values', () => {
    const { brokenNesting, utilities } = parseStylesheet('&__x { @apply flex; }\n.y[data-a="&b"] { @apply grid; }');
    expect(brokenNesting).toEqual([{ selector: '&__x', line: 1 }]);
    expect(utilities.get('y')).toEqual(['grid']);
  });

  it('lists @apply utilities whose rule styles no class as unmapped, with the @apply line', () => {
    const { unmapped } = parseStylesheet(':host { @apply block; }\n.a h1 { @apply flex; }\n.a { @apply grid; }\n&__x { @apply p-2; }\n');
    expect(unmapped).toEqual([
      { tokens: ['block'], line: 1 },
      { tokens: ['flex'], line: 2 },
    ]);
  });

  it('skips an unparseable selector instead of throwing, and reports it', () => {
    const r = parseStylesheet('// header\n.a { @apply grid; }\n');
    expect(r.brokenNesting).toEqual([{ selector: '// header\n.a', line: 1 }]);
    expect(r.utilities.size).toBe(0);
  });

  it('parses CRLF stylesheets with the same lines', () => {
    const { selectorClasses } = parseStylesheet(css.replaceAll('\n', '\r\n'));
    expect(selectorClasses.find((s) => s.cls === 'badge-lite').line).toBe(16);
  });
});
