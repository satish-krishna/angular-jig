import { getTemplateParserServices } from '@angular-eslint/utils';

// Disallow an overlay primitive composed without its required title.
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
