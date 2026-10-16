// Template side of the BEM plane. classUses() lists every class a template
// names; expandTemplate() rewrites a copy of the template with each class
// replaced by the utilities its stylesheet applies, so the series 1 seal and
// layout checks can judge the utilities where they now live. Edits are made by
// source offset, never by adding lines, so reported line numbers stay true.
import { parseTemplate, BindingType } from '@angular/compiler';

const CHILD_KEYS = ['children', 'branches', 'groups', 'cases', 'empty', 'placeholder', 'loading', 'error'];

export function* elements(nodes) {
  for (const n of nodes ?? []) {
    if (!n || typeof n !== 'object') continue;
    if (typeof n.name === 'string' && Array.isArray(n.attributes) && Array.isArray(n.inputs)) yield n;
    for (const k of CHILD_KEYS) {
      const v = n[k];
      if (Array.isArray(v)) yield* elements(v);
      else if (v && typeof v === 'object') yield* elements([v]);
    }
  }
}

const parse = (html, file) => parseTemplate(html, file, { preserveWhitespaces: true }).nodes;
const split = (s) => s.split(/\s+/).filter(Boolean);
const lineOf = (el) => (el.sourceSpan?.start?.line ?? 0) + 1;

// Every class source on one element, in a fixed order, shared by classUses()
// and expandTemplate(): static tokens, interpolated-attribute tokens, [class.x]
// names, then [class] expression tokens (string literals first, then bare keys).
function sources(el, html) {
  const attr = el.attributes.find((a) => a.name === 'class');
  const out = { attr, interp: null, tokens: [] };
  if (attr && typeof attr.value === 'string') {
    for (const token of split(attr.value)) out.tokens.push({ token, via: 'class' });
  }
  for (const i of el.inputs) {
    const raw = html.slice(i.sourceSpan.start.offset, i.sourceSpan.end.offset);
    const named = i.name === 'class' || i.name === 'className';
    if (i.type === BindingType.Class) {
      out.tokens.push({ token: i.name, via: '[class.x]' });
    } else if (named && /^class\s*=/.test(raw) && i.valueSpan) {
      out.interp = i;
      const text = html.slice(i.valueSpan.start.offset, i.valueSpan.end.offset).replace(/\{\{[\s\S]*?\}\}/g, ' ');
      for (const token of split(text)) out.tokens.push({ token, via: 'class' });
    } else if (named) {
      const src = i.valueSpan ? html.slice(i.valueSpan.start.offset, i.valueSpan.end.offset) : '';
      for (const m of src.matchAll(/'([^']*)'|"([^"]*)"|`((?:[^`\$]|\[\s\S]|\$(?!\{)|\$\{[^}]*\})*)`/g)) {
        const lit = m[1] ?? m[2] ?? (m[3] ?? '').replace(/\$\{[^}]*\}/g, ' ');
        for (const token of split(lit)) out.tokens.push({ token, via: '[class]' });
      }
      for (const m of src.matchAll(/[{,]\s*([A-Za-z_][\w-]*)\s*:/g)) out.tokens.push({ token: m[1], via: '[class]' });
    }
  }
  return out;
}

export function classUses(html, file = 'template.html') {
  const out = [];
  for (const el of elements(parse(html, file))) {
    const line = lineOf(el);
    for (const { token, via } of sources(el, html).tokens) out.push({ token, line, via });
  }
  return out;
}

export function expandTemplate(html, utilities, file = 'template.html') {
  const edits = [];
  for (const el of elements(parse(html, file))) {
    const { attr, interp, tokens } = sources(el, html);
    if (tokens.length === 0) continue;
    const value = tokens
      .flatMap(({ token, via }) => utilities.get(token) ?? (via === 'class' ? [token] : []))
      .join(' ');
    const target = attr?.valueSpan ? attr : interp;
    if (target?.valueSpan) {
      const { start, end } = target.valueSpan;
      const before = html[start.offset - 1];
      const old = html.slice(start.offset, end.offset);
      const pad = (old.match(/\r\n|\n|\r/g) ?? []).join('');
      let text;
      if (before === '"') text = value.replaceAll('"', "'");
      else if (before === "'") text = value.replaceAll("'", '"');
      else text = `"${value.replaceAll('"', "'")}"`;
      edits.push({ start: start.offset, end: end.offset, text: text + pad });
    } else if (value && el.startSourceSpan) {
      const s = el.startSourceSpan.start.offset;
      const name = html.slice(s + 1).match(/^[^\s/>]+/)?.[0];
      if (!name) continue;
      const at = s + 1 + name.length;
      edits.push({ start: at, end: at, text: ` class="${value.replaceAll('"', "'")}"` });
    }
  }
  edits.sort((a, b) => b.start - a.start);
  let out = html;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}
