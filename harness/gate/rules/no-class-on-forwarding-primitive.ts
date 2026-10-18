import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { FORWARDING_PRIMITIVES } from './forwarding-primitives.ts';
import { createRule } from './create-rule.ts';

// What this forbids, why, and its known blind spots: see
// ../../rules/no-class-on-forwarding-primitive.md.
//
// The element and input list lives in ./forwarding-primitives.ts and is pinned
// to libs/ui by harness/gate/forwarding-primitives.test.mjs.

export type Options = [];
export type MessageIds = 'classOnForwardingPrimitive';
export const RULE_NAME = 'no-class-on-forwarding-primitive';

// How each written form reaches the element, per Angular's runtime.
const WHY = {
  attr: 'a class attribute lands on the host, which has no box of its own, and on the inner control, which your stylesheet cannot reach',
  bound: 'a [class] binding lands only on the inner control, which your stylesheet cannot reach',
  hostOnly: 'it styles only the host, which has no box of its own, never the control',
  named: 'the class you pass lands on an element inside the primitive, which your stylesheet cannot reach',
} as const;

// angular-eslint overwrites a bound attribute's `type` with its node kind, so
// the binding kind is read from the source key: `[class.x]` has key "class.x".
const keyOf = (i: { keySpan?: { toString(): string } }): string => i.keySpan?.toString() ?? '';

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: { description: 'Disallow a class on a primitive that forwards it to an inner element.' },
    schema: [],
    messages: {
      classOnForwardingPrimitive:
        'Sealed vocabulary: <{{element}}> forwards {{input}} to an element inside its own template. {{written}} is banned here: {{why}}. Instead use {{use}}. If none fits, add a variant or input to the primitive in libs/ui.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node: TmplAstElement) {
        const entry = FORWARDING_PRIMITIVES[node.name];
        if (!entry) return;
        const forwardsClass = entry.inputs.includes('class');
        let hit: { input: string; written: string; why: string } | null = null;

        for (const a of node.attributes) {
          if (a.name === 'class' && forwardsClass) hit ??= { input: '`class`', written: 'A class attribute', why: WHY.attr };
          else if (entry.inputs.includes(a.name)) hit ??= { input: `\`${a.name}\``, written: `The ${a.name} attribute`, why: WHY.named };
        }
        for (const i of node.inputs ?? []) {
          const key = keyOf(i);
          if (forwardsClass && i.name === 'ngClass') hit ??= { input: '`class`', written: '[ngClass]', why: WHY.hostOnly };
          else if (forwardsClass && key.startsWith('class.')) hit ??= { input: '`class`', written: `[class.${i.name}]`, why: WHY.hostOnly };
          else if (forwardsClass && i.name === 'class') {
            const attrForm = key.startsWith('attr.');
            hit ??= { input: '`class`', written: attrForm ? '[attr.class]' : '[class]', why: attrForm ? WHY.hostOnly : WHY.bound };
          } else if (entry.inputs.includes(i.name)) hit ??= { input: `\`${i.name}\``, written: `[${i.name}]`, why: WHY.named };
        }
        if (!hit) return;
        context.report({
          loc: parserServices.convertElementSourceSpanToLoc(context, node),
          messageId: 'classOnForwardingPrimitive',
          data: { element: node.name, input: hit.input, written: hit.written, why: hit.why, use: entry.use },
        });
      },
    };
  },
});
