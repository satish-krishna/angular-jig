import { componentDecoratorObject } from './component-util.mjs';

// Rule 11 of the component-shape spec (capstone-residue): no explicit
// `standalone` in @Component. CLAUDE.md, verbatim: "Must NOT set
// `standalone: true` inside Angular decorators. It's the default in Angular
// v20+." Same AST shape as rule 1 (hand-set-change-detection): the presence
// of the property key in the decorator's object literal, to any value, not
// its value. messageId `explicitStandalone` maps to the counter's
// `explicit-standalone` kind.
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow an explicit standalone in @Component; standalone is the v20+ default.' },
    schema: [],
    messages: {
      explicitStandalone:
        'Component shape: do not set standalone explicitly. Standalone is the Angular v20+ default (see CLAUDE.md ' +
        'and harness/component-shape-spec.md, rule 11); remove the standalone property.',
    },
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        const obj = componentDecoratorObject(node);
        if (!obj) return;
        const prop = obj.properties.find(
          (p) =>
            p.type === 'Property' &&
            p.key &&
            ((p.key.type === 'Identifier' && p.key.name === 'standalone') ||
              (p.key.type === 'Literal' && p.key.value === 'standalone')),
        );
        if (prop) context.report({ node: prop, messageId: 'explicitStandalone' });
      },
    };
  },
};
