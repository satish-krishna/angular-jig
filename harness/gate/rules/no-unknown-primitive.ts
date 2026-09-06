import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { PRIMITIVE_ATTRS, PRIMITIVE_ELEMENTS } from './primitive-vocabulary.ts';
import { createRule } from './create-rule.ts';

// Rule 5 of the sealing spec: an hlm* attribute or element that matches no
// installed selector. See ../../sealing-spec.md, "The six rules" #5. Docs: the
// house-style skill, "The primitive must actually exist," and this spec's own
// instruction to read the vocabulary from source rather than from memory.
// messageId `unknownPrimitive` maps to the counter's `unknown-primitive` kind.
//
// Every Helm primitive is either an attribute directive or an element, never
// both, and which one it is is fixed by its `selector:` in libs/ui. This is a
// closed-world check against PRIMITIVE_ATTRS/PRIMITIVE_ELEMENTS (see
// ./primitive-vocabulary.ts, shared gate-internally with rule 2): a name
// outside the hlm namespace is never considered, so ordinary attributes and
// third-party components are untouched.
//
// The attribute-versus-element distinction is the whole point: an attribute
// whose name matches /^hlm[A-Z]/ or /^hlm-/ (both casings, because a writer
// who reaches for the wrong form usually reaches for the element name as an
// attribute) is checked against PRIMITIVE_ATTRS, and an element whose name
// matches /^hlm-/ is checked against PRIMITIVE_ELEMENTS, each in that form
// only. `hlmSelectTrigger` as an attribute is a violation even though
// `hlm-select-trigger` is a real, installed element.

export type Options = [];
export type MessageIds = 'unknownPrimitive';
export const RULE_NAME = 'no-unknown-primitive';

type Form = 'attribute' | 'element';

const ATTR_LIKE_RE = /^(hlm[A-Z]|hlm-)/;
const ELEMENT_LIKE_RE = /^hlm-/;

const camelToKebab = (name: string): string => name.replace(/([A-Z])/g, '-$1').toLowerCase();
const kebabToCamel = (name: string): string => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

// If the name written in the wrong form has a real vocabulary entry in the
// OTHER form, name that entry in the report so the fix is a single
// substitution, not a guess.
function correctFormFor(name: string, form: Form): { as: Form; name: string } | null {
  if (form === 'attribute') {
    const kebab = name.startsWith('hlm-') ? name : camelToKebab(name);
    return PRIMITIVE_ELEMENTS.has(kebab) ? { as: 'element', name: kebab } : null;
  }
  const camel = kebabToCamel(name);
  return PRIMITIVE_ATTRS.has(camel) ? { as: 'attribute', name: camel } : null;
}

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow an hlm* attribute or element that matches no installed selector.',
    },
    schema: [],
    messages: {
      unknownPrimitive:
        'Sealed vocabulary: "{{name}}" is not an installed primitive {{form}}.{{hint}} Check ' +
        'the house-style skill and sealing-spec.md, "The vocabulary, as installed", before using ' +
        'an hlm* name.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    const report = (node: TmplAstElement, name: string, form: Form) => {
      const correct = correctFormFor(name, form);
      const hint = correct
        ? form === 'attribute'
          ? ` The installed selector is the element <${correct.name}>; write it as an element, not an attribute.`
          : ` The installed selector is the attribute ${correct.name}; write it on the native element it decorates, not as an element.`
        : '';
      context.report({
        loc: parserServices.convertElementSourceSpanToLoc(context, node),
        messageId: 'unknownPrimitive',
        data: { name, form, hint },
      });
    };

    return {
      Element(node: TmplAstElement) {
        if (ELEMENT_LIKE_RE.test(node.name) && !PRIMITIVE_ELEMENTS.has(node.name)) {
          report(node, node.name, 'element');
        }
        for (const attr of node.attributes) {
          if (ATTR_LIKE_RE.test(attr.name) && !PRIMITIVE_ATTRS.has(attr.name)) {
            report(node, attr.name, 'attribute');
          }
        }
      },
    };
  },
});
