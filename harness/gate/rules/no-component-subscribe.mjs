import { inComponentOrViewModelClass } from './component-util.ts';

// Rule 2 of the component-shape spec: no .subscribe() inside a component. Use the
// async pipe or toSignal at the edge. messageId `componentSubscribe` maps to the
// counter's `component-subscribe` kind.
//
// Widened per "Two widenings the capstone forced": the predicate now also
// covers classes whose name ends in ViewModel, not only @Component classes.
// Two capstone trials put `this.route.paramMap.subscribe(...)` in a ViewModel
// constructor once the MVVM refinement gave `.subscribe` a class that is a
// service by decorator and a component's brain by role; the gate did not stop
// the subscribe, it relocated it into the one class the original scope note
// exempted.
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
