#!/usr/bin/env node
// Proves the schematic's output arrives green. On a throwaway basis it generates the three
// fixtures into this worktree's own src/app with the real Angular CLI, compares every file to the
// golden exemplars, then runs the build, lint, stylelint, the unit tests and the five structural
// counters, the series 3 gate hook on every generated stylesheet and template, a boot check
// of the generated routes, the routing gate's shell check. It always restores src/app afterwards (git checkout + git clean on src/app only).
//
//   node schematics/verify-arrives-green.mjs [--counters-ref <git ref>]
//
// It refuses to start when src/app has uncommitted changes, because the restore step would
// destroy them.
//
// The counters are read from a git ref (default: HEAD, the committed harness/counter) into a temporary
// folder inside the worktree, so Node resolves their packages from node_modules and a substrate that
// strips harness/ can still name a ref that has them; the folder is deleted again at the end. They
// judge only the files the generator wrote: this script proves the generator's output, not the app
// around it, and a hand-written app that predates a rule would otherwise fail it.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = ['book', 'member', 'loan']; // referenced entities first; these have golden exemplars
// Novel specs with no golden file. They exist to prove that output for specs nobody has seen before
// type-checks, not just that it parses: optional fields of every type, an entity-only spec, a boolean
// filter, an enum filter, single and many refs, numbers without bounds, dates.
const NOVEL = ['gadget', 'ticket', 'shipment', 'status-note'];
const COUNTERS = [
  ['seal', 'counter.mjs'],
  ['component-shape', 'component-shape-counter.mjs'],
  ['freeloader', 'freeloader-counter.mjs'],
  ['layout', 'layout-counter.mjs'],
  ['bem', 'bem-counter.mjs'],
];
const tmp = join(root, '.verify-tmp');
const args = process.argv.slice(2);
const refIndex = args.indexOf('--counters-ref');
const countersRef = refIndex >= 0 ? args[refIndex + 1] : 'HEAD';

const NL = String.fromCharCode(10);
const stripAnsi = (s) => s.replace(/\u001b\[[0-9;]*m/g, '');
const run = (command, argv, options = {}) => {
  const r = spawnSync(command, argv, { cwd: root, encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 64 * 1024 * 1024, ...options });
  return { status: r.status ?? 1, out: stripAnsi(`${r.stdout ?? ''}${r.stderr ?? ''}`) };
};

const results = [];
const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `: ${detail}` : ''}`);
};

const dirty = run('git', ['status', '--porcelain', '--', 'src/app']).out.trim();
if (dirty) {
  console.error(`Refusing to run: src/app has uncommitted changes that the restore step would destroy:\n${dirty}`);
  process.exit(2);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const hadDist = existsSync(join(root, 'dist'));
let exitCode = 0;
try {
  // 1. Generate with the real CLI.
  let generated = 0;
  const touched = new Set(); // every file the generation created or updated
  const collect = (out) => {
    for (const m of out.matchAll(/^(?:CREATE|UPDATE) (\S+)/gm)) touched.add(m[1]);
  };
  for (const name of FIXTURES) {
    const r = run('npx', ['ng', 'generate', 'slice', '--spec', `schematics/slice/fixtures/${name}.json`, '--force']);
    collect(r.out);
    const created = (r.out.match(/^(CREATE|UPDATE) /gm) ?? []).length;
    generated += created;
    record(`ng generate slice --spec ${name}.json`, r.status === 0 && created > 0 && !/WARNING/.test(r.out), `${created} files written`);
    if (r.status !== 0) throw new Error(r.out);
  }

  for (const name of NOVEL) {
    const r = run('npx', ['ng', 'generate', 'slice', '--spec', `schematics/slice/fixtures/novel/${name}.json`, '--force']);
    collect(r.out);
    const created = (r.out.match(/^(CREATE|UPDATE) /gm) ?? []).length;
    record(`ng generate slice --spec novel/${name}.json`, r.status === 0 && created > 0 && !/WARNING/.test(r.out), `${created} files written`);
    if (r.status !== 0) throw new Error(r.out);
  }

  // Reruns (Decision G2): over unchanged output a rerun succeeds and writes nothing; over a file a
  // person changed it refuses without --force; --force puts the generator's bytes back.
  const unchanged = run('npx', ['ng', 'generate', 'slice', '--spec', 'schematics/slice/fixtures/book.json']);
  record('rerun over unchanged output writes nothing', unchanged.status === 0 && !/^(CREATE|UPDATE) /m.test(unchanged.out), `exit ${unchanged.status}`);
  const edited = join(root, 'src', 'app', 'book', 'book.model.ts');
  const original = readFileSync(edited, 'utf8');
  writeFileSync(edited, `${original}// edited by hand${NL}`);
  const refused = run('npx', ['ng', 'generate', 'slice', '--spec', 'schematics/slice/fixtures/book.json']);
  record('rerun over a changed file refuses without --force', refused.status !== 0 && /already exists/.test(refused.out), `exit ${refused.status}`);
  const forced = run('npx', ['ng', 'generate', 'slice', '--spec', 'schematics/slice/fixtures/book.json', '--force']);
  record('rerun with --force restores the generator output', forced.status === 0 && readFileSync(edited, 'utf8') === original, `exit ${forced.status}`);
  collect(forced.out);

  // 2. What the CLI wrote is what the golden exemplars say it should write, byte for byte.
  let compared = 0;
  const mismatched = [];
  for (const name of FIXTURES) {
    const goldenRoot = join(root, 'schematics', 'slice', 'golden', name);
    for (const file of walk(goldenRoot)) {
      const rel = relative(goldenRoot, file).replace(/\\/g, '/');
      if (rel === 'src/app/app.routes.ts') continue; // accumulates across fixtures, checked below
      compared++;
      if (readFileSync(file, 'utf8') !== readFileSync(join(root, rel), 'utf8')) mismatched.push(rel);
    }
  }
  const routes = readFileSync(join(root, 'src/app/app.routes.ts'), 'utf8');
  const routesOk = ["path: 'books'", "path: 'members'", "path: 'loans'"].every((p) => routes.includes(p));
  record('CLI output equals the golden exemplars', mismatched.length === 0 && routesOk, `${compared} files compared${mismatched.length ? `, differing: ${mismatched.join(', ')}` : ''}; routes added: ${routesOk}`);

  // 3. The gates.
  // A real type check of the application and of the specs, which transpile-only checks never do.
  for (const project of ['tsconfig.app.json', 'tsconfig.spec.json']) {
    const tsc = run('npx', ['tsc', '-p', project, '--noEmit']);
    record(`tsc -p ${project} --noEmit`, tsc.status === 0, tsc.status === 0 ? '0 errors' : tsc.out.split('\n').slice(0, 30).join('\n'));
  }

  const build = run('npm', ['run', 'build']);
  const bundle = /Application bundle generation complete/.test(build.out);
  record('npm run build', build.status === 0 && bundle, bundle ? 'bundle generated' : build.out.split('\n').slice(-15).join('\n'));

  const lint = run('npm', ['run', 'lint']);
  record('npm run lint', lint.status === 0, lint.status === 0 ? '0 problems' : lint.out.split('\n').slice(-30).join('\n'));

  const style = run('npx', ['stylelint', 'src/**/*.css']);
  record('stylelint src/**/*.css', style.status === 0, style.status === 0 ? '0 problems' : style.out.split('\n').slice(-20).join('\n'));

  const test = run('npx', ['ng', 'test', '--watch=false']);
  const files = /Test Files\s+(?:(\d+) failed \| )?(\d+) passed \((\d+)\)/.exec(test.out);
  const tests = /Tests\s+(?:(\d+) failed \| )?(\d+) passed \((\d+)\)/.exec(test.out);
  record(
    'ng test --watch=false',
    test.status === 0 && !!tests && !tests[1],
    tests ? `${tests[2]} of ${tests[3]} tests passed in ${files ? files[2] : '?'} files` : test.out.split('\n').slice(-20).join('\n'),
  );

  // 3b. Boot the generated manage routes in a real browser (check-boot builds the development configuration itself).
  const boot = run('node', ['harness/gate/check-boot.mjs', '--route', 'books', '--route', 'members', '--route', 'loans']);
  record('boot check: books, members, loans render with no runtime errors', boot.status === 0 && /boot check passed/.test(boot.out), boot.status === 0 ? '3 routes' : boot.out.split(NL).filter((l) => l.trim()).slice(-25).join(NL));

  // 4. The counters, read from a git ref and run against the files the generation wrote.
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const archive = spawnSync('git', ['archive', '--format=tar', '-o', join(tmp, 'counters.tar'), countersRef, 'harness/counter'], { cwd: root, encoding: 'utf8' });
  if (archive.status !== 0) throw new Error(`Could not read harness/counter from git ref "${countersRef}": ${archive.stderr}`);
  const tar = spawnSync('tar', ['-xf', 'counters.tar'], { cwd: tmp, encoding: 'utf8' });
  if (tar.status !== 0) throw new Error(`Could not extract the counters: ${tar.stderr}`);
  const generated = [...touched].filter((f) => f.startsWith('src/') && existsSync(join(root, f))).map((f) => join(root, f));
  for (const [label, script] of COUNTERS) {
    const r = spawnSync('node', [join('harness', 'counter', script), '--root', root, ...generated], { cwd: tmp, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    let totals = null;
    try {
      const json = JSON.parse(r.stdout);
      // bem-counter prints { bem: { totals }, expanded: { seal, layout } }; the others print { totals }.
      totals = label === 'bem' ? json.bem.totals : json.totals;
    } catch {
      /* reported below */
    }
    record(`counter ${label}`, r.status === 0 && totals?.all === 0, totals ? `all = ${totals.all}` : stripAnsi(r.stderr).slice(0, 300));
  }

  // 5. The series 3 gate hook on every stylesheet and template the generation wrote.
  const gated = [...touched].filter((f) => /\.(css|html)$/i.test(f) && f.startsWith('src/app/') && existsSync(join(root, f))).sort();
  let gatePass = 0;
  for (const rel of gated) {
    const payload = JSON.stringify({ tool_name: 'Write', tool_input: { file_path: join(root, rel) } });
    const r = spawnSync('node', [join('.claude', 'hooks', 'check-app-css.mjs')], { cwd: root, input: payload, encoding: 'utf8' });
    const ok = r.status === 0;
    if (ok) gatePass++;
    record(`gate hook check-app-css ${rel}`, ok, ok ? '' : stripAnsi(`${r.stdout ?? ''}${r.stderr ?? ''}`).slice(0, 600));
  }
  record('gate hook checked every generated css and html file', gated.length > 0 && gatePass === gated.length, `${gatePass} of ${gated.length} files`);

  // 6. The routing gate's shell check: every generator-owned TypeScript file the CLI wrote starts with the header.
  const routed = spawnSync('node', [join('.claude', 'hooks', 'route-to-generator.mjs')], {
    cwd: root,
    input: JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'ls' } }),
    encoding: 'utf8',
  });
  record('gate hook route-to-generator finds no headerless generator-owned file', routed.status === 0, stripAnsi(`${routed.stdout ?? ''}${routed.stderr ?? ''}`).slice(0, 600));
} catch (error) {
  record('verification could not complete', false, String(error.message ?? error).split('\n').slice(0, 20).join('\n'));
} finally {
  // 7. Restore. Always.
  rmSync(tmp, { recursive: true, force: true });
  run('git', ['checkout', '--', 'src/app']);
  run('git', ['clean', '-fdq', '--', 'src/app']);
  if (!hadDist) rmSync(join(root, 'dist'), { recursive: true, force: true });
  const left = run('git', ['status', '--porcelain', '--', 'src/app']).out.trim();
  record('src/app restored to the committed state', left === '', left);
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${failed.length === 0 ? 'ARRIVES GREEN' : `NOT GREEN: ${failed.length} failing`} (${results.length} checks)`);
exitCode = failed.length === 0 ? 0 : 1;
process.exit(exitCode);
