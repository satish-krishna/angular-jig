// Reads a component stylesheet the way the expansion needs it: which
// utilities each class applies, and which classes the selectors name.
// Nesting is resolved the way native CSS resolves it (`&` is the parent
// selector, descendant otherwise). Native CSS cannot append text to `&`, so
// a Sass-style `.roster { &__row { ... } }` styles nothing in the browser:
// such a rule, and everything nested in it, maps no utilities and names no
// class here either, and is reported in brokenNesting instead.
import postcss from 'postcss';

function ruleParent(node) {
  let p = node.parent;
  while (p && p.type !== 'rule' && p.type !== 'root') p = p.parent;
  return p && p.type === 'rule' ? p : null;
}

// `&` followed by an identifier character is concatenation, which only Sass does.
const CONCAT_RE = /&[\w-]/;

function isBroken(rule) {
  const parent = ruleParent(rule);
  if (!parent) return false;
  return rule.selectors.some((s) => CONCAT_RE.test(s)) || isBroken(parent);
}

export function resolvedSelectors(rule) {
  const parent = ruleParent(rule);
  const parents = parent ? resolvedSelectors(parent) : [''];
  return rule.selectors.flatMap((s) => parents.map((p) => (s.includes('&') ? s.replaceAll('&', p) : p ? `${p} ${s}` : s)));
}

const CLASS_RE = /\.(-?[_a-zA-Z][\w-]*)/g;
const classesIn = (sel) => [...sel.matchAll(CLASS_RE)].map((m) => m[1]);
// The element a selector styles is its last compound: `.a .b:hover` styles .b.
const lastCompound = (sel) => sel.trim().split(/\s*[>+~]\s*|\s+/).pop() ?? '';

export function parseStylesheet(css, from = 'component.css') {
  const root = postcss.parse(css, { from });
  const utilities = new Map();
  let hasApply = false;
  let hasReference = false;
  root.walkAtRules((a) => {
    if (a.name === 'reference') hasReference = true;
    if (a.name !== 'apply') return;
    hasApply = true;
    const rule = ruleParent(a);
    if (!rule || isBroken(rule)) return;
    const tokens = a.params.split(/\s+/).filter(Boolean);
    for (const sel of resolvedSelectors(rule)) {
      for (const cls of classesIn(lastCompound(sel))) {
        if (!utilities.has(cls)) utilities.set(cls, []);
        utilities.get(cls).push(...tokens);
      }
    }
  });
  const seen = new Set();
  const selectorClasses = [];
  const brokenNesting = [];
  root.walkRules((rule) => {
    const line = rule.source?.start?.line ?? 0;
    if (isBroken(rule)) {
      for (const selector of rule.selectors) if (CONCAT_RE.test(selector)) brokenNesting.push({ selector, line });
      return;
    }
    for (const sel of resolvedSelectors(rule)) {
      for (const cls of classesIn(sel)) {
        const key = `${cls}@${line}`;
        if (seen.has(key)) continue;
        seen.add(key);
        selectorClasses.push({ cls, line });
      }
    }
  });
  return { utilities, selectorClasses, brokenNesting, hasApply, hasReference };
}
