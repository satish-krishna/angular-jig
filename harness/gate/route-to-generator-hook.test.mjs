import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { GENERATED_MARKER, PLACEHOLDER_MARKER, ownerOf } from '../../.claude/hooks/route-to-generator.mjs';

const require = createRequire(import.meta.url);
const naming = require('../../schematics/slice/lib/naming.cjs');
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const HOOK = join(repoRoot, '.claude', 'hooks', 'route-to-generator.mjs');
const probeDir = join(repoRoot, 'src', 'app', 'zz-r2g-probe');
const probeForm = join(repoRoot, 'src', 'app', 'ui', 'zz-r2g-probe-form');
const specsDir = join(repoRoot, 'specs');
const probeSpec = join(specsDir, 'zz-r2g-probe.json');
const heroSpec = join(specsDir, 'hero.json');
const hadSpecsDir = existsSync(specsDir);
const hadHeroSpec = existsSync(heroSpec);
const withSpec = (file) => {
  mkdirSync(specsDir, { recursive: true });
  writeFileSync(file, '{}\n');
};
const hookLog = join(repoRoot, 'harness', 'gate', '.zz-r2g-firings.jsonl');

const run = (payload) =>
  spawnSync('node', [HOOK], {
    cwd: repoRoot,
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    env: { ...process.env, HOOK_LOG: hookLog },
    encoding: 'utf8',
  });
const write = (file_path) => ({ tool_name: 'Write', tool_input: { file_path, content: 'x' } });
const bash = { tool_name: 'Bash', tool_input: { command: 'ls' } };
const clean = () => {
  rmSync(probeDir, { recursive: true, force: true });
  rmSync(probeForm, { recursive: true, force: true });
  rmSync(probeSpec, { force: true });
  if (!hadHeroSpec) rmSync(heroSpec, { force: true });
  if (!hadSpecsDir) rmSync(specsDir, { recursive: true, force: true });
};

beforeEach(clean);
afterAll(() => {
  clean();
  rmSync(hookLog, { force: true });
});

describe('route-to-generator, the markers', { timeout: 30000 }, () => {
  it('uses the same markers the generator emits', () => {
    expect(GENERATED_MARKER).toBe(naming.GENERATED_MARKER);
    expect(PLACEHOLDER_MARKER).toBe(naming.PLACEHOLDER_MARKER);
    expect(naming.GENERATED_HEADER).toContain(GENERATED_MARKER);
  });

  it('knows which paths the generator owns', () => {
    expect(ownerOf('src/app/hero/hero.model.ts')).toEqual({ kind: 'entity', entity: 'hero' });
    expect(ownerOf('src/app/domain/hero.schema.ts')).toEqual({ kind: 'entity', entity: 'hero' });
    expect(ownerOf('src/app/hero/hero-example-data.ts')).toEqual({ kind: 'entity', entity: 'hero' });
    expect(ownerOf('src/app/ui/status-note-form/status-note-form.html')).toEqual({ kind: 'form', entity: 'status-note' });
    expect(ownerOf('src/app/heroes/heroes.view-model.ts')).toBeNull();
    expect(ownerOf('src/app/forms/zod-meta.ts')).toBeNull();
    expect(ownerOf('harness/x.model.ts')).toBeNull();
  });

  it('does not own services (ruling R1: the shell stage may hand-write theme.service.ts)', () => {
    for (const f of ['src/app/theme/theme.service.ts', 'src/app/hero/hero.service.ts', 'src/app/hero/hero.service.spec.ts']) {
      expect(ownerOf(f), f).toBeNull();
    }
  });
});

describe('route-to-generator, PreToolUse Write', { timeout: 30000 }, () => {
  it('denies creating a generator-owned entity file, naming the spec and the command', () => {
    withSpec(probeSpec);
    const r = run(write(join(probeDir, 'zz-r2g-probe.model.ts')));
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('npx ng g slice --spec specs/zz-r2g-probe.json --kinds entity');
  });

  it('denies every generator-owned entity name', () => {
    withSpec(probeSpec);
    for (const f of ['zz-r2g-probe.schema.ts', 'zz-r2g-probe-example-data.ts']) {
      expect(run(write(join(probeDir, f))).status, f).toBe(2);
    }
  });

  it('allows hand-written services and their specs (ruling R1)', () => {
    for (const f of ['zz-r2g-probe.service.ts', 'zz-r2g-probe.service.spec.ts']) {
      expect(run(write(join(probeDir, f))).status, f).toBe(0);
    }
    expect(run(write(join(repoRoot, 'src', 'app', 'theme', 'theme.service.ts'))).status).toBe(0);
    expect(run(write(join(repoRoot, 'src', 'app', 'hero', 'hero.service.ts'))).status).toBe(0);
  });

  it('denies creating anything under ui/<name>-form/ as the form kind', () => {
    withSpec(probeSpec);
    const r = run(write(join(probeForm, 'zz-r2g-probe-form.html')));
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('--kinds form');
  });

  it('denies a Windows path with backslashes and a lower-case drive letter', () => {
    withSpec(probeSpec);
    const p = join(probeDir, 'zz-r2g-probe.model.ts').replaceAll('/', '\\').replace(/^([A-Z]):/, (_m, d) => `${d.toLowerCase()}:`);
    expect(run(write(p)).status).toBe(2);
  });

  it('allows a Write over an existing generator-owned file (the spec denies creation, not rewrites)', () => {
    mkdirSync(probeDir, { recursive: true });
    writeFileSync(join(probeDir, 'zz-r2g-probe.model.ts'), `// ${GENERATED_MARKER} from its spec.\nexport interface Probe {}\n`);
    expect(run(write(join(probeDir, 'zz-r2g-probe.model.ts'))).status).toBe(0);
  });

  it('allows files the generator does not own, and anything outside src/', () => {
    expect(run(write(join(probeDir, 'zz-r2g-probe.view-model.ts'))).status).toBe(0);
    expect(run(write(join(repoRoot, 'harness', 'zz-r2g-probe.model.ts'))).status).toBe(0);
  });

  it('denies a Write over a file carrying the placeholder marker, quoting its marker line', () => {
    mkdirSync(probeDir, { recursive: true });
    writeFileSync(join(probeDir, 'zz-r2g-probe.ts'), `// ${PLACEHOLDER_MARKER}. Replaced by: npx ng g slice --spec specs/zz.json --kinds manage\nexport class P {}\n`);
    const r = run(write(join(probeDir, 'zz-r2g-probe.ts')));
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('npx ng g slice --spec specs/zz.json --kinds manage');
  });

  it('ignores Edit: filling a generated file is the other gates\' business', () => {
    expect(run({ tool_name: 'Edit', tool_input: { file_path: join(probeDir, 'zz-r2g-probe.model.ts') } }).status).toBe(0);
  });

  it('fails closed on an unparseable payload', () => {
    expect(run('not json').status).toBe(2);
  });
});

describe('route-to-generator, ownership needs a spec (ruling R4)', { timeout: 30000 }, () => {
  it('allows hand-written files of entities without a spec', () => {
    for (const f of ['src/app/recruit/recruit.schema.ts', 'src/app/domain/mission.model.ts', 'src/app/ui/recruit-form/recruit-form.ts']) {
      expect(run(write(join(repoRoot, f))).status, f).toBe(0);
    }
  });

  it('still denies the entity of an existing spec under any folder', () => {
    withSpec(heroSpec);
    for (const f of ['src/app/zz-r2g-probe/hero.model.ts', 'src/app/domain/hero.model.ts', 'src/app/ui/hero-form/zz-probe.ts']) {
      const r = run(write(join(repoRoot, f)));
      expect(r.status, f).toBe(2);
      expect(r.stderr, f).toContain('specs/hero.json');
    }
  });

  it('the shell check ignores a headerless model of an entity without a spec', () => {
    mkdirSync(probeDir, { recursive: true });
    mkdirSync(probeForm, { recursive: true });
    writeFileSync(join(probeDir, 'zz-r2g-probe.model.ts'), 'export interface Probe {}\n');
    writeFileSync(join(probeForm, 'zz-r2g-probe-form.ts'), 'export class F {}\n');
    expect(run(bash).status).toBe(0);
  });
});

describe('route-to-generator, PostToolUse Bash', { timeout: 30000 }, () => {
  it('passes a clean tree', () => {
    expect(run(bash).status).toBe(0);
  });

  it('reports a generator-owned TypeScript file without the header, naming the command', () => {
    withSpec(probeSpec);
    mkdirSync(probeDir, { recursive: true });
    writeFileSync(join(probeDir, 'zz-r2g-probe.model.ts'), 'export interface Probe {}\n');
    const r = run(bash);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('src/app/zz-r2g-probe/zz-r2g-probe.model.ts');
    expect(r.stderr).toContain('npx ng g slice --spec specs/zz-r2g-probe.json --kinds entity');
  });

  it('passes a generator-owned file that starts with the header, and ignores non-owned and non-TypeScript files', () => {
    mkdirSync(probeDir, { recursive: true });
    mkdirSync(probeForm, { recursive: true });
    writeFileSync(join(probeDir, 'zz-r2g-probe.model.ts'), `${naming.GENERATED_HEADER}\nexport interface Probe {}\n`);
    writeFileSync(join(probeDir, 'zz-r2g-probe.ts'), 'export class P {}\n');
    writeFileSync(join(probeForm, 'zz-r2g-probe-form.html'), '<form class="zz-r2g-probe-form"></form>\n');
    expect(run(bash).status).toBe(0);
  });

  it('ignores a headerless hand-written service (ruling R1)', () => {
    mkdirSync(probeDir, { recursive: true });
    writeFileSync(join(probeDir, 'zz-r2g-probe.service.ts'), 'export class S {}\n');
    writeFileSync(join(probeDir, 'zz-r2g-probe.service.spec.ts'), 'export {};\n');
    expect(run(bash).status).toBe(0);
  });
});
