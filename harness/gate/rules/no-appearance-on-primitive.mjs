import { getTemplateParserServices } from '@angular-eslint/utils';

// Part 1, rule 2 (corrected): no appearance-override class on a primitive.
// Docs: spartan styling.md, "class is for layout only. Do not use it to override
// a component's own colors, typography, or internal padding." So layout and
// spacing classes on a primitive are fine; only appearance classes are flagged.
// Independent of the counter (own classifier, angular-eslint parser).
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

const baseUtil = (t) => (t.includes(':') ? t.slice(t.lastIndexOf(':') + 1) : t);

// Appearance: color, typography, decoration, internal padding. Everything else
// (display, flex/grid arrangement, dimensions, margins, position) is layout.
const APPEARANCE_RE =
  /^(bg-|text-(?!left$|center$|right$|justify$|start$|end$|wrap$|nowrap$|balance$|pretty$|ellipsis$|clip$)|font-|leading-|tracking-|border($|-)|rounded($|-)|shadow($|-)|ring($|-)|p[xytblrse]?-)/;
const isAppearance = (t) => APPEARANCE_RE.test(baseUtil(t));

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow appearance-override classes on a spartan primitive.' },
    schema: [],
    messages: {
      appearanceOnPrimitive:
        'Sealed vocabulary: "{{token}}" overrides the appearance of <{{element}}>. Class on a primitive is for layout only; change its look through a variant input or the Helm file in libs/ui.',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        if (!isPrimitive(node)) return;
        const offender = classTokens(node).find(isAppearance);
        if (!offender) return;
        context.report({
          loc: parserServices.convertElementSourceSpanToLoc(context, node),
          messageId: 'appearanceOnPrimitive',
          data: { element: node.name, token: offender },
        });
      },
    };
  },
};
