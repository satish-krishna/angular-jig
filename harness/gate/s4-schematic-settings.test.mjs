import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (name) => JSON.parse(readFileSync(join(here, name), 'utf8'));
const ROUTE = 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/route-to-generator.mjs"';

describe('s4-schematic settings (Decision G4)', () => {
  it('is the series 3 gate-on settings plus route-to-generator, and nothing else', () => {
    const expected = structuredClone(read('s3-gate-on.settings.json').hooks);
    expected.PreToolUse.push({ matcher: 'Write', hooks: [{ type: 'command', command: ROUTE }] });
    expected.PostToolUse.find((m) => m.matcher === 'Bash|PowerShell').hooks.push({ type: 'command', command: ROUTE });
    expect(read('s4-schematic.settings.json').hooks).toEqual(expected);
  });

  it('registers every hook through $CLAUDE_PROJECT_DIR (commit e019ab1)', () => {
    const hooks = read('s4-schematic.settings.json').hooks;
    for (const entry of [...hooks.PreToolUse, ...hooks.PostToolUse]) {
      for (const h of entry.hooks) expect(h.command).toMatch(/^node "\$CLAUDE_PROJECT_DIR\/\.claude\/hooks\/[a-z-]+\.mjs"$/);
    }
  });
});
