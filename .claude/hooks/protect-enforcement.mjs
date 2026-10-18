#!/usr/bin/env node
// PreToolUse enforcement guard: the gate with no dial.
//
// The capstone measured the agent under test editing `stylelint.config.mjs` to
// widen a rule that was blocking it, byte-identically, in two of three gate-on
// trials. A third trial invented a CSS-variable indirection to dodge the same
// rule. The tally then reported `raw-css-literal: 0` for those trials, and part
// of that zero was the agent widening the rule rather than obeying it.
//
// The driver already detects this after the fact and voids the run. Detection is
// a smoke alarm; this is not leaving the gas on. A PreToolUse hook DENIES the
// edit before it happens, so the enforcement configuration is not writable by
// the thing being enforced, and the constitution has no dial to turn.
//
// Two design points worth stating, because both are easy to get wrong:
//
// 1. It matches Bash as well as the file-editing tools. A guard that only
//    watches Write/Edit/MultiEdit is trivially walked around with `sed -i`, a
//    shell redirect, `cp`, or `git checkout` of another revision's config. A
//    guard with a known bypass is decoration.
//
// 2. It is registered in BOTH run conditions, unlike every other hook here.
//    This is not a house-convention gate; it is an experimental control, the
//    same kind of thing as the driver's clean-working-tree check. gate-off's
//    premise is that no house conventions are enforced, not that the harness is
//    editable. Registering it in only one arm would leave the baseline free to
//    tamper, which would be a worse asymmetry than the one it fixes.
//
// WHAT THIS GUARD CANNOT DO, stated rather than discovered later. The Bash arm
// scans the command text for a literal protected path, and a shell can always
// name a file without spelling it: `F=stylelint; sed -i s/a/b/ $F.config.mjs`,
// a glob (`sed -i s/a/b/ *.config.mjs`), a working-directory change (`cd
// harness && sed -i ... index.mjs`, and this tool's cwd persists between calls),
// `find . -name '*.config.mjs' -exec sed -i {} +`, or a base64-decoded path all
// get through. Short of running the shell in a sandbox with the paths mounted
// read-only, no PreToolUse text scan closes those; the review that found them
// is on record.
//
// So this hook is the cheap first line, not the guarantee. The guarantee is
// run-capstone.mjs, which diffs every changed file after the run and VOIDS any
// trial that touched an enforcement path. That check cannot be talked around,
// because it reads the git tree rather than the agent's intent. Prevention here,
// authority there.
//
// Fails closed: a payload it cannot parse is denied rather than waved through,
// matching the repo's hook convention.

import { logFiring } from './_hook-log.mjs';

// Single source of truth for enforcement paths. This used to be cross-checked
// against ENFORCEMENT_PATHS in the run driver by harness/gate/protected-paths.test.mjs;
// the driver was removed, so nothing corroborates this list any more
const PROTECTED = [
  'stylelint.config.mjs',
  'eslint.config.mjs',
  'harness/',
  'schematics/',
  '.claude/hooks/',
  '.claude/skills/',
  '.claude/settings.json',
  '.claude/settings.local.json',
  '.agents/skills/',
  'components.json',
  // Not enforcement rules themselves, but each is a lever on the experiment.
  // package.json holds the scripts the gates run, so an agent that can add a
  // script can rewrite a config through it. tsconfig.json holds strictTemplates,
  // which the driver sets as a control in BOTH arms. .mcp.json is handed to the
  // agent as --mcp-config.
  // Implementations from previous runs. The capstone found FOUR stages reading
  // a prior trial out of experiments/, including a gate-on trial reading a
  // gate-off one, and the dialog bug in gate-on t2 is a near-verbatim copy of
  // the one in gate-on t1. Trials are supposed to be independent samples and
  // the two arms are supposed to share nothing but the substrate; a readable
  // experiments/ breaks both. The guard was written to stop the agent editing
  // the RULES and nobody thought about it reading the ANSWERS.
  //
  // NOTE for future edits to this array: harness/gate/protected-paths.test.mjs
  // parses this whole array body, comments included, by scanning for pairs of
  // single quote characters. A stray apostrophe, or any other lone single
  // quote character, in a comment inside this array silently corrupts every
  // entry parsed after it. Do not put an apostrophe or a single quote
  // character in a comment inside this array; write around it instead.
  'experiments/',
  'package.json',
  'tsconfig.json',
  'tsconfig.app.json',
  // Decides whether the rules type-check at all (the safety net Task 1 built).
  // Flip "strict": false in here and that net goes slack, silently.
  'tsconfig.harness.json',
  '.mcp.json',
];

// npm scripts that run the generator's maintenance tools. They name no protected path on
// the command line, so the path scan above cannot see them. They stay out of the PROTECTED
// array on purpose: that array is parsed by quote scanning and these are matched against
// command text, not file paths. Reading about them (grep golden:update README) is allowed.
const DENIED_SCRIPTS = ['verify:arrives-green', 'golden:update', 'build:spec-schema'];

const DENY_MESSAGE =
  'Enforcement configuration is not editable.\n\n' +
  'This path defines or enforces the project constitution, or measures conformance to it:\n' +
  '  stylelint.config.mjs, eslint.config.mjs, harness/, schematics/, .claude/hooks/, .claude/skills/,\n' +
  '  .agents/skills/, components.json\n\n' +
  'Reading them with a read-only command (cat, head, ls, grep, sed -n) is allowed; experiments/\n' +
  'is not readable at all.\n\n' +
  'If a rule is blocking you, the answer is to change the code so it passes, not to change\n' +
  'the rule so it stops asking. If you believe the rule itself is wrong, say so in your final\n' +
  'response and explain why; do not edit it.\n';

async function readStdin() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  return raw;
}

const raw = await readStdin();

let payload;
try {
  payload = JSON.parse(raw);
} catch {
  process.stderr.write('protect-enforcement: could not parse hook payload; failing closed.\n');
  process.exit(2);
}

const READ_ONLY_COMMANDS = new Set(['cat', 'head', 'tail', 'ls', 'grep', 'egrep', 'rg', 'wc', 'sort', 'cut', 'diff', 'stat', 'file', 'pwd', 'echo', 'printf', 'cd', 'true', 'jq',
  // PowerShell reads, compared lowercased.
  'get-content', 'get-childitem', 'select-string', 'get-item', 'gc', 'gci', 'sls', 'dir', 'type']);

const norm = (p) => String(p).replaceAll('\\', '/').replace(/^\.\//, '');

// A path is protected if it IS a protected entry or sits under a protected dir.
// Compared on the tail as well as the whole string, so an absolute path such as
// D:/Repos/angular-jig/harness/gate/index.mjs still matches `harness/`.
function hitsProtected(pathish) {
  const p = norm(pathish);
  return PROTECTED.filter((entry) =>
    entry.endsWith('/')
      ? p === entry.slice(0, -1) || p.includes(entry)
      : p === entry || p.endsWith(`/${entry}`),
  );
}

const toolName = payload.tool_name ?? '';
const input = payload.tool_input ?? {};
let hits = [];

if (toolName === 'Bash' || toolName === 'PowerShell') {
  // A shell command can rewrite a file without ever naming a file-editing tool.
  // Scan the command text for any protected path, then let through only
  // commands that cannot write (isReadOnlyCommand, below).
  const cmd = norm(input.command ?? '');
  hits = PROTECTED.filter((entry) => cmd.includes(entry));
  // Prior trials are the answers, so experiments/ stays unreadable. Every
  // other protected path is read-only rather than invisible: schematic-arm
  // gate-on trial 1 was denied 16 times, and every one was a read (cat
  // package.json, cat .claude/skills/house-style/SKILL.md). Denying reads
  // cost the agent the house rules it was told to follow.
  if (hits.length && !hits.includes('experiments/') && isReadOnlyCommand(cmd, toolName === 'PowerShell')) hits = [];
  if (!hits.length && !isReadOnlyCommand(cmd, toolName === 'PowerShell')) hits = DENIED_SCRIPTS.filter((script) => cmd.includes(script));
} else {
  const file = input.file_path ?? input.filePath ?? input.notebook_path ?? null;
  if (file) hits = hitsProtected(file);
}

if (hits.length === 0) process.exit(0);

// True only when every part of the command is a shape that cannot write. It is
// an allowlist, so anything it does not recognize (a loop, awk, xargs, cp, a
// redirect into a file, a command substitution) counts as a write and is
// denied. Tested against the NORMALIZED command, so the Windows path form and
// the forward-slash form get the same answer.
function isReadOnlyCommand(cmd, powershell) {
  if (/`|\$\(|<\(|>\(/.test(cmd)) return false;
  // PowerShell runs anything in (...), @(...) or a {...} script block.
  if (powershell && /[({]/.test(cmd)) return false;
  // Quoted text is blanked to the same length, so a | or > inside a grep or jq
  // pattern neither splits the command nor reads as a redirect, and segment
  // offsets still line up with the original text.
  const masked = cmd.replace(/'[^']*'|"[^"]*"/g, (q) => q[0] + 'x'.repeat(q.length - 2) + q[0]);
  // 2>&1 and >/dev/null go nowhere. A >&2 followed by more text is a redirect
  // into a file whose name starts with a digit, so the lookahead keeps it.
  const harmless = masked.replace(/\d?>&\d(?!\S)/g, (m) => ' '.repeat(m.length)).replace(/(&|\d)?>>?\s*\/dev\/null/g, (m) => ' '.repeat(m.length));
  if (harmless.includes('>')) return false;
  const segments = [];
  let start = 0;
  for (const m of harmless.matchAll(/&&|\|\||[;|&\n]/g)) {
    segments.push(cmd.slice(start, m.index));
    start = m.index + m[0].length;
  }
  segments.push(cmd.slice(start));
  return segments
    .map((s) => s.trim().replace(/^timeout\s+\d+[smh]?\s+/, ''))
    .filter(Boolean)
    .every(isReadOnlySegment);
}

function isReadOnlySegment(seg) {
  // The checks the agent is told to run, with no flags that rewrite files
  // (eslint --fix, a vitest snapshot update).
  if (/^(npm run (check:responsive|check:boot|test:harness|count|lint|build|validate:spec)|npx vitest|node harness\/counter\/[a-z-]+\.mjs)(\s|$)/.test(seg)) {
    return !/\s(--fix\S*|-u|--update\S*)(\s|=|$)/.test(seg);
  }
  // Flags that write a file or run a program: rg --pre, git diff --output,
  // git grep -O.
  if (/\s(-O\S*|--output\S*|--pre\S*|--open-files-in-pager\S*|--ext-diff)(\s|=|$)/.test(seg)) return false;
  const [word] = seg.split(/\s+/);
  if (word === 'sort') return !/\s-[a-zA-Z]*o/.test(seg);
  if (READ_ONLY_COMMANDS.has(word.toLowerCase())) return true;
  if (word === 'git') return /^git\s+(status|log|show|diff|ls-files|grep|blame)(\s|$)/.test(seg);
  // Plain line-range prints of named files only: a sed script can write with
  // its w command, and GNU sed takes -i after the script too.
  if (word === 'sed') return /^sed\s+-n\s+(['"]?)[\d,$]*p\1(\s+[^-\s]\S*)*\s*$/.test(seg);
  if (word === 'find') return !/\s-(exec\S*|ok\S*|delete|fprint\S*|fls)(\s|$)/.test(seg);
  return false;
}

logFiring('protect-enforcement', hits.join(', '), [`${toolName} blocked on: ${hits.join(', ')}`], ['protect-enforcement']);
process.stderr.write(`${DENY_MESSAGE}\nBlocked: ${toolName} touching ${hits.join(', ')}\n`);
process.exit(2);
