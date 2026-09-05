import { hasComponentDecorator, isUiPath } from './component-util.mjs';

// Rule 8 of the component-shape spec: a feature component (not under
// src/app/ui/) declares no state of its own; the state lives in its
// component-scoped ViewModel. Only a property whose initializer is a direct
// call to signal, computed, or linkedSignal counts as state: input()/output()/
// model()/viewChild()/contentChild()/inject()/toSignal() are component API or
// an edge conversion, not screen state, and are never flagged. messageId
// `stateOutsideVm` maps to the counter's `state-outside-vm` kind.
//
// The ui/ complement matters: a presentational component holding a signal() is
// the dumb-holds-state heuristic (counter-only), not this hard gate, because a
// self-contained widget's local toggle is legitimate there.
const STATE_FNS = new Set(['signal', 'computed', 'linkedSignal']);

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow a feature component declaring its own state signal; state lives in the ViewModel.',
    },
    schema: [],
    messages: {
      stateOutsideVm:
        'Component shape: a feature component holds no state of its own. Move this {{name}}(...) into the ' +
        'component-scoped ViewModel (see harness/component-shape-spec.md, rule 8) and read it off the injected vm instead.',
    },
  },
  create(context) {
    const filename = context.filename ?? (context.getFilename && context.getFilename()) ?? '';
    if (isUiPath(filename)) return {};
    return {
      ClassDeclaration(classNode) {
        if (!hasComponentDecorator(classNode)) return;
        for (const member of classNode.body.body) {
          if (member.type !== 'PropertyDefinition' || !member.value) continue;
          const v = member.value;
          if (v.type === 'CallExpression' && v.callee.type === 'Identifier' && STATE_FNS.has(v.callee.name)) {
            context.report({ node: member, messageId: 'stateOutsideVm', data: { name: v.callee.name } });
          }
        }
      },
    };
  },
};
