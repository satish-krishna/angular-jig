import { getTemplateParserServices } from '@angular-eslint/utils';

// Disallow a flex row of flex columns, which is a grid written as nested flex.
const baseUtil = (t) => (t.includes(':') ? t.slice(t.lastIndexOf(':') + 1) : t);

function classTokens(node) {
  const attr = (node.attributes ?? []).find((a) => a.name === 'class');
  return attr && typeof attr.value === 'string'
    ? attr.value.split(/\s+/).filter(Boolean).map(baseUtil)
    : [];
}

const isElement = (n) => n && typeof n.name === 'string' && Array.isArray(n.attributes);

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow a flex row of flex columns, which is a grid written as nested flex.',
    },
    schema: [],
    messages: {
      nestedFlexGrid:
        'Layout grammar: this is a flex row containing {{count}} flex-col children, which lays out as a ' +
        'grid. Use grid for two-dimensional regions (grid grid-cols-* gap-*) and keep flex for ' +
        'single-axis runs. See the house-style skill, "Do not nest flex to fake a grid". A flex COLUMN ' +
        'of flex rows is fine and is not what this rule flags.',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        const own = classTokens(node);
        // A row: flex, and not flex-col.
        if (!own.includes('flex') || own.includes('flex-col')) return;
        const colKids = (node.children ?? []).filter((c) => {
          if (!isElement(c)) return false;
          const k = classTokens(c);
          return k.includes('flex') && k.includes('flex-col');
        });
        if (colKids.length < 2) return;
        context.report({
          loc: parserServices.convertElementSourceSpanToLoc(context, node),
          messageId: 'nestedFlexGrid',
          data: { count: colKids.length },
        });
      },
    };
  },
};
