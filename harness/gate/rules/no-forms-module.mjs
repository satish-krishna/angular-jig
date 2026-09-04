import { componentDecoratorObject } from './component-util.mjs';

// Rule 3 (TypeScript half) of the component-shape spec: no FormsModule in a
// component's imports. Template-driven forms are not used here. messageId
// `formsModule` maps to the counter's `template-driven-form` kind. ReactiveFormsModule
// is NOT gated here (reactive-form is a counter-only heuristic).
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow FormsModule (template-driven forms) in a component.' },
    schema: [],
    messages: {
      formsModule:
        'Component shape: template-driven forms are not used here. Remove FormsModule; author the form with signal-forms and a zod schema.',
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
          if (el && el.type === 'Identifier' && el.name === 'FormsModule') {
            context.report({ node: el, messageId: 'formsModule' });
          }
        }
      },
    };
  },
};
