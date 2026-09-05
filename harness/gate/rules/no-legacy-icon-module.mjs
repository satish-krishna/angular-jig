import { componentDecoratorObject } from './component-util.mjs';

// Disallow NgIconsModule (the legacy icon module) in a component.
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow NgIconsModule (the legacy icon module) in a component.' },
    schema: [],
    messages: {
      legacyIconModule:
        'Component shape: NgIconsModule is the legacy icon module and throws at bootstrap here. Import NgIcon ' +
        'instead and register icons with provideIcons(...) (see harness/component-shape-spec.md, rule 12).',
    },
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        const obj = componentDecoratorObject(node);
        if (!obj) return;
        const imp = obj.properties.find(
          (p) => p.type === 'Property' && p.key && p.key.type === 'Identifier' && p.key.name === 'imports',
        );
        if (!imp || imp.value.type !== 'ArrayExpression') return;
        for (const el of imp.value.elements) {
          if (el && el.type === 'Identifier' && el.name === 'NgIconsModule') {
            context.report({ node: el, messageId: 'legacyIconModule' });
          }
        }
      },
    };
  },
};
