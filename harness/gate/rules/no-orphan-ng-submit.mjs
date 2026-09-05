import { getTemplateParserServices } from '@angular-eslint/utils';

// Rule 14 of the component-shape spec (capstone-residue): no (ngSubmit)
// binding in a template. The house-style skill, "Submitting a form": the
// house pattern has exactly one submit path, `submit(this.form, ...)` from
// `@angular/forms/signals`, and (ngSubmit) is not part of it.
//
// `ngSubmit` is an output of NgForm and FormGroupDirective, which arrive only
// with FormsModule or ReactiveFormsModule. Rules 3 and 6 ban both modules, so
// in this repo the directive can never be present: Angular registers a DOM
// listener for an event named `ngSubmit`, which nothing ever fires. The
// button reads as wired and is dead. messageId `orphanNgSubmit` maps to the
// counter's `orphan-ng-submit` kind. Runs under the angular-eslint template
// parser, on .html files and inline templates via processInlineTemplates,
// like no-ng-model.
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
