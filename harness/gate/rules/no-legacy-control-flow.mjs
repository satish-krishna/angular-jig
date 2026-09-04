// Freeloader spec rule 1: no *ngIf/*ngFor/*ngSwitch where native control flow
// exists. A structural directive desugars to a Template node carrying the
// directive in templateAttrs. messageId `legacyControlFlow` maps to the counter's
// `legacy-control-flow` kind.
const STRUCTURAL = new Set(['ngIf', 'ngFor', 'ngSwitch']);
const BLOCK = { ngIf: 'if', ngFor: 'for', ngSwitch: 'switch' };

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow *ngIf/*ngFor/*ngSwitch; use native @if/@for/@switch control flow.' },
    schema: [],
    messages: {
      legacyControlFlow:
        'Template modernity: use native control flow. Replace *{{name}} with @{{block}} (for example @if (x) {} / @for (h of xs; track h.id) {}).',
    },
  },
  create(context) {
    // A Template node is not an element, so the element loc helper rejects it;
    // build the loc from the node's own ParseSourceSpan (0-based line -> ESLint 1-based).
    const locOf = (node) => {
      const span = node.sourceSpan ?? node.startSourceSpan;
      return {
        start: { line: span.start.line + 1, column: span.start.col },
        end: { line: span.end.line + 1, column: span.end.col },
      };
    };
    const check = (node) => {
      const hit = (node.templateAttrs ?? []).find((a) => STRUCTURAL.has(a.name));
      if (!hit) return;
      context.report({
        loc: locOf(node),
        messageId: 'legacyControlFlow',
        data: { name: hit.name, block: BLOCK[hit.name] },
      });
    };
    return { Template: check, 'Template$1': check };
  },
};
