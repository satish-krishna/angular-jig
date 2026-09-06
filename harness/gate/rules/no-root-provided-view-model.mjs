import { isViewModelName, decoratorObjectByNames } from './component-util.ts';

// Rule 7 of the component-shape spec: a ViewModel (a class whose name ends in
// `ViewModel`) must be component-scoped, never providedIn. A providedIn
// ViewModel is a singleton store wearing a ViewModel's name and leaks one
// screen's state into the next visit to that screen. messageId
// `vmNotComponentScoped` maps to the counter's `vm-not-component-scoped` kind.
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow a providedIn ViewModel; ViewModels are component-scoped.' },
    schema: [],
    messages: {
      vmNotComponentScoped:
        'Component shape: {{name}} is a ViewModel, which is component-scoped. Remove providedIn from its ' +
        '@Injectable/@Service and list {{name}} in the owning component\'s own providers instead.',
    },
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        const name = node.id && node.id.name;
        if (!isViewModelName(name)) return;
        const obj = decoratorObjectByNames(node, ['Injectable', 'Service']);
        if (!obj) return;
        const prop = obj.properties.find(
          (p) =>
            p.type === 'Property' &&
            p.key &&
            ((p.key.type === 'Identifier' && p.key.name === 'providedIn') ||
              (p.key.type === 'Literal' && p.key.value === 'providedIn')),
        );
        if (prop) context.report({ node: prop, messageId: 'vmNotComponentScoped', data: { name } });
      },
    };
  },
};
