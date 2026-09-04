import { getTemplateParserServices } from '@angular-eslint/utils';

// Rule 3 of the sealing spec: no inline style on any element. See
// ../../sealing-spec.md. messageId `styleAttribute` maps to the counter's
// `style-attribute` kind. Covers the static style attribute, [style] and
// [style.x] bindings, and [ngStyle].
function isStyleBearing(node) {
  if (node.attributes.some((a) => a.name === 'style')) return true;
  return node.inputs.some(
    (i) => i.name === 'style' || i.name === 'ngStyle' || i.keySpan?.details?.includes('style.'),
  );
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow inline style attributes and bindings on any element.',
    },
    schema: [],
    messages: {
      styleAttribute:
        'Sealed vocabulary: inline style on <{{element}}> is banned. Style belongs in the primitive or a token, never inline.',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        if (!isStyleBearing(node)) return;
        context.report({
          loc: parserServices.convertElementSourceSpanToLoc(context, node),
          messageId: 'styleAttribute',
          data: { element: node.name },
        });
      },
    };
  },
};
