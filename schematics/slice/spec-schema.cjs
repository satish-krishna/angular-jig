'use strict';

/**
 * The strict zod schema for one slice spec file (specs/<entity>.json).
 *
 * A spec is pure data. Nothing in it may carry code, markup, a CSS value, or a
 * template string: every free-text string rejects the characters that could
 * open a tag, an interpolation, a template literal, or an escape sequence, and
 * every identifier is pinned by a regex. Unknown keys fail everywhere.
 *
 * `spec.schema.json` is generated from this file (see build-json-schema.cjs) and
 * a test fails when the two drift.
 */

const { z } = require('zod');

/** Characters a free-text string must never contain: < > { } backtick $ backslash, plus control characters. */
const FORBIDDEN_TEXT = /[<>{}`$\\\u0000-\u001f\u007f]/;
const SAFE_TEXT_PATTERN = '^[^<>{}`$\\\\\\u0000-\\u001f\\u007f]*$';
const SAFE_TEXT = new RegExp(SAFE_TEXT_PATTERN);

/**
 * A free-text string: bounded length, none of the forbidden characters.
 * @param {number} max
 * @param {number} [min]
 */
const text = (max, min = 1) =>
  z
    .string()
    .min(min)
    .max(max)
    .regex(SAFE_TEXT, 'must not contain < > { } ` $ \\ or control characters');

const ENTITY = /^[A-Z][a-z0-9]+([A-Z][a-z0-9]+)*$/;
const PLURAL = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const FIELD = /^[a-z][a-zA-Z0-9]*$/;
const ICON = /^lucide[A-Z][A-Za-z0-9]*$/;
const APP_PATH = /^\/[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID_STRING = /^[0-9]{1,6}$/;

/** Field names that would collide with the generated `id` or with object internals. */
const RESERVED_FIELDS = new Set(['id', 'constructor', 'prototype', 'hasOwnProperty', 'toString', 'valueOf']);

const entityName = z.string().max(40).regex(ENTITY, 'must be PascalCase, e.g. Mission or ThreatReport');
const pluralName = z.string().max(40).regex(PLURAL, 'must be lowercase kebab-case, e.g. missions or threat-reports');
const fieldName = z
  .string()
  .max(40)
  .regex(FIELD, 'must be camelCase')
  .refine((n) => !RESERVED_FIELDS.has(n), 'is reserved (id is generated, the rest collide with object internals)');
const iconName = z.string().max(60).regex(ICON, 'must look like lucideTarget');
const labelText = text(60);
const placeholderText = text(100);
const helpText = text(200);
const optionText = text(40);
const exampleText = text(500, 0);
const idString = z.string().regex(ID_STRING, 'must be a numeric id string such as "1"');

const BADGE_VARIANTS = ['default', 'secondary', 'success', 'warning', 'destructive', 'outline'];
const badgeVariant = z.enum(BADGE_VARIANTS);

/** Properties every field carries. */
const base = {
  name: fieldName,
  label: labelText,
  required: z.boolean(),
  inForm: z.boolean().default(true),
  placeholder: placeholderText.optional(),
  help: helpText.optional(),
};

const stringField = z.strictObject({ ...base, type: z.literal('string'), default: exampleText.optional() });
const textField = z.strictObject({ ...base, type: z.literal('text'), default: exampleText.optional() });
const numberField = z.strictObject({
  ...base,
  type: z.literal('number'),
  min: z.number().finite().optional(),
  max: z.number().finite().optional(),
  default: z.number().finite().optional(),
});
const booleanField = z.strictObject({ ...base, type: z.literal('boolean'), default: z.boolean().optional() });
const enumField = z.strictObject({
  ...base,
  type: z.literal('enum'),
  options: z.array(optionText).min(1).max(20),
  default: optionText.optional(),
});
const dateField = z.strictObject({
  ...base,
  type: z.literal('date'),
  default: z.string().regex(ISO_DATE, 'must be an ISO date, YYYY-MM-DD').optional(),
});
const refField = z.strictObject({
  ...base,
  type: z.literal('ref'),
  ref: z.strictObject({
    entity: entityName,
    plural: pluralName,
    label: fieldName,
  }),
  many: z.boolean().default(false),
  default: z.union([z.null(), z.array(idString).max(0)]).optional(),
});

const field = z.discriminatedUnion('type', [
  stringField,
  textField,
  numberField,
  booleanField,
  enumField,
  dateField,
  refField,
]);

const column = z.strictObject({
  field: fieldName,
  badge: z
    .strictObject({
      variants: z.record(optionText, badgeVariant),
      fallback: badgeVariant,
    })
    .optional(),
});

const manage = z.strictObject({
  icon: iconName,
  createLabel: labelText,
  createRoute: z.string().max(60).regex(APP_PATH, 'must be an app path such as /recruit').optional(),
  columns: z.array(column).min(1).max(8),
  search: z.array(fieldName).min(1).max(4),
  filters: z
    .array(
      z.discriminatedUnion('control', [
        z.strictObject({ field: fieldName, control: z.literal('select') }),
        z.strictObject({
          field: fieldName,
          control: z.literal('toggle'),
          /** Required for an enum field: the single value the toggle filters to. */
          value: optionText.optional(),
          label: labelText,
          icon: iconName,
        }),
      ]),
    )
    .min(1)
    .max(3)
    .optional(),
  sort: z.strictObject({ field: fieldName, direction: z.enum(['asc', 'desc']) }).optional(),
  summary: z.boolean().optional(),
});

const KINDS = ['entity', 'form', 'manage'];

const specObject = z.strictObject({
  entity: entityName,
  plural: pluralName,
  labels: z.strictObject({ singular: labelText, plural: labelText }),
  kinds: z.array(z.enum(KINDS)).min(1).max(3),
  fields: z.array(field).min(1).max(24),
  examples: z.array(z.record(fieldName, z.unknown())).max(50).optional(),
  manage: manage.optional(),
});

/** Does a value look right for a field? Returns an error message or null. */
function checkValue(f, value) {
  switch (f.type) {
    case 'string':
    case 'text':
      if (typeof value !== 'string') return 'must be a string';
      if (value.length > 500) return 'must be at most 500 characters';
      if (FORBIDDEN_TEXT.test(value)) return 'must not contain < > { } ` $ \\ or control characters';
      if (f.required && value.length === 0) return 'is required';
      return null;
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) return 'must be a number';
      if (f.min !== undefined && value < f.min) return `must be at least ${f.min}`;
      if (f.max !== undefined && value > f.max) return `must be at most ${f.max}`;
      return null;
    case 'boolean':
      return typeof value === 'boolean' ? null : 'must be true or false';
    case 'enum':
      return typeof value === 'string' && f.options.includes(value) ? null : 'must be one of the declared options';
    case 'date':
      if (typeof value !== 'string') return 'must be an ISO date string';
      if (value === '') return f.required ? 'is required' : null;
      return ISO_DATE.test(value) && !Number.isNaN(Date.parse(value)) ? null : 'must be an ISO date, YYYY-MM-DD';
    case 'ref':
      if (f.many) {
        return Array.isArray(value) && value.every((v) => typeof v === 'string' && ID_STRING.test(v))
          ? null
          : 'must be an array of numeric id strings';
      }
      if (value === null) return f.required ? 'is required' : null;
      return typeof value === 'string' && ID_STRING.test(value) ? null : 'must be a numeric id string or null';
    default:
      return 'has an unknown type';
  }
}

const spec = specObject.superRefine((s, ctx) => {
  const add = (path, message) => ctx.addIssue({ code: 'custom', path, message });
  const byName = new Map();

  s.fields.forEach((f, i) => {
    if (byName.has(f.name)) add(['fields', i, 'name'], `duplicate field name "${f.name}"`);
    byName.set(f.name, f);

    if (['number', 'boolean', 'enum'].includes(f.type) && f.required !== true) {
      add(['fields', i, 'required'], `must be true for a ${f.type} field (it always has a value)`);
    }
    if (f.type === 'number' && f.min !== undefined && f.max !== undefined && f.min > f.max) {
      add(['fields', i, 'min'], 'must not exceed max');
    }
    if (f.type === 'enum') {
      if (new Set(f.options).size !== f.options.length) add(['fields', i, 'options'], 'must be unique');
      if (f.default !== undefined && !f.options.includes(f.default)) add(['fields', i, 'default'], 'must be one of the options');
    }
    if (f.type === 'number' && f.default !== undefined) {
      const msg = checkValue(f, f.default);
      if (msg) add(['fields', i, 'default'], msg);
    }
    if (f.type === 'string' || f.type === 'text') {
      if (f.default !== undefined && checkValue({ ...f, required: false }, f.default)) {
        add(['fields', i, 'default'], 'is not a valid value');
      }
    }
    if (f.type === 'ref') {
      if (f.many && f.inForm) add(['fields', i, 'inForm'], 'must be false for a many ref (no multi-select control exists)');
      if (f.many && f.default !== undefined && !Array.isArray(f.default)) add(['fields', i, 'default'], 'must be [] for a many ref');
      if (!f.many && f.default !== undefined && f.default !== null) add(['fields', i, 'default'], 'must be null for a ref');
      if (!f.many && f.required && !f.inForm) add(['fields', i, 'inForm'], 'a required single ref must be in the form (a model-only ref can only default to null, which a required ref cannot hold)');
    }
    if (f.inForm === false && f.default === undefined) {
      add(['fields', i, 'default'], 'is required for a field that is not in the form (create has no other source for it)');
    }
  });

  // Refs: one options input / one for-<Entity> method per target, so names stay unambiguous.
  const manyTargets = new Set();
  s.fields.forEach((f, i) => {
    if (f.type !== 'ref') return;
    if (f.ref.entity === s.entity) add(['fields', i, 'ref', 'entity'], 'a self reference is not supported');
    if (f.many) {
      if (manyTargets.has(f.ref.entity)) add(['fields', i, 'ref', 'entity'], 'two many refs to the same entity are not supported');
      manyTargets.add(f.ref.entity);
    }
  });

  if (s.kinds.length !== new Set(s.kinds).size) add(['kinds'], 'must not repeat a kind');
  if (!s.fields.some((f) => f.inForm)) add(['fields'], 'at least one field must have inForm true (the schema and the service are built from the form fields)');
  if (s.kinds.includes('form') && !s.kinds.includes('entity')) add(['kinds'], 'form needs entity (the schema it is built from)');
  if (s.kinds.includes('manage')) {
    if (!s.kinds.includes('entity') || !s.kinds.includes('form')) add(['kinds'], 'manage needs entity and form');
    if (!s.manage) add(['manage'], 'is required when kinds includes manage');
  } else if (s.manage) {
    add(['manage'], 'is only allowed when kinds includes manage');
  }

  if (s.manage) {
    const m = s.manage;
    const lookup = (name, path, accept, what) => {
      const f = byName.get(name);
      if (!f) add(path, `"${name}" is not a declared field`);
      else if (!accept.includes(f.type)) add(path, `"${name}" must be a ${what} field`);
      return f;
    };
    const seenCols = new Set();
    m.columns.forEach((c, i) => {
      if (seenCols.has(c.field)) add(['manage', 'columns', i, 'field'], 'duplicate column');
      seenCols.add(c.field);
      const f = lookup(c.field, ['manage', 'columns', i, 'field'], i === 0 ? ['string', 'text'] : ['string', 'text', 'number', 'boolean', 'enum', 'date'], i === 0 ? 'string or text (the first column is the row title)' : 'string, text, number, boolean, enum or date');
      if (c.badge) {
        if (f && f.type !== 'enum') add(['manage', 'columns', i, 'badge'], 'a badge needs an enum field');
        if (f && f.type === 'enum') {
          for (const v of Object.keys(c.badge.variants)) {
            if (!f.options.includes(v)) add(['manage', 'columns', i, 'badge', 'variants', v], 'is not an option of the field');
          }
        }
      }
    });
    const seenSearch = new Set();
    m.search.forEach((n, i) => {
      if (seenSearch.has(n)) add(['manage', 'search', i], 'duplicate search field');
      seenSearch.add(n);
      const sf = lookup(n, ['manage', 'search', i], ['string', 'text'], 'string or text');
      if (sf && !sf.inForm) add(['manage', 'search', i], 'must be a field with inForm true');
    });
    const seenFilters = new Set();
    (m.filters ?? []).forEach((flt, i) => {
      const path = ['manage', 'filters', i];
      if (flt.control === 'select') {
        lookup(flt.field, [...path, 'field'], ['enum'], 'enum');
      } else {
        const f = lookup(flt.field, [...path, 'field'], ['enum', 'boolean'], 'enum or boolean');
        if (f && !f.inForm) add([...path, 'field'], 'must be a field with inForm true');
        if (f && f.type === 'enum') {
          if (flt.value === undefined) add([...path, 'value'], 'is required for an enum filter');
          else if (!f.options.includes(flt.value)) add([...path, 'value'], 'is not an option of the field');
        }
        if (f && f.type === 'boolean' && flt.value !== undefined) add([...path, 'value'], 'is not allowed for a boolean filter');
      }
      if (seenFilters.has(flt.field)) add([...path, 'field'], 'must not repeat a filtered field');
      seenFilters.add(flt.field);
    });
    if (m.sort) lookup(m.sort.field, ['manage', 'sort', 'field'], ['string', 'text', 'number', 'date', 'enum'], 'string, text, number, date or enum');
  }

  if (s.examples) {
    s.examples.forEach((row, ri) => {
      const known = new Set(s.fields.map((f) => f.name));
      for (const key of Object.keys(row)) {
        if (!known.has(key)) add(['examples', ri, key], 'is not a declared field');
      }
      s.fields.forEach((f) => {
        if (!(f.name in row)) {
          add(['examples', ri, f.name], 'is missing');
          return;
        }
        const msg = checkValue(f, row[f.name]);
        if (msg) add(['examples', ri, f.name], msg);
      });
    });
  }
});

/**
 * Parse a spec, returning the validated value or a list of readable problems.
 * @param {unknown} data
 * @returns {{ ok: true, spec: any } | { ok: false, errors: string[] }}
 */
function parseSpec(data) {
  const result = spec.safeParse(data);
  if (result.success) return { ok: true, spec: result.data };
  const errors = result.error.issues.map((issue) => {
    const where = issue.path.length ? issue.path.join('.') : '(spec)';
    return `${where}: ${issue.message}`;
  });
  return { ok: false, errors };
}

module.exports = { spec, parseSpec, SAFE_TEXT_PATTERN, BADGE_VARIANTS, KINDS };
