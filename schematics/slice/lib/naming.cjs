'use strict';

/** Name and literal helpers shared by every emitter. Pure functions, no I/O. */

/** @param {string} s */
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** PascalCase to kebab-case: ThreatReport -> threat-report. @param {string} s */
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** PascalCase to camelCase: ThreatReport -> threatReport. @param {string} s */
const camel = (s) => s.charAt(0).toLowerCase() + s.slice(1);

/** kebab-case to camelCase: threat-reports -> threatReports. @param {string} s */
const camelFromKebab = (s) => s.replace(/-([a-z0-9])/g, (_m, c) => c.toUpperCase());

/** kebab-case to PascalCase: threat-reports -> ThreatReports. @param {string} s */
const pascalFromKebab = (s) => cap(camelFromKebab(s));

/** kebab-case to CONSTANT_CASE: threat-reports -> THREAT_REPORTS. @param {string} s */
const constantFromKebab = (s) => s.replace(/-/g, '_').toUpperCase();

/** camelCase to CONSTANT_CASE: powerClass -> POWER_CLASS. @param {string} s */
const constantFromCamel = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();

/**
 * The only way spec text becomes TypeScript source: a JSON string literal.
 * The spec schema already rejects quotes' dangerous neighbors (backslash, backtick,
 * dollar, braces, angle brackets, control characters), and JSON.stringify escapes the rest.
 * @param {string} s
 */
const lit = (s) => JSON.stringify(s);

/**
 * A literal for any JSON-shaped value: strings through JSON.stringify, arrays of strings
 * as `["a", "b"]`.
 * @param {unknown} v
 * @returns {string}
 */
function value(v) {
  if (Array.isArray(v)) return `[${v.map(value).join(', ')}]`;
  if (typeof v === 'string') return lit(v);
  return JSON.stringify(v);
}

/** Join lines with a trailing newline. @param {string[]} lines */
const file = (lines) => lines.join('\n') + '\n';

/**
 * Everything the emitters need to know about one entity, derived once from the spec.
 * @param {any} spec a spec that already passed spec-schema
 */
function buildContext(spec) {
  const Entity = spec.entity;
  const entity = camel(Entity);
  const entityKebab = kebab(Entity);
  const plural = spec.plural;
  const fields = spec.fields;
  const formFields = fields.filter((f) => f.inForm !== false);
  const modelOnlyFields = fields.filter((f) => f.inForm === false);
  return {
    spec,
    Entity,
    entity,
    entityKebab,
    plural,
    Plural: pascalFromKebab(plural),
    list: camelFromKebab(plural),
    upperPlural: constantFromKebab(plural),
    fields,
    formFields,
    modelOnlyFields,
    refs: fields.filter((f) => f.type === 'ref'),
    paths: {
      model: `src/app/${entityKebab}/${entityKebab}.model.ts`,
      schema: `src/app/${entityKebab}/${entityKebab}.schema.ts`,
      service: `src/app/${entityKebab}/${entityKebab}.service.ts`,
      serviceSpec: `src/app/${entityKebab}/${entityKebab}.service.spec.ts`,
      example: `src/app/${entityKebab}/${entityKebab}-example-data.ts`,
      form: `src/app/ui/${entityKebab}-form/${entityKebab}-form.ts`,
      formTemplate: `src/app/ui/${entityKebab}-form/${entityKebab}-form.html`,
      formStyles: `src/app/ui/${entityKebab}-form/${entityKebab}-form.css`,
      screen: `src/app/${plural}/${plural}.ts`,
      template: `src/app/${plural}/${plural}.html`,
      styles: `src/app/${plural}/${plural}.css`,
      viewModel: `src/app/${plural}/${plural}.view-model.ts`,
      viewModelSpec: `src/app/${plural}/${plural}.view-model.spec.ts`,
    },
  };
}

/** The TypeScript type of a field's value on the model. */
function tsType(ctx, f) {
  switch (f.type) {
    case 'string':
    case 'text':
    case 'date':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'enum':
      return `${ctx.Entity}${cap(f.name)}`;
    case 'ref':
      if (f.many) return 'readonly string[]';
      return f.required ? 'string' : 'string | null';
    default:
      throw new Error(`unknown field type ${f.type}`);
  }
}

/** Clamp a number into a field's min/max. */
function clamp(f, n) {
  let v = n;
  if (f.min !== undefined && v < f.min) v = f.min;
  if (f.max !== undefined && v > f.max) v = f.max;
  return v;
}

/** The value a form starts from: the spec default, else the type's neutral value. */
function blankValue(f) {
  if (f.default !== undefined) return f.default;
  switch (f.type) {
    case 'string':
    case 'text':
    case 'date':
      return '';
    case 'number':
      return clamp(f, 0);
    case 'boolean':
      return false;
    case 'enum':
      return f.options[0];
    case 'ref':
      return f.many ? [] : f.required ? '' : null;
    default:
      throw new Error(`unknown field type ${f.type}`);
  }
}

/** A valid-looking value for generated tests (the service does not validate). */
function sampleValue(f) {
  switch (f.type) {
    case 'string':
      return `Test ${f.name}`;
    case 'text':
      return '';
    case 'date':
      return '2026-01-01';
    case 'number':
      return clamp(f, 0);
    case 'boolean':
      return false;
    case 'enum':
      return f.options[0];
    case 'ref':
      return f.many ? [] : f.required ? '1' : null;
    default:
      throw new Error(`unknown field type ${f.type}`);
  }
}

/** A different valid-looking value, for update tests. */
function changedValue(f) {
  switch (f.type) {
    case 'string':
    case 'text':
      return 'Changed';
    case 'date':
      return '2026-02-02';
    case 'number':
      return clamp(f, sampleValue(f) + 1);
    case 'boolean':
      return true;
    case 'enum':
      return f.options.length > 1 ? f.options[1] : f.options[0];
    case 'ref':
      return '2';
    default:
      throw new Error(`unknown field type ${f.type}`);
  }
}

/** The form field that update/save tests change: strings first, otherwise the first form field. */
function changeField(ctx) {
  return ctx.formFields.find((f) => f.type === 'string') ?? ctx.formFields[0];
}

/** An object literal of sample values for every form field, as source lines at a given indent. */
function candidateLines(ctx, indent, overrides = {}) {
  return ctx.formFields.map((f) => {
    const v = f.name in overrides ? overrides[f.name] : sampleValue(f);
    return `${indent}${f.name}: ${value(v)},`;
  });
}

/** On the first line of every generated TypeScript file; .claude/hooks/route-to-generator.mjs looks for it. */
const GENERATED_MARKER = '@generated by the slice schematic';

/**
 * The generator's version, written into every header so an app can tell which version wrote each generated file.
 * Bump it whenever the output changes. 1.1.0: a createRoute screen no longer emits an in-screen create path.
 */
const GENERATOR_VERSION = '1.1.0';

/** The first line of every generated TypeScript file. */
const GENERATED_HEADER = `// ${GENERATED_MARKER} ${GENERATOR_VERSION} from its spec. Edit in place; reshape via the spec and --force.`;

/** A file carrying this marker is a placeholder the generator replaces without --force. */
const PLACEHOLDER_MARKER = 'slice:placeholder';

module.exports = {
  GENERATED_MARKER,
  GENERATED_HEADER,
  GENERATOR_VERSION,
  PLACEHOLDER_MARKER,
  cap,
  kebab,
  camel,
  camelFromKebab,
  pascalFromKebab,
  constantFromKebab,
  constantFromCamel,
  lit,
  value,
  clamp,
  file,
  buildContext,
  tsType,
  blankValue,
  sampleValue,
  changedValue,
  changeField,
  candidateLines,
};
