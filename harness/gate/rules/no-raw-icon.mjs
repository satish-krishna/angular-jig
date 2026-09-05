import { getTemplateParserServices } from '@angular-eslint/utils';

// Rule 4 of the sealing spec: no raw inline <svg> in an application template.
// See ../../sealing-spec.md, "The four rules" #4. messageId `rawIcon` maps to
// the counter's `raw-icon` kind.
//
// Both the angular-eslint template parser and @angular/compiler namespace SVG
// element nodes, so an inline <svg> arrives with node.name ':svg:svg', not
// 'svg'. Matching that exact name (rather than a prefix) catches only the
// <svg> root, not its namespaced descendants (':svg:path', ':svg:g', ...),
// which is what "an <svg> element" means here - one report per pasted icon.
//
// Narrow on purpose, twice over: this does not gate the provideIcons
// registration (a fact about the component class, invisible to a template
// engine - the spec states that half is doc-only), and it does not touch
// libs/** (the gate ignores it wholesale; Helm internals may inline SVG).
const SVG_ROOT_NAME = ':svg:svg';

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow a raw inline <svg> element; use <ng-icon> instead.',
    },
    schema: [],
    messages: {
      rawIcon:
        'Sealed vocabulary: an inline <svg> bypasses the icon registry. Replace it with ' +
        '<ng-icon name="lucide..."> and register the icon via provideIcons on the component.',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        if (node.name !== SVG_ROOT_NAME) return;
        context.report({
          loc: parserServices.convertElementSourceSpanToLoc(context, node),
          messageId: 'rawIcon',
        });
      },
    };
  },
};
