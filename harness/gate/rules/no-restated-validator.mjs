import { inComponentClass } from './component-util.mjs';

// Rule 4 of the component-shape spec: no per-field signal-forms validator the zod
// schema already owns. validateStandardSchema is the blessed path; the async and
// custom validators are for logic a schema cannot own and are not flagged.
// messageId `restatedValidator` maps to the counter's `restated-validator` kind.
const VALIDATORS = new Set(['required', 'minLength', 'maxLength', 'min', 'max', 'email', 'pattern']);

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow a per-field signal-forms validator the zod schema already owns.' },
    schema: [],
    messages: {
      restatedValidator:
        'Component shape: validation lives in the zod schema. Remove {{name}}(...) and validate through validateStandardSchema(path, schema).',
    },
  },
  create(context) {
    // Track only the validator names actually imported from @angular/forms/signals,
    // under their local (possibly aliased) name.
    const imported = new Set();
    return {
      ImportDeclaration(node) {
        if (node.source && node.source.value === '@angular/forms/signals') {
          for (const s of node.specifiers) {
            if (s.type === 'ImportSpecifier' && s.imported && VALIDATORS.has(s.imported.name)) {
              imported.add(s.local.name);
            }
          }
        }
      },
      CallExpression(node) {
        const c = node.callee;
        if (c && c.type === 'Identifier' && imported.has(c.name) && inComponentClass(node)) {
          context.report({ node, messageId: 'restatedValidator', data: { name: c.name } });
        }
      },
    };
  },
};
