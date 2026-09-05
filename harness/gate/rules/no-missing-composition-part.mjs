import { getTemplateParserServices } from '@angular-eslint/utils';

// Rule 6 of the sealing spec: a primitive present but not composed. See
// ../../sealing-spec.md, "The six rules" #6. Docs: spartan's composition.md,
// verbatim: "Overlays need a title. Dialog, Sheet, and Alert Dialog must have
// a title for accessibility. If the design hides it, keep it present and
// apply class="sr-only"." Restated in the house-style skill. messageId
// `missingCompositionPart` maps to the counter's `missing-composition-part`
// kind.
//
// A required DESCENDANT only: a container primitive (hlm-dialog-content,
// hlm-sheet-content) needs a descendant carrying the matching title attribute
// (hlmDialogTitle, hlmSheetTitle) somewhere under it. This is a pure
// parent/child property of a single template AST: no cross-file join, no
// type information, no heuristic. Containment is scoped within one template,
// so a title supplied by a wrapper component in another file would be a
// false positive; in this repo overlays are composed inline at the call
// site, which is what makes the check sound here.
//
// What this rule deliberately does NOT check, and why: spartan's forms.md
// also says "Use hlmField, not raw divs. Wrap each control in hlmField," and
// an earlier draft of this rule gated that as a required-ancestor check on
// every hlmInput, hlmTextarea and hlm-select. The spec now states plainly
// that draft was over-broad and would have been a bad gate - the capstone
// build spec itself calls for a search input and a class-filter select in a
// toolbar, neither of which is a form field, and "is this control part of a
// form" is not decidable from the template. So the field-wrapping convention
// stays doc-only (house-style skill) and is not gated here.
const REQUIRED_DESCENDANT = {
  'hlm-dialog-content': 'hlmDialogTitle',
  'hlm-sheet-content': 'hlmSheetTitle',
};

const hasAttr = (node, name) => (node.attributes ?? []).some((a) => a.name === name);

// Generic child accessor across every angular-eslint template AST node shape
// that can contain nested template nodes (Element/Template `children`, the
// control-flow block shapes' `children`/`branches`/`groups`/`cases`/`empty`/
// `placeholder`/`loading`/`error`), so the descendant search is not blind to
// a title placed inside an `@if` or similar.
const CONTAINER_KEYS = [
  'children',
  'branches',
  'groups',
  'cases',
  'empty',
  'placeholder',
  'loading',
  'error',
];

function* childNodes(node) {
  for (const key of CONTAINER_KEYS) {
    const value = node[key];
    if (!value) continue;
    if (Array.isArray(value)) yield* value;
    else yield value;
  }
}

function hasDescendantWithAttr(node, attrName) {
  for (const child of childNodes(node)) {
    if (!child || typeof child !== 'object') continue;
    if (child.type === 'Element' && hasAttr(child, attrName)) return true;
    if (hasDescendantWithAttr(child, attrName)) return true;
  }
  return false;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow an overlay primitive composed without its required title.',
    },
    schema: [],
    messages: {
      missingCompositionPart:
        'Sealed composition: <{{element}}> has no descendant carrying {{requiredAttr}}. Overlays ' +
        'need a title for accessibility (spartan composition.md); add one, e.g. ' +
        '<h2 {{requiredAttr}}>Title</h2> inside it (class="sr-only" if the design hides it).',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      Element(node) {
        const requiredAttr = REQUIRED_DESCENDANT[node.name];
        if (!requiredAttr || hasDescendantWithAttr(node, requiredAttr)) return;
        context.report({
          loc: parserServices.convertElementSourceSpanToLoc(context, node),
          messageId: 'missingCompositionPart',
          data: { element: node.name, requiredAttr },
        });
      },
    };
  },
};
