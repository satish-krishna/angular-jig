import { getTemplateParserServices } from '@angular-eslint/utils';

// Part 2, rule 1 (template surface): no literal visual value in a class. Any
// Tailwind arbitrary-bracket token (w-[327px], bg-[#0af], p-[7px]) is the escape
// hatch around the token scale, so it is flagged. Literals in component
// stylesheets are covered by the gate's separate CSS check, not here. Skips
// primitives: a class on a primitive is a Part 1 violation (class-on-primitive).
const PRIMITIVE_ATTRS = new Set([
  'hlmBtn',
  'hlmInput',
  'hlmCard',
  'hlmCardHeader',
  'hlmCardFooter',
  'hlmCardTitle',
  'hlmCardDescription',
  'hlmCardContent',
  'hlmCardAction',
]);
const PRIMITIVE_ELEMENTS = new Set(['hlm-card', 'hlm-card-header', 'hlm-card-footer']);

const isPrimitive = (node) =>
  PRIMITIVE_ELEMENTS.has(node.name) || node.attributes.some((a) => PRIMITIVE_ATTRS.has(a.name));

const classTokens = (node) => {
  const attr = node.attributes.find((a) => a.name === 'class');
  return attr && typeof attr.value === 'string' ? attr.value.split(/\s+/).filter(Boolean) : [];
};

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow literal (arbitrary-bracket) values in template classes.' },
    schema: [],
    messages: {
      literalValue:
        'Layout grammar: "{{token}}" is a literal value. Use a token from the scale (for example p-4, w-full, bg-primary), not an arbitrary bracket value.',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        if (isPrimitive(node)) return;
        for (const token of classTokens(node)) {
          if (token.includes('[') && token.includes(']')) {
            context.report({
              loc: parserServices.convertElementSourceSpanToLoc(context, node),
              messageId: 'literalValue',
              data: { token },
            });
          }
        }
      },
    };
  },
};
