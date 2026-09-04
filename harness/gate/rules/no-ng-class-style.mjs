import { getTemplateParserServices } from '@angular-eslint/utils';

// Freeloader spec rule 2: no ngClass/ngStyle. Use a class or style binding.
// messageId `ngClassStyle` maps to the counter's `ng-class-style` kind.
const NG_CLASS_STYLE = new Set(['ngClass', 'ngStyle']);
const REPLACEMENT = { ngClass: '[class.x] or [class]', ngStyle: '[style.x] or [style]' };

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow ngClass/ngStyle; use class/style bindings.' },
    schema: [],
    messages: {
      ngClassStyle:
        'Template modernity: do not use {{name}}. Use a binding instead: {{replacement}} (for example [class.active]="isActive()").',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const check = (node) => {
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
};
