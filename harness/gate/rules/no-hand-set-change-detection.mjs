import { componentDecoratorObject } from './component-util.ts';

// Rule 1 of the component-shape spec: no explicit changeDetection in @Component.
// OnPush is the Angular v22 default, and CLAUDE.md says not to set it. messageId
// `handSetChangeDetection` maps to the counter's `hand-set-change-detection` kind.
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow an explicit changeDetection in @Component; OnPush is the v22 default.' },
    schema: [],
    messages: {
      handSetChangeDetection:
        'Component shape: do not set changeDetection explicitly. OnPush is the Angular v22 default; remove the changeDetection property.',
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
            ((p.key.type === 'Identifier' && p.key.name === 'changeDetection') ||
              (p.key.type === 'Literal' && p.key.value === 'changeDetection')),
        );
        if (prop) context.report({ node: prop, messageId: 'handSetChangeDetection' });
      },
    };
  },
};
