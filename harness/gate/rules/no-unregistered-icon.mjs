import { componentDecoratorObject } from './component-util.mjs';

// Rule 13 of the component-shape spec (capstone-residue): a component that
// lists NgIcon in its imports array but has no provideIcons(...) call in its
// providers array. The house-style skill: "Register with `provideIcons`, and
// only `provideIcons`"; spartan's `rules/icons.md`: "Icon names are not
// global - each icon you reference must be provided to the component (or
// app) via `provideIcons`."
//
// Keyed on the component decorator (NgIcon in `imports`), not on the file's
// import list, deliberately: imports are a file-level fact, so a file holding
// two components where only one renders icons would false-positive under the
// looser reading. NgIcon in `imports` is the component saying it renders
// icons, which is a per-component property.
//
// One capstone trial invented `providers: [{ provide: 'ICONS', useValue: {...} }]`,
// which typechecks, registers nothing, and left every icon in the shell blank.
// messageId `unregisteredIcon` maps to the counter's `unregistered-icon` kind.
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow a component that imports NgIcon but registers no icon via provideIcons.',
    },
    schema: [],
    messages: {
      unregisteredIcon:
        'Component shape: this component imports NgIcon but registers no icon, which renders blank. Add ' +
        'provideIcons({ ... }) to its providers array (see harness/component-shape-spec.md, rule 13); a custom ' +
        'token or plain object registers nothing.',
    },
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        const obj = componentDecoratorObject(node);
        if (!obj) return;

        const importsProp = obj.properties.find(
          (p) => p.type === 'Property' && p.key && p.key.type === 'Identifier' && p.key.name === 'imports',
        );
        if (!importsProp || importsProp.value.type !== 'ArrayExpression') return;
        const ngIconEl = importsProp.value.elements.find((el) => el && el.type === 'Identifier' && el.name === 'NgIcon');
        if (!ngIconEl) return;

        const providersProp = obj.properties.find(
          (p) => p.type === 'Property' && p.key && p.key.type === 'Identifier' && p.key.name === 'providers',
        );
        const providerElements =
          providersProp && providersProp.value.type === 'ArrayExpression' ? providersProp.value.elements : [];
        const hasProvideIcons = providerElements.some(
          (el) => el && el.type === 'CallExpression' && el.callee.type === 'Identifier' && el.callee.name === 'provideIcons',
        );

        if (!hasProvideIcons) {
          context.report({ node: ngIconEl, messageId: 'unregisteredIcon' });
        }
      },
    };
  },
};
