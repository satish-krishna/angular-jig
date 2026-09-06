// Rule 13 of the component-shape spec (capstone-residue): a file that imports
// one or more glyph symbols from `@ng-icons/lucide` and never calls
// `provideIcons(...)`. Reported once per file, at the import declaration.
// messageId `unregisteredIcon` maps to the counter's `unregistered-icon` kind.
//
// spartan's `rules/icons.md`: "Icon names are not global - each icon you
// reference must be provided to the component (or app) via `provideIcons`."
//
// The parenthesis in "(or app)" is the whole design of this rule, and the first
// draft got it wrong. That draft keyed on the component decorator: `NgIcon` in
// `imports` with no `provideIcons` in `providers`. It reads plausibly and it is
// wrong, because registering every glyph once in `app.config.ts` is a
// documented pattern, and a component relying on it correctly has no
// `provideIcons` of its own. Run against the capstone builds that draft fired 7
// times on one and 4 on another, and those were precisely the two builds where
// icons WORKED. A rule written to catch a fatal icon bug would have blocked the
// only builds that shipped icons correctly.
//
// The property that actually separates the cases is not where `NgIcon` is
// imported but where the glyph SYMBOLS go. A file that imports a glyph and never
// registers it has dead or misrouted imports; a file relying on app-level
// registration imports no glyph at all. One capstone trial imported eleven
// glyphs and handed them to `{ provide: 'ICONS', useValue: {...} }`, which
// typechecks, registers nothing, and left every icon in the shell blank.
import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from './create-rule.ts';

export type Options = [];
export type MessageIds = 'unregisteredIcon';
export const RULE_NAME = 'no-unregistered-icon';

const LUCIDE_MODULE = '@ng-icons/lucide';

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow importing lucide glyph symbols into a file that never registers them with provideIcons.',
    },
    schema: [],
    messages: {
      unregisteredIcon:
        'Component shape: this file imports icon symbols from @ng-icons/lucide but never calls ' +
        'provideIcons({ ... }), so they register nothing and every <ng-icon> using them renders blank. ' +
        'Register them with provideIcons in this component’s providers, or drop the imports and rely on the ' +
        'application-level registration (see harness/component-shape-spec.md, rule 13). A custom injection ' +
        'token or a plain object registers nothing.',
    },
  },
  defaultOptions: [],
  create(context) {
    const lucideImports: TSESTree.ImportDeclaration[] = [];
    let sawProvideIcons = false;

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        if (node.source && node.source.value === LUCIDE_MODULE) {
          const named = (node.specifiers ?? []).some((s) => s.type === 'ImportSpecifier');
          if (named) lucideImports.push(node);
        }
      },
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee && node.callee.type === 'Identifier' && node.callee.name === 'provideIcons') {
          sawProvideIcons = true;
        }
      },
      'Program:exit'() {
        if (sawProvideIcons) return;
        // Once per file, anchored at the first offending import.
        if (lucideImports.length > 0) {
          context.report({ node: lucideImports[0], messageId: 'unregisteredIcon' });
        }
      },
    };
  },
});
