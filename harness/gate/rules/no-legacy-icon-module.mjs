import { componentDecoratorObject } from './component-util.ts';

// Rule 12 of the component-shape spec (capstone-residue): no NgIconsModule in
// a component's imports. The house-style skill: "Import `NgIcon`, never
// `NgIconsModule`," layered on spartan's `rules/icons.md`, which shows only
// the standalone `NgIcon` import. Same AST shape as the FormsModule half of
// rule 3 and the ReactiveFormsModule half of rule 6. Bare `NgIconsModule`
// throws at bootstrap ("No icons have been provided...") and takes the whole
// application down with a blank page while compiling perfectly; this rule's
// absence is what let three of the capstone's six builds render blank pages
// past every other AST gate. messageId `legacyIconModule` maps to the
// counter's `legacy-icon-module` kind.
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
