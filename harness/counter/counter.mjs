// The independent structural counter (Part 1).
//
// This is one of the two engines that encode the sealing spec
// (see ../sealing-spec.md). It shares NO code with the gate. The gate parses
// templates with angular-eslint; this counter parses them with Angular's own
// compiler (@angular/compiler parseTemplate) and extracts inline templates with
// the TypeScript compiler API. Two engines, one spec: that independence is what
// closes the circularity objection, so keep it that way. Do not import anything
// the gate imports here.

import { parseTemplate, BindingType } from '@angular/compiler';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// The vocabulary, mirrored from ../sealing-spec.md. Read from source when the
// primitive set changes; do not let this drift from what libs/ui actually ships.
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

// A native control element -> the primitive attribute that must be present.
const CONTROL_PRIMITIVE = { button: 'hlmBtn', input: 'hlmInput' };

const emptyTotals = () => ({
  'raw-control': 0,
  'class-on-primitive': 0,
  'style-attribute': 0,
  all: 0,
});

const norm = (p) => p.replaceAll('\\', '/');

function isClassBearing(el) {
  if (el.attributes.some((a) => a.name === 'class')) return true;
  return el.inputs.some(
    (i) => i.type === BindingType.Class || i.name === 'class' || i.name === 'ngClass',
  );
}

function isStyleBearing(el) {
  if (el.attributes.some((a) => a.name === 'style')) return true;
  return el.inputs.some(
    (i) => i.type === BindingType.Style || i.name === 'style' || i.name === 'ngStyle',
  );
}

function elementViolations(el, file, lineOffset) {
  const out = [];
  const attrNames = new Set(el.attributes.map((a) => a.name));
  const line = (el.sourceSpan?.start?.line ?? 0) + 1 + lineOffset;

  // Rule 1: raw-control.
  const requiredAttr = CONTROL_PRIMITIVE[el.name];
  if (requiredAttr && !attrNames.has(requiredAttr)) {
    out.push({ kind: 'raw-control', file, line, detail: `${el.name} without ${requiredAttr}` });
  }

  const isPrimitive =
    PRIMITIVE_ELEMENTS.has(el.name) || [...attrNames].some((n) => PRIMITIVE_ATTRS.has(n));

  // Rule 2: class-on-primitive.
  if (isPrimitive && isClassBearing(el)) {
    out.push({
      kind: 'class-on-primitive',
      file,
      line,
      detail: `class applied to primitive ${el.name}`,
    });
  }

  // Rule 3: style-attribute (any element).
  if (isStyleBearing(el)) {
    out.push({ kind: 'style-attribute', file, line, detail: `inline style on ${el.name}` });
  }

  return out;
}

// Duck-typed AST walk. An element node has a string name plus attributes and
// inputs arrays; block nodes carry their bodies in children/branches/cases/empty.
function walk(nodes, file, lineOffset, acc) {
  for (const n of nodes) {
    if (n && typeof n.name === 'string' && Array.isArray(n.attributes) && Array.isArray(n.inputs)) {
      acc.push(...elementViolations(n, file, lineOffset));
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

// Pull every inline `template: \`...\`` string out of a component .ts, with the
// 0-based file line of the literal's opening backtick as the line offset.
function extractInlineTemplates(sourceText) {
  const sf = ts.createSourceFile('component.ts', sourceText, ts.ScriptTarget.Latest, true);
  const results = [];
  const visit = (node) => {
    if (
      ts.isPropertyAssignment(node) &&
      node.name &&
      node.name.getText(sf) === 'template' &&
      (ts.isNoSubstitutionTemplateLiteral(node.initializer) ||
        ts.isStringLiteral(node.initializer))
    ) {
      const init = node.initializer;
      const { line } = sf.getLineAndCharacterOfPosition(init.getStart(sf));
      results.push({ text: init.text, lineOffset: line });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return results;
}

export function countFile(absPath, { root } = {}) {
  const file = root ? norm(relative(root, absPath)) : norm(absPath);
  const text = readFileSync(absPath, 'utf8');
  if (absPath.endsWith('.html')) {
    return countTemplateSource(text, { file, lineOffset: 0 });
  }
  if (absPath.endsWith('.ts')) {
    const acc = [];
    for (const { text: tpl, lineOffset } of extractInlineTemplates(text)) {
      acc.push(...countTemplateSource(tpl, { file, lineOffset }));
    }
    return acc;
  }
  return [];
}

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.angular', 'coverage']);

// Recursively collect template-bearing files under a directory.
export function collectTemplateFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) out.push(...collectTemplateFiles(full));
    } else if (entry.endsWith('.html') || entry.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

export function tally(paths, opts = {}) {
  const files = [];
  for (const p of paths) {
    if (statSync(p).isDirectory()) files.push(...collectTemplateFiles(p));
    else files.push(p);
  }
  const violations = [];
  for (const f of files) violations.push(...countFile(f, opts));

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

// CLI: node counter.mjs [--root <dir>] <path...>  ->  JSON tally on stdout.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  let root;
  const ri = args.indexOf('--root');
  if (ri >= 0) {
    root = args[ri + 1];
    args.splice(ri, 2);
  }
  if (args.length === 0) {
    process.stderr.write('usage: node counter.mjs [--root <dir>] <file-or-dir...>\n');
    process.exit(2);
  }
  const result = tally(args, { root });
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
