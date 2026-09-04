// Shared helpers for the Part 3 component-shape TS rules. Gate-internal only:
// this is shared among the gate's own rules, never with the counter (the two
// engines stay independent). Operates on typescript-eslint's ESTree AST.

export function hasComponentDecorator(classNode) {
  const decs = classNode.decorators ?? [];
  return decs.some((d) => {
    const e = d.expression;
    const callee = e && e.type === 'CallExpression' ? e.callee : e;
    return callee && callee.type === 'Identifier' && callee.name === 'Component';
  });
}

export function inComponentClass(node) {
  let p = node.parent;
  while (p) {
    if ((p.type === 'ClassDeclaration' || p.type === 'ClassExpression') && hasComponentDecorator(p)) return true;
    p = p.parent;
  }
  return false;
}

export function componentDecoratorObject(classNode) {
  for (const d of classNode.decorators ?? []) {
    const e = d.expression;
    if (e && e.type === 'CallExpression' && e.callee.type === 'Identifier' && e.callee.name === 'Component') {
      const arg = e.arguments[0];
      if (arg && arg.type === 'ObjectExpression') return arg;
    }
  }
  return null;
}
