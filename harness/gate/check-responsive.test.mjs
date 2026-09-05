import { test, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serveStatic } from '../playwright/serve-and-visit.mjs';
import { assertResponsive } from './check-responsive.mjs';
import { formatCorrectiveMessage } from './responsive-guidance.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, '..', 'counter', 'fixtures', 'responsive');

async function check(file) {
  const srv = await serveStatic(fixtures, { spaFallback: false });
  try { return await assertResponsive({ origin: srv.origin, route: file, breakpoints: [375] }); }
  finally { await srv.close(); }
}

test('clean fixture passes', async () => {
  const { failures } = await check('clean.html');
  expect(failures.length).toBe(0);
}, 60000);

test('viewport-escape fixture fails', async () => {
  const { failures } = await check('viewport-escape.html');
  expect(failures.length).toBeGreaterThanOrEqual(1);
}, 60000);

test('scroll-exempt fixture passes', async () => {
  const { failures } = await check('scroll-exempt.html');
  expect(failures.length).toBe(0);
}, 60000);

test('corrective message names the breakpoint and selector', async () => {
  const { failures } = await check('viewport-escape.html');
  const msg = formatCorrectiveMessage(failures);
  expect(msg).toContain('375px');
  expect(msg).toContain('npm run check:responsive');
}, 60000);
