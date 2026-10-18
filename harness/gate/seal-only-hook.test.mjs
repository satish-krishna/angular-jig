import { describe, it, expect, afterAll } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// seal-templates must enforce the seal rules and nothing else. The repo's
// eslint.config.mjs lists every ESLint-hosted rule for `npm run lint`; if the
// sealing hook loaded it, each layout/freeloader/applied/shape violation would be
// reported twice (once here under the sealing corrective text) and the gate-off
// experiment conditions, which register only some hooks, would be contaminated.
// Hooks are entrypoints with a shebang: always spawn them, never import them.
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const probeDir = join(repoRoot, 'src', '.zz-seal-only-probe');
afterAll(() => rmSync(probeDir, { recursive: true, force: true }));

function runHook(hook, name, html) {
  mkdirSync(probeDir, { recursive: true });
  const file = join(probeDir, name);
  writeFileSync(file, html);
  const payload = JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: file } });
  const r = spawnSync('node', [join(repoRoot, '.claude', 'hooks', hook)], {
    input: payload,
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: repoRoot },
  });
  return { status: r.status, stderr: r.stderr };
}

describe('seal-templates enforces only the seal rules', { timeout: 30000 }, () => {
  const cases = [
    ['layout/no-space-utility', 'space.html', '<div class="space-y-4"></div>\n', 'check-layout.mjs'],
    ['layout/no-raw-palette-color', 'palette.html', '<div class="bg-blue-500"></div>\n', 'check-layout.mjs'],
    ['freeloader/no-legacy-control-flow', 'legacy.html', '<p *ngIf="ok">x</p>\n', 'check-freeloader.mjs'],
    ['freeloader/no-ng-class-style', 'ngclass.html', '<p [ngClass]="c">x</p>\n', 'check-freeloader.mjs'],
  ];
  for (const [rule, name, html, owner] of cases) {
    it(`${rule} does not fire through seal-templates`, () => {
      expect(runHook('seal-templates.mjs', name, html).status).toBe(0);
      expect(runHook(owner, name, html).status).toBe(2);
    });
  }

  it('applied/no-applied-appearance-on-primitive does not fire through seal-templates', () => {
    mkdirSync(probeDir, { recursive: true });
    writeFileSync(join(probeDir, 'applied.css'), '@reference "../../styles.css";\n.applied__go { @apply ps-9; }\n');
    const html = '<button hlmBtn class="applied__go">Go</button>\n';
    expect(runHook('seal-templates.mjs', 'applied.html', html).status).toBe(0);
    expect(runHook('check-applied-appearance.mjs', 'applied.html', html).status).toBe(2);
  });

  it('a seal violation still blocks', () => {
    const r = runHook('seal-templates.mjs', 'raw.html', '<button>Save</button>\n');
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('Sealing gate blocked');
  });

  it('a template parse error still blocks', () => {
    expect(runHook('seal-templates.mjs', 'broken.html', '<div\n').status).toBe(2);
  });
});
