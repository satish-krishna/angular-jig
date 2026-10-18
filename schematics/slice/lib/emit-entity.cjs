'use strict';

/**
 * Kind `entity`: model, zod schema, root service, example data, service spec.
 * Every function returns file content as a string. Spec text reaches the output only
 * through `lit()` (JSON.stringify) or `value()`.
 */

const {
  cap,
  camel,
  kebab,
  lit,
  value,
  file,
  tsType,
  blankValue,
  changeField,
  changedValue,
  candidateLines,
  camelFromKebab,
} = require('./naming.cjs');

/** @param {ReturnType<import('./naming.cjs').buildContext>} ctx */
function model(ctx) {
  const out = [];
  const enums = ctx.fields.filter((f) => f.type === 'enum');
  for (const f of enums) {
    out.push(`export type ${ctx.Entity}${cap(f.name)} = ${f.options.map(lit).join(' | ')};`);
  }
  if (enums.length) out.push('');
  out.push(`export interface ${ctx.Entity} {`);
  out.push('  readonly id: string;');
  for (const f of ctx.fields) {
    if (f.type === 'date') out.push('  /** ISO date, never a Date object. */');
    out.push(`  ${f.name}: ${tsType(ctx, f)};`);
  }
  out.push('}');
  return file(out);
}

/** The zod expression and meta for one form field, as source lines. */
function schemaField(f) {
  const placeholder = f.placeholder ?? (f.type === 'date' ? 'YYYY-MM-DD' : undefined);
  const control = { string: 'text', text: 'textarea', number: 'number', boolean: 'checkbox', enum: 'select', date: 'text', ref: 'select' }[f.type];
  const head = [`label: ${lit(f.label)}`, `control: ${lit(control)}`];
  if (placeholder !== undefined) head.push(`placeholder: ${lit(placeholder)}`);
  if (f.help !== undefined) head.push(`help: ${lit(f.help)}`);

  const required = lit(`${f.label} is required`);
  let chain;
  switch (f.type) {
    case 'string':
    case 'text':
      chain = f.required ? `string().min(1, ${required})` : 'string()';
      break;
    case 'number':
      chain = 'number()';
      if (f.min !== undefined) chain += `.min(${f.min}, ${lit(`${f.label} must be at least ${f.min}`)})`;
      if (f.max !== undefined) chain += `.max(${f.max}, ${lit(`${f.label} must not exceed ${f.max}`)})`;
      break;
    case 'boolean':
      chain = 'boolean()';
      break;
    case 'enum':
      chain = `enum([${f.options.map(lit).join(', ')}])`;
      break;
    case 'date': {
      const re = f.required ? '/^\\d{4}-\\d{2}-\\d{2}$/' : '/^(\\d{4}-\\d{2}-\\d{2})?$/';
      chain = `string().regex(${re}, ${lit(`${f.label} must be a date as YYYY-MM-DD`)})`;
      break;
    }
    case 'ref':
      chain = f.required ? `string().min(1, ${required})` : 'string().nullable()';
      break;
    default:
      throw new Error(`unknown field type ${f.type}`);
  }

  if (f.type === 'enum') {
    return [
      `  ${f.name}: z`,
      `    .${chain}`,
      '    .meta({',
      ...head.map((h) => `      ${h},`),
      '      options: [',
      ...f.options.map((o) => `        { value: ${lit(o)}, label: ${lit(o)} },`),
      '      ],',
      '    } satisfies FormFieldMeta),',
    ];
  }
  return [`  ${f.name}: z`, `    .${chain}`, `    .meta({ ${head.join(', ')} } satisfies FormFieldMeta),`];
}

/** @param {ReturnType<import('./naming.cjs').buildContext>} ctx */
function schema(ctx) {
  const out = [
    "import { z } from 'zod';",
    "import type { FormFieldMeta } from '../forms/form-field-meta';",
    '',
    `export const ${ctx.entity}Schema = z.object({`,
  ];
  for (const f of ctx.formFields) out.push(...schemaField(f));
  out.push('});', '', `export type ${ctx.Entity}FormModel = z.infer<typeof ${ctx.entity}Schema>;`);
  return file(out);
}

/** Ref fields grouped by target entity, in order of first appearance. */
function refTargets(ctx) {
  const targets = new Map();
  for (const f of ctx.refs) {
    if (!targets.has(f.ref.entity)) targets.set(f.ref.entity, { ...f.ref, fields: [] });
    targets.get(f.ref.entity).fields.push(f);
  }
  return [...targets.values()];
}

/** @param {ReturnType<import('./naming.cjs').buildContext>} ctx */
function service(ctx) {
  const { Entity, entity, entityKebab, list } = ctx;
  const targets = refTargets(ctx);
  const manyRefs = ctx.refs.filter((f) => f.many);
  const angularImports = ['Injectable', ...(targets.length ? ['effect', 'inject'] : []), 'signal'];
  const out = [`import { ${angularImports.join(', ')} } from '@angular/core';`];
  for (const t of targets) {
    out.push(`import { ${t.entity}Service } from '../${kebab(t.entity)}/${kebab(t.entity)}.service';`);
  }
  out.push(
    `import type { ${Entity} } from './${entityKebab}.model';`,
    `import type { ${Entity}FormModel } from './${entityKebab}.schema';`,
    `import { EXAMPLE_${ctx.upperPlural} } from './${entityKebab}-example-data';`,
    '',
    "@Injectable({ providedIn: 'root' })",
    `export class ${Entity}Service {`,
  );
  if (targets.length) {
    out.push('  // Dependencies point one way only: this entity knows about the entities it references,');
    out.push('  // never the reverse. A referenced service that imported this one would be a cycle.');
    for (const t of targets) out.push(`  private readonly ${camel(t.entity)}Service = inject(${t.entity}Service);`);
    out.push('');
  }
  out.push(
    `  private readonly _${list} = signal<${Entity}[]>(EXAMPLE_${ctx.upperPlural});`,
    `  private readonly _nextId = signal(Math.max(0, ...EXAMPLE_${ctx.upperPlural}.map((item) => parseInt(item.id, 10))) + 1);`,
    '',
    `  readonly ${list} = this._${list}.asReadonly();`,
    '',
  );

  if (targets.length) {
    out.push('  constructor() {');
    out.push('    // Prune references to records that no longer exist, so removing one detaches it everywhere.');
    out.push('    // The `changed` guard matters: this effect reads the list and writes it, so setting an');
    out.push('    // equal-but-newly-allocated array would retrigger the effect forever.');
    out.push('    effect(() => {');
    for (const t of targets) {
      out.push(`      const live${cap(camelFromKebab(t.plural))} = new Set(this.${camel(t.entity)}Service.${camelFromKebab(t.plural)}().map((item) => item.id));`);
    }
    out.push('      let changed = false;');
    out.push(`      const pruned = this._${list}().map((item) => {`);
    out.push('        let next = item;');
    for (const f of ctx.refs) {
      const live = `live${cap(camelFromKebab(f.ref.plural))}`;
      if (f.many) {
        out.push(`        const ${f.name} = next.${f.name}.filter((id) => ${live}.has(id));`);
        out.push(`        if (${f.name}.length !== next.${f.name}.length) next = { ...next, ${f.name} };`);
      } else if (f.required) {
        out.push(`        if (next.${f.name} !== '' && !${live}.has(next.${f.name})) next = { ...next, ${f.name}: '' };`);
      } else {
        out.push(`        if (next.${f.name} !== null && !${live}.has(next.${f.name})) next = { ...next, ${f.name}: null };`);
      }
    }
    out.push('        if (next !== item) changed = true;');
    out.push('        return next;');
    out.push('      });');
    out.push(`      if (changed) this._${list}.set(pruned);`);
    out.push('    });');
    out.push('  }');
    out.push('');
  }

  out.push(
    `  byId(id: string): ${Entity} | undefined {`,
    `    return this._${list}().find((item) => item.id === id);`,
    '  }',
    '',
  );
  for (const f of manyRefs) {
    out.push(
      `  for${f.ref.entity}(${camel(f.ref.entity)}Id: string): ${Entity}[] {`,
      `    return this._${list}().filter((item) => item.${f.name}.includes(${camel(f.ref.entity)}Id));`,
      '  }',
      '',
    );
  }
  const defaults = ctx.modelOnlyFields.map((f) => `${f.name}: ${value(f.default)}, `).join('');
  out.push(
    `  create(candidate: ${Entity}FormModel): ${Entity} {`,
    `    const ${entity}: ${Entity} = { id: String(this._nextId()), ${defaults}...candidate };`,
    `    this._${list}.update((items) => [...items, ${entity}]);`,
    '    this._nextId.update((n) => n + 1);',
    `    return ${entity};`,
    '  }',
    '',
    `  update(id: string, patch: Partial<${Entity}FormModel>): void {`,
    `    this._${list}.update((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));`,
    '  }',
    '',
    '  remove(id: string): void {',
    `    this._${list}.update((items) => items.filter((item) => item.id !== id));`,
    '  }',
    '}',
  );
  return file(out);
}

/** @param {ReturnType<import('./naming.cjs').buildContext>} ctx */
function exampleData(ctx) {
  const rows = ctx.spec.examples ?? [];
  const out = [`import type { ${ctx.Entity} } from './${ctx.entityKebab}.model';`, ''];
  out.push('/**');
  out.push(' * Example data. Not real records.');
  if (ctx.refs.length) out.push(' * Reference ids point at the example rows of the entity they name.');
  out.push(' */');
  if (rows.length === 0) {
    out.push(`export const EXAMPLE_${ctx.upperPlural}: ${ctx.Entity}[] = [];`);
    return file(out);
  }
  out.push(`export const EXAMPLE_${ctx.upperPlural}: ${ctx.Entity}[] = [`);
  rows.forEach((row, i) => {
    const props = [`id: ${lit(String(i + 1))}`, ...ctx.fields.map((f) => `${f.name}: ${value(row[f.name])}`)];
    out.push(`  { ${props.join(', ')} },`);
  });
  out.push('];');
  return file(out);
}

/** @param {ReturnType<import('./naming.cjs').buildContext>} ctx */
function serviceSpec(ctx) {
  const { Entity, list, entityKebab } = ctx;
  const target = changeField(ctx);
  const other = ctx.formFields.find((f) => f !== target);
  const out = [
    "import { TestBed } from '@angular/core/testing';",
    `import { ${Entity}Service } from './${entityKebab}.service';`,
    `import { EXAMPLE_${ctx.upperPlural} } from './${entityKebab}-example-data';`,
  ];
  const targets = refTargets(ctx);
  const rows = ctx.spec.examples ?? [];
  const pruneTests = [];
  for (const t of targets) {
    for (const f of t.fields) {
      if (rows.some((r) => (f.many ? r[f.name].length > 0 : r[f.name] !== null))) pruneTests.push({ t, f });
    }
  }
  const imported = new Set();
  for (const { t } of pruneTests) {
    if (!imported.has(t.entity)) {
      imported.add(t.entity);
      out.push(`import { ${t.entity}Service } from '../${kebab(t.entity)}/${kebab(t.entity)}.service';`);
    }
  }
  out.push('', `describe('${Entity}Service', () => {`, '  beforeEach(() => TestBed.configureTestingModule({}));', '');
  const candidate = (indent) => candidateLines(ctx, indent).join('\n');
  out.push(
    "  it('seeds from example data', () => {",
    `    expect(TestBed.inject(${Entity}Service).${list}().length).toBe(EXAMPLE_${ctx.upperPlural}.length);`,
    '  });',
    '',
    "  it('creates a record with a fresh id and returns it', () => {",
    `    const service = TestBed.inject(${Entity}Service);`,
    `    const before = service.${list}().length;`,
    '    const created = service.create({',
    candidate('      '),
    '    });',
    `    expect(service.${list}().length).toBe(before + 1);`,
    `    expect(service.byId(created.id)?.${ctx.formFields[0].name}).toEqual(created.${ctx.formFields[0].name});`,
  );
  for (const f of ctx.modelOnlyFields) {
    out.push(`    expect(created.${f.name}).toEqual(${value(f.default)});`);
  }
  out.push(
    '  });',
    '',
    "  it('updates only the fields it is given', () => {",
    `    const service = TestBed.inject(${Entity}Service);`,
    '    const created = service.create({',
    candidate('      '),
    '    });',
    `    service.update(created.id, { ${target.name}: ${value(changedValue(target))} });`,
    `    expect(service.byId(created.id)?.${target.name}).toEqual(${value(changedValue(target))});`,
  );
  if (other) out.push(`    expect(service.byId(created.id)?.${other.name}).toEqual(created.${other.name});`);
  out.push(
    '  });',
    '',
    "  it('removes a record', () => {",
    `    const service = TestBed.inject(${Entity}Service);`,
    '    const created = service.create({',
    candidate('      '),
    '    });',
    '    service.remove(created.id);',
    '    expect(service.byId(created.id)).toBeUndefined();',
    '  });',
  );
  for (const { t, f } of pruneTests) {
    const tName = camel(t.entity);
    out.push(
      '',
      `  it('detaches ${f.name} once the ${t.entity} it points at is removed', () => {`,
      `    const ${tName}Service = TestBed.inject(${t.entity}Service);`,
      `    const service = TestBed.inject(${Entity}Service);`,
    );
    if (f.many) {
      out.push(
        `    const assigned = service.${list}().find((item) => item.${f.name}.length > 0);`,
        '    expect(assigned).toBeDefined();',
        `    const targetId = assigned!.${f.name}[0];`,
        `    ${tName}Service.remove(targetId);`,
        '    TestBed.flushEffects();',
        `    expect(service.byId(assigned!.id)?.${f.name}).not.toContain(targetId);`,
        '  });',
        '',
        `  it('lists the records for one ${t.entity}', () => {`,
        `    const service = TestBed.inject(${Entity}Service);`,
        `    const assigned = service.${list}().find((item) => item.${f.name}.length > 0)!;`,
        `    expect(service.for${t.entity}(assigned.${f.name}[0]).map((item) => item.id)).toContain(assigned.id);`,
        '  });',
      );
    } else {
      out.push(
        `    const linked = service.${list}().find((item) => item.${f.name} !== null && item.${f.name} !== '');`,
        '    expect(linked).toBeDefined();',
        `    ${tName}Service.remove(linked!.${f.name}!);`,
        '    TestBed.flushEffects();',
        `    expect(service.byId(linked!.id)?.${f.name}).toBe(${f.required ? "''" : 'null'});`,
        '  });',
      );
    }
  }
  out.push('});');
  return file(out);
}

module.exports = { model, schema, service, exampleData, serviceSpec, refTargets, blankValue };
