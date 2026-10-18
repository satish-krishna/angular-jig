import { describe, it, expect, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// CLAUDE.md says `npm run lint` enforces every rule the hooks enforce. The
// layout hook's stylesheet half is stylelint, so the lint script must run it,
// and it must fail on a raw literal. The fixture lives in a scratch dir under
// harness/gate, never in src/.
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const scratch = mkdtempSync(join(here, '.zz-lint-stylelint-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const stylelint = (file) =>
  spawnSync('npx', ['stylelint', '--config', join(repoRoot, 'stylelint.config.mjs'), file], {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: true,
  });

describe('npm run lint includes stylelint', { timeout: 30000 }, () => {
  it('the lint script runs stylelint over every stylesheet under src', () => {
    const lint = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')).scripts.lint;
    expect(lint.split('&&').map((s) => s.trim())).toContain('stylelint "src/**/*.css"');
  });

  it('a raw hex literal in a stylesheet fails stylelint', () => {
    const file = join(scratch, 'dirty.css');
    writeFileSync(file, '.dirty { color: #ff0000; }\n');
    const r = stylelint(file);
    expect(r.status).not.toBe(0);
    expect(r.stdout + r.stderr).toContain('declaration-strict-value');
  });

  it('a token reference passes', () => {
    const file = join(scratch, 'clean.css');
    writeFileSync(file, '.clean { color: var(--foreground); }\n');
    expect(stylelint(file).status).toBe(0);
  });
});
