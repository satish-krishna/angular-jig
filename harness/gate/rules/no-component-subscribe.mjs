import { inComponentClass } from './component-util.mjs';

// Rule 2 of the component-shape spec: no .subscribe() inside a component. Use the
// async pipe or toSignal at the edge. messageId `componentSubscribe` maps to the
// counter's `component-subscribe` kind.
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow .subscribe() inside a component class.' },
    schema: [],
    messages: {
      componentSubscribe:
        'Component shape: no .subscribe in a component. Convert at the edge and bind with the async pipe or toSignal.',
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
          inComponentClass(node)
        ) {
          context.report({ node, messageId: 'componentSubscribe' });
        }
      },
    };
  },
};
