import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { createRule } from './create-rule.ts';

// Freeloader spec rule 2: no ngClass/ngStyle. Use a class or style binding.
// messageId `ngClassStyle` maps to the counter's `ng-class-style` kind.

export type Options = [];
export type MessageIds = 'ngClassStyle';
export const RULE_NAME = 'no-ng-class-style';

const NG_CLASS_STYLE = new Set(['ngClass', 'ngStyle']);
const REPLACEMENT: Record<string, string> = { ngClass: '[class.x] or [class]', ngStyle: '[style.x] or [style]' };

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: { description: 'Disallow ngClass/ngStyle; use class/style bindings.' },
    schema: [],
    messages: {
      ngClassStyle:
        'Template modernity: do not use {{name}}. Use a binding instead: {{replacement}} (for example [class.active]="isActive()").',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const check = (node: TmplAstElement) => {
      const all = [...(node.attributes ?? []), ...(node.inputs ?? [])];
      const hit = all.find((a) => NG_CLASS_STYLE.has(a.name));
      if (!hit) return;
      context.report({
        loc: parserServices.convertElementSourceSpanToLoc(context, node),
        messageId: 'ngClassStyle',
        data: { name: hit.name, replacement: REPLACEMENT[hit.name] },
      });
    };
    return { Element: check, 'Element$1': check };
  },
});
