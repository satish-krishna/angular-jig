'use strict';

/**
 * Add a lazy route to src/app/app.routes.ts using the TypeScript parser to find the routes
 * array. Pure string in, string out. Throws a RoutesError rather than guessing when the file
 * is not in the shape it understands.
 */

const ts = require('typescript');

class RoutesError extends Error {}

/**
 * @param {string} source contents of app.routes.ts
 * @param {{ path: string, importPath: string, className: string }} route
 * @returns {{ source: string, added: boolean, existingPath?: string }} added is false when the path already has a route or another route already loads the component
 */
function addRoute(source, route) {
  const sf = ts.createSourceFile('app.routes.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  /** @type {import('typescript').ArrayLiteralExpression | null} */
  let array = null;
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.name.text === 'routes' && decl.initializer && ts.isArrayLiteralExpression(decl.initializer)) {
        array = decl.initializer;
      }
    }
  }
  if (!array) {
    throw new RoutesError(
      'Could not find `const routes = [ ... ]` (an array literal) in app.routes.ts. Add the route by hand: ' +
        `{ path: '${route.path}', loadComponent: () => import('${route.importPath}').then((m) => m.${route.className}) }`,
    );
  }

  const pathOf = (el) => {
    if (!ts.isObjectLiteralExpression(el)) return undefined;
    for (const prop of el.properties) {
      if (ts.isPropertyAssignment(prop) && prop.name.getText(sf) === 'path' && ts.isStringLiteralLike(prop.initializer)) {
        return prop.initializer.text;
      }
    }
    return undefined;
  };

  /** The module specifier of the first dynamic import() inside an element, if any. */
  const importOf = (el) => {
    let found;
    const visit = (node) => {
      if (found !== undefined) return;
      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length > 0 &&
        ts.isStringLiteralLike(node.arguments[0])
      ) {
        found = node.arguments[0].text;
        return;
      }
      ts.forEachChild(node, visit);
    };
    visit(el);
    return found;
  };
  const sameModule = (a, b) => a !== undefined && a.replace(/\.ts$/, '') === b.replace(/\.ts$/, '');

  const elements = [...array.elements];
  if (elements.some((el) => pathOf(el) === route.path)) return { source, added: false, existingPath: route.path };
  // A shell that already routes another path to this component (for example 'roster' to
  // ./heroes/heroes) keeps that path: a second route would split the screen across two URLs.
  const loading = elements.find((el) => sameModule(importOf(el), route.importPath));
  if (loading) return { source, added: false, existingPath: pathOf(loading) ?? '' };

  const block = [
    '  {',
    `    path: '${route.path}',`,
    `    loadComponent: () => import('${route.importPath}').then((m) => m.${route.className}),`,
    '  },',
  ].join('\n');

  // Keep a catch-all last: insert before it when there is one.
  const wildcard = elements.findIndex((el) => pathOf(el) === '**');
  if (wildcard >= 0) {
    const at = elements[wildcard].getFullStart();
    const lineStart = source.lastIndexOf('\n', elements[wildcard].getStart(sf)) + 1;
    void at;
    return { source: source.slice(0, lineStart) + block + '\n' + source.slice(lineStart), added: true };
  }

  if (elements.length === 0) {
    const open = array.getStart(sf) + 1;
    return { source: source.slice(0, open) + '\n' + block + '\n' + source.slice(open), added: true };
  }

  const last = elements[elements.length - 1];
  const afterLast = last.getEnd();
  const rest = source.slice(afterLast);
  const comma = /^\s*,/.exec(rest);
  if (comma) {
    const insertAt = afterLast + comma[0].length;
    return { source: source.slice(0, insertAt) + '\n' + block + source.slice(insertAt), added: true };
  }
  return { source: source.slice(0, afterLast) + ',\n' + block.replace(/,$/, '') + source.slice(afterLast), added: true };
}

module.exports = { addRoute, RoutesError };
