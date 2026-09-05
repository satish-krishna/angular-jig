// Disallow importing lucide glyph symbols into a file that never registers them with provideIcons.
const LUCIDE_MODULE = '@ng-icons/lucide';

export default {
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
  create(context) {
    const lucideImports = [];
    let sawProvideIcons = false;

    return {
      ImportDeclaration(node) {
        if (node.source && node.source.value === LUCIDE_MODULE) {
          const named = (node.specifiers ?? []).some((s) => s.type === 'ImportSpecifier');
          if (named) lucideImports.push(node);
        }
      },
      CallExpression(node) {
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
};
