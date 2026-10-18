import { describe, it, expect, afterAll } from 'vitest';
import { ESLint } from 'eslint';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// `npm run lint` must cite every ESLint-hosted rule a Write/Edit hook cites, or
// a human in an editor sees less than an agent does. Each case plants one
// violation in a scratch tree (never in src/) and lints it with the REAL config.
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const configFile = join(repoRoot, 'eslint.config.mjs');
const scratch = mkdtempSync(join(here, '.zz-lint-hooks-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

async function ruleIdsFor(name, html, css) {
  const dir = join(scratch, name);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${name}.html`);
  writeFileSync(file, html);
  if (css !== undefined) writeFileSync(join(dir, `${name}.css`), `@reference "../../styles.css";\n${css}\n`);
  const eslint = new ESLint({ cwd: scratch, overrideConfigFile: configFile });
  const results = await eslint.lintFiles([file]);
  return results.flatMap((r) => r.messages.map((m) => m.ruleId));
}

describe('eslint.config.mjs enforces every rule the hooks enforce', () => {
  it('layout/no-raw-palette-color', async () => {
    expect(await ruleIdsFor('palette', '<div class="grid bg-blue-500"></div>\n')).toContain('layout/no-raw-palette-color');
  });
  it('layout/no-space-utility', async () => {
    expect(await ruleIdsFor('space', '<div class="space-y-4"></div>\n')).toContain('layout/no-space-utility');
  });
  it('layout/no-nested-flex-grid', async () => {
    const html = '<div class="flex justify-between"><div class="flex flex-col gap-1"><span>a</span></div><div class="flex flex-col gap-1"><span>b</span></div></div>';
    expect(await ruleIdsFor('nested', html)).toContain('layout/no-nested-flex-grid');
  });
  it('freeloader/no-legacy-control-flow', async () => {
    expect(await ruleIdsFor('legacy', '<p *ngIf="ok">x</p>\n')).toContain('freeloader/no-legacy-control-flow');
  });
  it('freeloader/no-ng-class-style', async () => {
    expect(await ruleIdsFor('ngclass', '<p [ngClass]="c">x</p>\n')).toContain('freeloader/no-ng-class-style');
  });
  it('applied/no-applied-appearance-on-primitive', async () => {
    const ids = await ruleIdsFor('applied', '<button hlmBtn class="applied__go">Go</button>\n', '.applied__go { @apply ps-9; }');
    expect(ids).toContain('applied/no-applied-appearance-on-primitive');
  });
  it('a clean template raises none of them', async () => {
    const ids = await ruleIdsFor('clean', '<section class="clean"><p class="clean__hint">x</p></section>\n');
    expect(ids.filter((id) => /^(layout|freeloader|applied)\//.test(id ?? ''))).toEqual([]);
  });
});
