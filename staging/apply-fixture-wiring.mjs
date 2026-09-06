// Registers the two fixture hooks and lets the checker be run from Bash.
//
// Both target files are protected by protect-enforcement.mjs, so the agent cannot
// make these edits. Review and run it yourself:
//
//   node staging/apply-fixture-wiring.mjs            # dry run
//   node staging/apply-fixture-wiring.mjs --write    # apply
//
// Refuses on any anchor it cannot find exactly once, and writes nothing if any
// file fails, so it cannot half-apply.
//
// Copy staging/fixtures/ to harness/fixtures/ and staging/hooks/*.mjs to
// .claude/hooks/ BEFORE running this.

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const WRITE = process.argv.includes('--write');

const SETTINGS = join(REPO, '.claude/settings.json');
const GUARD = join(REPO, '.claude/hooks/protect-enforcement.mjs');
const CHECKER = join(REPO, 'harness/fixtures/check-good-fixtures.mjs');

const edits = [];

// ------------------------------------------------------- 1. settings.json ---
// The anchor hook joins the existing PostToolUse list. The Stop hook is new.

const settingsOld = `          { "type": "command", "command": "node .claude/hooks/check-freeloader.mjs" }
        ]
      }
    ]
  }
}`;

const settingsNew = `          { "type": "command", "command": "node .claude/hooks/check-freeloader.mjs" },
          { "type": "command", "command": "node .claude/hooks/check-fixture-anchors.mjs" }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "node .claude/hooks/check-fixtures-on-stop.mjs" }
        ]
      }
    ]
  }
}`;

edits.push({ file: SETTINGS, label: 'register both fixture hooks', from: settingsOld, to: settingsNew });

// --------------------------------------------- 2. the read-only allowlist ---
// The guard denies any Bash command naming a protected path, which would stop the
// agent running the fixture checker at all. The existing allowlist already carves
// out the harness commands it is told to run; the checker joins them. Every shape
// here is read-only.

const guardOld =
  "    const readOnly = /^\\s*(npm run (check:responsive|test:harness|count|lint|build)|npx vitest|node harness\\/counter\\/[a-z-]+\\.mjs)\\b/;";

const guardNew =
  "    const readOnly =\n" +
  "      /^\\s*(npm run (check:responsive|check:boot|check:good|test:harness|count|lint|build)|npx vitest|node harness\\/(counter|fixtures)\\/[a-z-]+\\.mjs)\\b/;";

edits.push({ file: GUARD, label: 'allow the fixture checker to be run', from: guardOld, to: guardNew });

// ------------------------------------------------------------------ apply ---

// Missing checker is a warning in a dry run (so the anchors can still be
// validated) and a hard stop before writing: registering hooks that point at a
// script that is not there arms nothing and hides that it armed nothing.
const checkerInstalled = existsSync(CHECKER);
if (!checkerInstalled) {
  console.error(
    'WARN: harness/fixtures/check-good-fixtures.mjs is not installed.\n' +
      '      Copy staging/fixtures/ to harness/fixtures/ and staging/hooks/*.mjs to\n' +
      '      .claude/hooks/ before applying.\n',
  );
}

const staged = [];
let failed = false;

for (const edit of edits) {
  let text;
  try {
    text = await readFile(edit.file, 'utf8');
  } catch {
    console.error(`STOP ${edit.file}: not found`);
    failed = true;
    continue;
  }
  const hits = text.split(edit.from).length - 1;
  if (hits !== 1) {
    console.error(`STOP ${edit.file}: expected 1 match for "${edit.label}", found ${hits}`);
    failed = true;
    continue;
  }
  staged.push({ file: edit.file, text: text.replace(edit.from, edit.to) });
  console.log(`ok  ${edit.file}`);
  console.log(`    ${edit.label}`);
}

if (failed) {
  console.error('\nNothing written.');
  process.exit(1);
}

if (!WRITE) {
  console.log('\ndry run only; pass --write to apply');
  process.exit(0);
}

if (!checkerInstalled) {
  console.error('\nSTOP: refusing to register hooks pointing at a checker that is not installed.');
  process.exit(1);
}

for (const { file, text } of staged) await writeFile(file, text, 'utf8');
console.log('\napplied. Also add to package.json scripts:');
console.log('  "check:good": "node harness/fixtures/check-good-fixtures.mjs"');
