import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { createRule } from './create-rule.ts';

// Part 2, rule 1: no raw palette or hex color in a class. Docs: spartan
// styling.md, "Semantic colors only. Never use raw Tailwind palette values."
// A color utility whose value is a palette name plus number (blue-500), or an
// arbitrary hex, is flagged; a semantic token (card, primary) passes.
// Independent of the counter (own classifier, angular-eslint parser).

export type Options = [];
export type MessageIds = 'rawPaletteColor';
export const RULE_NAME = 'no-raw-palette-color';

const PALETTE = new Set([
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow',
  'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
  'purple', 'fuchsia', 'pink', 'rose',
]);
const COLOR_PREFIX_RE =
  /^(bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration|placeholder|caret|accent)-/;
const baseUtil = (t: string): string => (t.includes(':') ? t.slice(t.lastIndexOf(':') + 1) : t);

function isRawPaletteColor(token: string): boolean {
  const t = baseUtil(token);
  const m = t.match(COLOR_PREFIX_RE);
  if (!m) return false;
  const rest = t.slice(m[0].length);
  if (rest.startsWith('[') && rest.includes('#')) return true;
  if (rest === 'white' || rest === 'black') return true;
  const seg = rest.split('-');
  return PALETTE.has(seg[0]) && seg.length >= 2 && /^\d+$/.test(seg[1]);
}

const classTokens = (node: TmplAstElement): string[] => {
  const attr = node.attributes.find((a) => a.name === 'class');
  return attr && typeof attr.value === 'string' ? attr.value.split(/\s+/).filter(Boolean) : [];
};

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: { description: 'Disallow raw Tailwind palette or hex colors; use semantic tokens.' },
    schema: [],
    messages: {
      rawPaletteColor:
        'Semantic colors only: "{{token}}" is a raw palette value. Use a semantic token (bg-card, text-muted-foreground, border-border).',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node: TmplAstElement) {
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
});
