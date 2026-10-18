#!/usr/bin/env node
// PostToolUse on Bash (series 2 phase 3). A shell command can write any file
// (sed, a heredoc, a Python script) and no Write/Edit hook sees it. So this hook
// ignores the command, asks git which files under src/ are modified or untracked,
// and runs the app-css checks and the phase 2 applied-appearance rule on those.
// It reports on the whole changed tree after every Bash command: while a
// violation is anywhere in src/, every command reports it.
//
// Fails closed on an unparseable payload or a git failure.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import angular from 'angular-eslint';
import applied from '../../harness/gate/applied-index.mjs';
import { messagesFor, inScope, report } from './check-app-css.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const appliedConfig = [
  { ignores: ['dist/**', '.angular/**', 'node_modules/**', 'coverage/**', 'libs/**'] },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { applied },
    linterOptions: { noInlineConfig: true },
    rules: { 'applied/no-applied-appearance-on-primitive': 'error' },
  },
];

export function changedFiles() {
  const r = spawnSync('git', ['-C', ROOT, 'status', '--porcelain=v1', '-z', '-uall', '--', 'src'], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git status failed: ${r.stderr.trim()}`);
  const parts = r.stdout.split('\0').filter(Boolean);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const status = parts[i].slice(0, 2);
    const path = parts[i].slice(3);
    if (status.startsWith('R') || status.startsWith('C')) i++; // -z puts the source path next
    if (status.includes('D')) continue;
    out.push(path);
  }
  return out.filter(inScope).filter((p) => existsSync(join(ROOT, p)));
}

async function main() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  try {
    JSON.parse(raw);
  } catch {
    process.stderr.write('check-src-after-bash: could not parse hook payload; failing closed.\n');
    process.exit(2);
  }
  let messages = [];
  try {
    const files = changedFiles();
    if (files.length === 0) process.exit(0);
    const oracleRef = {};
    for (const f of files) messages.push(...(await messagesFor(join(ROOT, f), oracleRef)));
    const templates = new Set();
    for (const f of files) {
      const html = /\.css$/i.test(f) ? f.replace(/\.css$/i, '.html') : f;
      if (/\.html$/i.test(html) && html.startsWith('src/app/') && existsSync(join(ROOT, html))) templates.add(join(ROOT, html));
    }
    if (templates.size) {
      const eslint = new ESLint({ cwd: ROOT, overrideConfigFile: true, overrideConfig: appliedConfig });
      for (const r of await eslint.lintFiles([...templates])) {
        const shown = r.filePath.replaceAll('\\', '/').replace(`${ROOT.replaceAll('\\', '/')}/`, '');
        for (const m of r.messages) if (m.severity === 2) messages.push(`${shown}:${m.line}:${m.column}  ${m.message}`);
      }
    }
  } catch (err) {
    process.stderr.write(`check-src-after-bash: check failed (${err?.message ?? err}); failing closed.\n`);
    process.exit(2);
  }
  if (messages.length === 0) process.exit(0);
  report('check-src-after-bash', 'src/', messages);
  process.exit(2);
}

main().catch((err) => {
  process.stderr.write(`check-src-after-bash: ${err?.message ?? err}; failing closed.\n`);
  process.exit(2);
});
