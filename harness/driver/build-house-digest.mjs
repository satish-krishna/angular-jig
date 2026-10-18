#!/usr/bin/env node
// Generates harness/rules/HOUSE-RULES.md: every rule's `## Agent guidance`
// section, concatenated, for CLAUDE.md to @-include.
//
// WHY THIS EXISTS. The capsule at experiments/rules-vs-hooks measured what a
// house rule doc does when it is in context before the work rather than only in
// a rejection afterwards. On rules that are decidable from the line being
// written -- the sealed vocabulary, the token rules, anything an author could
// obey by looking at what they are typing -- prose in context removed every
// violation, and the gated arm ran FASTER with the docs loaded than without,
// because the gate stopped having to reject and the model stopped having to
// redo. The docs were already written; they were just only ever delivered after
// the mistake.
//
// WHY A DIGEST RATHER THAN THE WHOLE DOCS. All 28 rule documents are 74KB. The
// `## Agent guidance` sections alone are 15KB, and the guidance section is the
// part written to be acted on -- the Why and the Known blind spots are for a
// human deciding whether the rule is right, which is a different reader on a
// different occasion.
//
// WHY GENERATED RATHER THAN HAND-MAINTAINED. Same reason agentGuidanceFor reads
// the markdown instead of keeping a copy: a second copy of a rule is a rule
// that will disagree with itself. Run this when a rule's guidance changes;
// harness/gate/house-digest.test.mjs fails if the checked-in digest is stale.
//
// WHY NOT .claude/rules/. Two reasons, both measured. An @-include inside a
// .claude/rules/*.md file does not expand -- verified against a canary that was
// obeyed through CLAUDE.md and missed through a rules file -- so putting them
// there would mean copying all 28 documents rather than referencing them. And
// .claude/rules/ is not in protect-enforcement's PROTECTED list, while
// harness/ is, so the copies would sit outside the guard that keeps rule text
// from being edited by the thing it constrains.
//
// WHY NO paths: FRONTMATTER anywhere in this design. A path-scoped rule loads
// when the session READS a matching file. A stage that creates new files reads
// nothing, so the rule never loads -- verified with a catch-all `**/*` glob,
// which also never fired. Scoping a rule to the files it governs silently
// switches it off in exactly the greenfield regime where it would pay.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RULES_DIR = join(ROOT, 'harness', 'rules');
const OUT = join(RULES_DIR, 'HOUSE-RULES.md');

export function buildDigest() {
  const sections = [];
  for (const name of readdirSync(RULES_DIR).sort()) {
    if (!name.endsWith('.md') || name === 'HOUSE-RULES.md') continue;
    const rule = name.replace(/\.md$/, '');
    const md = readFileSync(join(RULES_DIR, name), 'utf8').replace(/\r\n/g, '\n');
    const m = md.match(/\n## Agent guidance\n([\s\S]*?)(?=\n## |\s*$)/);
    if (!m) continue;
    sections.push(`### ${rule}\n\n${m[1].trim()}`);
  }
  if (sections.length === 0) {
    // The empty-ruleset failure, in the one place it would otherwise be silent.
    // A digest with no rules in it loads cleanly, reads as a house with no
    // house rules, and reports nothing wrong.
    throw new Error('No rule guidance found. Refusing to write an empty digest.');
  }
  return (
    `# House rules\n\n` +
    `Generated from \`harness/rules/*.md\` by \`harness/driver/build-house-digest.mjs\`. ` +
    `Do not edit; edit the rule document and regenerate.\n\n` +
    `Each section is the enforced rule's own guidance. The gate quotes the same text ` +
    `when it rejects a write, so this is what you will be told afterwards if you get it ` +
    `wrong now.\n\n${sections.join('\n\n')}\n`
  );
}

// pathToFileURL rather than string-building the URL: on Windows a built
// `file://D:/...` never equals the `file:///D:/...` Node actually reports, so
// the script runs, matches nothing, writes nothing, and exits 0.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const digest = buildDigest();
  writeFileSync(OUT, digest);
  process.stdout.write(`Wrote ${OUT} (${digest.length} chars, ${digest.split('### ').length - 1} rules).\n`);
}
