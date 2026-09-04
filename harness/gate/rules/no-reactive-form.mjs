import { componentDecoratorObject } from './component-util.mjs';

// Rule 6 of the component-shape spec: no reactive forms. The house-style skill
// overrides Angular's reactive-forms fallback and requires signal-forms plus a
// zod schema, so ReactiveFormsModule in imports, or a `new FormGroup/FormControl/
// FormBuilder/FormArray` in the class, is a defect. Flagged once per component,
// to match the counter's `reactive-form` kind (one signal per component).
const REACTIVE = new Set(['FormGroup', 'FormControl', 'FormBuilder', 'FormArray']);

function findReactiveNew(node) {
  if (!node || typeof node.type !== 'string') return null;
  if (
    node.type === 'NewExpression' &&
    node.callee &&
    node.callee.type === 'Identifier' &&
    REACTIVE.has(node.callee.name)
  ) {
    return node;
  }
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue;
    const v = node[key];
    if (Array.isArray(v)) {
      for (const c of v) {
        const r = findReactiveNew(c);
        if (r) return r;
      }
    } else if (v && typeof v.type === 'string') {
      const r = findReactiveNew(v);
      if (r) return r;
    }
  }
  return null;
}

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow reactive forms; this repo requires signal-forms and a zod schema.' },
    schema: [],
    messages: {
      reactiveForm:
        'Component shape: reactive forms are not used here. Author the form with signal-forms and a zod schema (validateStandardSchema), not FormGroup/FormControl.',
    },
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        const obj = componentDecoratorObject(node);
        if (!obj) return;
        let target = null;
        const imp = obj.properties.find(
          (p) => p.type === 'Property' && p.key && p.key.type === 'Identifier' && p.key.name === 'imports',
        );
        if (imp && imp.value.type === 'ArrayExpression') {
          target =
            imp.value.elements.find((el) => el && el.type === 'Identifier' && el.name === 'ReactiveFormsModule') ?? null;
        }
        if (!target) target = findReactiveNew(node.body);
        if (target) context.report({ node: target, messageId: 'reactiveForm' });
      },
    };
  },
};
