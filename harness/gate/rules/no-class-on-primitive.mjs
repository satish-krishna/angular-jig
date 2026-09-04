import { getTemplateParserServices } from '@angular-eslint/utils';

// Rule 2 of the sealing spec: no arbitrary class string on a primitive.
// See ../../sealing-spec.md. messageId `classOnPrimitive` maps to the counter's
// `class-on-primitive` kind. Class on a plain (non-primitive) element is NOT
// flagged here: that is Part 2's layout grammar, deferred on purpose.
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

function isPrimitive(node) {
  if (PRIMITIVE_ELEMENTS.has(node.name)) return true;
  return node.attributes.some((a) => PRIMITIVE_ATTRS.has(a.name));
}

function isClassBearing(node) {
  if (node.attributes.some((a) => a.name === 'class')) return true;
  return node.inputs.some(
    (i) => i.name === 'class' || i.name === 'ngClass' || i.keySpan?.details?.includes('class.'),
  );
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow arbitrary class strings on a spartan primitive.',
    },
    schema: [],
    messages: {
      classOnPrimitive:
        'Sealed vocabulary: <{{element}}> is a primitive and owns its styling. Remove the class binding; do not reach past the primitive with utility classes.',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        if (!isPrimitive(node) || !isClassBearing(node)) return;
        context.report({
          loc: parserServices.convertElementSourceSpanToLoc(context, node),
          messageId: 'classOnPrimitive',
          data: { element: node.name },
        });
      },
    };
  },
};
