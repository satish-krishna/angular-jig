import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { FORWARDING_PRIMITIVES } from './forwarding-primitives.ts';
import { createRule } from './create-rule.ts';

// What this forbids, why, and its known blind spots: see
// ../../rules/no-class-on-forwarding-primitive.md.
//
// The element list lives in ./forwarding-primitives.ts and is pinned to
// libs/ui by harness/gate/forwarding-primitives.test.mjs.

export type Options = [];
export type MessageIds = 'classOnForwardingPrimitive';
export const RULE_NAME = 'no-class-on-forwarding-primitive';

// angular-eslint overwrites a bound attribute's `type` with its node kind, so
// the binding kind is read from the source key: `[class.x]` has key "class.x".
const isClassBinding = (name: string, key: string): boolean =>
  name === 'class' || name === 'ngClass' || key.startsWith('class.');

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: { description: 'Disallow a class on a primitive that forwards it to an inner element.' },
    schema: [],
    messages: {
      classOnForwardingPrimitive:
        'Sealed vocabulary: <{{element}}> forwards its class to an element inside its own template, so a rule in this component\'s stylesheet (via {{written}}) can never match it. Use {{use}}, or add a variant or input to the primitive in libs/ui.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node: TmplAstElement) {
        const entry = FORWARDING_PRIMITIVES[node.name];
        if (!entry) return;
        const attr = node.attributes.find((a) => a.name === 'class');
        const input = (node.inputs ?? []).find((i) => isClassBinding(i.name, i.keySpan?.toString() ?? ''));
        const written = attr
          ? 'a class attribute'
          : input
            ? input.name === 'ngClass'
              ? '[ngClass]'
              : input.name === 'class'
                ? '[class]'
                : `[class.${input.name}]`
            : null;
        if (!written) return;
        context.report({
          loc: parserServices.convertElementSourceSpanToLoc(context, node),
          messageId: 'classOnForwardingPrimitive',
          data: { element: node.name, written, use: entry.use },
        });
      },
    };
  },
});
