import { componentDecoratorObject } from './component-util.mjs';

// Disallow an explicit standalone in @Component; standalone is the v20+ default.
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
