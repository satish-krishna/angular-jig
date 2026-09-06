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
        'registers a DOM listener for an event nothing ever fires. Put [formRoot] on the <form> and register ' +
        'the submit action in the submission options of form() from @angular/forms/signals, which is what ' +
        'FormRoot runs on native submit; then drop (ngSubmit). Declaring submit(this.form, ...) as a class ' +
        'member that nothing calls registers no action and leaves the button just as dead.',
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
