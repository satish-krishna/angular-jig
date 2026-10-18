import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { addRoute, RoutesError } = require('../lib/routes.cjs');

const route = { path: 'missions', importPath: './missions/missions', className: 'Missions' };
const BLOCK = `  {
    path: 'missions',
    loadComponent: () => import('./missions/missions').then((m) => m.Missions),
  },`;

describe('addRoute', () => {
  it('adds nothing when another path already loads the same component, and names that path', () => {
    const src =
      "export const routes: Routes = [\n  {\n    path: 'roster',\n    loadComponent: () => import('./missions/missions').then((m) => m.Missions),\n  },\n];\n";
    const out = addRoute(src, route);
    expect(out).toEqual({ source: src, added: false, existingPath: 'roster' });
  });

  it('still adds the route when only a different component is loaded', () => {
    const src =
      "export const routes: Routes = [\n  {\n    path: 'roster',\n    loadComponent: () => import('./missions-old/missions').then((m) => m.Missions),\n  },\n];\n";
    expect(addRoute(src, route).added).toBe(true);
  });

  it('appends after a last element that has a trailing comma', () => {
    const src = "export const routes: Routes = [\n  { path: 'a', component: A },\n];\n";
    const out = addRoute(src, route);
    expect(out.added).toBe(true);
    expect(out.source).toBe(`export const routes: Routes = [\n  { path: 'a', component: A },\n${BLOCK}\n];\n`);
  });

  it('adds the missing comma when the last element has none', () => {
    const src = "export const routes: Routes = [\n  { path: 'a', component: A }\n];\n";
    const out = addRoute(src, route);
    expect(out.source).toContain("{ path: 'a', component: A },\n  {\n    path: 'missions',");
    expect(out.source).not.toContain('},,');
  });

  it('fills an empty array', () => {
    const out = addRoute('export const routes: Routes = [];\n', route);
    expect(out.source).toBe(`export const routes: Routes = [\n${BLOCK}\n];\n`);
  });

  it('keeps a catch-all route last', () => {
    const src = "export const routes: Routes = [\n  { path: 'a', component: A },\n  { path: '**', redirectTo: '' },\n];\n";
    const out = addRoute(src, route).source;
    expect(out.indexOf("path: 'missions'")).toBeLessThan(out.indexOf("path: '**'"));
    expect(out.indexOf("path: 'missions'")).toBeGreaterThan(out.indexOf("path: 'a'"));
  });

  it('does nothing when the path already has a route', () => {
    const src = "export const routes: Routes = [\n  { path: 'missions', component: M },\n];\n";
    const out = addRoute(src, route);
    expect(out.added).toBe(false);
    expect(out.source).toBe(src);
  });

  it('ignores the word routes inside strings and comments, and finds the real array', () => {
    const src = "// const routes = [ nope ]\nconst note = 'const routes = [x]';\nexport const routes: Routes = [\n  { path: 'a', component: A },\n];\n";
    expect(addRoute(src, route).source).toContain("path: 'missions'");
  });

  it.each([
    ['a function call', 'export const routes = buildRoutes();\n'],
    ['no routes variable', "export const other = [{ path: 'a' }];\n"],
    ['a spread of another file', "export const routes = [...shared];\nexport default routes;\n".replace('[...shared]', 'shared')],
    ['an empty file', ''],
  ])('refuses rather than guesses on %s', (_name, src) => {
    expect(() => addRoute(src, route)).toThrow(RoutesError);
  });
});
