import postcss, { type Node, type Rule } from 'postcss';

// The gate's own reader for a component stylesheet: which utilities each class
// receives through @apply. Written from ../../bem-phase-2-gate-spec.md, not from
// the counter's harness/counter/bem/ reader: two engines, one spec, so a defect
// in one cannot blind both.

export function parentRule(node: Node): Rule | null {
  let p = node.parent as Node | undefined;
  while (p && p.type !== 'rule' && p.type !== 'root') p = p.parent as Node | undefined;
  return p && p.type === 'rule' ? (p as Rule) : null;
}

// `&` followed by an identifier character is Sass concatenation; native CSS
// compiles it to a selector that matches nothing.
export const CONCAT = /&[\w-]/;

function isConcatenated(rule: Rule): boolean {
  const parent = parentRule(rule);
  if (!parent) return false;
  return rule.selectors.some((s) => CONCAT.test(s)) || isConcatenated(parent);
}

export function resolveSelectors(rule: Rule): string[] {
  const parent = parentRule(rule);
  const outer = parent ? resolveSelectors(parent) : [''];
  return rule.selectors.flatMap((s) => outer.map((o) => (s.includes('&') ? s.split('&').join(o) : o ? `${o} ${s}` : s)));
}

// The element a selector styles is its last compound. Combinators and class
// dots are only read at bracket depth 0, so `:nth-child(2n+1)`, `:not(.b)` and
// `[href$=".pdf"]` are never misread; a backslash escapes the next character.
export function styledClasses(selector: string): string[] {
  const s = selector.trim();
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') {
      i++;
      continue;
    }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (depth === 0 && /[\s>+~]/.test(c)) start = i + 1;
  }
  const compound = s.slice(start);
  const out: string[] = [];
  depth = 0;
  for (let i = 0; i < compound.length; i++) {
    const c = compound[i];
    if (c === '\\') {
      i++;
      continue;
    }
    if (c === '(' || c === '[') {
      depth++;
      continue;
    }
    if (c === ')' || c === ']') {
      depth--;
      continue;
    }
    if (depth !== 0 || c !== '.') continue;
    let name = '';
    let j = i + 1;
    while (j < compound.length) {
      const d = compound[j];
      if (d === '\\') {
        name += compound[j + 1] ?? '';
        j += 2;
      } else if (/[\w-]/.test(d)) {
        name += d;
        j++;
      } else break;
    }
    if (name) out.push(name);
    i = j - 1;
  }
  return out;
}

export function appliedUtilities(css: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  postcss.parse(css).walkAtRules('apply', (a) => {
    const rule = parentRule(a);
    if (!rule || isConcatenated(rule)) return;
    const tokens = a.params.split(/\s+/).filter((t) => t && t !== '!important');
    for (const sel of resolveSelectors(rule)) {
      for (const cls of styledClasses(sel)) {
        const list = map.get(cls) ?? [];
        for (const t of tokens) if (!list.includes(t)) list.push(t);
        map.set(cls, list);
      }
    }
  });
  return map;
}
