import { getTemplateParserServices } from '@angular-eslint/utils';

// Rule 3 (template half) of the component-shape spec: no ngModel binding in a
// template. Template-driven forms are not used here. messageId `ngModel` maps to
// the counter's `template-driven-form` kind (the same kind as the FormsModule
// half, counted on the template surface). Runs under the angular-eslint template
// parser, on .html files and inline templates via processInlineTemplates.
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow an ngModel binding (template-driven forms) in a template.' },
    schema: [],
    messages: {
      ngModel:
        'Component shape: template-driven forms are not used here. Replace ngModel with a signal-form control bound via [formField].',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const named = (arr) => Array.isArray(arr) && arr.some((a) => a.name === 'ngModel');
    return {
      Element(node) {
        if (named(node.inputs) || named(node.attributes)) {
          context.report({
            loc: parserServices.convertElementSourceSpanToLoc(context, node),
            messageId: 'ngModel',
          });
        }
      },
    };
  },
};
