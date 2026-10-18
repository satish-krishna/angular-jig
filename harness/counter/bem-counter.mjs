// The BEM plane (series 2, harness/bem-house-style-spec.md). Two exports:
//
// bemTally: the eight rules that are new in series 2 (BEM-only templates, one
// block per component, the file triad, @reference, no Sass-style nesting, no
// utilities in TS).
//
// expandedTally: the series 1 seal and layout checks, run on each template
// after its BEM classes are replaced by the utilities its stylesheet applies.
// Moving `bg-red-500` from the template into `@apply` must not hide it.
//
// Counter side only: like counter.mjs, this imports nothing the gates import.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as seal from './counter.mjs';
import * as layout from './layout-counter.mjs';
import { loadClassifier, BEM_RE, blockOf } from './bem/classify.mjs';
import { parseStylesheet, isConcat } from './bem/stylesheet.mjs';
import { appCssViolations } from './bem/app-css.mjs';
import { classUses, expandTemplate, normalizeUtility } from './bem/template.mjs';
import { readComponents, stringValue, stringList } from './bem/components.mjs';

export const BEM_KINDS = [
  'template-utility-class',
  'foreign-block',
  'inline-template',
  'inline-styles',
  'missing-triad',
  'missing-reference',
  'broken-nesting',
  'utility-in-ts',
  'appearance-in-app-css',
];

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.angular', 'coverage']);
const norm = (p) => p.replaceAll('\\', '/');

function walkFiles(paths, exts) {
  const out = [];
  const visit = (p) => {
    if (statSync(p).isDirectory()) {
      for (const e of readdirSync(p)) if (!SKIP_DIRS.has(e)) visit(join(p, e));
    } else if (exts.some((x) => p.endsWith(x))) out.push(p);
  };
  for (const p of paths) visit(p);
  return out.sort();
}

const byFileLineKind = (a, b) =>
  (a.file < b.file ? -1 : a.file > b.file ? 1 : 0) || a.line - b.line || (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0);

function withTotals(zero, violations) {
  const totals = { ...zero };
  for (const v of violations) {
    totals[v.kind] += 1;
    totals.all += 1;
  }
  violations.sort(byFileLineKind);
  return { totals, violations };
}

// A string that reads as a class list. Two or more tokens: every one is
// class-shaped (a utility or a BEM name), and either two are utilities or one
// has a separator in it (`w-full`, `sm:x`, `a/50`). One token: a utility with a
// separator. A lone bare word (`hidden`, `block`) is too often ordinary data,
// and so is `show hidden items`.
const SEPARATED = /[-:/[]/;
function looksLikeClasses(text, isUtility) {
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    if (!tokens.every((t) => isUtility(t) || BEM_RE.test(t))) return false;
    const utilities = tokens.filter(isUtility);
    return utilities.length >= 2 || utilities.some((t) => SEPARATED.test(t));
  }
  return tokens.length === 1 && isUtility(tokens[0]) && SEPARATED.test(tokens[0]);
}

const brokenDetail = (selector) =>
  isConcat(selector) ? `${selector} appends to & (Sass only)` : 'unparseable selector (Sass-style comment or syntax?)';

export async function bemTally(paths, { root, styles } = {}) {
  const { isUtility } = await loadClassifier(styles ?? join(root, 'src', 'styles.css'));
  const rel = (p) => norm(root ? relative(root, p) : p);
  const v = [];
  const add = (kind, file, line, detail) => v.push({ kind, file: rel(file), line, detail });

  const checkUses = (uses, file, block, lineOffset = 0) => {
    for (const u of uses) {
      const line = u.line + lineOffset;
      // A class name built from data (`block__status--{{ s }}`) leaves a dangling
      // separator; the counter cannot know what it expands to.
      if (/(__|--)$/.test(u.token)) add('template-utility-class', file, line, `partial class name: ${u.token}`);
      // A component named after a utility (`table`) may use its own name.
      else if (BEM_RE.test(u.token) && blockOf(u.token) === block) continue;
      else if (isUtility(u.token) || !BEM_RE.test(u.token)) add('template-utility-class', file, line, `${u.via} ${u.token}`);
      else add('foreign-block', file, line, `${u.token} in ${block}`);
    }
  };

  // R7 / R7a: every stylesheet in the walk, claimed by a component or not. An
  // unparseable one records nothing here (broken-nesting reports bad selectors).
  const checkAppCss = (file) => {
    const global = rel(file) === 'src/styles.css';
    const stem = basename(file, '.css').replace(/\.component$/, '');
    let found;
    try {
      found = appCssViolations(readFileSync(file, 'utf8'), { stem: global ? null : stem, global });
    } catch {
      return;
    }
    for (const x of found) add('appearance-in-app-css', file, x.line, `${x.selector}: ${x.token}`);
  };

  const claimed = new Set();
  const blocks = new Set();
  for (const tsPath of walkFiles(paths, ['.ts']).filter((p) => !p.endsWith('.spec.ts'))) {
    const text = readFileSync(tsPath, 'utf8');
    const { components, hostClasses, strings } = readComponents(tsPath, text);
    const dir = dirname(tsPath);
    const fileStem = basename(tsPath, '.ts');
    const block = fileStem.replace(/\.component$/, '');
    const htmlPath = join(dir, `${fileStem}.html`);
    const cssPath = join(dir, `${fileStem}.css`);

    components.forEach((c, index) => {
      const p = c.props;
      for (const url of [stringValue(p.templateUrl), ...stringList(p.styleUrl), ...stringList(p.styleUrls)]) {
        if (url == null) continue;
        const f = join(dir, url);
        if (existsSync(f)) claimed.add(norm(f));
      }
      blocks.add(block);
      const inlineTemplate = stringValue(p.template);
      if (p.template) add('inline-template', tsPath, c.line, 'template: in @Component');
      if (p.styles) add('inline-styles', tsPath, c.line, 'styles: in @Component');
      if (inlineTemplate != null) checkUses(classUses(inlineTemplate, rel(tsPath)), tsPath, block, c.templateLine - 1);
      if (index > 0) {
        add('missing-triad', tsPath, c.line, 'a second @Component in one file cannot own a triad');
        return;
      }
      const templateOk = stringValue(p.templateUrl) === `./${fileStem}.html` && existsSync(htmlPath);
      const styleUrls = [...stringList(p.styleUrl), ...stringList(p.styleUrls)];
      const styleOk = styleUrls.length === 1 && styleUrls[0] === `./${fileStem}.css` && existsSync(cssPath);
      if (!p.template && !templateOk) add('missing-triad', tsPath, c.line, `expected templateUrl './${fileStem}.html'`);
      if (!p.styles && !styleOk) add('missing-triad', tsPath, c.line, `expected styleUrl './${fileStem}.css'`);
      if (templateOk) checkUses(classUses(readFileSync(htmlPath, 'utf8'), rel(htmlPath)), htmlPath, block);
      if (styleOk) {
        const s = parseStylesheet(readFileSync(cssPath, 'utf8'), cssPath);
        for (const { cls, line } of s.selectorClasses) {
          if (blockOf(cls) !== block) add('foreign-block', cssPath, line, `.${cls} in ${fileStem}.css`);
        }
        if (s.hasApply && !s.hasReference) add('missing-reference', cssPath, 1, '@apply without @reference');
        for (const b of s.brokenNesting) add('broken-nesting', cssPath, b.line, brokenDetail(b.selector));
      }
    });

    for (const h of hostClasses) {
      if (h.kind === 'binding') {
        if (isUtility(h.text)) add('utility-in-ts', tsPath, h.line, `host [class.${h.text}]`);
      } else if (h.kind === 'map') {
        if (looksLikeClasses(h.text, isUtility)) add('utility-in-ts', tsPath, h.line, `host [class]: ${h.text}`);
      } else if (h.text.split(/\s+/).some((t) => t && isUtility(t))) add('utility-in-ts', tsPath, h.line, `host class: ${h.text}`);
    }
    for (const s of strings) {
      if (looksLikeClasses(s.text, isUtility)) add('utility-in-ts', tsPath, s.line, s.text);
    }
  }

  for (const f of walkFiles(paths, ['.html', '.css'])) {
    if (f.endsWith('.css')) checkAppCss(f);
    if (claimed.has(norm(f))) continue;
    if (/(^|\/)app\//.test(rel(f))) add('missing-triad', f, 1, 'no component claims this file');
    if (f.endsWith('.css')) {
      const s = parseStylesheet(readFileSync(f, 'utf8'), f);
      for (const { cls, line } of s.selectorClasses) {
        const b = blockOf(cls);
        if (blocks.has(b)) add('foreign-block', f, line, `.${cls} styles ${b} from a stylesheet no component owns`);
      }
    }
  }

  return withTotals(Object.fromEntries([...BEM_KINDS.map((k) => [k, 0]), ['all', 0]]), v);
}

export function expandedTally(paths, { root } = {}) {
  const rel = (p) => norm(root ? relative(root, p) : p);
  const siblingCss = (f) => {
    if (!f.endsWith('.html')) return null;
    const css = f.replace(/\.html$/, '.css');
    return existsSync(css) ? css : null;
  };
  const globalMap = new Map();
  for (const f of walkFiles(paths, ['.css'])) {
    if (existsSync(f.replace(/\.css$/, '.html'))) continue;
    for (const [cls, utils] of parseStylesheet(readFileSync(f, 'utf8'), f).utilities) {
      const list = globalMap.get(cls) ?? [];
      for (const u of utils) if (!list.includes(u)) list.push(u);
      globalMap.set(cls, list);
    }
  }
  const expand = (html, css) => {
    const map = new Map();
    const own = parseStylesheet(readFileSync(css, 'utf8'), css).utilities;
    for (const m of [own, globalMap]) {
      for (const [cls, utils] of m) {
        const list = map.get(cls) ?? [];
        for (const u of utils) if (!list.includes(u)) list.push(u);
        map.set(cls, list);
      }
    }
    return expandTemplate(readFileSync(html, 'utf8'), map, rel(html));
  };
  const filesOf = (collect) => paths.flatMap((p) => (statSync(p).isDirectory() ? collect(p) : [p]));

  const sealV = [];
  for (const f of filesOf(seal.collectTemplateFiles)) {
    const css = siblingCss(f);
    sealV.push(...(css ? seal.countTemplateSource(expand(f, css), { file: rel(f) }) : seal.countFile(f, { root })));
  }
  const layoutV = [];
  for (const f of filesOf(layout.collectLayoutFiles)) {
    const css = siblingCss(f);
    layoutV.push(...(css ? layout.countTemplateSource(expand(f, css), { file: rel(f) }) : layout.layoutCountFile(f, { root })));
    // `@apply` on :host, a bare element or a descendant styles no BEM class, so
    // no template expansion carries it. Judge it as a template at its own line.
    // Not sealed: appearance-on-primitive cannot apply to a host or a bare element.
    if (f.endsWith('.css')) {
      for (const { tokens, line } of parseStylesheet(readFileSync(f, 'utf8'), f).unmapped) {
        const html = `<div class="${tokens.map(normalizeUtility).join(' ').replaceAll('"', "'")}"></div>`;
        layoutV.push(...layout.countTemplateSource(html, { file: rel(f), lineOffset: line - 1 }));
      }
    }
  }
  return {
    seal: withTotals(seal.tally([]).totals, sealV),
    layout: withTotals(layout.layoutTally([]).totals, layoutV),
  };
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
    process.stderr.write('usage: node bem-counter.mjs [--root <dir>] <path...>\n');
    process.exit(2);
  }
  const bem = await bemTally(args, { root: root ?? process.cwd() });
  process.stdout.write(JSON.stringify({ bem, expanded: expandedTally(args, { root: root ?? process.cwd() }) }, null, 2) + '\n');
}
