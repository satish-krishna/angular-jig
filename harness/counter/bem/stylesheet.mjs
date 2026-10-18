// Reads a component stylesheet the way the expansion needs it: which
// utilities each class applies, and which classes the selectors name.
// Nesting is resolved the way native CSS resolves it (`&` is the parent
// selector, descendant otherwise). Native CSS cannot append text to `&`, so
// a Sass-style `.roster { &__row { ... } }` styles nothing in the browser:
// such a rule, and everything nested in it, maps no utilities and names no
// class here either, and is reported in brokenNesting instead.
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

function ruleParent(node) {
  let p = node.parent;
  while (p && p.type !== 'rule' && p.type !== 'root') p = p.parent;
  return p && p.type === 'rule' ? p : null;
}

// `&` followed by an identifier character is concatenation, which only Sass
// does. Quoted strings and attribute brackets are blanked first, so an `&`
// inside `[data-a="&b"]` is not mistaken for nesting.
const CONCAT_RE = /&[\w-]/;
const blankStrings = (s) => s.replace(/"[^"]*"|'[^']*'|\[[^\]]*\]/g, '');
export const isConcat = (s) => CONCAT_RE.test(blankStrings(s));

// A selector the parser rejects (`// header` is a Sass comment, not CSS, and
// postcss reads it as the start of the next selector) must never crash the
// counter: the rule is treated like broken nesting and reported.
const parses = (s) => {
  try {
    selectorParser().astSync(s);
    return true;
  } catch {
    return false;
  }
};
const isBadSelector = (s) => isConcat(s) || !parses(s);

function isBroken(rule) {
  const parent = ruleParent(rule);
  return rule.selectors.some(isBadSelector) || (parent ? isBroken(parent) : false);
}

export function resolvedSelectors(rule) {
  const parent = ruleParent(rule);
  const parents = parent ? resolvedSelectors(parent) : [''];
  return rule.selectors.flatMap((s) => parents.map((p) => (s.includes('&') ? s.replaceAll('&', p) : p ? `${p} ${s}` : s)));
}

// Selectors are parsed, not pattern-matched: a regex cannot tell the `+` in
// `:nth-child(2n+1)` from a combinator, or the `.b` in `:not(.b)` from a class
// on the element. The element a selector styles is its last compound; inside
// it, the alternatives of :is()/:where() are also that element, while the
// arguments of :not(), :has(), :host() and other pseudo-functions are not.
const ALTERNATIVES = new Set([':is', ':where', ':matches']);
const parseSelector = (sel) => selectorParser().astSync(sel);

function compoundClasses(selector) {
  let start = 0;
  selector.nodes.forEach((n, i) => {
    if (n.type === 'combinator') start = i + 1;
  });
  const out = [];
  for (const n of selector.nodes.slice(start)) {
    if (n.type === 'class') out.push(n.value);
    else if (n.type === 'pseudo' && ALTERNATIVES.has(n.value.toLowerCase())) {
      for (const alt of n.nodes) out.push(...compoundClasses(alt));
    }
  }
  return out;
}

const styledClasses = (sel) => parseSelector(sel).nodes.flatMap(compoundClasses);

function allClasses(sel) {
  const out = [];
  parseSelector(sel).walkClasses((c) => out.push(c.value));
  return out;
}

export function parseStylesheet(css, from = 'component.css') {
  const root = postcss.parse(css, { from });
  const utilities = new Map();
  const unmapped = [];
  let hasApply = false;
  let hasReference = false;
  root.walkAtRules((a) => {
    if (a.name === 'reference') hasReference = true;
    if (a.name !== 'apply') return;
    hasApply = true;
    const rule = ruleParent(a);
    if (!rule || isBroken(rule)) return;
    // `!important` is a flag on the whole @apply, not a utility.
    const tokens = a.params.split(/\s+/).filter((t) => t && t !== '!important');
    let styled = 0;
    for (const sel of resolvedSelectors(rule)) {
      if (!parses(sel)) {
        styled += 1; // reported as broken nesting instead
        continue;
      }
      for (const cls of styledClasses(sel)) {
        styled += 1;
        if (!utilities.has(cls)) utilities.set(cls, []);
        const list = utilities.get(cls);
        for (const t of tokens) if (!list.includes(t)) list.push(t);
      }
    }
    // `:host`, a bare element or a descendant: no BEM class carries these
    // utilities, so the expansion could not place them anywhere.
    if (styled === 0 && tokens.length > 0) unmapped.push({ tokens, line: a.source?.start?.line ?? 0 });
  });
  const seen = new Set();
  const selectorClasses = [];
  const brokenNesting = [];
  root.walkRules((rule) => {
    const line = rule.source?.start?.line ?? 0;
    if (isBroken(rule)) {
      for (const selector of rule.selectors) if (isBadSelector(selector)) brokenNesting.push({ selector, line });
      return;
    }
    for (const sel of resolvedSelectors(rule)) {
      if (!parses(sel)) {
        brokenNesting.push({ selector: sel, line });
        continue;
      }
      for (const cls of allClasses(sel)) {
        const key = `${cls}@${line}`;
        if (seen.has(key)) continue;
        seen.add(key);
        selectorClasses.push({ cls, line });
      }
    }
  });
  return { utilities, unmapped, selectorClasses, brokenNesting, hasApply, hasReference };
}
