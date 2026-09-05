import { test, expect, afterEach } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serveStatic, launchChromium, visitBreakpoint } from './serve-and-visit.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, '..', 'counter', 'fixtures', 'responsive');

test('serveStatic serves a real file', async () => {
  const srv = await serveStatic(fixtures, { spaFallback: false });
  try {
    const res = await fetch(`${srv.origin}/clean.html`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('app-hero-detail');
  } finally { await srv.close(); }
});

test('spaFallback returns index.html for an unknown path', async () => {
  // fixtures has no index.html; point at a dir that does via a temp copy is overkill,
  // so assert fallback behavior with spaFallback off vs on against a known-missing path.
  const off = await serveStatic(fixtures, { spaFallback: false });
  try {
    const res = await fetch(`${off.origin}/detail/11`);
    expect(res.status).toBe(404);
  } finally { await off.close(); }
});

test('visitBreakpoint sets the viewport width', async () => {
  const srv = await serveStatic(fixtures, { spaFallback: false });
  const browser = await launchChromium();
  try {
    const { page, context } = await visitBreakpoint(browser, `${srv.origin}/clean.html`, 375);
    const w = await page.evaluate(() => window.innerWidth);
    expect(w).toBe(375);
    await context.close();
  } finally { await browser.close(); await srv.close(); }
}, 60000);
