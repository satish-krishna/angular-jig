import { getTemplateParserServices } from '@angular-eslint/utils';

// Rule 4 of the layout-grammar spec: a ROW of COLUMNS is a grid, so use grid.
// See ../../layout-grammar-spec.md. messageId `nestedFlexGrid` maps to the
// counter's `nested-flex-grid` kind.
//
// This rule did not exist until the capstone, and the reason is worth keeping.
// Part 2 judged the anti-pattern undecidable from classes alone and left it as a
// counter-only heuristic: any flex container with two or more flex children. But
// the house doc's own sentence is directional - "a ROW of flex COLUMNS, each
// itself a flex stack, arranged to line up into a grid" - and direction is the
// whole discriminator. A row of columns reads as a grid. A column of rows is a
// card body. Part 2's own counter-example, "a legitimate flex toolbar of flex
// rows", is a row of ROWS, which this rule correctly ignores.
//
// The proxy flagged 63 sites across seven capstone builds, of which one was the
// real thing. It was never undecidable, only unencoded.
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
