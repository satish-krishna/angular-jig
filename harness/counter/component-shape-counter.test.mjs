import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { countTsSource, countTemplateSource } from './component-shape-counter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fx = (n) => join(here, 'fixtures', n);
const tallyOf = (vs) => {
  const t = {};
  for (const v of vs) t[v.kind] = (t[v.kind] ?? 0) + 1;
  return t;
};

describe('component-shape counter', () => {
  const dirty = readFileSync(fx('part3-dirty-ui.ts'), 'utf8');

  it('tallies one of each kind on the dirty ui fixture', () => {
    const vs = countTsSource(dirty, { file: 'src/app/ui/hero-card.ts' });
    expect(tallyOf(vs)).toEqual({
      'hand-set-change-detection': 1,
      'component-subscribe': 1,
      'template-driven-form': 1,
      'restated-validator': 1,
      'presentational-injects-data': 1,
      'hand-written-form-model': 1,
      'reactive-form': 1,
      'dumb-holds-state': 1,
    });
  });

  it('does not fire the ui-path kinds outside src/app/ui/', () => {
    const t = tallyOf(countTsSource(dirty, { file: 'src/app/heroes/hero-card.ts' }));
    expect(t['presentational-injects-data']).toBeUndefined();
    expect(t['dumb-holds-state']).toBeUndefined();
    expect(t['hand-set-change-detection']).toBe(1);
  });

  it('passes the clean fixture with zero violations', () => {
    expect(countTsSource(readFileSync(fx('part3-clean.ts'), 'utf8'), { file: 'src/app/heroes/hero-list.ts' })).toEqual([]);
  });

  it('flags ngModel in a template and passes the clean template', () => {
    expect(tallyOf(countTemplateSource(readFileSync(fx('part3-dirty.html'), 'utf8'), { file: 'd.html' }))).toEqual({
      'template-driven-form': 1,
    });
    expect(countTemplateSource(readFileSync(fx('part3-clean.html'), 'utf8'), { file: 'c.html' })).toEqual([]);
  });

  it('is deterministic: same bytes in, identical tally out', () => {
    const a = JSON.stringify(countTsSource(dirty, { file: 'src/app/ui/hero-card.ts' }));
    const b = JSON.stringify(countTsSource(dirty, { file: 'src/app/ui/hero-card.ts' }));
    expect(a).toBe(b);
  });
});
