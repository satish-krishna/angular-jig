import { getTemplateParserServices } from '@angular-eslint/utils';

// Disallow an (ngSubmit) binding; no forms module can supply the directive in this repo.
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow an (ngSubmit) binding; no forms module can supply the directive in this repo.' },
    schema: [],
    messages: {
      orphanNgSubmit:
        'Component shape: (ngSubmit) is dead here. NgForm/FormGroupDirective ship only with FormsModule or ' +
        'ReactiveFormsModule, and both are banned (see harness/component-shape-spec.md, rule 14), so Angular ' +
        "registers a DOM listener for an event nothing ever fires. Wire the submit in the class through " +
        'submit(this.form, async () => { ... }) from @angular/forms/signals, and drop (ngSubmit) from the <form>.',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const named = (arr) => Array.isArray(arr) && arr.some((a) => a.name === 'ngSubmit');
    return {
      Element(node) {
        if (named(node.outputs)) {
          context.report({
            loc: parserServices.convertElementSourceSpanToLoc(context, node),
            messageId: 'orphanNgSubmit',
          });
        }
      },
    };
  },
};
