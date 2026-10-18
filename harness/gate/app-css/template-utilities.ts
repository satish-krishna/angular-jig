import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseTemplate, BindingType, TmplAstElement, TmplAstTemplate, type TmplAstNode } from '@angular/compiler';
import { __unstable__loadDesignSystem } from '@tailwindcss/node';

// BEM rule 1, gate side: no Tailwind utility in a template's class attribute
// or a [class.x] binding. Tailwind's own design system decides what a utility
// is (the oracle both engines may ask); the template walk is the gate's own.

export type TemplateViolation = { line: number; token: string; via: 'class' | '[class.x]' };

export async function loadUtilityOracle(stylesPath: string): Promise<(token: string) => boolean> {
  const ds = await __unstable__loadDesignSystem(readFileSync(stylesPath, 'utf8'), { base: dirname(stylesPath) });
  const cache = new Map<string, boolean>();
  return (raw: string) => {
    const token = raw.replace(/^!|!$/g, '');
    if (!cache.has(token)) cache.set(token, ds.candidatesToCss([token])[0] != null);
    return cache.get(token)!;
  };
}

export function templateUtilities(html: string, path: string, isUtility: (t: string) => boolean): TemplateViolation[] {
  const parsed = parseTemplate(html, path, { preserveWhitespaces: true });
  if (parsed.errors?.length) throw new Error(`${path}: ${parsed.errors[0].msg}`);
  const out: TemplateViolation[] = [];
  const visit = (nodes: TmplAstNode[]) => {
    for (const n of nodes as any[]) {
      if (n instanceof TmplAstElement || n instanceof TmplAstTemplate) {
        for (const a of n.attributes) {
          if (a.name !== 'class') continue;
          for (const t of String(a.value).split(/\s+/).filter(Boolean)) {
            if (isUtility(t)) out.push({ line: a.sourceSpan.start.line + 1, token: t, via: 'class' });
          }
        }
        for (const i of n.inputs) {
          if (i.type === BindingType.Class && isUtility(i.name)) out.push({ line: i.sourceSpan.start.line + 1, token: i.name, via: '[class.x]' });
        }
      }
      for (const key of ['children', 'branches', 'groups', 'cases', 'expression']) {
        const v = n?.[key];
        if (Array.isArray(v)) visit(v);
      }
      if (n?.empty) visit([n.empty]);
      if (n?.placeholder) visit([n.placeholder]);
      if (n?.loading) visit([n.loading]);
      if (n?.error) visit([n.error]);
    }
  };
  visit(parsed.nodes);
  return out;
}
