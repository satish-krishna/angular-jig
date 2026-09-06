import type { TSESTree } from '@typescript-eslint/utils';
import { inComponentClass, isDataServiceToken, isUiPath } from './component-util.ts';
import { createRule } from './create-rule.ts';

// Rule 9 of the component-shape spec: a feature component (not under
// src/app/ui/) injects no data service directly; its ViewModel does. This is
// rule 5 inverted across the ui/ path split, and reuses rule 5's token check
// (HttpClient or a *Service identifier, minus the pure-UI allowlist). A
// *ViewModel identifier is not a *Service identifier, so inject(SomeViewModel)
// never matches here, and ActivatedRoute/Router never match either (routing is
// permitted in the component). The rule fires only inside @Component classes,
// so a ViewModel's own inject(HeroService) is never flagged: a ViewModel
// carries no @Component decorator. messageId `featureInjectsData` maps to the
// counter's `feature-injects-data` kind.

export type Options = [];
export type MessageIds = 'featureInjectsData';
export const RULE_NAME = 'no-feature-inject-data';

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow a feature component injecting a data service directly; the ViewModel does that.',
    },
    schema: [],
    messages: {
      featureInjectsData:
        'Component shape: a feature component injects no data service. Move inject({{token}}) into the ' +
        'component-scoped ViewModel (see harness/component-shape-spec.md, rule 9) and inject the ViewModel here instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? (context.getFilename && context.getFilename()) ?? '';
    if (isUiPath(filename)) return {};
    return {
      CallExpression(node: TSESTree.CallExpression) {
        const c = node.callee;
        if (
          c &&
          c.type === 'Identifier' &&
          c.name === 'inject' &&
          node.arguments.length &&
          node.arguments[0].type === 'Identifier'
        ) {
          const token = node.arguments[0].name;
          if (isDataServiceToken(token) && inComponentClass(node)) {
            context.report({ node, messageId: 'featureInjectsData', data: { token } });
          }
        }
      },
    };
  },
});
