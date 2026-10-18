#!/usr/bin/env node
// The app-css gate over the whole tree, for `npm run lint`. The Write/Edit hook
// (.claude/hooks/check-app-css.mjs) judges one file as an agent edits it; ESLint
// cannot host this gate because it reads stylesheets with PostCSS and judges
// template classes against Tailwind's own utility oracle. This CLI runs the same
// checks (it imports the hook's own scope and per-file logic, so the two cannot
// drift) over every stylesheet under src and every template under src/app, prints
// violations in the hook's format, and exits 1 on any.
//
// Usage: node harness/gate/check-app-css-all.mjs [--root <dir>]   (default: the repo)

import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inScope, messagesFor } from '../../.claude/hooks/check-app-css.mjs';

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
  const files = walk(join(root, 'src')).filter((f) => inScope(relative(root, f).replaceAll('\\', '/')));
  const messages = [];
  const oracleRef = {};
  for (const abs of files) messages.push(...(await messagesFor(abs, oracleRef, root)));
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
