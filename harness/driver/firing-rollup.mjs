// npm run firings [-- --since 2026-09-01]
// Reads the ordinary-session firing log and prints counts by hook and by rule.
import { readFileSync, existsSync } from 'node:fs';
import { DEFAULT_LOG_PATH } from '../../.claude/hooks/_hook-log.mjs';

const args = process.argv.slice(2);
const since = args.includes('--since') ? args[args.indexOf('--since') + 1] : null;

if (!existsSync(DEFAULT_LOG_PATH)) {
  process.stdout.write(`No firings recorded yet (${DEFAULT_LOG_PATH} does not exist).\n`);
  process.exit(0);
}

const rows = readFileSync(DEFAULT_LOG_PATH, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => { try { return JSON.parse(l); } catch { return null; } })
  .filter(Boolean)
  .filter((r) => !since || r.ts >= since);

const byHook = {};
const byRule = {};
for (const r of rows) {
  byHook[r.hook] = (byHook[r.hook] ?? 0) + 1;
  for (const rule of r.rules ?? []) byRule[rule] = (byRule[rule] ?? 0) + 1;
}

const table = (title, obj) => {
  process.stdout.write(`\n${title}\n`);
  const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
  if (!entries.length) { process.stdout.write('  (none)\n'); return; }
  for (const [k, n] of entries) process.stdout.write(`  ${String(n).padStart(5)}  ${k}\n`);
};

process.stdout.write(`${rows.length} firing(s)${since ? ` since ${since}` : ''}, ${new Set(rows.map((r) => r.file)).size} distinct file(s).\n`);
table('By hook', byHook);
table('By rule', byRule);
process.stdout.write('\n');
