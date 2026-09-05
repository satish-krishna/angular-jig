import { getTemplateParserServices } from '@angular-eslint/utils';

// Disallow raw Tailwind palette or hex colors; use semantic tokens.
const PALETTE = new Set([
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow',
  'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
  'purple', 'fuchsia', 'pink', 'rose',
]);
const COLOR_PREFIX_RE =
  /^(bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration|placeholder|caret|accent)-/;
const baseUtil = (t) => (t.includes(':') ? t.slice(t.lastIndexOf(':') + 1) : t);

function isRawPaletteColor(token) {
  const t = baseUtil(token);
  const m = t.match(COLOR_PREFIX_RE);
  if (!m) return false;
  const rest = t.slice(m[0].length);
  if (rest.startsWith('[') && rest.includes('#')) return true;
  if (rest === 'white' || rest === 'black') return true;
  const seg = rest.split('-');
  return PALETTE.has(seg[0]) && seg.length >= 2 && /^\d+$/.test(seg[1]);
}

const classTokens = (node) => {
  const attr = node.attributes.find((a) => a.name === 'class');
  return attr && typeof attr.value === 'string' ? attr.value.split(/\s+/).filter(Boolean) : [];
};

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow raw Tailwind palette or hex colors; use semantic tokens.' },
    schema: [],
    messages: {
      rawPaletteColor:
        'Semantic colors only: "{{token}}" is a raw palette value. Use a semantic token (bg-card, text-muted-foreground, border-border).',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        for (const token of classTokens(node)) {
          if (isRawPaletteColor(token)) {
            context.report({
              loc: parserServices.convertElementSourceSpanToLoc(context, node),
              messageId: 'rawPaletteColor',
              data: { token },
            });
          }
        }
      },
    };
  },
};
