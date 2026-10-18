import postcss, { type AtRule, type Container, type Declaration, type Node, type Rule } from 'postcss';
import { CONCAT, parentRule, resolveSelectors } from '../rules/applied-utilities.ts';

// R7 and R7a of ../../bem-phase-3-layout-only-spec.md, judged per stylesheet:
// the block root is known from the file stem, so no template is needed.
// Written from the spec, not from the counter's harness/counter/bem/ code.

export type CssViolation = {
  line: number;
  selector: string;
  token: string;
  kind: 'utility' | 'property';
  reason: 'appearance' | 'padding-off-root';
};

const LAYOUT_EXACT = new Set([
  'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents', 'hidden', 'sr-only',
  'not-sr-only', 'box-border', 'box-content', 'static', 'relative', 'absolute', 'fixed', 'sticky', 'truncate',
  'text-ellipsis', 'text-clip', 'text-left', 'text-center', 'text-right', 'text-start', 'text-end', 'text-justify',
  'isolate', 'container', 'grow', 'shrink',
]);
const LAYOUT_PREFIX =
  /^(flex-|grow-|shrink-|basis-|order-|grid-cols-|grid-rows-|grid-flow-|col-|row-|auto-cols-|auto-rows-|items-|justify-|self-|place-|gap-|w-|h-|size-|min-w-|min-h-|max-w-|max-h-|aspect-|m[xytrblse]?-|inset-(?!shadow|ring)|top-|right-|bottom-|left-|start-|end-|z-|overflow-|overscroll-|whitespace-|break-|object-)/;
const CONTENT_ALIGN = /^content-(normal|center|start|end|between|around|evenly|baseline|stretch)$/;
const PADDING = /^p[xytrblse]?-/;

const LAYOUT_PROPS =
  /^(display|flex(-.*)?|grid(-.*)?|gap|row-gap|column-gap|width|height|min-.*|max-.*|aspect-ratio|margin(-.*)?|position|inset(-.*)?|top|right|bottom|left|z-index|overflow(-.*)?|text-overflow|white-space|word-break|overflow-wrap|text-align|object-fit|object-position|isolation|order|align-.*|justify-.*|place-.*)$/;
const PADDING_PROP = /^padding(-.*)?$/;

// The utility after its variant prefixes: split on `:` outside brackets and
// parentheses, keep the last part, then drop `!` and a negative sign.
export function baseUtility(token: string): string {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    const c = token[i];
    if (c === '[' || c === '(') depth++;
    else if (c === ']' || c === ')') depth--;
    else if (c === ':' && depth === 0) start = i + 1;
  }
  return token.slice(start).replace(/^!|!$/g, '').replace(/^-/, '');
}

type Verdict = 'layout' | 'padding' | 'appearance';

function utilityVerdict(token: string): Verdict {
  const u = baseUtility(token);
  if (u.startsWith('[')) return 'appearance';
  if (PADDING.test(u)) return 'padding';
  if (LAYOUT_EXACT.has(u) || CONTENT_ALIGN.test(u)) return 'layout';
  if (u.startsWith('content-')) return 'appearance';
  return LAYOUT_PREFIX.test(u) ? 'layout' : 'appearance';
}

function propertyVerdict(prop: string): Verdict {
  const p = prop.toLowerCase();
  if (PADDING_PROP.test(p)) return 'padding';
  return LAYOUT_PROPS.test(p) ? 'layout' : 'appearance';
}

export const stemOf = (path: string): string =>
  path.replaceAll('\\', '/').split('/').pop()!.replace(/\.css$/i, '').replace(/\.component$/, '');

export const isGlobalStylesheet = (relPath: string): boolean => /(^|\/)src\/styles\.css$/.test(relPath.replaceAll('\\', '/'));

function isConcatenated(rule: Rule): boolean {
  const parent = parentRule(rule);
  return rule.selectors.some((s) => CONCAT.test(s)) || (parent ? isConcatenated(parent) : false);
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function isBlockRoot(rule: Rule | null, stem: string | null): boolean {
  if (!rule || !stem) return false;
  const root = new RegExp(`^(\\.${escape(stem)}(--[a-z0-9]+(-[a-z0-9]+)*)?|:host)$`);
  return resolveSelectors(rule).every((s) => root.test(s.trim()));
}

function ancestors(node: Node): Container[] {
  const out: Container[] = [];
  let p = node.parent as Container | undefined;
  while (p && p.type !== 'root') {
    out.push(p);
    p = p.parent as Container | undefined;
  }
  return out;
}

// An element selector is built only from `*`, `html`, `body` and hyphen-free
// tag names, joined by combinators, with optional pseudo-classes and
// pseudo-elements. A class, id, attribute, nesting `&`, namespace or custom
// element (a tag with a hyphen) makes it a component selector, which is judged.
const TAG = /^(\*|[a-zA-Z][a-zA-Z0-9]*)/;
const PSEUDO = /^::?-?[a-zA-Z][a-zA-Z0-9-]*/;
const SELECTOR_PSEUDOS = new Set([':not', ':is', ':where', ':has', ':matches']);

function matchingParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')' && --depth === 0) return i;
  }
  return -1;
}

function splitCommas(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') depth--;
    else if (text[i] === ',' && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

function isElementSelector(selector: string): boolean {
  let rest = selector.trim();
  if (!rest) return false;
  let expectCompound = true;
  while (rest) {
    const comb = /^\s*([>+~]|\s)\s*/.exec(rest);
    if (comb && !expectCompound) {
      rest = rest.slice(comb[0].length);
      expectCompound = true;
      continue;
    }
    if (expectCompound && /^[>+~]/.test(rest)) return false;
    const tag = TAG.exec(rest);
    if (tag) rest = rest.slice(tag[0].length);
    else if (!PSEUDO.test(rest)) return false;
    while (rest && !/^\s|^[>+~]/.test(rest)) {
      const ps = PSEUDO.exec(rest);
      if (!ps) return false;
      rest = rest.slice(ps[0].length);
      if (rest.startsWith('(')) {
        const close = matchingParen(rest, 0);
        if (close < 0) return false;
        const args = rest.slice(1, close);
        const ok = SELECTOR_PSEUDOS.has(ps[0]) ? splitCommas(args).every((a) => isElementSelector(a.replace(/^\s*[>+~]\s*/, ''))) : /^[\w\s+-]*$/.test(args);
        if (!ok) return false;
        rest = rest.slice(close + 1);
      }
    }
    expectCompound = false;
  }
  return !expectCompound;
}

// The global stylesheet's theme: anything under `@theme`, or a declaration or
// @apply whose own rule is exactly `:root` or `:root.dark`, or sits inside
// `@layer base` and is built only from element selectors. Only the immediate
// rule counts, so a class rule nested inside an exempt rule is still judged.
function isThemeContext(node: Node): boolean {
  if (ancestors(node).some((a) => a.type === 'atrule' && (a as AtRule).name === 'theme')) return true;
  const rule = parentRule(node);
  if (!rule) return false;
  const sels = resolveSelectors(rule).map((s) => s.trim());
  if (sels.every((s) => s === ':root' || s === ':root.dark')) return true;
  const inBase = ancestors(rule).some((x) => x.type === 'atrule' && (x as AtRule).name === 'layer' && (x as AtRule).params.trim() === 'base');
  return inBase && sels.every(isElementSelector);
}

export function checkStylesheet(css: string, opts: { stem: string | null; global: boolean }): CssViolation[] {
  const root = postcss.parse(css);
  const out: CssViolation[] = [];
  const seen = new Map<object, Set<string>>();
  const judge = (node: Node, items: { token: string; kind: 'utility' | 'property'; verdict: Verdict }[]) => {
    const rule = parentRule(node);
    if (rule && isConcatenated(rule)) return;
    if (opts.global && isThemeContext(node)) return;
    const selector = rule ? resolveSelectors(rule).join(', ') : (node.parent as AtRule | undefined)?.type === 'atrule' ? `@${(node.parent as AtRule).name} ${(node.parent as AtRule).params}`.trim() : '';
    const rootOk = !opts.global && isBlockRoot(rule, opts.stem);
    const owner: object = rule ?? (node.parent as object | undefined) ?? root;
    if (!seen.has(owner)) seen.set(owner, new Set());
    const reported = seen.get(owner)!;
    for (const it of items) {
      if (it.verdict === 'layout') continue;
      if (it.verdict === 'padding' && rootOk) continue;
      if (reported.has(it.token)) continue;
      reported.add(it.token);
      out.push({
        line: node.source?.start?.line ?? 0,
        selector,
        token: it.token,
        kind: it.kind,
        reason: it.verdict === 'padding' ? 'padding-off-root' : 'appearance',
      });
    }
  };
  root.walk((node) => {
    if (node.type === 'atrule' && (node as AtRule).name === 'apply') {
      const tokens = (node as AtRule).params.split(/\s+/).filter((t) => t && t !== '!important');
      judge(node, tokens.map((token) => ({ token, kind: 'utility' as const, verdict: utilityVerdict(token) })));
    } else if (node.type === 'decl') {
      const d = node as Declaration;
      judge(node, [{ token: d.prop, kind: 'property' as const, verdict: propertyVerdict(d.prop) }]);
    }
  });
  return out;
}

const TEXT = /^(text-|font-|leading-|tracking-|italic$|not-italic$|underline|line-through|no-underline|uppercase$|lowercase$|capitalize$|normal-case$|tabular-nums$)/;

export function remedyFor(v: Pick<CssViolation, 'token' | 'reason'>, stem: string | null): string {
  if (v.reason === 'padding-off-root') {
    return stem
      ? `padding belongs on the block root .${stem} (the region's inset) or in a primitive's variant in libs/ui`
      : 'padding in the global stylesheet is never allowed; put it on a component block root or in a primitive variant';
  }
  if (TEXT.test(baseUtility(v.token)) || v.token === 'color') {
    return 'use a typography directive (hlmH1-hlmH4, hlmP, hlmLead, hlmLarge, hlmSmall, hlmMuted, hlmCode) or, for an icon, <ng-icon hlmIcon tone="...">';
  }
  return "add a variant to the primitive's cva in libs/ui and select it with its variant input";
}
