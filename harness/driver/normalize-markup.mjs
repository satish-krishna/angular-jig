#!/usr/bin/env node
// Markup-volume normalizer for the capstone.
//
// Exists to answer one question honestly. Under gate-on, nested-flex-grid (the
// one Part 2 kind that is a counter-only heuristic and therefore NOT enforced)
// rose from 13 to 32 while every enforced kind went to zero. The tempting story
// is displacement: block the agent from space-* and appearance classes and it
// restructures into nested flex instead. But a raw count cannot distinguish
// displacement from the agent simply emitting more markup, and gate-on ran ~24%
// more turns, so it might well have.
//
// So divide by the markup. This counts template elements, flex containers and
// @Component classes per built impl, and reports nested-flex-grid as a rate.
// If the rate is flat, the raw rise was volume and the displacement story is
// wrong. If the rate rises, the story holds.
//
// Usage: node harness/driver/normalize-markup.mjs   (run from the repo root)

import { parseTemplate } from '@angular/compiler';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const walkDir = (d, out = []) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walkDir(p, out);
    else if (e.endsWith('.html') || e.endsWith('.ts')) out.push(p);
  }
  return out;
};

function templatesOf(file) {
  const text = readFileSync(file, 'utf8');
  if (file.endsWith('.html')) return [text];
  const sf = ts.createSourceFile('x.ts', text, ts.ScriptTarget.Latest, true);
  const out = [];
  const visit = (n) => {
    if (ts.isPropertyAssignment(n) && n.name?.getText(sf) === 'template' &&
        (ts.isNoSubstitutionTemplateLiteral(n.initializer) || ts.isStringLiteral(n.initializer))) {
      out.push(n.initializer.text);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

function stats(srcDir) {
  let elements = 0, flexContainers = 0, components = 0;
  for (const f of walkDir(srcDir)) {
    if (f.endsWith('.ts')) {
      const t = readFileSync(f, 'utf8');
      components += (t.match(/@Component\(/g) || []).length;
    }
    for (const tpl of templatesOf(f)) {
      let nodes;
      try { nodes = parseTemplate(tpl, f, { preserveWhitespaces: false }).nodes; } catch { continue; }
      const walk = (ns) => {
        for (const n of ns) {
          if (n && typeof n.name === 'string' && Array.isArray(n.attributes)) {
            elements++;
            const cls = n.attributes.find((a) => a.name === 'class');
            if (cls && typeof cls.value === 'string' && /\bflex\b/.test(cls.value)) flexContainers++;
          }
          for (const k of ['children', 'branches', 'cases', 'empty']) if (Array.isArray(n?.[k])) walk(n[k]);
        }
      };
      walk(nodes);
    }
  }
  return { elements, flexContainers, components };
}

const base = 'experiments/capstone';
const rows = [];
for (const cond of ['gate-off', 'gate-on']) {
  const dir = join(base, cond);
  if (!existsSync(dir)) continue;
  for (const run of readdirSync(dir)) {
    const meta = join(dir, run, 'meta.json');
    const src = join(dir, run, 'impl', 'src');
    if (!existsSync(meta) || !existsSync(src)) continue;
    const m = JSON.parse(readFileSync(meta, 'utf8'));
    if ((m.stages?.length ?? 0) !== 6) continue;
    const s = stats(src);
    rows.push({ cond, trial: m.trial, nfg: m.counterTotals.layout['nested-flex-grid'], ...s });
  }
}
const fmt = (n) => String(n).padStart(6);
console.log('cond      trial   nested-flex   elements   flexCtr   comps   nfg/1k-elem   nfg/flexCtr');
for (const r of rows.sort((a,b)=>a.cond.localeCompare(b.cond)||a.trial-b.trial)) {
  console.log(
    r.cond.padEnd(10), r.trial, fmt(r.nfg), fmt(r.elements), fmt(r.flexContainers), fmt(r.components),
    fmt((r.nfg / r.elements * 1000).toFixed(1)), fmt((r.nfg / (r.flexContainers||1)).toFixed(3)));
}
for (const c of ['gate-off','gate-on']) {
  const rs = rows.filter(r=>r.cond===c);
  const sum = (k)=>rs.reduce((a,r)=>a+r[k],0);
  console.log(`\n${c}: nfg=${sum('nfg')} elements=${sum('elements')} flexCtr=${sum('flexContainers')} comps=${sum('components')}  -> ${(sum('nfg')/sum('elements')*1000).toFixed(1)} per 1k elements, ${(sum('nfg')/sum('flexContainers')).toFixed(3)} per flex container`);
}
