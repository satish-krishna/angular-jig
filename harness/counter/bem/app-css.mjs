// Counter side of R7 / R7a (harness/bem-phase-3-layout-only-spec.md): an app
// stylesheet carries layout only. Every utility applied through `@apply` and
// every plain declaration is judged; anything not on the layout list is
// appearance, so an unknown utility fails closed. Padding is layout only in a
// rule whose every selector is the component's block root.
//
// Written from the spec and the plan's Global Constraints. It shares nothing
// with the gate; the only counter-side helpers used are the existing nesting
// resolver and the Sass-concatenation test.
import postcss from 'postcss';
import { resolvedSelectors, isConcat } from './stylesheet.mjs';

const EXACT = new Set([
  'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents', 'hidden',
  'sr-only', 'not-sr-only', 'box-border', 'box-content',
  'static', 'relative', 'absolute', 'fixed', 'sticky',
  'truncate', 'text-ellipsis', 'text-clip', 'text-left', 'text-center', 'text-right', 'text-start', 'text-end',
  'text-justify', 'isolate', 'container',
]);

const PREFIXES = [
  'flex-', 'basis-', 'order-', 'grid-cols-', 'grid-rows-', 'col-', 'row-', 'auto-cols-', 'auto-rows-', 'grid-flow-',
  'items-', 'justify-', 'self-', 'place-', 'gap-',
  'w-', 'h-', 'size-', 'min-w-', 'min-h-', 'max-w-', 'max-h-', 'aspect-',
  'm-', 'mx-', 'my-', 'mt-', 'mr-', 'mb-', 'ml-', 'ms-', 'me-',
  'inset-', 'top-', 'right-', 'bottom-', 'left-', 'start-', 'end-', 'z-',
  'overflow-', 'overscroll-', 'whitespace-', 'break-', 'object-',
];

const GROW_SHRINK = /^(grow|shrink)(-|$)/;
const CONTENT_ALIGN = /^content-(normal|center|start|end|between|around|evenly|baseline|stretch)$/;
const PADDING_UTILITY = /^p[xytrblse]?-/;
// `inset-*` is the position family; the shadow and ring utilities that share
// the prefix set box-shadow.
const INSET_APPEARANCE = /^inset-(shadow|ring)(-|$)/;

// Split on `sep` at bracket depth 0 (square brackets, parentheses, quotes).
function splitTop(text, sep) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '[' || c === '(') depth++;
    else if (c === ']' || c === ')') depth--;
    else if (c === sep && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

function baseUtility(token) {
  let u = splitTop(token, ':').pop();
  if (u.startsWith('!')) u = u.slice(1);
  if (u.endsWith('!')) u = u.slice(0, -1);
  if (u.startsWith('-')) u = u.slice(1);
  return u;
}

// 'layout' | 'padding' | 'appearance'
function classifyUtility(token) {
  const u = baseUtility(token);
  if (EXACT.has(u) || GROW_SHRINK.test(u) || CONTENT_ALIGN.test(u)) return 'layout';
  if (u.startsWith('inset-') && INSET_APPEARANCE.test(u)) return 'appearance';
  if (PREFIXES.some((p) => u.startsWith(p))) return 'layout';
  if (PADDING_UTILITY.test(u)) return 'padding';
  return 'appearance';
}

const LAYOUT_PROPERTY = new RegExp(
  '^(display|flex.*|grid.*|gap|row-gap|column-gap|width|height|min-.*|max-.*|aspect-ratio|margin.*|position|inset.*|' +
    'top|right|bottom|left|z-index|overflow.*|text-overflow|white-space|word-break|text-align|object-fit|' +
    'object-position|isolation|order|align-.*|justify-.*|place-.*)$',
);

function classifyProperty(prop) {
  const p = prop.toLowerCase();
  if (p.startsWith('--')) return 'appearance';
  if (/^padding/.test(p)) return 'padding';
  return LAYOUT_PROPERTY.test(p) ? 'layout' : 'appearance';
}

const squash = (s) => s.replace(/\s+/g, ' ').trim();
const blankLiterals = (s) => s.replace(/"[^"]*"|'[^']*'|\[[^\]]*\]/g, '');
const namesClass = (selector) => /\.-?[_a-zA-Z\\]/.test(blankLiterals(selector));

function ruleParent(node) {
  for (let p = node.parent; p; p = p.parent) if (p.type === 'rule') return p;
  return null;
}

function ancestorAtRules(node) {
  const out = [];
  for (let p = node.parent; p; p = p.parent) if (p.type === 'atrule') out.push(p);
  return out;
}

// A rule, or one of its ancestors, that appends to `&` styles nothing.
function inConcat(rule) {
  for (let r = rule; r; r = ruleParent(r)) if (r.selectors.some(isConcat)) return true;
  return false;
}

function isBlockRoot(selector, stem, global) {
  if (global) return false;
  const s = squash(selector);
  if (s === ':host') return true;
  if (stem == null) return false;
  const root = `.${stem}`;
  return s === root || (s.startsWith(`${root}--`) && /^[\w-]+$/.test(s.slice(root.length + 2)) && s.length > root.length + 2);
}

export function appCssViolations(css, { stem = null, global = false } = {}) {
  const root = postcss.parse(css, { from: 'app.css' });
  const out = [];
  const dedupe = new Map();

  // The rule a node belongs to: its own resolved selectors, or for a node
  // directly under an at-rule (`@utility`), the at-rule's own header.
  const context = (node) => {
    const rule = node.parent?.type === 'rule' ? node.parent : ruleParent(node);
    if (rule) return { rule, selectors: resolvedSelectors(rule), key: rule };
    const at = ancestorAtRules(node)[0];
    return { rule: null, selectors: [at ? squash(`@${at.name} ${at.params}`) : ''], key: at ?? root };
  };

  const exempt = (node, { rule, selectors }) => {
    if (!global) return false;
    const ats = ancestorAtRules(node);
    if (ats.some((a) => a.name === 'theme')) return true;
    if (!rule) return false;
    // The theme rules: judged on the declaration's own rule, never an ancestor's.
    if (selectors.every((s) => squash(s) === ':root' || squash(s) === ':root.dark')) return true;
    // Element rules in the base layer: the resolved selectors name no class.
    const inBase = ats.some((a) => a.name === 'layer' && squash(a.params) === 'base');
    return inBase && !selectors.some(namesClass);
  };

  const report = (node, ctx, token, kind) => {
    if (kind === 'layout') return;
    if (kind === 'padding' && ctx.rule && ctx.selectors.every((s) => isBlockRoot(s, stem, global))) return;
    const id = ctx.key;
    if (!dedupe.has(id)) dedupe.set(id, new Set());
    if (dedupe.get(id).has(token)) return;
    dedupe.get(id).add(token);
    out.push({ line: node.source?.start?.line ?? 0, selector: ctx.selectors.join(', '), token });
  };

  root.walk((node) => {
    if (node.type === 'atrule' && node.name === 'apply') {
      const ctx = context(node);
      if (ctx.rule && inConcat(ctx.rule)) return;
      if (exempt(node, ctx)) return;
      const tokens = node.params.split(/\s+/).filter((t) => t && t !== '!important');
      for (const t of tokens) report(node, ctx, t, classifyUtility(t));
    } else if (node.type === 'decl') {
      const ctx = context(node);
      if (ctx.rule && inConcat(ctx.rule)) return;
      if (exempt(node, ctx)) return;
      report(node, ctx, node.prop, classifyProperty(node.prop));
    }
  });
  return out;
}
