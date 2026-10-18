#!/usr/bin/env node
// The app-css gate over the whole tree, for `npm run lint`. The Write/Edit hook
// (.claude/hooks/check-app-css.mjs) judges one file as an agent edits it; ESLint
// cannot host this gate because it reads stylesheets with PostCSS and judges
// template classes against Tailwind's own utility oracle. This CLI runs the same
// checks over every component stylesheet and template under src/app plus
// src/styles.css, prints violations in the hook's format, and exits 1 on any.
//
// Usage: node harness/gate/check-app-css-all.mjs [--root <dir>]   (default: the repo)

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkStylesheet, stemOf, isGlobalStylesheet, remedyFor, loadUtilityOracle, templateUtilities } from './app-css/index.mjs';

const DOC = 'harness/rules/app-css-layout-only.md';

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

export async function checkTree(root) {
  const files = [join(root, 'src', 'styles.css'), ...walk(join(root, 'src', 'app')).filter((f) => /\.(css|html)$/i.test(f))].filter(existsSync);
  const messages = [];
  const oracleRef = {};
  for (const abs of files) {
    const rel = relative(root, abs).replaceAll('\\', '/');
    const text = readFileSync(abs, 'utf8');
    if (/\.css$/i.test(rel)) {
      const global = isGlobalStylesheet(rel);
      const stem = global ? null : stemOf(rel);
      let vs;
      try {
        vs = checkStylesheet(text, { stem, global });
      } catch (err) {
        messages.push(`${rel}: unreadable stylesheet (${err?.message ?? err}); fix the syntax.`);
        continue;
      }
      for (const v of vs) {
        messages.push(`${rel}:${v.line}  ${v.selector || '(top level)'}  "${v.token}" is ${v.reason === 'padding-off-root' ? 'padding off the block root' : 'appearance'}: ${remedyFor(v, stem)}.`);
      }
    } else {
      oracleRef.isUtility ??= await loadUtilityOracle(join(root, 'src', 'styles.css'));
      let vs;
      try {
        vs = templateUtilities(text, rel, oracleRef.isUtility);
      } catch (err) {
        messages.push(`${rel}: unreadable template (${err?.message ?? err}).`);
        continue;
      }
      for (const v of vs) {
        messages.push(`${rel}:${v.line}  "${v.token}" is a Tailwind utility in a template ${v.via}: give the element a BEM class and @apply layout in its stylesheet.`);
      }
    }
  }
  return { checked: files.length, messages };
}

async function main() {
  const i = process.argv.indexOf('--root');
  const root = i > -1 ? resolve(process.argv[i + 1]) : join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const { messages } = await checkTree(root);
  if (messages.length === 0) return;
  process.stderr.write(
    `App-css gate: ${messages.length} violation(s).\n` + messages.map((m) => `  ${m}`).join('\n') + `\n  app-css/layout-only  ->  ${DOC}\n`,
  );
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`check-app-css-all: ${err?.message ?? err}; failing closed.\n`);
  process.exit(1);
});
