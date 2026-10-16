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

  it('parses CRLF stylesheets with the same lines', () => {
    const { selectorClasses } = parseStylesheet(css.replaceAll('\n', '\r\n'));
    expect(selectorClasses.find((s) => s.cls === 'badge-lite').line).toBe(16);
  });
});
