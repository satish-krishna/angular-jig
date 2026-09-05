import { test, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serveStatic } from '../playwright/serve-and-visit.mjs';
import { auditServed } from './responsive-auditor.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, 'fixtures', 'responsive');

async function auditFixture(file) {
  const srv = await serveStatic(fixtures, { spaFallback: false });
  try {
    return await auditServed({ origin: srv.origin, route: file, breakpoints: [375] });
  } finally { await srv.close(); }
}

test('clean fixture: no violations', async () => {
  const t = await auditFixture('clean.html');
  expect(t.totals.all).toBe(0);
}, 60000);

test('viewport-escape fixture flags the page scroll', async () => {
  const t = await auditFixture('viewport-escape.html');
  expect(t.totals['viewport-escape']).toBeGreaterThanOrEqual(1);
}, 60000);

test('element-escape fixture flags the escaping element', async () => {
  const t = await auditFixture('element-escape.html');
  expect(t.totals['element-escape']).toBeGreaterThanOrEqual(1);
}, 60000);

test('element-clip fixture flags the clipped element', async () => {
  const t = await auditFixture('element-clip.html');
  expect(t.totals['element-clip']).toBeGreaterThanOrEqual(1);
}, 60000);

test('scroll-exempt fixture is NOT flagged', async () => {
  const t = await auditFixture('scroll-exempt.html');
  expect(t.totals['element-escape']).toBe(0);
  expect(t.totals['element-clip']).toBe(0);
}, 60000);

test('determinism: two audits of the same fixture are byte-identical', async () => {
  const a = await auditFixture('element-escape.html');
  const b = await auditFixture('element-escape.html');
  expect(JSON.stringify(a)).toBe(JSON.stringify(b));
}, 60000);
