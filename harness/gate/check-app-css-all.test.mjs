import { describe, it, expect, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const cli = join(here, 'check-app-css-all.mjs');
// The fixture trees live under the repo so `tailwindcss` resolves from node_modules.
const made = [];

function tree(files) {
  const root = mkdtempSync(join(here, '.zz-app-css-all-'));
  made.push(root);
  const all = { 'src/styles.css': "@import 'tailwindcss/theme.css' layer(theme);\n@import 'tailwindcss/utilities.css';\n", ...files };
  for (const [rel, body] of Object.entries(all)) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), body);
  }
  return root;
}
const run = (root) => spawnSync('node', [cli, '--root', root], { encoding: 'utf8' });

afterAll(() => {
  for (const r of made) rmSync(r, { recursive: true, force: true });
});

const cleanHtml = '<section class="zz-demo"><p class="zz-demo__hint">x</p></section>\n';
const cleanCss = '@reference "../../styles.css";\n.zz-demo { @apply grid gap-4; }\n';

describe('check-app-css-all', () => {
  it('exits 0 on a clean tree', () => {
    const r = run(tree({ 'src/app/zz-demo/zz-demo.html': cleanHtml, 'src/app/zz-demo/zz-demo.css': cleanCss }));
    expect(r.status).toBe(0);
  });
  it('exits 1 and names the file when a stylesheet applies appearance', () => {
    const r = run(tree({ 'src/app/zz-demo/zz-demo.html': cleanHtml, 'src/app/zz-demo/zz-demo.css': '@reference "../../styles.css";\n.zz-demo__hint { @apply text-muted-foreground; }\n' }));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('src/app/zz-demo/zz-demo.css');
    expect(r.stderr).toContain('text-muted-foreground');
  });
  it('exits 1 and names the file when a template carries a Tailwind utility', () => {
    const r = run(tree({ 'src/app/zz-demo/zz-demo.html': '<section class="zz-demo flex"></section>\n', 'src/app/zz-demo/zz-demo.css': cleanCss }));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('src/app/zz-demo/zz-demo.html');
    expect(r.stderr).toContain('"flex"');
  });
});
