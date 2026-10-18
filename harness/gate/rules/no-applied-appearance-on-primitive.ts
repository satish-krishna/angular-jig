import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { createRule } from './create-rule.ts';
import { isAppearance, isPrimitive } from './no-appearance-on-primitive.ts';
import { appliedUtilities } from './applied-utilities.ts';

// What this forbids, why, and its known blind spots: see
// ../../rules/no-applied-appearance-on-primitive.md. The series 1 rule judged
// the template's class text; under the series 2 house style the utilities live
// in the component stylesheet behind BEM names, so this rule follows each class
// on a primitive into the sibling .css and judges what it @applies there.

export type Options = [];
export type MessageIds = 'appliedAppearanceOnPrimitive' | 'appliedStylesheetUnreadable';
export const RULE_NAME = 'no-applied-appearance-on-primitive';

// A `[class.x]` binding is found by its key span, not its type: the template
// parser rewrites each input's `type` to "BoundAttribute", and the same object
// can sit on both a Template and its inner Element, so no type tag is reliable.
// `bind-class.x` has the key span `class.x` too. Without a key span we cannot
// tell, so fail loudly rather than skip a class.
const boundClasses = (node: TmplAstElement): string[] =>
  node.inputs.flatMap((i) => {
    if (!i.keySpan) throw new Error(`no-applied-appearance-on-primitive: input "${i.name}" on <${node.name}> has no key span`);
    return i.keySpan.toString().startsWith('class.') ? [i.name] : [];
  });

const classesOf = (node: TmplAstElement): string[] => {
  const attr = node.attributes.find((a) => a.name === 'class');
  const own = attr && typeof attr.value === 'string' ? attr.value.split(/\s+/).filter(Boolean) : [];
  return [...own, ...boundClasses(node)];
};

const bare = (u: string): string => u.replaceAll('!', '');

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: { description: 'Disallow appearance utilities reaching a spartan primitive through the component stylesheet.' },
    schema: [],
    messages: {
      appliedAppearanceOnPrimitive:
        'Applied appearance: "{{utility}}" reaches <{{element}}> through .{{cls}} in {{css}}. A primitive takes layout only from the app; give it the look with a variant on the primitive in libs/ui and select it with its variant input.',
      appliedStylesheetUnreadable: 'Could not read {{css}} to check what it applies to primitives: {{error}}. Fix the stylesheet.',
    },
  },
  defaultOptions: [],
  create(context) {
    const file = context.filename;
    if (!file.endsWith('.html')) return {};
    const cssPath = file.slice(0, -'.html'.length) + '.css';
    if (!existsSync(cssPath)) return {};
    const css = basename(cssPath);
    const parserServices = getTemplateParserServices(context);
    let applied: Map<string, string[]> | null = null;
    let error: string | null = null;
    try {
      applied = appliedUtilities(readFileSync(cssPath, 'utf8'));
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
    let reportedUnreadable = false;
    return {
      Element(node: TmplAstElement) {
        const loc = parserServices.convertElementSourceSpanToLoc(context, node);
        if (error !== null) {
          if (!reportedUnreadable) context.report({ loc, messageId: 'appliedStylesheetUnreadable', data: { css, error } });
          reportedUnreadable = true;
          return;
        }
        if (!isPrimitive(node)) return;
        for (const cls of classesOf(node)) {
          const utility = (applied?.get(cls) ?? []).find((u) => isAppearance(bare(u)));
          if (utility) {
            context.report({ loc, messageId: 'appliedAppearanceOnPrimitive', data: { utility, element: node.name, cls, css } });
            return;
          }
        }
      },
    };
  },
});
