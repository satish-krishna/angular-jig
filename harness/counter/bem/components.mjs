// Reads the @Component decorators in a .ts file, and the string literals that
// could be class lists. Strings inside a decorator (selector, paths, inline
// template) and module specifiers are not class lists and are skipped; a
// decorator's host `class` is returned separately, because it is always one.
import ts from 'typescript';

export const stringValue = (n) => (n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : null);

export const stringList = (n) => {
  if (!n) return [];
  if (ts.isArrayLiteralExpression(n)) return n.elements.map(stringValue).filter((s) => s != null);
  const s = stringValue(n);
  return s == null ? [] : [s];
};

export function readComponents(path, text) {
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const lineOf = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const skip = new Set();
  const markSkip = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) skip.add(node);
    ts.forEachChild(node, markSkip);
  };
  const components = [];
  const hostClasses = [];
  const strings = [];
  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) markSkip(node);
    if (
      ts.isDecorator(node) &&
      ts.isCallExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'Component'
    ) {
      markSkip(node);
      const arg = node.expression.arguments[0];
      const props = {};
      if (arg && ts.isObjectLiteralExpression(arg)) {
        for (const p of arg.properties) {
          if (ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) props[p.name.text] = p.initializer;
        }
      }
      if (props.host && ts.isObjectLiteralExpression(props.host)) {
        for (const p of props.host.properties) {
          const value = ts.isPropertyAssignment(p) ? stringValue(p.initializer) : null;
          if (value != null && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === 'class') {
            hostClasses.push({ text: value, line: lineOf(p) });
          }
        }
      }
      components.push({ line: lineOf(node), props, templateLine: props.template ? lineOf(props.template) : null });
    }
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !skip.has(node)) {
      strings.push({ text: node.text, line: lineOf(node) });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { components, hostClasses, strings };
}
