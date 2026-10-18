// Test helper: run the slice schematic in memory through the real devkit runner.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { HostTree } = require('@angular-devkit/schematics');
const { SchematicTestRunner } = require('@angular-devkit/schematics/testing');
const { NodeWorkflow } = require('@angular-devkit/schematics/tools');

export const SLICE_DIR = join(here, '..');
export const COLLECTION = join(here, '..', '..', 'collection.json');
export const FIXTURES = ['book', 'member', 'loan'];
export const BASE_ROUTES = readFileSync(join(here, 'base-app.routes.ts'), 'utf8');

export const readFixture = (name) => readFileSync(join(SLICE_DIR, 'fixtures', `${name}.json`), 'utf8');
export const spec = require('../spec-schema.cjs');

export const runner = () => new SchematicTestRunner('local', COLLECTION);

/** A fresh in-memory workspace holding a base routes file and the given spec files. */
export function workspace(specs = {}, extra = {}) {
  const tree = new HostTree();
  tree.create('src/app/app.routes.ts', extra.routes ?? BASE_ROUTES);
  for (const [path, content] of Object.entries(specs)) tree.create(path, content);
  return tree;
}

/** Run the schematic and return a Map of every file it created or changed, path -> content. */
export async function generate(specPath, tree, options = {}) {
  const r = runner();
  const result = await r.runSchematic('slice', { spec: specPath, ...options }, tree);
  const out = new Map();
  for (const file of result.files.sort()) out.set(file.replace(/^\//, ''), result.readContent(file));
  return out;
}

/** Generate one fixture into a fresh workspace; returns only the files the schematic produced. */
export async function generateFixture(name) {
  const tree = workspace({ [`specs/${name}.json`]: readFixture(name) });
  const all = await generate(`specs/${name}.json`, tree);
  all.delete(`specs/${name}.json`);
  if (all.get('src/app/app.routes.ts') === BASE_ROUTES) all.delete('src/app/app.routes.ts');
  return all;
}

/**
 * Run the schematic the way `ng generate` does: the CLI's own NodeWorkflow against a real
 * directory, with its sinks, so the overwrite policy (refuse unless force) is the real one.
 * @returns {Promise<{ ok: boolean, conflicts: string[], message: string }>}
 */
export async function cliRun(dir, specPath, { force = false, kinds } = {}) {
  const workflow = new NodeWorkflow(dir, { force, dryRun: false });
  const conflicts = [];
  workflow.reporter.subscribe((event) => {
    if (event.kind === 'error' && event.description === 'alreadyExist') conflicts.push(event.path.replace(/^\//, ''));
  });
  const messages = [];
  const logger = {
    info: (m) => messages.push(m),
    warn: (m) => messages.push(m),
    error: (m) => messages.push(m),
    fatal: (m) => messages.push(m),
    debug() {},
    createChild() {
      return logger;
    },
  };
  try {
    await workflow.execute({ collection: COLLECTION, schematic: 'slice', options: { spec: specPath, ...(kinds !== undefined ? { kinds } : {}) }, logger }).toPromise();
    return { ok: true, conflicts, message: messages.join('\n') };
  } catch (error) {
    return { ok: false, conflicts, message: `${error.message}\n${messages.join('\n')}` };
  }
}
