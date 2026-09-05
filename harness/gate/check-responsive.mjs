import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveStatic, launchChromium, visitBreakpoint } from '../playwright/serve-and-visit.mjs';
import { formatCorrectiveMessage } from './responsive-guidance.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');
const DIST = join(ROOT, 'dist', 'angular-jig', 'browser');

// Independent in-page check. Distinct code from the auditor's inPageMeasure.
function pageCheck(tol) {
  const vw = window.innerWidth;
  const fails = [];
  const sel = (el) => {
    if (el.id) return el.tagName.toLowerCase() + '#' + el.id;
    const c = (el.getAttribute && el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean)[0];
    return el.tagName.toLowerCase() + (c ? '.' + c : '');
  };
  const scrollAncestor = (el, root) => {
    let e = el.parentElement;
    while (e && e !== root.parentElement) {
      const o = getComputedStyle(e).overflowX;
      if (o === 'auto' || o === 'scroll') return true;
      e = e.parentElement;
    }
    return false;
  };
  if (document.documentElement.scrollWidth - vw > tol) {
    fails.push({ kind: 'viewport-escape', selector: 'html', detail: 'page scrolls horizontally' });
  }
  const root = document.querySelector('app-hero-detail') || document.body;
  for (const el of root.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    const cs = getComputedStyle(el);
    if ((r.right - vw > tol || r.left < -tol) && !scrollAncestor(el, root)) {
      fails.push({ kind: 'element-escape', selector: sel(el), detail: 'right ' + Math.round(r.right) + ' vs ' + vw });
    }
    const hidX = (cs.overflowX === 'hidden' || cs.overflowX === 'clip') && el.scrollWidth - el.clientWidth > tol;
    const hidY = (cs.overflowY === 'hidden' || cs.overflowY === 'clip') && el.scrollHeight - el.clientHeight > tol;
    if (hidX || hidY) fails.push({ kind: 'element-clip', selector: sel(el), detail: 'clipped' });
  }
  return fails;
}

export async function assertResponsive({ origin, route, breakpoints = [375, 768, 1280], tolerancePx = 1, browser: given }) {
  const browser = given ?? (await launchChromium());
  const failures = [];
  try {
    for (const bp of breakpoints) {
      const { page, context } = await visitBreakpoint(browser, `${origin}/${route}`, bp);
      const fails = await page.evaluate(pageCheck, tolerancePx);
      for (const f of fails) failures.push({ breakpoint: bp, ...f });
      await context.close();
    }
  } finally {
    if (!given) await browser.close();
  }
  return { failures };
}

async function cli() {
  execFileSync('npx', ['ng', 'build'], { cwd: ROOT, stdio: 'inherit' });
  const srv = await serveStatic(DIST, { spaFallback: true });
  try {
    const { failures } = await assertResponsive({ origin: srv.origin, route: 'detail/11' });
    if (failures.length) {
      process.stderr.write(formatCorrectiveMessage(failures) + '\n');
      process.exit(1);
    }
    process.stdout.write('responsive check passed at 375, 768, 1280\n');
  } finally {
    await srv.close();
  }
}

if (process.argv[1]?.endsWith('check-responsive.mjs')) {
  cli().catch((e) => { console.error(e); process.exit(1); });
}
