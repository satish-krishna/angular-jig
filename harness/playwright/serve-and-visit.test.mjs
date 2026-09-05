import { test, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
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

test('spaFallback=false returns 404 for unknown path', async () => {
  const off = await serveStatic(fixtures, { spaFallback: false });
  try {
    const res = await fetch(`${off.origin}/detail/11`);
    expect(res.status).toBe(404);
  } finally { await off.close(); }
});

test('spaFallback=true returns index.html for unknown path', async () => {
  const tmpDir = join(tmpdir(), `serve-test-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });
  await writeFile(join(tmpDir, 'index.html'), '<html>test index</html>');
  const srv = await serveStatic(tmpDir, { spaFallback: true });
  try {
    const res = await fetch(`${srv.origin}/detail/11`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('test index');
  } finally {
    await srv.close();
    await rm(tmpDir, { recursive: true, force: true });
  }
});


test('visitBreakpoint sets the viewport width', async () => {
  const srv = await serveStatic(fixtures, { spaFallback: false });
  const browser = await launchChromium();
  try {
    const { page, context } = await visitBreakpoint(browser, `${srv.origin}/clean.html`, 375);
    try {
      const w = await page.evaluate(() => window.innerWidth);
      expect(w).toBe(375);
    } finally { await context.close(); }
  } finally { await browser.close(); await srv.close(); }
}, 60000);
