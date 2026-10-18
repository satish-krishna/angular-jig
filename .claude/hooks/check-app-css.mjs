#!/usr/bin/env node
// PostToolUse app-css gate (series 2 phase 3, harness/bem-phase-3-layout-only-spec.md
// on the launching branch). On a Write/Edit/MultiEdit of a stylesheet under src/app
// or src/styles.css: every @apply utility and declaration must be layout (R7), with
// padding only on the block root (R7a). On a template under src/app: no Tailwind
// utility in a class attribute or [class.x] binding (BEM rule 1).
//
// Self-contained: only harness/gate/s3-gate-on.settings.json (launching branch)
// registers it. Present-but-unregistered in gate-off. Fails closed on an
// unparseable payload, stylesheet or template.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkStylesheet, stemOf, isGlobalStylesheet, remedyFor, loadUtilityOracle, templateUtilities } from '../../harness/gate/app-css/index.mjs';
import { logFiring } from './_hook-log.mjs';
import { agentGuidanceFor, formatDocPointerBlock } from './rule-docs.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DOC = { ruleId: 'app-css/layout-only', url: 'harness/rules/app-css-layout-only.md' };

export const inScope = (rel) => /^src\/.+\.css$/i.test(rel) || /^src\/app\/.+\.html$/i.test(rel);

// Messages for one file. `oracle` is loaded lazily, once per process.
export async function messagesFor(absPath, oracleRef) {
  const rel = relative(ROOT, absPath).replaceAll('\\', '/');
  const text = readFileSync(absPath, 'utf8');
  if (/\.css$/i.test(rel)) {
    const global = isGlobalStylesheet(rel);
    const stem = global ? null : stemOf(rel);
    let vs;
    try {
      vs = checkStylesheet(text, { stem, global });
    } catch (err) {
      return [`${rel}: unreadable stylesheet (${err?.message ?? err}); fix the syntax.`];
    }
    return vs.map((v) => `${rel}:${v.line}  ${v.selector || '(top level)'}  "${v.token}" is ${v.reason === 'padding-off-root' ? 'padding off the block root' : 'appearance'}: ${remedyFor(v, stem)}.`);
  }
  oracleRef.isUtility ??= await loadUtilityOracle(join(ROOT, 'src', 'styles.css'));
  let vs;
  try {
    vs = templateUtilities(text, rel, oracleRef.isUtility);
  } catch (err) {
    return [`${rel}: unreadable template (${err?.message ?? err}).`];
  }
  return vs.map((v) => `${rel}:${v.line}  "${v.token}" is a Tailwind utility in a template ${v.via}: give the element a BEM class and @apply layout in its stylesheet.`);
}

export function report(hook, file, messages) {
  logFiring(hook, file, messages, [DOC.ruleId]);
  const guidance = agentGuidanceFor([DOC]);
  process.stderr.write(
    `App-css gate blocked this change: ${messages.length} violation(s).\n` +
      messages.map((m) => `  ${m}`).join('\n') +
      '\n' +
      formatDocPointerBlock([`  ${DOC.ruleId}  ->  ${DOC.url}`]) +
      (guidance.length ? `${guidance.join('\n\n')}\n\n` : '') +
      'Fix the above before continuing.\n',
  );
}

async function main() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  let payload;
  try {
    payload = JSON.parse(raw);
    if (payload === null || typeof payload !== 'object') throw new Error('payload is not an object');
  } catch {
    process.stderr.write('check-app-css: could not parse hook payload; failing closed.\n');
    process.exit(2);
  }
  const file = payload?.tool_input?.file_path ?? payload?.tool_input?.filePath ?? null;
  if (!file) process.exit(0);
  const rel = relative(ROOT, String(file)).replaceAll('\\', '/');
  if (!inScope(rel) || !existsSync(file)) process.exit(0);
  let messages;
  try {
    messages = await messagesFor(String(file), {});
  } catch (err) {
    process.stderr.write(`check-app-css: check failed (${err?.message ?? err}); failing closed.\n`);
    process.exit(2);
  }
  if (messages.length === 0) process.exit(0);
  report('check-app-css', rel, messages);
  process.exit(2);
}

const failClosed = (err) => {
  process.stderr.write(`check-app-css: ${err?.message ?? err}; failing closed.\n`);
  process.exit(2);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(failClosed);
