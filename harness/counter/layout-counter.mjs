// The independent structural counter for Part 2 (layout as a grammar).
//
// Encodes the layout-grammar spec (../layout-grammar-spec.md) as a second
// engine, separate from the gate: templates via @angular/compiler, stylesheets
// via a small deterministic text pass. Three kinds: literal-value,
// presentation-on-raw, and the stated-heuristic nested-flex-grid. Shares no code
// with the gate.

import { parseTemplate } from '@angular/compiler';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const PRIMITIVE_ATTRS = new Set([
  'hlmBtn',
  'hlmInput',
  'hlmCard',
  'hlmCardHeader',
  'hlmCardFooter',
  'hlmCardTitle',
  'hlmCardDescription',
  'hlmCardContent',
  'hlmCardAction',
]);
const PRIMITIVE_ELEMENTS = new Set(['hlm-card', 'hlm-card-header', 'hlm-card-footer']);

const norm = (p) => p.replaceAll('\\', '/');
const emptyTotals = () => ({
  'literal-value': 0,
  'presentation-on-raw': 0,
  'nested-flex-grid': 0,
  all: 0,
});

const isBracket = (t) => t.includes('[') && t.includes(']');
const isAppearance = (t) =>
  !isBracket(t) &&
  (t.startsWith('bg-') ||
    t === 'border' ||
    t.startsWith('border-') ||
    t === 'rounded' ||
    t.startsWith('rounded-') ||
    t === 'shadow' ||
    t.startsWith('shadow-') ||
    t === 'ring' ||
    t.startsWith('ring-'));

function isPrimitive(el) {
  if (PRIMITIVE_ELEMENTS.has(el.name)) return true;
  return el.attributes.some((a) => PRIMITIVE_ATTRS.has(a.name));
}

function classTokens(el) {
  const attr = el.attributes.find((a) => a.name === 'class');
  if (!attr || typeof attr.value !== 'string') return [];
  return attr.value.split(/\s+/).filter(Boolean);
}

function elementChildren(el) {
  return (el.children ?? []).filter(
    (n) => n && typeof n.name === 'string' && Array.isArray(n.attributes) && Array.isArray(n.inputs),
  );
}

function templateViolations(el, file, lineOffset, acc) {
  const line = (el.sourceSpan?.start?.line ?? 0) + 1 + lineOffset;
  const tokens = classTokens(el);
  const primitive = isPrimitive(el);

  if (!primitive) {
    for (const t of tokens) {
      if (isBracket(t)) {
        acc.push({ kind: 'literal-value', file, line, detail: `arbitrary value ${t}` });
      }
    }
    if (tokens.some(isAppearance)) {
      acc.push({
        kind: 'presentation-on-raw',
        file,
        line,
        detail: `appearance classes on <${el.name}>`,
      });
    }
  }

  // nested-flex heuristic: a flex container with two or more flex children.
  if (tokens.includes('flex')) {
    const flexChildren = elementChildren(el).filter((c) => classTokens(c).includes('flex'));
    if (flexChildren.length >= 2) {
      acc.push({
        kind: 'nested-flex-grid',
        file,
        line,
        detail: `flex container with ${flexChildren.length} flex children (heuristic)`,
      });
    }
  }
}

function walk(nodes, file, lineOffset, acc) {
  for (const n of nodes) {
    if (n && typeof n.name === 'string' && Array.isArray(n.attributes) && Array.isArray(n.inputs)) {
      templateViolations(n, file, lineOffset, acc);
    }
    for (const key of ['children', 'branches', 'cases', 'empty']) {
      if (Array.isArray(n?.[key])) walk(n[key], file, lineOffset, acc);
    }
  }
}

export function countTemplateSource(template, { file, lineOffset = 0 }) {
  const { nodes } = parseTemplate(template, file, { preserveWhitespaces: false });
  const acc = [];
  walk(nodes, file, lineOffset, acc);
  return acc;
}

// A literal color or raw px length in CSS, outside a var(...) token reference.
export function countCssSource(css, { file, lineOffset = 0 }) {
  const acc = [];
  // Mask comments and var(...) spans so a token reference or a value inside a
  // comment never registers as a literal, while keeping character positions
  // intact for line numbers.
  const masked = css
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/var\([^)]*\)/g, (m) => ' '.repeat(m.length));
  const patterns = [
    { re: /#[0-9a-fA-F]{3,8}\b/g, what: 'hex color' },
    { re: /\b\d+(?:\.\d+)?px\b/g, what: 'raw px length' },
    { re: /\b(?:rgb|rgba|hsl|hsla)\(/g, what: 'literal color function' },
  ];
  for (const { re, what } of patterns) {
    let m;
    while ((m = re.exec(masked)) !== null) {
      const line = css.slice(0, m.index).split('\n').length + lineOffset;
      acc.push({ kind: 'literal-value', file, line, detail: `${what} ${m[0].trim()}` });
    }
  }
  return acc;
}

// Extract inline template, inline styles, and styleUrl(s) from a component .ts.
function extractFromComponent(sourceText) {
  const sf = ts.createSourceFile('component.ts', sourceText, ts.ScriptTarget.Latest, true);
  const templates = [];
  const styles = [];
  const styleUrls = [];
  const litText = (node) =>
    ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node) ? node : null;

  const visit = (node) => {
    if (ts.isPropertyAssignment(node) && node.name) {
      const key = node.name.getText(sf);
      const init = node.initializer;
      if (key === 'template' && litText(init)) {
        templates.push({ text: init.text, lineOffset: sf.getLineAndCharacterOfPosition(init.getStart(sf)).line });
      } else if ((key === 'styles' || key === 'styleUrls') && ts.isArrayLiteralExpression(init)) {
        for (const el of init.elements) {
          const lit = litText(el);
          if (!lit) continue;
          if (key === 'styles') {
            styles.push({ text: lit.text, lineOffset: sf.getLineAndCharacterOfPosition(lit.getStart(sf)).line });
          } else {
            styleUrls.push(lit.text);
          }
        }
      } else if (key === 'styleUrl' && litText(init)) {
        styleUrls.push(init.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { templates, styles, styleUrls };
}

export function layoutCountFile(absPath, { root } = {}) {
  const file = root ? norm(relative(root, absPath)) : norm(absPath);
  const text = readFileSync(absPath, 'utf8');
  const acc = [];

  if (absPath.endsWith('.html')) {
    acc.push(...countTemplateSource(text, { file, lineOffset: 0 }));
  } else if (absPath.endsWith('.css')) {
    acc.push(...countCssSource(text, { file, lineOffset: 0 }));
  } else if (absPath.endsWith('.ts')) {
    const { templates, styles } = extractFromComponent(text);
    for (const t of templates) acc.push(...countTemplateSource(t.text, { file, lineOffset: t.lineOffset }));
    for (const s of styles) acc.push(...countCssSource(s.text, { file, lineOffset: s.lineOffset }));
    // A styleUrl .css file is scanned standalone by the directory walk, so it is
    // NOT followed from the .ts here: doing both double-counts the same file.
  }
  return acc;
}

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.angular', 'coverage']);

export function collectLayoutFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(entry)) out.push(...collectLayoutFiles(full));
    } else if (entry.endsWith('.html') || entry.endsWith('.ts') || entry.endsWith('.css')) {
      out.push(full);
    }
  }
  return out;
}

export function layoutTally(paths, opts = {}) {
  const files = [];
  for (const p of paths) {
    if (statSync(p).isDirectory()) files.push(...collectLayoutFiles(p));
    else files.push(p);
  }
  const violations = [];
  for (const p of files) violations.push(...layoutCountFile(p, opts));
  violations.sort(
    (a, b) =>
      (a.file < b.file ? -1 : a.file > b.file ? 1 : 0) ||
      a.line - b.line ||
      (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0),
  );
  const totals = emptyTotals();
  for (const v of violations) {
    totals[v.kind] += 1;
    totals.all += 1;
  }
  return { totals, violations };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  let root;
  const ri = args.indexOf('--root');
  if (ri >= 0) {
    root = args[ri + 1];
    args.splice(ri, 2);
  }
  if (args.length === 0) {
    process.stderr.write('usage: node layout-counter.mjs [--root <dir>] <file...>\n');
    process.exit(2);
  }
  process.stdout.write(JSON.stringify(layoutTally(args, { root }), null, 2) + '\n');
}
