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
const staticTokens = (el) => {
  const attr = el.attributes.find((a) => a.name === 'class');
  return attr && typeof attr.value === 'string' ? attr.value.split(/\s+/).filter(Boolean) : [];
};

export function classUses(html, file = 'template.html') {
  const out = [];
  for (const el of elements(parse(html, file))) {
    const line = (el.sourceSpan?.start?.line ?? 0) + 1;
    for (const token of staticTokens(el)) out.push({ token, line, via: 'class' });
    for (const i of el.inputs) {
      if (i.type === BindingType.Class) {
        out.push({ token: i.name, line, via: '[class.x]' });
      } else if (i.name === 'class' || i.name === 'className') {
        const src = i.valueSpan ? html.slice(i.valueSpan.start.offset, i.valueSpan.end.offset) : '';
        for (const m of src.matchAll(/'([^']*)'|"([^"]*)"/g)) {
          for (const token of (m[1] ?? m[2]).split(/\s+/).filter(Boolean)) out.push({ token, line, via: '[class]' });
        }
      }
    }
  }
  return out;
}

export function expandTemplate(html, utilities, file = 'template.html') {
  const edits = [];
  for (const el of elements(parse(html, file))) {
    const own = staticTokens(el);
    const bound = el.inputs.filter((i) => i.type === BindingType.Class).map((i) => i.name);
    if (own.length === 0 && bound.length === 0) continue;
    const value = [...own, ...bound].flatMap((t) => utilities.get(t) ?? (own.includes(t) ? [t] : [])).join(' ');
    const attr = el.attributes.find((a) => a.name === 'class');
    if (attr?.valueSpan) {
      edits.push({ start: attr.valueSpan.start.offset, end: attr.valueSpan.end.offset, text: value });
    } else if (value && !el.name.startsWith(':') && el.startSourceSpan) {
      const at = el.startSourceSpan.start.offset + 1 + el.name.length;
      edits.push({ start: at, end: at, text: ` class="${value}"` });
    }
  }
  edits.sort((a, b) => b.start - a.start);
  let out = html;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}
