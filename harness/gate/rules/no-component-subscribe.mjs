import { inComponentOrViewModelClass } from './component-util.mjs';

// Disallow .subscribe() inside a component class or a ViewModel.
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow .subscribe() inside a component class or a ViewModel.' },
    schema: [],
    messages: {
      componentSubscribe:
        'Component shape: no .subscribe in a component or ViewModel. Convert at the edge and bind with the async pipe or toSignal.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const c = node.callee;
        if (
          c &&
          c.type === 'MemberExpression' &&
          c.property &&
          c.property.type === 'Identifier' &&
          c.property.name === 'subscribe' &&
          inComponentOrViewModelClass(node)
        ) {
          context.report({ node, messageId: 'componentSubscribe' });
        }
      },
    };
  },
};
