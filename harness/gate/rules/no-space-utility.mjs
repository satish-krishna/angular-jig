import { getTemplateParserServices } from '@angular-eslint/utils';

// Part 2, rule 2: no space-x-* / space-y-* utilities. Docs: spartan styling.md,
// "Spacing: gap-*, not space-*." Use flex/grid with gap-* instead.
const baseUtil = (t) => (t.includes(':') ? t.slice(t.lastIndexOf(':') + 1) : t);
const isSpaceUtil = (t) => /^space-(x|y)-/.test(baseUtil(t));

const classTokens = (node) => {
  const attr = node.attributes.find((a) => a.name === 'class');
  return attr && typeof attr.value === 'string' ? attr.value.split(/\s+/).filter(Boolean) : [];
};

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow space-x-*/space-y-* utilities; use gap-*.' },
    schema: [],
    messages: {
      spaceUtility:
        'Spacing: use gap-* on a flex or grid container, not "{{token}}".',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        const offender = classTokens(node).find(isSpaceUtil);
        if (!offender) return;
        context.report({
          loc: parserServices.convertElementSourceSpanToLoc(context, node),
          messageId: 'spaceUtility',
          data: { token: offender },
        });
      },
    };
  },
};
