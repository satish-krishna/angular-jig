'use strict';

/**
 * Kind `manage`: a routed CRUD screen. The component is a thin shell (providers: [ViewModel]),
 * the ViewModel owns all state, and the template reaches spec text only through `vm.text`,
 * a constant object of JSON string literals.
 */

const {
  cap,
  camel,
  kebab,
  camelFromKebab,
  constantFromCamel,
  lit,
  file,
  candidateLines,
  changeField,
  changedValue,
  value,
  clamp,
} = require('./naming.cjs');
const { refTargets } = require('./emit-entity.cjs');

/** Resolve the manage section against the fields once. */
function plan(ctx) {
  const m = ctx.spec.manage;
  const byName = new Map(ctx.fields.map((f) => [f.name, f]));
  const columns = m.columns.map((c) => ({ ...c, f: byName.get(c.field) }));
  const title = columns[0];
  const description = columns[1] && !columns[1].badge && ['string', 'text'].includes(columns[1].f.type) ? columns[1] : null;
  const action = columns.find((c) => c.badge && c !== title && c !== description) ?? null;
  const rows = columns.filter((c) => c !== title && c !== description && c !== action);
  const filters = (m.filters ?? []).map((flt) => ({ ...flt, f: byName.get(flt.field) }));
  const selects = filters.filter((flt) => flt.control === 'select');
  const toggles = filters.filter((flt) => flt.control === 'toggle');
  const sort = m.sort ? { ...m.sort, f: byName.get(m.sort.field) } : null;
  const icons = [];
  for (const name of ['lucidePlus', 'lucidePencil', 'lucideTrash2', m.icon, ...toggles.map((t) => t.icon)]) {
    if (name && !icons.includes(name)) icons.push(name);
  }
  return {
    m,
    columns,
    title,
    description,
    action,
    rows,
    filters,
    selects,
    toggles,
    sort,
    icons,
    badgeColumns: columns.filter((c) => c.badge),
    hasDate: columns.some((c) => c.f.type === 'date'),
    hasBoolean: columns.some((c) => c.f.type === 'boolean'),
    searchFields: m.search.map((n) => byName.get(n)),
    refForms: ctx.formFields.filter((f) => f.type === 'ref'),
  };
}

/** The comparator body for two sort expressions: numbers subtract, everything else compares as strings; desc multiplies by -1. */
function order(sort, x, y) {
  const base = sort.f.type === 'number' ? `${x} - ${y}` : `${x}.localeCompare(${y})`;
  return sort.direction === 'desc' ? `(${base}) * -1` : base;
}

const compare = (sort, a, b) => order(sort, `${a}.${sort.field}`, `${b}.${sort.field}`);

/** @param {ReturnType<import('./naming.cjs').buildContext>} ctx */
function viewModel(ctx) {
  const { Entity, entity, entityKebab, list, Plural } = ctx;
  const p = plan(ctx);
  const labels = ctx.spec.labels;
  const singular = labels.singular;
  const plural = labels.plural;
  const TEXT = `${ctx.upperPlural}_TEXT`;
  const targets = refTargets({ ...ctx, refs: p.refForms });

  const out = ["import { Injectable, computed, inject, signal } from '@angular/core';"];
  if (p.badgeColumns.length) out.push("import type { BadgeVariants } from '@spartan-ng/helm/badge';");
  out.push(`import { ${Entity}Service } from '../${entityKebab}/${entityKebab}.service';`);
  for (const t of targets) out.push(`import { ${t.entity}Service } from '../${kebab(t.entity)}/${kebab(t.entity)}.service';`);
  out.push(`import type { ${Entity}FormModel } from '../${entityKebab}/${entityKebab}.schema';`, '');

  if (p.badgeColumns.length) out.push("type BadgeVariant = NonNullable<BadgeVariants['variant']>;", '');
  out.push('/** Every piece of spec text the screen shows. The template binds to these and never repeats them. */', `const ${TEXT} = {`);
  const t = [
    ['title', cap(plural)],
    ['plural', plural],
    ['createLabel', p.m.createLabel],
    // A createRoute creates on another screen, so this one has no create dialog to title.
    ...(p.m.createRoute
      ? []
      : [
          ['createTitle', `Create ${singular}`],
          ['createDescription', `Add a new ${singular}.`],
        ]),
    ['editTitle', `Edit ${singular}`],
    ['editDescription', `Change this ${singular}'s details and save.`],
    ['deleteTitle', `Delete ${singular}?`],
    ['deleteDescription', `This ${singular} will be permanently removed. This cannot be undone.`],
    ['searchLabel', `Search ${plural}`],
    ['searchPlaceholder', `Search ${plural}...`],
    ['empty', `No ${plural} match this filter.`],
    ['edit', 'Edit'],
    ['delete', 'Delete'],
    ['actions', 'Actions'],
  ];
  if (p.selects.length) t.push(['all', 'All']);
  if (p.sort) t.push(['sortedBy', `sorted by ${p.sort.f.label.toLowerCase()}`]);
  for (const [k, v] of t) out.push(`  ${k}: ${lit(v)},`);
  if (p.filters.length) {
    out.push('  filters: {');
    for (const flt of p.filters) out.push(`    ${flt.field}: ${lit(flt.control === 'toggle' ? flt.label : flt.f.label)},`);
    out.push('  },');
  }
  out.push('  columns: {');
  for (const c of p.columns) out.push(`    ${c.field}: ${lit(c.f.label)},`);
  out.push('  },', '} as const;', '');

  for (const c of p.badgeColumns) {
    out.push(`const ${constantFromCamel(c.field)}_VARIANTS: Readonly<Record<string, BadgeVariant>> = {`);
    for (const [k, v] of Object.entries(c.badge.variants)) out.push(`  ${lit(k)}: ${lit(v)},`);
    out.push('};', '');
  }

  out.push(
    '@Injectable()',
    `export class ${Plural}ViewModel {`,
    `  private readonly ${entity}Service = inject(${Entity}Service);`,
  );
  for (const tg of targets) out.push(`  private readonly ${camel(tg.entity)}Service = inject(${tg.entity}Service);`);
  out.push('', `  readonly text = ${TEXT};`);
  if (p.m.createRoute) out.push(`  readonly createRoute = ${lit(p.m.createRoute)};`);
  out.push(`  readonly ${list} = this.${entity}Service.${list};`, '', "  readonly searchQuery = signal('');");
  for (const flt of p.selects) out.push(`  readonly ${flt.field}Filter = signal('');`);
  for (const flt of p.toggles) out.push(`  readonly ${flt.field}FilterOn = signal(false);`);
  for (const flt of p.selects) {
    out.push(
      '',
      `  readonly ${flt.field}FilterOptions: ReadonlyArray<{ value: string; label: string }> = [`,
      `    { value: '', label: ${TEXT}.all },`,
      ...flt.f.options.map((o) => `    { value: ${lit(o)}, label: ${lit(o)} },`),
      '  ];',
      '',
      `  readonly ${flt.field}FilterLabel = (value: string): string =>`,
      `    this.${flt.field}FilterOptions.find((o) => o.value === value)?.label ?? '';`,
    );
  }
  out.push(
    '',
    p.m.createRoute
      ? `  /** The id of the ${singular} being edited, or null when closed. */`
      : `  /** The id of the ${singular} being edited, '' for a new one, or null when closed. */`,
    '  readonly editing = signal<string | null>(null);',
    '',
    '  readonly filtered = computed(() => {',
    '    const q = this.searchQuery().toLowerCase();',
  );
  for (const flt of p.selects) out.push(`    const ${flt.field}Selected = this.${flt.field}Filter();`);
  for (const flt of p.toggles) out.push(`    const ${flt.field}On = this.${flt.field}FilterOn();`);
  out.push(`    const rows = this.${list}()`);
  for (const flt of p.selects) out.push(`      .filter((item) => !${flt.field}Selected || item.${flt.field} === ${flt.field}Selected)`);
  for (const flt of p.toggles) {
    const test = flt.f.type === 'boolean' ? `item.${flt.field}` : `item.${flt.field} === ${lit(flt.value)}`;
    out.push(`      .filter((item) => !${flt.field}On || ${test})`);
  }
  out.push(
    `      .filter((item) => !q || ${p.searchFields.map((f) => `item.${f.name}.toLowerCase().includes(q)`).join(' || ')});`,
  );
  if (p.sort) out.push(`    return [...rows].sort((a, b) => ${compare(p.sort, 'a', 'b')});`);
  else out.push('    return rows;');
  out.push('  });', '');
  for (const f of p.refForms) {
    out.push(
      `  readonly ${f.name}Options = computed(() =>`,
      `    this.${camel(f.ref.entity)}Service.${camelFromKebab(f.ref.plural)}().map((item) => ({ value: item.id, label: item.${f.ref.label} })),`,
      '  );',
      '',
    );
  }
  out.push(
    `  readonly editing${Entity} = computed(() => {`,
    '    const id = this.editing();',
    `    return id ? this.${entity}Service.byId(id) : undefined;`,
    '  });',
    '',
  );
  for (const c of p.badgeColumns) {
    out.push(
      `  readonly ${c.field}Variant = (value: string): BadgeVariant =>`,
      `    ${constantFromCamel(c.field)}_VARIANTS[value] ?? ${lit(c.badge.fallback)};`,
      '',
    );
  }
  for (const flt of p.toggles) {
    out.push(`  toggle${cap(flt.field)}Filter(): void {`, `    this.${flt.field}FilterOn.update((on) => !on);`, '  }', '');
  }
  if (!p.m.createRoute) out.push('  startCreate(): void {', "    this.editing.set('');", '  }', '');
  out.push(
    '  startEdit(id: string): void {',
    '    this.editing.set(id);',
    '  }',
    '',
    '  cancel(): void {',
    '    this.editing.set(null);',
    '  }',
    '',
    `  save(model: ${Entity}FormModel): void {`,
    '    const id = this.editing();',
    ...(p.m.createRoute
      ? [`    if (id) this.${entity}Service.update(id, model);`]
      : ['    if (id) {', `      this.${entity}Service.update(id, model);`, '    } else {', `      this.${entity}Service.create(model);`, '    }']),
    '    this.editing.set(null);',
    '  }',
    '',
    '  remove(id: string): void {',
    `    this.${entity}Service.remove(id);`,
    '    if (this.editing() === id) this.editing.set(null);',
    '  }',
    '}',
  );
  return file(out);
}

/** @param {ReturnType<import('./naming.cjs').buildContext>} ctx */
function screen(ctx) {
  const { Entity, entityKebab, plural, Plural } = ctx;
  const p = plan(ctx);
  const hasSelect = p.selects.length > 0;
  const out = ["import { Component, inject } from '@angular/core';"];
  if (p.hasDate) out.push("import { DatePipe } from '@angular/common';");
  if (p.m.createRoute) out.push("import { RouterLink } from '@angular/router';");
  out.push("import { NgIcon, provideIcons } from '@ng-icons/core';", `import { ${p.icons.join(', ')} } from '@ng-icons/lucide';`);
  if (p.badgeColumns.length || p.hasBoolean) out.push("import { HlmBadgeImports } from '@spartan-ng/helm/badge';");
  out.push(
    "import { HlmButtonImports } from '@spartan-ng/helm/button';",
    "import { HlmDialogImports } from '@spartan-ng/helm/dialog';",
    "import { HlmIconImports } from '@spartan-ng/helm/icon';",
    "import { HlmInputImports } from '@spartan-ng/helm/input';",
    "import { HlmLabelImports } from '@spartan-ng/helm/label';",
  );
  if (hasSelect) out.push("import { HlmSelectImports } from '@spartan-ng/helm/select';");
  out.push(
    "import { HlmTableImports } from '@spartan-ng/helm/table';",
    "import { HlmTypographyImports } from '@spartan-ng/helm/typography';",
    `import { ${Entity}Form } from '../ui/${entityKebab}-form/${entityKebab}-form';`,
    `import { ${Plural}ViewModel } from './${plural}.view-model';`,
    '',
    '@Component({',
    `  selector: 'app-${plural}',`,
    `  providers: [${Plural}ViewModel, provideIcons({ ${p.icons.join(', ')} })],`,
    '  imports: [',
    ...(p.hasDate ? ['    DatePipe,'] : []),
    ...(p.m.createRoute ? ['    RouterLink,'] : []),
    '    NgIcon,',
    ...(p.badgeColumns.length || p.hasBoolean ? ['    HlmBadgeImports,'] : []),
    '    HlmButtonImports,',
    '    HlmDialogImports,',
    '    HlmIconImports,',
    '    HlmInputImports,',
    '    HlmLabelImports,',
    ...(hasSelect ? ['    HlmSelectImports,'] : []),
    '    HlmTableImports,',
    '    HlmTypographyImports,',
    `    ${Entity}Form,`,
    '  ],',
    `  templateUrl: './${plural}.html',`,
    `  styleUrl: './${plural}.css',`,
    '})',
    `export class ${Plural} {`,
    `  protected readonly vm = inject(${Plural}ViewModel);`,
    '}',
  );
  return file(out);
}

/** The form element with its bindings. */
function formElement(ctx, p, indent, mode, dialogRef, item) {
  const { Entity, entityKebab } = ctx;
  const lines = [`<app-${entityKebab}-form`];
  if (mode === 'edit') lines.push(`  [initialValue]="${item}"`);
  for (const f of p.refForms) lines.push(`  [${f.name}Options]="vm.${f.name}Options()"`);
  lines.push(
    `  submitLabel="${mode === 'edit' ? 'Update' : 'Create'}"`,
    `  (save${Entity})="vm.save($event); ${dialogRef}.close()"`,
    `  (cancel)="${dialogRef}.close()"`,
    '/>',
  );
  return lines.map((l) => indent + l);
}

function cellFor(ctx, c, item) {
  switch (c.f.type) {
    case 'boolean':
      return [`@if (${item}.${c.field}) {`, '  <span hlmBadge variant="outline">Yes</span>', '}'];
    case 'date':
      return [`{{ ${item}.${c.field} | date: 'mediumDate' }}`];
    case 'enum':
      if (c.badge) {
        return [
          `<span hlmBadge [variant]="vm.${c.field}Variant(${item}.${c.field})">`,
          `  {{ ${item}.${c.field} }}`,
          '</span>',
        ];
      }
      return [`{{ ${item}.${c.field} }}`];
    default:
      return [`{{ ${item}.${c.field} }}`];
  }
}

function editDialog(ctx, p, item) {
  const { entityKebab, Entity, plural } = ctx;
  return [
    '<hlm-dialog #editDialog="hlmDialog">',
    `  <button hlmBtn hlmDialogTrigger size="sm" variant="ghost" (click)="vm.startEdit(${item}.id)" data-testid="edit-${entityKebab}" [attr.aria-label]="vm.text.edit + ' ' + ${item}.${p.title.field}">`,
    '    <ng-icon hlmIcon name="lucidePencil" />',
    '  </button>',
    `  <hlm-dialog-content *hlmDialogPortal class="${plural}__dialog">`,
    '    <hlm-dialog-header>',
    '      <h2 hlmDialogTitle>{{ vm.text.editTitle }}</h2>',
    '      <p hlmDialogDescription>{{ vm.text.editDescription }}</p>',
    '    </hlm-dialog-header>',
    `    @if (vm.editing${Entity}(); as ${item}) {`,
    ...formElement(ctx, p, '      ', 'edit', 'editDialog', item),
    '    }',
    '  </hlm-dialog-content>',
    '</hlm-dialog>',
  ];
}

function deleteDialog(ctx, item, titleField) {
  const { plural } = ctx;
  return [
    '<hlm-dialog>',
    `  <button hlmBtn hlmDialogTrigger size="sm" variant="ghost" [attr.aria-label]="vm.text.delete + ' ' + ${item}.${titleField}">`,
    '    <ng-icon hlmIcon name="lucideTrash2" />',
    '  </button>',
    `  <hlm-dialog-content *hlmDialogPortal class="${plural}__dialog ${plural}__dialog--narrow">`,
    '    <hlm-dialog-header>',
    '      <h2 hlmDialogTitle>{{ vm.text.deleteTitle }}</h2>',
    '      <p hlmDialogDescription>{{ vm.text.deleteDescription }}</p>',
    '    </hlm-dialog-header>',
    '    <hlm-dialog-footer>',
    '      <button hlmBtn variant="outline" hlmDialogClose>Cancel</button>',
    `      <button hlmBtn variant="destructive" hlmDialogClose (click)="vm.remove(${item}.id)">{{ vm.text.delete }}</button>`,
    '    </hlm-dialog-footer>',
    '  </hlm-dialog-content>',
    '</hlm-dialog>',
  ];
}

/** @param {ReturnType<import('./naming.cjs').buildContext>} ctx */
function template(ctx) {
  const { entity, entityKebab, list, plural } = ctx;
  const p = plan(ctx);
  const item = entity;
  const out = [];
  const push = (indent, lines) => lines.forEach((l) => out.push(l === '' ? '' : indent + l));

  out.push(`<section class="${plural}">`, `  <header class="${plural}__header">`);
  push('    ', [
    `<div class="${plural}__title">`,
    `  <ng-icon hlmIcon name="${p.m.icon}" tone="primary" />`,
    '  <h1 hlmH3>{{ vm.text.title }}</h1>',
    '</div>',
    ...(p.m.createRoute
      ? [
          `<a hlmBtn [routerLink]="vm.createRoute" data-testid="create-${entityKebab}">`,
          '  <ng-icon hlmIcon name="lucidePlus" />',
          '  <span>{{ vm.text.createLabel }}</span>',
          '</a>',
        ]
      : [
          '<hlm-dialog #createDialog="hlmDialog">',
          `  <button hlmBtn hlmDialogTrigger (click)="vm.startCreate()" data-testid="create-${entityKebab}">`,
          '    <ng-icon hlmIcon name="lucidePlus" />',
          '    <span>{{ vm.text.createLabel }}</span>',
          '  </button>',
          `  <hlm-dialog-content *hlmDialogPortal class="${plural}__dialog">`,
          '    <hlm-dialog-header>',
          '      <h2 hlmDialogTitle>{{ vm.text.createTitle }}</h2>',
          '      <p hlmDialogDescription>{{ vm.text.createDescription }}</p>',
          '    </hlm-dialog-header>',
          ...formElement(ctx, p, '    ', 'create', 'createDialog', item),
          '  </hlm-dialog-content>',
          '</hlm-dialog>',
        ]),
  ]);
  out.push('  </header>', '', `  <div class="${plural}__filters">`);
  push('    ', [
    `<label hlmLabel for="${plural}-search" class="${plural}__label">{{ vm.text.searchLabel }}</label>`,
    `<input hlmInput id="${plural}-search" type="search" class="${plural}__search" [placeholder]="vm.text.searchPlaceholder" [value]="vm.searchQuery()" (input)="vm.searchQuery.set($any($event.target).value)" />`,
  ]);
  for (const flt of p.selects) {
    const id = `${plural}-filter-${kebab(flt.field)}`;
    push('    ', [
      `<label hlmLabel for="${id}" class="${plural}__label">{{ vm.text.filters.${flt.field} }}</label>`,
      `<hlm-select class="${plural}__filter" [value]="vm.${flt.field}Filter()" (valueChange)="vm.${flt.field}Filter.set($event ?? '')" [itemToString]="vm.${flt.field}FilterLabel">`,
      `  <hlm-select-trigger buttonId="${id}">`,
      '    <hlm-select-value />',
      '  </hlm-select-trigger>',
      '  <hlm-select-content *hlmSelectPortal>',
      `    @for (option of vm.${flt.field}FilterOptions; track option.value) {`,
      '      <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>',
      '    }',
      '  </hlm-select-content>',
      '</hlm-select>',
    ]);
  }
  for (const flt of p.toggles) {
    push('    ', [
      `<button hlmBtn [variant]="vm.${flt.field}FilterOn() ? 'default' : 'outline'" size="sm" (click)="vm.toggle${cap(flt.field)}Filter()">`,
      `  <ng-icon hlmIcon name="${flt.icon}" />`,
      `  <span>{{ vm.text.filters.${flt.field} }}</span>`,
      '</button>',
    ]);
  }
  out.push('  </div>', '');

  out.push(`  <div class="${plural}__table">`, '    <table hlmTable>', '      <thead hlmTHead>', '        <tr hlmTr>');
  for (const c of p.columns) out.push(`          <th hlmTh>{{ vm.text.columns.${c.field} }}</th>`);
  out.push(
    '          <th hlmTh>{{ vm.text.actions }}</th>',
    '        </tr>',
    '      </thead>',
    '      <tbody hlmTBody>',
    `        @for (${item} of vm.filtered(); track ${item}.id) {`,
    '          <tr hlmTr>',
  );
  for (const c of p.columns) {
    const cell = cellFor(ctx, c, item);
    if (cell.length === 1) out.push(`            <td hlmTd>${cell[0]}</td>`);
    else {
      out.push('            <td hlmTd>');
      push('              ', cell);
      out.push('            </td>');
    }
  }
  out.push('            <td hlmTd>', `              <div class="${plural}__actions">`);
  push('                ', editDialog(ctx, p, item));
  push('                ', deleteDialog(ctx, item, p.title.field));
  out.push(
    '              </div>',
    '            </td>',
    '          </tr>',
    '        } @empty {',
    '          <tr hlmTr>',
    `            <td hlmTd colspan="${p.columns.length + 1}"><p hlmMuted>{{ vm.text.empty }}</p></td>`,
    '          </tr>',
    '        }',
    '      </tbody>',
    '    </table>',
    '  </div>',
  );
  if (p.m.summary === true) {
    out.push('', `  <footer class="${plural}__footer">`, `    <p hlmMuted>{{ vm.filtered().length }} of {{ vm.${list}().length }} {{ vm.text.plural }}</p>`);
    if (p.sort) out.push('    <p hlmMuted>{{ vm.text.sortedBy }}</p>');
    out.push('  </footer>');
  }
  out.push('</section>');
  return file(out);
}

/** The `.css` of the manage screen: layout only, every BEM class written out in full. */
function styles(ctx) {
  const { plural } = ctx;
  const p = plan(ctx);
  const b = `.${plural}`;
  const rule = (name, apply) => ['', `${b}${name} {`, `  @apply ${apply};`, '}'];
  const out = ['@reference "../../styles.css";', '', `${b} {`, '  @apply grid min-w-0 gap-6 p-6;', '}'];
  out.push(
    ...rule('__header', 'flex flex-wrap items-center justify-between gap-4'),
    ...rule('__title', 'flex items-center gap-2'),
    ...rule('__dialog', 'sm:max-w-2xl'),
    ...rule('__dialog--narrow', 'sm:max-w-sm'),
    ...rule('__filters', 'flex flex-wrap items-end gap-3'),
    ...rule('__label', 'sr-only'),
    ...rule('__search', 'w-full sm:w-64'),
  );
  if (p.selects.length) out.push(...rule('__filter', 'w-full sm:w-48'));
  out.push(...rule('__table', 'min-w-0 overflow-x-auto'), ...rule('__actions', 'flex gap-2'));
  if (p.m.summary === true) out.push(...rule('__footer', 'flex flex-wrap items-center justify-between gap-2'));
  return file(out);
}

/** @param {ReturnType<import('./naming.cjs').buildContext>} ctx */
function viewModelSpec(ctx) {
  const { Entity, list, Plural, plural, entityKebab } = ctx;
  const p = plan(ctx);
  const change = changeField(ctx);
  const search = p.searchFields[0];
  const searchSample = value(search.type === 'string' ? `Test ${search.name}` : '');
  const out = [
    "import { TestBed } from '@angular/core/testing';",
    `import { ${Plural}ViewModel } from './${plural}.view-model';`,
    `import { ${Entity}Service } from '../${entityKebab}/${entityKebab}.service';`,
    '',
    `describe('${Plural}ViewModel', () => {`,
    `  let vm: ${Plural}ViewModel;`,
    '',
    '  beforeEach(() => {',
    `    TestBed.configureTestingModule({ providers: [${Plural}ViewModel] });`,
    `    vm = TestBed.inject(${Plural}ViewModel);`,
    '  });',
    '',
    `  it('lists every record by default', () => {`,
    `    expect(vm.filtered().length).toBe(TestBed.inject(${Entity}Service).${list}().length);`,
    '  });',
    '',
    "  it('filters by the search fields', () => {",
    `    const service = TestBed.inject(${Entity}Service);`,
    '    const created = service.create({',
    ...candidateLines(ctx, '      '),
    '    });',
    `    vm.searchQuery.set(${searchSample}.toLowerCase());`,
    '    expect(vm.filtered().map((item) => item.id)).toContain(created.id);',
    "    vm.searchQuery.set('no record contains this');",
    '    expect(vm.filtered()).toEqual([]);',
    '  });',
  ];
  for (const flt of p.selects) {
    out.push(
      '',
      `  it('filters by ${flt.field} and returns every record when the filter is cleared', () => {`,
      `    const service = TestBed.inject(${Entity}Service);`,
      `    vm.${flt.field}Filter.set(vm.${flt.field}FilterOptions[1].value);`,
      `    expect(vm.filtered().every((item) => item.${flt.field} === vm.${flt.field}Filter())).toBe(true);`,
      `    vm.${flt.field}Filter.set('');`,
      `    expect(vm.filtered().length).toBe(service.${list}().length);`,
      '  });',
    );
  }
  for (const flt of p.toggles) {
    const f = flt.f;
    const on = f.type === 'boolean' ? true : flt.value;
    const off = f.type === 'boolean' ? false : f.options.find((o) => o !== flt.value);
    const test = f.type === 'boolean' ? `item.${f.name}` : `item.${f.name} === ${lit(flt.value)}`;
    out.push(
      '',
      `  it('narrows the list when the ${f.name} filter is on', () => {`,
      `    const service = TestBed.inject(${Entity}Service);`,
      '    const matching = service.create({',
      ...candidateLines(ctx, '      ', { [f.name]: on }),
      '    });',
    );
    if (off !== undefined) {
      out.push('    const other = service.create({', ...candidateLines(ctx, '      ', { [f.name]: off }), '    });');
    }
    out.push(
      `    vm.toggle${cap(f.name)}Filter();`,
      `    expect(vm.filtered().every((item) => ${test})).toBe(true);`,
      '    expect(vm.filtered().map((item) => item.id)).toContain(matching.id);',
    );
    if (off !== undefined) out.push('    expect(vm.filtered().map((item) => item.id)).not.toContain(other.id);');
    out.push('  });');
  }
  if (p.sort) {
    const sf = p.sort.f;
    const desc = p.sort.direction === 'desc';
    out.push(
      '',
      `  it('orders the list by ${sf.name}, ${desc ? 'descending' : 'ascending'}', () => {`,
      `    const values = vm.filtered().map((item) => item.${sf.name});`,
      `    expect(values).toEqual([...values].sort((a, b) => ${order(p.sort, 'a', 'b')}));`,
      '  });',
    );
    const formSort = ctx.formFields.find((x) => x.name === sf.name);
    if (sf.type === 'number' && formSort) {
      const low = clamp(sf, 9);
      const high = clamp(sf, 100);
      if (low < high) {
        out.push(
          '',
          `  it('puts the ${desc ? 'larger' : 'smaller'} ${sf.name} first', () => {`,
          `    const service = TestBed.inject(${Entity}Service);`,
          '    const low = service.create({',
          ...candidateLines(ctx, '      ', { [sf.name]: low }),
          '    });',
          '    const high = service.create({',
          ...candidateLines(ctx, '      ', { [sf.name]: high }),
          '    });',
          '    const ids = vm.filtered().map((item) => item.id);',
          `    expect(ids.indexOf(${desc ? 'high' : 'low'}.id)).toBeLessThan(ids.indexOf(${desc ? 'low' : 'high'}.id));`,
          '  });',
        );
      }
    }
  }
  out.push(
    '',
    p.m.createRoute
      ? "  it('creates nothing through save when nothing is being edited: create lives on its own route', () => {"
      : "  it('creates a record through save when nothing is being edited', () => {",
    `    const service = TestBed.inject(${Entity}Service);`,
    `    const before = service.${list}().length;`,
    ...(p.m.createRoute ? [] : ['    vm.startCreate();']),
    '    vm.save({',
    ...candidateLines(ctx, '      '),
    '    });',
    `    expect(service.${list}().length).toBe(before${p.m.createRoute ? '' : ' + 1'});`,
    '    expect(vm.editing()).toBeNull();',
    '  });',
    '',
    "  it('removes a record', () => {",
    `    const service = TestBed.inject(${Entity}Service);`,
    '    const created = service.create({',
    ...candidateLines(ctx, '      '),
    '    });',
    '    vm.remove(created.id);',
    '    expect(service.byId(created.id)).toBeUndefined();',
    '  });',
    '',
    "  it('resolves the record being edited once startEdit runs', () => {",
    `    const service = TestBed.inject(${Entity}Service);`,
    '    const created = service.create({',
    ...candidateLines(ctx, '      '),
    '    });',
    `    expect(vm.editing${Entity}()).toBeUndefined();`,
    '    vm.startEdit(created.id);',
    `    expect(vm.editing${Entity}()?.id).toBe(created.id);`,
    '  });',
    '',
    "  it('updates rather than creates when a record is being edited', () => {",
    `    const service = TestBed.inject(${Entity}Service);`,
    '    const created = service.create({',
    ...candidateLines(ctx, '      '),
    '    });',
    `    const before = service.${list}().length;`,
    '    vm.startEdit(created.id);',
    '    vm.save({',
    ...candidateLines(ctx, '      ', { [change.name]: changedValue(change) }),
    '    });',
    `    expect(service.${list}().length).toBe(before);`,
    `    expect(service.byId(created.id)?.${change.name}).toEqual(${value(changedValue(change))});`,
    '    expect(vm.editing()).toBeNull();',
    '  });',
  );
  for (const c of p.badgeColumns) {
    out.push(
      '',
      `  it('falls back to a default badge variant for an unlisted ${c.field}', () => {`,
      `    expect(vm.${c.field}Variant('not a listed value')).toBe(${lit(c.badge.fallback)});`,
      '  });',
    );
  }
  if (p.m.createRoute) {
    out.push('', "  it('links the create action to its route', () => {", `    expect(vm.createRoute).toBe(${lit(p.m.createRoute)});`, '  });');
  }
  out.push('});');
  return file(out);
}

module.exports = { viewModel, screen, template, styles, viewModelSpec, plan };
