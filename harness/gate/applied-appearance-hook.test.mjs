import { describe, it, expect, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const probeDir = join(repoRoot, 'src', 'app', 'zz-applied-probe');
const html = join(probeDir, 'zz-applied-probe.html');
const css = join(probeDir, 'zz-applied-probe.css');
const hookLog = join(probeDir, 'firings.jsonl');

function probe(cssBody) {
  mkdirSync(probeDir, { recursive: true });
  writeFileSync(html, '<button hlmBtn class="zz-applied-probe__go">Go</button>\n');
  writeFileSync(css, `@reference "../../styles.css";\n${cssBody}\n`);
}
const run = (payload) =>
  spawnSync('node', ['.claude/hooks/check-applied-appearance.mjs'], {
    cwd: repoRoot,
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    env: { ...process.env, HOOK_LOG: hookLog },
    encoding: 'utf8',
  });
const edit = (file_path) => ({ tool_name: 'Edit', tool_input: { file_path } });

afterAll(() => rmSync(probeDir, { recursive: true, force: true }));

describe('check-applied-appearance hook', { timeout: 30000 }, () => {
  it('blocks a stylesheet edit that puts appearance on a primitive, with the rule doc guidance', () => {
    probe('.zz-applied-probe__go { @apply ps-9; }');
    const r = run(edit(css));
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('ps-9');
    expect(r.stderr).toContain('harness/rules/no-applied-appearance-on-primitive.md');
    expect(r.stderr).toContain('add the variant to its `cva`');
  });

  it('blocks the same violation when the template is the file edited', () => {
    probe('.zz-applied-probe__go { @apply rounded-md; }');
    expect(run(edit(html)).status).toBe(2);
  });

  it('passes layout-only utilities', () => {
    probe('.zz-applied-probe__go { @apply w-full ms-auto; }');
    expect(run(edit(css)).status).toBe(0);
  });

  it('passes files outside src/ and files that are neither template nor stylesheet', () => {
    expect(run(edit(join(repoRoot, 'README.md'))).status).toBe(0);
    expect(run(edit(join(repoRoot, 'harness', 'x.css'))).status).toBe(0);
    probe('.zz-applied-probe__go { @apply ps-9; }');
    expect(run(edit(join(probeDir, 'zz-applied-probe.ts'))).status).toBe(0);
  });

  it('blocks an unreadable stylesheet', () => {
    probe('.zz-applied-probe__go { @apply ps-9;');
    expect(run(edit(css)).status).toBe(2);
  });

  it('fails closed on an unparseable payload', () => {
    expect(run('not json').status).toBe(2);
  });
});
