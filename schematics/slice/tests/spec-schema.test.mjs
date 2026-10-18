import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SLICE_DIR, FIXTURES, readFixture } from './run.mjs';

const require = createRequire(import.meta.url);
const { parseSpec } = require('../spec-schema.cjs');
const { render } = require('../build-json-schema.cjs');

const fixture = (name) => JSON.parse(readFixture(name));
const loan = () => fixture('loan');
const errorsOf = (data) => {
  const r = parseSpec(data);
  return r.ok ? [] : r.errors;
};
const rejects = (data, fragment) => {
  const errors = errorsOf(data);
  expect(errors.length, 'expected the spec to be rejected').toBeGreaterThan(0);
  if (fragment) expect(errors.join('\n')).toContain(fragment);
};

describe('the committed fixtures', () => {
  it.each(FIXTURES)('%s is a valid spec', (name) => {
    expect(errorsOf(fixture(name))).toEqual([]);
  });
});

describe('free text is pure data', () => {
  const FORBIDDEN = ['<', '>', '{', '}', '`', '$', '\\', '\n', '\u0000'];
  const places = {
    'field label': (s, v) => (s.fields[0].label = `Name${v}`),
    'field placeholder': (s, v) => (s.fields[0].placeholder = `Book${v}`),
    'field help': (s, v) => (s.fields[0].help = `Help${v}`),
    'enum option': (s, v) => (s.fields[2].options[0] = `Requested${v}`),
    'plural label': (s, v) => (s.labels.plural = `loans${v}`),
    'create label': (s, v) => (s.manage.createLabel = `New${v}`),
    'filter label': (s, v) => (s.manage.filters[0].label = `Only${v}`),
    'badge variant key': (s, v) => (s.manage.columns[2].badge.variants[`Returned${v}`] = 'default'),
    'example string': (s, v) => (s.examples[0].reference = `Tide${v}`),
  };
  for (const [place, mutate] of Object.entries(places)) {
    it.each(FORBIDDEN)(`${place} rejects %j`, (ch) => {
      const s = loan();
      mutate(s, ch);
      rejects(s);
    });
  }

  it('accepts ordinary punctuation, including quotes and apostrophes', () => {
    const s = loan();
    s.fields[0].label = `Dr. Ion's "Codename" & more; 50% (ok) #1 @home`;
    s.fields[0].placeholder = "What's the plan?";
    expect(errorsOf(s)).toEqual([]);
  });

  it('caps the length of every kind of text', () => {
    const long = (n) => 'a'.repeat(n);
    const cases = [
      (s) => (s.fields[0].label = long(61)),
      (s) => (s.fields[0].placeholder = long(101)),
      (s) => (s.fields[0].help = long(201)),
      (s) => (s.fields[2].options[0] = long(41)),
      (s) => (s.labels.singular = long(61)),
      (s) => (s.examples[0].branch = long(501)),
    ];
    for (const mutate of cases) {
      const s = loan();
      mutate(s);
      rejects(s);
    }
  });

  it('rejects an empty label', () => {
    const s = loan();
    s.fields[0].label = '';
    rejects(s);
  });
});

describe('identifiers and icons are pinned by pattern', () => {
  it.each([
    ['entity must be PascalCase', (s) => (s.entity = 'loan')],
    ['entity rejects separators', (s) => (s.entity = 'Loan_Thing')],
    ['entity rejects acronym runs', (s) => (s.entity = 'HTTPLog')],
    ['plural must be lowercase kebab', (s) => (s.plural = 'Loans')],
    ['plural rejects underscores', (s) => (s.plural = 'loan_list')],
    ['plural rejects slashes', (s) => (s.plural = 'a/b')],
    ['field name must be camelCase', (s) => (s.fields[0].name = 'Code_name')],
    ['field name rejects quotes', (s) => (s.fields[0].name = "a'b")],
    ['field name id is reserved', (s) => (s.fields[0].name = 'id')],
    ['field name constructor is reserved', (s) => (s.fields[0].name = 'constructor')],
    ['icon must start with lucide', (s) => (s.manage.icon = 'Target')],
    ['icon rejects kebab names', (s) => (s.manage.icon = 'lucide-target')],
    ['icon rejects markup', (s) => (s.manage.icon = 'lucideTarget"></ng-icon><script>')],
    ['filter icon is checked too', (s) => (s.manage.filters[0].icon = 'bad')],
    ['ref target label is an identifier', (s) => (s.fields[4].ref.label = 'a b')],
  ])('%s', (_name, mutate) => {
    const s = loan();
    mutate(s);
    rejects(s);
  });
});

describe('the schema is strict', () => {
  it.each([
    ['top level', (s) => (s.extra = 1)],
    ['labels', (s) => (s.labels.extra = 1)],
    ['a field', (s) => (s.fields[0].extra = 1)],
    ['a ref', (s) => (s.fields[4].ref.extra = 1)],
    ['manage', (s) => (s.manage.extra = 1)],
    ['a column', (s) => (s.manage.columns[0].extra = 1)],
    ['a badge', (s) => (s.manage.columns[2].badge.extra = 1)],
    ['the filter', (s) => (s.manage.filters[0].extra = 1)],
    ['a field of the wrong kind (min on a string)', (s) => (s.fields[0].min = 1)],
  ])('rejects an unknown key on %s', (_where, mutate) => {
    const s = loan();
    mutate(s);
    rejects(s);
  });

  it('rejects an unknown field type', () => {
    const s = loan();
    s.fields[0].type = 'html';
    rejects(s);
  });

  it('rejects a Date object smuggled in as example data', () => {
    const s = loan();
    s.examples[0].borrowedOn = new Date();
    rejects(s, 'ISO date');
  });

  it('rejects a non-ISO date', () => {
    const s = loan();
    s.examples[0].borrowedOn = '09/01/2026';
    rejects(s, 'ISO date');
  });
});

describe('cross-field rules', () => {
  it.each([
    ['duplicate field names', (s) => (s.fields[1].name = 'reference'), 'duplicate field name'],
    ['a model-only field with no default', (s) => delete s.fields[5].default, 'default'],
    ['a many ref in the form', (s) => (s.fields[5].inForm = true), 'many ref'],
    ['a non-required enum', (s) => (s.fields[2].required = false), 'must be true'],
    ['manage without a manage section', (s) => delete s.manage, 'required when kinds includes manage'],
    ['a manage section without the kind', (s) => (s.kinds = ['entity', 'form']), 'only allowed'],
    ['manage without form', (s) => (s.kinds = ['entity', 'manage']), 'manage needs entity and form'],
    ['form without entity', (s) => (s.kinds = ['form']), 'form needs entity'],
    ['a repeated kind', (s) => (s.kinds = ['entity', 'entity', 'form', 'manage']), 'repeat'],
    ['a column naming an undeclared field', (s) => (s.manage.columns[0].field = 'nope'), 'not a declared field'],
    ['a ref as the first column', (s) => (s.manage.columns[0].field = 'bookId'), 'must be'],
    ['a search field that is a date', (s) => (s.manage.search[0] = 'borrowedOn'), 'string or text'],
    ['a badge on a string column', (s) => (s.manage.columns[0].badge = { variants: {}, fallback: 'default' }), 'enum'],
    ['a badge variant that is not an option', (s) => (s.manage.columns[2].badge.variants.Nope = 'default'), 'not an option'],
    ['a badge variant that is not a spartan variant', (s) => (s.manage.columns[2].badge.variants.Returned = 'rainbow')],
    ['an enum filter without a value', (s) => (s.manage.filters = [{ field: 'status', control: 'toggle', label: 'Only', icon: 'lucideFlag' }]), 'required for an enum'],
    ['a boolean filter with a value', (s) => (s.manage.filters[0].value = 'x'), 'not allowed for a boolean'],
    ['an example row missing a field', (s) => delete s.examples[0].reference, 'missing'],
    ['an example row with an extra field', (s) => (s.examples[0].extra = 1), 'not a declared field'],
    ['an enum example outside its options', (s) => (s.examples[0].status = 'Nope'), 'declared options'],
    ['a self reference', (s) => (s.fields[4].ref.entity = 'Loan'), 'self reference'],
  ])('rejects %s', (_name, mutate, fragment) => {
    const s = loan();
    mutate(s);
    rejects(s, fragment);
  });

  it('rejects a number example outside its range', () => {
    const s = fixture('book');
    s.examples[0].popularity = 101;
    rejects(s, 'at most');
  });

  it('rejects a filter on a model-only field (the generated ViewModel test could not set it)', () => {
    const s = loan();
    s.fields[3].inForm = false;
    s.fields[3].default = false;
    rejects(s, 'inForm true');
    expect(errorsOf(s).join(' | ')).toContain('manage.filters.0.field');
  });

  it('rejects a required single ref that is not in the form (its default can only be null)', () => {
    const s = loan();
    s.fields[4].required = true;
    s.fields[4].inForm = false;
    s.fields[4].default = null;
    rejects(s, 'required single ref');
  });

  it('accepts an optional single ref that is not in the form', () => {
    const s = loan();
    s.fields[4].inForm = false;
    s.fields[4].default = null;
    s.manage.columns = s.manage.columns.filter((c) => c.field !== 'bookId');
    expect(errorsOf(s)).toEqual([]);
  });

  it('rejects an entity-only spec with no form field (the schema and service need one)', () => {
    const s = fixture('book');
    s.kinds = ['entity'];
    for (const f of s.fields) {
      f.inForm = false;
      if (f.default === undefined) f.default = f.type === 'string' || f.type === 'text' ? '' : 0;
    }
    s.fields.forEach((f) => { if (f.type === 'enum') f.default = f.options[0]; });
    rejects(s, 'at least one field must have inForm true');
  });

  it('accepts a spec with no examples', () => {
    const s = loan();
    delete s.examples;
    expect(errorsOf(s)).toEqual([]);
  });
});

describe('spec.schema.json', () => {
  it('is in sync with the zod schema (run `npm run build:spec-schema` after changing spec-schema.cjs)', () => {
    const committed = readFileSync(join(SLICE_DIR, 'spec.schema.json'), 'utf8');
    expect(committed).toBe(render());
  });

  it('declares the structural rules a standalone JSON validator can check', () => {
    const json = JSON.parse(readFileSync(join(SLICE_DIR, 'spec.schema.json'), 'utf8'));
    expect(json.additionalProperties).toBe(false);
    expect(Object.keys(json.properties)).toEqual(['entity', 'plural', 'labels', 'kinds', 'fields', 'examples', 'manage']);
  });
});

describe('manage filters, sort and summary', () => {
  const book = () => JSON.parse(readFixture('book'));
  it('accepts a select filter on an enum field, even one with inForm false', () => {
    const d = book();
    d.manage.filters = [{ field: 'genre', control: 'select' }, { field: 'availability', control: 'select' }];
    expect(parseSpec(d).ok).toBe(true);
  });
  it('rejects a select filter on a non-enum field', () => {
    const d = book();
    d.manage.filters = [{ field: 'title', control: 'select' }];
    const r = parseSpec(d);
    expect(r.ok).toBe(false);
    expect(r.errors.join('\n')).toMatch(/manage\.filters\.0\.field/);
  });
  it('keeps the toggle rules: enum needs a value that is an option, boolean takes none', () => {
    const d = book();
    d.manage.filters = [{ field: 'genre', control: 'toggle', label: 'Fiction only', icon: 'lucideBookOpen' }];
    expect(parseSpec(d).errors.join('\n')).toMatch(/manage\.filters\.0\.value/);
    d.manage.filters[0].value = 'Nope';
    expect(parseSpec(d).errors.join('\n')).toMatch(/not an option/);
  });
  it('rejects more than three filters and two filters on one field', () => {
    const d = book();
    d.manage.filters = [{ field: 'genre', control: 'select' }, { field: 'genre', control: 'select' }];
    expect(parseSpec(d).errors.join('\n')).toMatch(/manage\.filters\.1\.field/);
    d.manage.filters = ['genre', 'availability', 'condition', 'genre'].map((field) => ({ field, control: 'select' }));
    expect(parseSpec(d).ok).toBe(false);
  });
  it('rejects the retired single filter key', () => {
    const d = book();
    d.manage.filter = { field: 'genre', value: 'Fiction', label: 'Fiction only', icon: 'lucideBookOpen' };
    expect(parseSpec(d).ok).toBe(false);
  });
  it('accepts sort on a field and rejects sort on a boolean or an unknown field', () => {
    const d = book();
    d.manage.sort = { field: 'popularity', direction: 'desc' };
    expect(parseSpec(d).ok).toBe(true);
    d.manage.sort = { field: 'nope', direction: 'asc' };
    expect(parseSpec(d).errors.join('\n')).toMatch(/manage\.sort\.field/);
    const m = JSON.parse(readFixture('loan'));
    m.manage.sort = { field: 'extended', direction: 'asc' };
    expect(parseSpec(m).errors.join('\n')).toMatch(/manage\.sort\.field/);
  });
  it('accepts summary true or false and nothing else', () => {
    const d = book();
    d.manage.summary = 'yes';
    expect(parseSpec(d).ok).toBe(false);
  });
});

describe('manage.createRoute', () => {
  const book = () => JSON.parse(readFixture('book'));
  it('accepts an app path', () => {
    for (const path of ['/recruit', '/books/new', '/a-b/c1']) {
      const d = book();
      d.manage.createRoute = path;
      expect(parseSpec(d).ok, path).toBe(true);
    }
  });
  it('rejects anything that is not a plain app path', () => {
    for (const path of ['recruit', '/Recruit', '/a b', '/<x>', '/', '/books/', 'https://x.io', `/${'a'.repeat(60)}`]) {
      const d = book();
      d.manage.createRoute = path;
      const r = parseSpec(d);
      expect(r.ok, path).toBe(false);
      expect(r.errors.join('\n'), path).toMatch(/manage\.createRoute/);
    }
  });
});

describe('badge variants', () => {
  const { BADGE_VARIANTS } = require('../spec-schema.cjs');
  const badgeLib = readFileSync(join(SLICE_DIR, '..', '..', 'libs', 'ui', 'badge', 'src', 'lib', 'hlm-badge.ts'), 'utf8');

  it('offers success and warning, for status columns such as active and on leave', () => {
    expect(BADGE_VARIANTS).toEqual(expect.arrayContaining(['success', 'warning']));
  });

  it('names exactly the variants libs/ui badge ships, less the two that are not statuses (ghost, link)', () => {
    const block = /variant:\s*\{([\s\S]*?)\n\s{6}\},/.exec(badgeLib)?.[1] ?? '';
    const shipped = [...block.matchAll(/^\s{8}([a-z]+):/gm)].map((m) => m[1]);
    expect(shipped.length).toBeGreaterThan(0);
    expect([...BADGE_VARIANTS].sort()).toEqual(shipped.filter((v) => v !== 'ghost' && v !== 'link').sort());
  });
});
