'use strict';

/**
 * The `slice` schematic: reads one spec file and emits the kinds it lists, or the subset --kinds names.
 *
 *   ng generate slice --spec specs/hero.json [--kinds entity|form|manage[,...]] [--force]
 *
 * Plain CommonJS, no compile step. Deterministic: the same spec yields byte-identical files.
 *
 * Write policy, per file:
 * - absent: created.
 * - identical to what the generator emits (line endings aside): skipped and logged as Unchanged.
 * - carrying the placeholder marker: overwritten without --force.
 * - anything else: added with tree.create(), so the CLI's workflow refuses the whole run and writes
 *   nothing; `--force` (a built-in `ng generate` flag the schematic never sees) lets it overwrite.
 * app.routes.ts is the one file that is edited rather than created.
 */

const { SchematicsException } = require('@angular-devkit/schematics');
const { parseSpec } = require('./spec-schema.cjs');
const { buildContext, kebab, GENERATED_HEADER, PLACEHOLDER_MARKER } = require('./lib/naming.cjs');
const entity = require('./lib/emit-entity.cjs');
const { form, formTemplate, formStyles } = require('./lib/emit-form.cjs');
const manage = require('./lib/emit-manage.cjs');
const { addRoute, RoutesError } = require('./lib/routes.cjs');
const { formatSource } = require('./lib/format.cjs');

const ROUTES_FILE = 'src/app/app.routes.ts';
const KIND_ORDER = ['entity', 'form', 'manage'];

/** What each kind imports from the others. */
const NEEDS = { entity: [], form: ['entity'], manage: ['entity', 'form'] };

/**
 * Pure: spec in, files out. Keys are workspace-relative paths in a fixed order.
 * @param {any} spec a spec that already passed parseSpec
 * @param {string[]} [kinds] the kinds to emit; defaults to every kind the spec lists
 * @returns {Map<string, string>}
 */
function generateFiles(spec, kinds = spec.kinds) {
  const ctx = buildContext(spec);
  const files = new Map();
  if (kinds.includes('entity')) {
    files.set(ctx.paths.model, entity.model(ctx));
    files.set(ctx.paths.schema, entity.schema(ctx));
    files.set(ctx.paths.service, entity.service(ctx));
    files.set(ctx.paths.example, entity.exampleData(ctx));
    files.set(ctx.paths.serviceSpec, entity.serviceSpec(ctx));
  }
  if (kinds.includes('form')) {
    files.set(ctx.paths.form, form(ctx));
    files.set(ctx.paths.formTemplate, formTemplate(ctx));
    files.set(ctx.paths.formStyles, formStyles(ctx));
  }
  if (kinds.includes('manage')) {
    files.set(ctx.paths.screen, manage.screen(ctx));
    files.set(ctx.paths.template, manage.template(ctx));
    files.set(ctx.paths.styles, manage.styles(ctx));
    files.set(ctx.paths.viewModel, manage.viewModel(ctx));
    files.set(ctx.paths.viewModelSpec, manage.viewModelSpec(ctx));
  }
  for (const [path, content] of files) {
    if (path.endsWith('.ts')) files.set(path, `${GENERATED_HEADER}\n${content}`);
  }
  return files;
}

/**
 * The kinds this run generates: the --kinds subset, in the fixed order, or every kind the spec lists.
 * @param {unknown} option the raw --kinds value
 * @param {any} spec
 * @param {string} specPath
 * @returns {string[]}
 */
function selectKinds(option, spec, specPath) {
  if (option === undefined || option === null || String(option).trim() === '') return [...spec.kinds];
  const asked = [...new Set(String(option).split(',').map((k) => k.trim()).filter(Boolean))];
  const unknown = asked.filter((k) => !KIND_ORDER.includes(k));
  if (unknown.length) {
    throw new SchematicsException(
      `--kinds names ${unknown.map((k) => `"${k}"`).join(', ')}, which is not a kind; the kinds are entity, form and manage.`,
    );
  }
  const unlisted = asked.filter((k) => !spec.kinds.includes(k));
  if (unlisted.length) {
    throw new SchematicsException(
      `--kinds names ${unlisted.join(', ')}, which ${specPath} does not list in its kinds (${spec.kinds.join(', ')}).`,
    );
  }
  return KIND_ORDER.filter((k) => asked.includes(k));
}

/**
 * A kind whose dependency is not generated in this run needs that dependency's files on disk.
 * Throws one readable message per missing dependency.
 */
function checkDependencies(tree, ctx, kinds, specPath) {
  const onDisk = { entity: [ctx.paths.model, ctx.paths.schema, ctx.paths.service], form: [ctx.paths.form] };
  const problems = [];
  for (const kind of kinds) {
    for (const dep of NEEDS[kind]) {
      if (kinds.includes(dep)) continue;
      const missing = onDisk[dep].filter((p) => !tree.exists(p));
      if (!missing.length) continue;
      const together = KIND_ORDER.filter((k) => k === dep || kinds.includes(k)).join(',');
      problems.push(
        `--kinds ${kind} needs the ${dep} kind's files on disk, and ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} missing. ` +
          `Generate them first (ng g slice --spec ${specPath} --kinds ${dep}) or in the same run (--kinds ${together}).`,
      );
    }
  }
  if (problems.length) throw new SchematicsException(problems.join('\n'));
}

/** Field types whose values are strings, so they fit the `label: string` of a select option. */
const LABEL_TYPES = ['string', 'text', 'enum', 'date'];

/**
 * When the spec of a referenced entity sits at specs/<entity>.json, check that the ref names a
 * real, string-valued label field and the right plural. Returns problems; skips silently when the
 * target spec is absent or itself invalid (that spec reports its own problems when generated).
 * @param {import('@angular-devkit/schematics').Tree} tree
 * @param {any} spec
 * @returns {string[]}
 */
function checkRefTargets(tree, spec) {
  const problems = [];
  for (const f of spec.fields) {
    if (f.type !== 'ref') continue;
    const buffer = tree.read(`specs/${kebab(f.ref.entity)}.json`);
    if (!buffer) continue;
    let target;
    try {
      const parsed = parseSpec(JSON.parse(buffer.toString('utf8')));
      if (!parsed.ok) continue;
      target = parsed.spec;
    } catch {
      continue;
    }
    if (target.entity !== f.ref.entity) continue;
    if (target.plural !== f.ref.plural) {
      problems.push(`${f.name}: ref plural "${f.ref.plural}" does not match "${target.plural}" in specs/${kebab(f.ref.entity)}.json`);
    }
    const label = target.fields.find((t) => t.name === f.ref.label);
    if (!label) problems.push(`${f.name}: ref label "${f.ref.label}" is not a field of ${f.ref.entity}`);
    else if (!LABEL_TYPES.includes(label.type)) {
      problems.push(`${f.name}: ref label "${f.ref.label}" is a ${label.type} field of ${f.ref.entity}; it must be a string, text, enum or date field`);
    }
  }
  return problems;
}

/**
 * @param {{ spec: string, kinds?: string }} options
 * @returns {import('@angular-devkit/schematics').Rule}
 */
function slice(options) {
  return async (tree, context) => {
    const specPath = String(options.spec).replace(/\\/g, '/').replace(/^\.\//, '');
    const buffer = tree.read(specPath);
    if (!buffer) {
      throw new SchematicsException(`Spec file not found: ${specPath} (the path is relative to the workspace root)`);
    }
    let data;
    try {
      data = JSON.parse(buffer.toString('utf8'));
    } catch (e) {
      throw new SchematicsException(`Spec file ${specPath} is not valid JSON: ${e.message}`);
    }
    const parsed = parseSpec(data);
    if (!parsed.ok) {
      throw new SchematicsException(
        `Spec file ${specPath} is not valid:\n${parsed.errors.map((e) => `  - ${e}`).join('\n')}\n` +
          'It must satisfy schematics/slice/spec.schema.json.',
      );
    }
    const spec = parsed.spec;
    const kinds = selectKinds(options.kinds, spec, specPath);
    const refProblems = checkRefTargets(tree, spec);
    if (refProblems.length) {
      const list = refProblems.map((e) => `  - ${e}`).join(String.fromCharCode(10));
      throw new SchematicsException(`Spec file ${specPath} has bad references:${String.fromCharCode(10)}${list}`);
    }
    const ctx = buildContext(spec);
    checkDependencies(tree, ctx, kinds, specPath);
    const files = generateFiles(spec, kinds);

    let routesSource = null;
    let routed = null;
    if (kinds.includes('manage')) {
      const existing = tree.read(ROUTES_FILE);
      if (!existing) throw new SchematicsException(`Cannot add the route: ${ROUTES_FILE} does not exist.`);
      try {
        routed = addRoute(existing.toString('utf8'), {
          path: spec.plural,
          importPath: `./${spec.plural}/${spec.plural}`,
          className: ctx.Plural,
        });
      } catch (e) {
        if (e instanceof RoutesError) throw new SchematicsException(e.message);
        throw e;
      }
      routesSource = routed.source;
    }

    const formatted = new Map();
    for (const [path, content] of files) formatted.set(path, await formatSource(path, content));
    if (routed && routed.added) routesSource = await formatSource(ROUTES_FILE, routesSource);

    for (const [path, content] of formatted) {
      const existing = tree.read(path);
      if (!existing) {
        tree.create(path, content);
        continue;
      }
      const text = existing.toString('utf8');
      if (text.replace(/\r\n/g, '\n') === content) context.logger.info(`Unchanged: ${path}`);
      else if (text.includes(PLACEHOLDER_MARKER)) tree.overwrite(path, content);
      else tree.create(path, content); // refused by the CLI unless --force, which overwrites
    }
    if (routed && routed.added) tree.overwrite(ROUTES_FILE, routesSource);
    else if (routed) {
      context.logger.info(
        routed.existingPath === spec.plural
          ? `Route "${spec.plural}" already exists in ${ROUTES_FILE}; left as is.`
          : `Route "${routed.existingPath}" already loads ./${spec.plural}/${spec.plural} in ${ROUTES_FILE}; left as is, no second route added.`,
      );
    }
  };
}

module.exports = { slice, generateFiles };
