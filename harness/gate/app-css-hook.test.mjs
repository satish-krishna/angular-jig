import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const probeDir = join(repoRoot, 'src', 'app', 'zz-css-probe');
const html = join(probeDir, 'zz-css-probe.html');
const css = join(probeDir, 'zz-css-probe.css');
const outsideCss = join(repoRoot, 'src', 'zz-css-probe-theme.css');
const hookLog = join(repoRoot, 'harness', 'gate', '.zz-css-probe-firings.jsonl');

function probe(cssBody, htmlBody = '<section class="zz-css-probe"><p class="zz-css-probe__hint">x</p></section>\n') {
  mkdirSync(probeDir, { recursive: true });
  writeFileSync(html, htmlBody);
  writeFileSync(css, `@reference "../../styles.css";\n${cssBody}\n`);
}
const run = (hook, payload, cwd = repoRoot) =>
  spawnSync('node', [join(repoRoot, '.claude', 'hooks', hook)], {
    cwd,
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    env: { ...process.env, HOOK_LOG: hookLog },
    encoding: 'utf8',
  });
const edit = (file_path) => ({ tool_name: 'Edit', tool_input: { file_path } });
const bash = { tool_name: 'Bash', tool_input: { command: 'ls' } };

beforeEach(() => {
  rmSync(probeDir, { recursive: true, force: true });
  rmSync(outsideCss, { force: true });
});
afterAll(() => {
  rmSync(outsideCss, { force: true });
  rmSync(probeDir, { recursive: true, force: true });
  rmSync(hookLog, { force: true });
});

describe('check-app-css (Write/Edit)', () => {
  it('blocks appearance in a component stylesheet, naming the remedy and the rule doc guidance', () => {
    probe('.zz-css-probe__hint { @apply py-8 text-muted-foreground; }');
    const r = run('check-app-css.mjs', edit(css));
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('py-8');
    expect(r.stderr).toContain('text-muted-foreground');
    expect(r.stderr).toContain('typography directive');
    expect(r.stderr).toContain('harness/rules/app-css-layout-only.md');
    expect(r.stderr).toContain('The app stylesheet arranges things');
  });
  it('passes layout and block-root padding', () => {
    probe('.zz-css-probe { @apply grid gap-4 p-6; } .zz-css-probe__hint { @apply col-span-full; }');
    expect(run('check-app-css.mjs', edit(css)).status).toBe(0);
  });
  it('blocks a utility in the template', () => {
    probe('.zz-css-probe { @apply grid; }', '<section class="zz-css-probe flex"></section>\n');
    const r = run('check-app-css.mjs', edit(html));
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('flex');
  });
  it('passes the substrate global stylesheet', () => {
    expect(run('check-app-css.mjs', edit(join(repoRoot, 'src', 'styles.css'))).status).toBe(0);
  });
  it('blocks an unparseable stylesheet', () => {
    probe('.zz-css-probe__hint { @apply text-sm;');
    expect(run('check-app-css.mjs', edit(css)).status).toBe(2);
  });
  it('ignores files outside src/ and other extensions', () => {
    expect(run('check-app-css.mjs', edit(join(repoRoot, 'README.md'))).status).toBe(0);
    expect(run('check-app-css.mjs', edit(join(repoRoot, 'harness', 'x.css'))).status).toBe(0);
  });
  it('fails closed on an unparseable payload', () => {
    expect(run('check-app-css.mjs', 'not json').status).toBe(2);
  });
  it('judges a stylesheet outside src/app with its own stem', () => {
    writeFileSync(outsideCss, '.zz-css-probe-theme { color: red; }\n');
    const r = run('check-app-css.mjs', edit(outsideCss));
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('color');
  });
  it('checks an upper-case .CSS extension', () => {
    probe('');
    const upper = join(probeDir, 'zz-css-probe-upper.CSS');
    writeFileSync(upper, '.zz-css-probe-upper__x { @apply text-sm; }\n');
    const r = run('check-app-css.mjs', edit(upper));
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('text-sm');
  });
  it('fails closed on a JSON null payload', () => {
    expect(run('check-app-css.mjs', 'null').status).toBe(2);
  });
  it('loads from a subfolder through an absolute path', () => {
    probe('.zz-css-probe__hint { @apply text-sm; }');
    expect(run('check-app-css.mjs', edit(css), probeDir).status).toBe(2);
  });
});

// Vitest runs test files in parallel, and other hook tests write their own
// zz-*-probe folders under src/app. The Bash hook sees those too, so "clean"
// means: nothing reported outside a probe folder.
const onlyProbes = (r) =>
  r.status === 0 || r.stderr.split('\n').filter((l) => /src\/app\//.test(l)).every((l) => /src\/app\/zz-[a-z]+-probe\//.test(l));

describe('check-src-after-bash', () => {
  it('reports nothing on a tree with no changes outside probe folders', () => {
    expect(onlyProbes(run('check-src-after-bash.mjs', bash))).toBe(true);
  });
  it('blocks an untracked violating stylesheet written by a shell command', () => {
    probe('.zz-css-probe__hint { @apply rounded-md; }');
    const r = run('check-src-after-bash.mjs', bash);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('zz-css-probe.css');
    expect(r.stderr).toContain('rounded-md');
  });
  it('also runs the phase 2 rule: block-root padding on a primitive passes R7a but not the primitive rule', () => {
    probe('.zz-css-probe { @apply p-4; }', '<button hlmBtn class="zz-css-probe">Go</button>\n');
    expect(run('check-app-css.mjs', edit(css)).status).toBe(0);
    const r = run('check-src-after-bash.mjs', bash);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('p-4');
  });
  it('fails closed on an unparseable payload', () => {
    expect(run('check-src-after-bash.mjs', 'not json').status).toBe(2);
  });
  it('skips a deleted tracked file without crashing', () => {
    const tracked = join(repoRoot, 'src', 'app', 'heroes', 'heroes.css');
    const backup = existsSync(tracked) ? readFileSync(tracked, 'utf8') : null;
    rmSync(tracked, { force: true });
    try {
      const r = run('check-src-after-bash.mjs', bash);
      expect(r.stderr).not.toContain('failing closed');
      expect(onlyProbes(r)).toBe(true);
    } finally {
      if (backup !== null) writeFileSync(tracked, backup);
    }
  });
});
