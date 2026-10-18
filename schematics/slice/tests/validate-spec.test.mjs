import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SLICE_DIR, readFixture } from './run.mjs';

const SCRIPT = join(SLICE_DIR, 'validate-spec.cjs');
const run = (...args) => spawnSync('node', [SCRIPT, ...args], { encoding: 'utf8' });
const tmpSpec = (text) => {
  const file = join(mkdtempSync(join(tmpdir(), 'validate-spec-')), 'spec.json');
  writeFileSync(file, text);
  return file;
};

describe('validate-spec: the check an agent runs on a spec before asking for approval', () => {
  it('passes a valid spec and says so', () => {
    const r = run(join(SLICE_DIR, 'fixtures', 'book.json'));
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/book\.json is valid/);
  });

  it('fails an invalid spec and prints every problem, by path', () => {
    const data = JSON.parse(readFixture('book'));
    data.fields[0].label = '';
    delete data.plural;
    const r = run(tmpSpec(JSON.stringify(data)));
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/fields\.0\.label/);
    expect(r.stderr).toMatch(/plural/);
  });

  it('fails clearly on invalid JSON and on a missing file', () => {
    expect(run(tmpSpec('{ nope')).stderr).toMatch(/not valid JSON/);
    expect(run(tmpSpec('{ nope')).status).toBe(1);
    const missing = run(join(tmpdir(), 'no-such-spec.json'));
    expect(missing.status).toBe(1);
    expect(missing.stderr).toMatch(/not found/);
  });

  it('names its usage when given no file', () => {
    const r = run();
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/npm run validate:spec -- specs\/<entity>\.json/);
  });
});
