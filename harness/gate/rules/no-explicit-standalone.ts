import type { TSESTree } from '@typescript-eslint/utils';
import { componentDecoratorObject } from './component-util.ts';
import { createRule } from './create-rule.ts';

// Rule 11 of the component-shape spec (capstone-residue): no explicit
// `standalone` in @Component. CLAUDE.md, verbatim: "Must NOT set
// `standalone: true` inside Angular decorators. It's the default in Angular
// v20+." Same AST shape as rule 1 (hand-set-change-detection): the presence
// of the property key in the decorator's object literal, to any value, not
// its value. messageId `explicitStandalone` maps to the counter's
// `explicit-standalone` kind.

export type Options = [];
export type MessageIds = 'explicitStandalone';
export const RULE_NAME = 'no-explicit-standalone';

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
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
  defaultOptions: [],
  create(context) {
    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
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
});
