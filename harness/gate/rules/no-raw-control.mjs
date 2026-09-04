import { getTemplateParserServices } from '@angular-eslint/utils';

// Rule 1 of the sealing spec: no native control element where a primitive
// exists. See ../../sealing-spec.md. messageId `rawControl` maps to the
// counter's `raw-control` kind.
const CONTROL_PRIMITIVE = { button: 'hlmBtn', input: 'hlmInput' };

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow a native control element where a spartan primitive exists.',
    },
    schema: [],
    messages: {
      rawControl:
        'Sealed vocabulary: <{{element}}> must use the spartan primitive. Add {{attr}} (for example <{{element}} {{attr}}>) instead of a raw control.',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        const required = CONTROL_PRIMITIVE[node.name];
        if (!required) return;
        const hasPrimitive = node.attributes.some((a) => a.name === required);
        if (hasPrimitive) return;
        context.report({
          loc: parserServices.convertElementSourceSpanToLoc(context, node),
          messageId: 'rawControl',
          data: { element: node.name, attr: required },
        });
      },
    };
  },
};
