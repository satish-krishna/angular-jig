import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { FIXTURES, SLICE_DIR, generateFixture } from './run.mjs';
import { checkStylesheet, loadUtilityOracle, templateUtilities, stemOf } from '../../../harness/gate/app-css/index.mjs';

const require = createRequire(import.meta.url);
const { parseSpec } = require('../spec-schema.cjs');
const { generateFiles } = require('../index.cjs');
const ROOT = join(SLICE_DIR, '..', '..');
const NOVEL = ['gadget', 'ticket', 'shipment', 'status-note'];
const novelFiles = (name) => generateFiles(parseSpec(JSON.parse(readFileSync(join(SLICE_DIR, 'fixtures', 'novel', `${name}.json`), 'utf8'))).spec);

let isUtility;
beforeAll(async () => { isUtility = await loadUtilityOracle(join(ROOT, 'src', 'styles.css')); });

const BEM = (stem) => new RegExp(`^${stem}(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$`);
const classTokens = (html) => [...html.matchAll(/\sclass=(?:"([^"]*)"|'([^']*)')/g)].flatMap((m) => (m[1] ?? m[2]).split(/\s+/).filter(Boolean));

async function allOutputs() {
  const sets = [];
  for (const name of FIXTURES) sets.push([name, await generateFixture(name)]);
  for (const name of NOVEL) sets.push([`novel/${name}`, novelFiles(name)]);
  return sets;
}

describe('every emitted component follows the series 3 house style', () => {
  it('is a triad: each component .ts names its own .html and .css, and both are emitted', async () => {
    for (const [name, files] of await allOutputs()) {
      for (const [path, content] of files) {
        if (!/@Component\(/.test(content)) continue;
        const base = path.replace(/\.ts$/, '');
        const stem = base.split('/').pop();
        expect(content, `${name} ${path}`).not.toMatch(/\btemplate:\s*`|\bstyles:\s*[[`]/);
        expect(content, `${name} ${path}`).toContain(`templateUrl: './${stem}.html'`);
        expect(content, `${name} ${path}`).toContain(`styleUrl: './${stem}.css'`);
        expect(files.has(`${base}.html`) && files.has(`${base}.css`), `${name} ${base}`).toBe(true);
        expect(base.split('/').at(-2), `${name} ${base}: folder named for the component`).toBe(stem);
      }
    }
  });

  it('templates carry BEM classes of their own block only, and no utility', async () => {
    for (const [name, files] of await allOutputs()) {
      for (const [path, content] of files) {
        if (!path.endsWith('.html')) continue;
        const stem = stemOf(path.replace(/\.html$/, '.css')); // stemOf only strips .css
        for (const token of classTokens(content)) expect(token, `${name} ${path}`).toMatch(BEM(stem));
        expect(templateUtilities(content, path, isUtility), `${name} ${path}`).toEqual([]);
      }
    }
  });

  it('the first element of every template carries the block class, not just block elements', async () => {
    for (const [name, files] of await allOutputs()) {
      for (const [path, content] of files) {
        if (!path.endsWith('.html')) continue;
        const stem = stemOf(path.replace(/.html$/, '.css'));
        const root = content.match(/<[a-z][w-]*(?:"[^"]*"|'[^']*'|[^>"'])*>/)?.[0] ?? '';
        expect(classTokens(root), `${name} ${path}: root element ${root.slice(0, 60)}`).toContain(stem);
      }
    }
  });

  it('stylesheets are layout only, padding on the block root only, and start with the right @reference', async () => {
    for (const [name, files] of await allOutputs()) {
      for (const [path, content] of files) {
        if (!path.endsWith('.css')) continue;
        const depth = path.split('/').length - 2; // src/app/x/x.css -> 2
        expect(content.split('\n')[0], `${name} ${path}`).toBe(`@reference "${'../'.repeat(depth)}styles.css";`);
        expect(checkStylesheet(content, { stem: stemOf(path), global: false }), `${name} ${path}`).toEqual([]);
      }
    }
  });

  it('every class a stylesheet defines is used by its template, and every template class is defined', async () => {
    for (const [name, files] of await allOutputs()) {
      for (const [path, css] of files) {
        if (!path.endsWith('.css')) continue;
        const html = files.get(path.replace(/\.css$/, '.html')) ?? '';
        const defined = new Set([...css.matchAll(/^\.([a-z0-9_-]+)\s*\{/gm)].map((m) => m[1]));
        const used = new Set(classTokens(html));
        for (const c of defined) expect(used.has(c), `${name} ${path} defines unused .${c}`).toBe(true);
        for (const c of used) expect(defined.has(c), `${name} ${path} template uses undefined .${c}`).toBe(true);
      }
    }
  });

  it('every ng-icon carries hlmIcon', async () => {
    for (const [name, files] of await allOutputs()) {
      for (const [path, content] of files) {
        if (!path.endsWith('.html')) continue;
        for (const tag of content.match(/<ng-icon\b[^>]*>/g) ?? []) expect(tag, `${name} ${path}`).toMatch(/\bhlmIcon\b/);
      }
    }
  });
});
