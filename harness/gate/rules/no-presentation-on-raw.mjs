import { getTemplateParserServices } from '@angular-eslint/utils';

// Part 2, rule 2 (template surface): no appearance utilities on a non-primitive
// element. Layout and spacing utilities are the allowed grammar on containers;
// background, border, rounded, shadow, and ring are appearance, which belongs to
// a primitive. This names the hand-rolled div-card that wears its styling inline.
// Skips primitives (their classes are Part 1's domain).
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

const isBracket = (t) => t.includes('[') && t.includes(']');
const isAppearance = (t) =>
  !isBracket(t) &&
  (t.startsWith('bg-') ||
    t === 'border' ||
    t.startsWith('border-') ||
    t === 'rounded' ||
    t.startsWith('rounded-') ||
    t === 'shadow' ||
    t.startsWith('shadow-') ||
    t === 'ring' ||
    t.startsWith('ring-'));

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow appearance utility classes on a non-primitive element.' },
    schema: [],
    messages: {
      presentationOnRaw:
        'Layout grammar: appearance classes on <{{element}}> mean a raw element is impersonating a styled component. Move appearance into a primitive; a container is for layout, not looks.',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        if (isPrimitive(node)) return;
        if (classTokens(node).some(isAppearance)) {
          context.report({
            loc: parserServices.convertElementSourceSpanToLoc(context, node),
            messageId: 'presentationOnRaw',
            data: { element: node.name },
          });
        }
      },
    };
  },
};
