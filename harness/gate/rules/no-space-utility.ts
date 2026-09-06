import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { createRule } from './create-rule.ts';

// Part 2, rule 2: no space-x-* / space-y-* utilities. Docs: spartan styling.md,
// "Spacing: gap-*, not space-*." Use flex/grid with gap-* instead.

export type Options = [];
export type MessageIds = 'spaceUtility';
export const RULE_NAME = 'no-space-utility';

const baseUtil = (t: string): string => (t.includes(':') ? t.slice(t.lastIndexOf(':') + 1) : t);
const isSpaceUtil = (t: string): boolean => /^space-(x|y)-/.test(baseUtil(t));

const classTokens = (node: TmplAstElement): string[] => {
  const attr = node.attributes.find((a) => a.name === 'class');
  return attr && typeof attr.value === 'string' ? attr.value.split(/\s+/).filter(Boolean) : [];
};

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: { description: 'Disallow space-x-*/space-y-* utilities; use gap-*.' },
    schema: [],
    messages: {
      spaceUtility:
        'Spacing: use gap-* on a flex or grid container, not "{{token}}".',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node: TmplAstElement) {
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
});
