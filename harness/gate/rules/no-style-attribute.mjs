import { getTemplateParserServices } from '@angular-eslint/utils';

// Disallow a static inline style attribute.
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow a static inline style attribute.' },
    schema: [],
    messages: {
      styleAttribute:
        'Sealed vocabulary: a static style attribute on <{{element}}> is a raw literal. Style belongs in a token or the primitive; a computed [style.x] binding is fine, a hardcoded style attribute is not.',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        const hasStaticStyle = node.attributes.some((a) => a.name === 'style');
        if (!hasStaticStyle) return;
        context.report({
          loc: parserServices.convertElementSourceSpanToLoc(context, node),
          messageId: 'styleAttribute',
          data: { element: node.name },
        });
      },
    };
  },
};
