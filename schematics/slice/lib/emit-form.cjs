'use strict';

/**
 * Kind `form`: a standalone component built from the entity's zod schema, one hlm-field
 * block per form field chosen by control kind. Spec text never appears in the template:
 * labels, placeholders and help are read from the schema's meta at runtime.
 */

const { value, file, blankValue, constantFromCamel } = require('./naming.cjs');

const isSelect = (f) => f.type === 'enum' || f.type === 'ref';

/** The `<hlm-field>` block for one form field. */
function fieldBlock(ctx, f) {
  const form = `${ctx.entity}Form`;
  const n = f.name;
  const out = [];
  out.push('        <hlm-field>');
  if (f.type === 'boolean') {
    out.push(`          <label hlmFieldLabel class="${ctx.entityKebab}-form__switch">`);
    out.push(`            <hlm-switch [formField]="${form}.${n}" />`);
    out.push(`            {{ meta['${n}'].label }}`);
    out.push('          </label>');
  } else {
    out.push(`          <label hlmFieldLabel for="${n}">{{ meta['${n}'].label }}</label>`);
    if (f.type === 'string' || f.type === 'date') {
      out.push(
        `          <input hlmInput id="${n}" [formField]="${form}.${n}" [placeholder]="meta['${n}'].placeholder ?? ''" />`,
      );
    } else if (f.type === 'number') {
      out.push(`          <input hlmInput id="${n}" type="number" [formField]="${form}.${n}" />`);
    } else if (f.type === 'text') {
      out.push(
        '          <textarea',
        '            hlmTextarea',
        `            id="${n}"`,
        '            rows="4"',
        `            [formField]="${form}.${n}"`,
        `            [placeholder]="meta['${n}'].placeholder ?? ''"`,
        '          ></textarea>',
      );
    } else {
      const source = f.type === 'enum' ? `${n}Options` : `${n}Options()`;
      out.push(
        `          <hlm-select [formField]="${form}.${n}" [itemToString]="${n}ToString">`,
        `            <hlm-select-trigger buttonId="${n}" width="full">`,
        `              <hlm-select-value [placeholder]="meta['${n}'].placeholder ?? ''" />`,
        '            </hlm-select-trigger>',
        '            <hlm-select-content *hlmSelectPortal>',
        '              <hlm-select-group>',
        `                <hlm-select-label>{{ meta['${n}'].label }}</hlm-select-label>`,
        `                @for (option of ${source}; track option.value) {`,
        '                  <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>',
        '                }',
        '              </hlm-select-group>',
        '            </hlm-select-content>',
        '          </hlm-select>',
      );
    }
  }
  if (f.help !== undefined) out.push(`          <hlm-field-description>{{ meta['${n}'].help }}</hlm-field-description>`);
  out.push(
    `          @for (error of ${form}.${n}().errors(); track error) {`,
    '            <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>',
    '          }',
    '        </hlm-field>',
  );
  return out;
}

/** @param {ReturnType<import('./naming.cjs').buildContext>} ctx */
function form(ctx) {
  const { Entity, entity, entityKebab, formFields } = ctx;
  const formVar = `${entity}Form`;
  const types = new Set(formFields.map((f) => f.type));
  const hasEnum = types.has('enum');
  const hasSelect = hasEnum || types.has('ref');
  const modelType = `${Entity}FormModel`;

  const out = [
    "import { Component, computed, input, linkedSignal, output } from '@angular/core';",
    "import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';",
    "import { HlmButtonImports } from '@spartan-ng/helm/button';",
    "import { HlmFieldImports } from '@spartan-ng/helm/field';",
  ];
  if (types.has('string') || types.has('number') || types.has('date')) out.push("import { HlmInputImports } from '@spartan-ng/helm/input';");
  if (hasSelect) out.push("import { HlmSelectImports } from '@spartan-ng/helm/select';");
  if (types.has('boolean')) out.push("import { HlmSwitchImports } from '@spartan-ng/helm/switch';");
  if (types.has('text')) out.push("import { HlmTextareaImports } from '@spartan-ng/helm/textarea';");
  if (hasEnum) out.push("import type { FormFieldMeta } from '../../forms/form-field-meta';");
  out.push(
    "import { formMeta } from '../../forms/zod-meta';",
    `import { ${entity}Schema, type ${modelType} } from '../../${entityKebab}/${entityKebab}.schema';`,
    '',
    `const meta = formMeta(${entity}Schema);`,
  );
  for (const f of formFields.filter((x) => x.type === 'enum')) {
    out.push(`const ${constantFromCamel(f.name)}_OPTIONS: NonNullable<FormFieldMeta['options']> = meta['${f.name}'].options ?? [];`);
  }
  out.push(
    '',
    "/** Narrow whatever the caller passes down to exactly the schema's shape. */",
    `const project = (value: ${modelType}): ${modelType} => ({`,
    ...formFields.map((f) => `  ${f.name}: value.${f.name},`),
    '});',
    '',
    `const sameValue = (a: ${modelType}, b: ${modelType}) =>`,
    ...formFields.map((f, i) => `  a.${f.name} === b.${f.name}${i === formFields.length - 1 ? ';' : ' &&'}`),
    '',
    '@Component({',
    `  selector: 'app-${entityKebab}-form',`,
    '  imports: [',
    '    FormRoot,',
    '    FormField,',
    '    HlmFieldImports,',
    ...(types.has('string') || types.has('number') || types.has('date') ? ['    HlmInputImports,'] : []),
    '    HlmButtonImports,',
    ...(hasSelect ? ['    HlmSelectImports,'] : []),
    ...(types.has('boolean') ? ['    HlmSwitchImports,'] : []),
    ...(types.has('text') ? ['    HlmTextareaImports,'] : []),
    '  ],',
    `  templateUrl: './${entityKebab}-form.html',`,
    `  styleUrl: './${entityKebab}-form.css',`,
    '})',
    `export class ${Entity}Form {`,
    `  readonly initialValue = input<${modelType}>({`,
    ...formFields.map((f) => `    ${f.name}: ${value(blankValue(f))},`),
    '  });',
  );
  for (const f of formFields.filter((x) => x.type === 'ref')) {
    out.push(`  readonly ${f.name}Options = input<ReadonlyArray<{ value: string; label: string }>>([]);`);
  }
  out.push(
    "  readonly submitLabel = input('Save');",
    `  readonly save${Entity} = output<${modelType}>();`,
    '  readonly cancel = output<void>();',
    '',
    '  // Compared by value, not identity: a caller that hands us a fresh object with the',
    '  // same contents on every change detection pass must not reseed the form mid-typing.',
    '  private readonly seed = computed(() => project(this.initialValue()), { equal: sameValue });',
    '',
    '  // linkedSignal, not signal: an input is not readable from a field initializer, so',
    '  // `signal(this.initialValue())` freezes the form on the default and never shows the',
    '  // record being edited. This reseeds when the caller genuinely passes a different record.',
    '  protected readonly model = linkedSignal(() => this.seed());',
    '',
    '  // The zod schema is the only validator: shape, rules, and labels all come from it.',
    `  protected readonly ${formVar} = form(`,
    '    this.model,',
    `    (path) => validateStandardSchema(path, ${entity}Schema),`,
    '    {',
    '      submission: {',
    '        action: async (field) => {',
    `          this.save${Entity}.emit(field().value());`,
    '        },',
    '      },',
    '    }',
    '  );',
    '',
    '  protected readonly meta = meta;',
  );
  for (const f of formFields.filter((x) => x.type === 'enum')) {
    const c = `${constantFromCamel(f.name)}_OPTIONS`;
    out.push(`  protected readonly ${f.name}Options = ${c};`);
  }
  for (const f of formFields.filter(isSelect)) {
    if (f.type === 'enum') {
      const c = `${constantFromCamel(f.name)}_OPTIONS`;
      out.push(
        `  protected readonly ${f.name}ToString = (value: string) =>`,
        `    ${c}.find((option) => option.value === value)?.label ?? '';`,
      );
    } else {
      out.push(
        `  protected readonly ${f.name}ToString = (value: string | null) =>`,
        `    this.${f.name}Options().find((option) => option.value === value)?.label ?? '';`,
      );
    }
  }
  out.push('}');
  return file(out);
}

/** The `.html` of the form: one hlm-field block per form field, BEM classes only. */
function formTemplate(ctx) {
  const { entity, entityKebab, formFields } = ctx;
  const out = [`<form class="${entityKebab}-form" [formRoot]="${entity}Form">`, '  <hlm-field-group>'];
  formFields.forEach((f, i) => {
    if (i > 0) out.push('');
    out.push(...fieldBlock(ctx, f).map((l) => l.slice(4)));
  });
  out.push(
    '',
    '    <hlm-field orientation="horizontal">',
    '      <button hlmBtn type="submit">{{ submitLabel() }}</button>',
    '      <button hlmBtn type="button" variant="outline" (click)="cancel.emit()">Cancel</button>',
    '    </hlm-field>',
    '  </hlm-field-group>',
    '</form>',
  );
  return file(out);
}

/** The `.css` of the form: layout only, every BEM class written out in full. */
function formStyles(ctx) {
  const { entityKebab, formFields } = ctx;
  const b = `${entityKebab}-form`;
  const out = ['@reference "../../../styles.css";', '', `.${b} {`, '  @apply grid gap-6;', '}'];
  if (formFields.some((f) => f.type === 'boolean')) out.push('', `.${b}__switch {`, '  @apply flex items-center gap-2;', '}');
  return file(out);
}

module.exports = { form, formTemplate, formStyles };
