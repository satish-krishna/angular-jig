import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The guard as the agent meets it: a PreToolUse payload on stdin, exit 2 to deny.
const hookLog = join(mkdtempSync(join(tmpdir(), 'protect-')), 'firings.jsonl');
const run = (tool_name, tool_input) =>
  spawnSync('node', ['.claude/hooks/protect-enforcement.mjs'], {
    input: JSON.stringify({ tool_name, tool_input }),
    env: { ...process.env, HOOK_LOG: hookLog },
    encoding: 'utf8',
  }).status;
const bash = (command) => run('Bash', { command });

describe('the guard lets reads of protected paths through', () => {
  // Each of these was denied in schematic-arm gate-on trial 1.
  it.each([
    'cd D:/Repos/angular-jig && cat prototype/capstone-build-spec.md && echo ---- && find src -type f | sort && echo ---- && cat package.json | head -60',
    'cd D:/Repos/angular-jig && ls .claude/skills/house-style && cat .claude/skills/house-style/SKILL.md | head -300',
    'ls .agents/skills/spartan/ .agents/skills/spartan/rules 2>&1 | head -40',
    'grep -n "route" harness/gate/check-responsive.mjs | head -30',
    'sed -n 1,80p tsconfig.json',
    'git diff -- package.json',
    'timeout 300 npm run check:boot 2>&1 | head -60',
    'ls .claude/skills/house-style 2>/dev/null',
    'cat harness\\gate\\index.mjs',
    'grep -o "spartan-ng/helm/[a-z]*" tsconfig.json | sort -u',
    'grep -E "a|b" harness/gate/index.mjs',
    "jq '.scripts | keys' package.json",
    'grep ">" harness/gate/index.mjs',
    'sed -n 1,40p package.json tsconfig.json',
  ])('%s', (command) => expect(bash(command)).toBe(0));

  it('lets PowerShell reads through', () => {
    expect(run('PowerShell', { command: 'Get-Content package.json | Select-String spartan' })).toBe(0);
    expect(run('PowerShell', { command: 'Get-ChildItem .claude/skills/house-style' })).toBe(0);
  });
});

describe('the guard still denies writes to protected paths', () => {
  it.each([
    "sed -i 's/a/b/' stylelint.config.mjs",
    'echo {} > tsconfig.json',
    'cat x >> package.json',
    'cp other.mjs eslint.config.mjs',
    'rm -rf harness/',
    'git checkout HEAD~1 -- .claude/hooks/',
    'find harness/ -name "*.mjs" -delete',
    'cat package.json | tee package.json',
    "sed -n 'w package.json' x",
    'cat $(echo package.json) && npm pkg set scripts.x=y package.json',
    'for f in harness/*.mjs; do cat $f; done',
    'node -e "1" package.json',
    'sort -o package.json package.json',
    'sort -uopackage.json package.json',
    "rg --pre 'sh -c x' . harness/",
    'git diff --output=tsconfig.json',
    'git grep -O"vi" x -- harness/',
    'uniq a package.json',
    // Found by review of the first cut of the allowlist.
    'cat package.json & sed -i s/a/b/ package.json',
    'echo {} >&2/../package.json',
    'sed -n 1p -i package.json',
    'find src -fprint0 package.json',
    'npm run lint -- --fix eslint.config.mjs',
    'npx vitest -u harness/',
    'cat "a" > package.json',
  ])('%s', (command) => expect(bash(command)).toBe(2));

  it.each([
    'npm run golden:update',
    'npm run verify:arrives-green',
    'npm run build:spec-schema',
    'cd D:/Repos/aj-s4 && npm run golden:update 2>&1 | tail -5',
  ])('denies the generator maintenance script: %s', (command) => {
    expect(bash(command)).toBe(2);
    expect(run('PowerShell', { command })).toBe(2);
  });

  it('still allows ordinary npm scripts and reading about the maintenance scripts', () => {
    expect(bash('npm run build')).toBe(0);
    expect(bash('npm run lint')).toBe(0);
    expect(bash('grep golden:update README.md')).toBe(0);
  });

  it('denies PowerShell that executes inside an argument', () => {
    expect(run('PowerShell', { command: 'echo (Set-Content package.json x)' })).toBe(2);
    expect(run('PowerShell', { command: 'Get-Content package.json; Set-Content package.json x' })).toBe(2);
  });

  it('denies the file tools on a protected path', () => {
    expect(run('Edit', { file_path: 'D:/Repos/angular-jig/harness/gate/index.mjs' })).toBe(2);
    expect(run('Write', { file_path: 'tsconfig.json' })).toBe(2);
  });
});

describe('the schematic is enforcement surface: read-only to the agent, but runnable', () => {
  it.each([
    "sed -i 's/a/b/' schematics/slice/lib/emit-form.cjs",
    'echo {} > schematics/collection.json',
    'cp other.json schematics/slice/fixtures/hero.json',
    'rm -rf schematics/',
    'git checkout HEAD~1 -- schematics/slice/spec-schema.cjs',
    'node schematics/verify-arrives-green.mjs',
  ])('denies a shell write: %s', (command) => expect(bash(command)).toBe(2));

  it('denies the file tools under schematics/', () => {
    expect(run('Write', { file_path: 'schematics/slice/lib/emit-form.cjs' })).toBe(2);
    expect(run('Edit', { file_path: 'D:/Repos/angular-jig/schematics/slice/spec-schema.cjs' })).toBe(2);
    expect(run('Write', { file_path: String.raw`schematics\slice\golden\hero\hero.model.ts` })).toBe(2);
  });

  it.each([
    'cat schematics/slice/spec.schema.json',
    'ls schematics/slice/fixtures',
    'grep -n lucide schematics/slice/lib/emit-manage.cjs',
  ])('allows reading: %s', (command) => expect(bash(command)).toBe(0));

  it.each([
    'ng generate slice --spec specs/hero.json',
    'npx ng generate slice --spec specs/hero.json --force',
    'ng g slice --spec specs/mission.json',
  ])('allows running the generator: %s', (command) => expect(bash(command)).toBe(0));

  it.each([
    'npm run validate:spec -- specs/hero.json',
    'npm run validate:spec -- specs/hero.json 2>&1 | tail -20',
    'cat schematics/slice/spec.schema.json && npm run validate:spec -- specs/hero.json',
  ])('allows validating a spec through the npm script: %s', (command) => {
    expect(bash(command)).toBe(0);
    expect(run('PowerShell', { command })).toBe(0);
  });

  it('still denies validating by running the parser inline (series 5 stage 0)', () => {
    expect(bash(`node -e "require('./schematics/slice/spec-schema.cjs')"`)).toBe(2);
  });

  it('still lets the agent write its own spec files', () => {
    expect(bash("echo '{}' > specs/hero.json")).toBe(0);
    expect(run('Write', { file_path: 'specs/hero.json' })).toBe(0);
  });
});

describe('prior trials stay unreadable', () => {
  it.each(['cat experiments/schematic-arm/x/meta.json', 'ls experiments/'])('%s', (command) => expect(bash(command)).toBe(2));
});

it('allows commands that touch no protected path', () => {
  expect(bash('npm install && echo ok > src/app/x.txt')).toBe(0);
});
