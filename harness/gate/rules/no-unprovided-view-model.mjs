import { isViewModelName, nearestComponentClass, componentDecoratorObject } from './component-util.ts';

// Rule 10 of the component-shape spec: a @Component that injects a ViewModel
// (inject(X) where X ends in `ViewModel`) must list that same X in its own
// @Component providers array. A component-scoped ViewModel that is injected
// without being provided is a NullInjectorError at runtime, not a build
// failure. `providers: [...someSpread]` is not statically resolvable and is
// treated as satisfying the rule (a stated blind spot, not a bug). messageId
// `vmNotProvided` maps to the counter's `vm-not-provided` kind.
function providersInfo(classNode) {
  const obj = componentDecoratorObject(classNode);
  const names = new Set();
  let hasSpread = false;
  if (obj) {
    const providersProp = obj.properties.find(
      (p) => p.type === 'Property' && p.key && p.key.type === 'Identifier' && p.key.name === 'providers',
    );
    if (providersProp && providersProp.value.type === 'ArrayExpression') {
      for (const el of providersProp.value.elements) {
        if (el && el.type === 'Identifier') names.add(el.name);
        if (el && el.type === 'SpreadElement') hasSpread = true;
      }
    }
  }
  return { names, hasSpread };
}

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow injecting a ViewModel without listing it in the component providers.' },
    schema: [],
    messages: {
      vmNotProvided:
        'Component shape: {{name}} is injected but not provided, which is a NullInjectorError at runtime. ' +
        'Add providers: [{{name}}] to this component\'s @Component metadata (see harness/component-shape-spec.md, rule 10).',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const c = node.callee;
        if (!(c && c.type === 'Identifier' && c.name === 'inject')) return;
        if (!node.arguments.length || node.arguments[0].type !== 'Identifier') return;
        const name = node.arguments[0].name;
        if (!isViewModelName(name)) return;
        const classNode = nearestComponentClass(node);
        if (!classNode) return;
        const { names, hasSpread } = providersInfo(classNode);
        if (!hasSpread && !names.has(name)) {
          context.report({ node, messageId: 'vmNotProvided', data: { name } });
        }
      },
    };
  },
};
