import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { appCssViolations } from './app-css.mjs';

const apply = (utils, opts = { stem: 'x' }, selector = '.x__y') => appCssViolations(`${selector} { @apply ${utils}; }`, opts);
const tokens = (v) => v.map((x) => x.token);

describe('appCssViolations: @apply', () => {
  it.each([
    ['display and box', 'block inline inline-block flex inline-flex grid inline-grid contents hidden sr-only not-sr-only box-border box-content'],
    ['flex and grid', 'flex-col flex-1 flex-wrap grow grow-0 shrink shrink-0 basis-1/2 order-2 grid-cols-3 grid-rows-2 col-span-2 row-span-2 auto-cols-fr auto-rows-min grid-flow-col items-center justify-between content-center self-start place-items-center gap-4 gap-x-2'],
    ['sizing', 'w-full h-10 size-4 min-w-0 min-h-screen max-w-md max-h-96 aspect-video w-[calc(100%-1rem)]'],
    ['margin', 'm-2 mx-auto my-4 mt-1 mr-1 mb-1 ml-1 ms-2 me-2'],
    ['position', 'static relative absolute fixed sticky inset-0 inset-x-2 top-0 right-0 bottom-0 left-1/2 start-0 end-0 z-10'],
    ['overflow and flow', 'overflow-hidden overflow-x-auto overscroll-contain truncate text-ellipsis text-clip whitespace-nowrap break-words text-left text-center text-right text-start text-end text-justify object-cover isolate container'],
  ])('%s passes', (_family, utils) => {
    expect(apply(utils)).toEqual([]);
  });

  it('variants, important markers, negatives and arbitrary variants are stripped before judging', () => {
    expect(apply('sm:grid-cols-2 !w-full w-full! -mt-2 supports-[display:grid]:grid [&:nth-child(2)]:mt-2 dark:hover:flex')).toEqual([]);
  });

  it.each([
    'text-sm', 'text-muted-foreground', 'font-semibold', 'bg-muted/50', 'rounded-md', 'shadow-sm', 'border-b', 'ring-1',
    'opacity-50', 'cursor-pointer', 'transition-colors', 'tabular-nums', '[color:red]', "content-['x']", 'hover:bg-accent',
    'zz-custom-thing', 'inset-shadow-sm', 'inset-ring-1', 'pointer-events-none', 'select-none',
  ])('%s is one violation', (utility) => {
    const v = apply(utility);
    expect(tokens(v)).toEqual([utility]);
    expect(v[0]).toMatchObject({ selector: '.x__y', line: 1 });
  });

  it('one violation per utility, and the same utility twice in one rule counts once', () => {
    expect(tokens(apply('flex py-8 text-sm'))).toEqual(['py-8', 'text-sm']);
    expect(tokens(apply('text-sm text-sm'))).toEqual(['text-sm']);
  });

  it('the !important flag is not a utility', () => {
    expect(apply('flex !important')).toEqual([]);
  });
});

describe('appCssViolations: plain declarations', () => {
  const decl = (body, opts = { stem: 'x' }) => appCssViolations(`.x__y { ${body} }`, opts);

  it('layout properties pass', () => {
    expect(decl('display: grid; grid-template-columns: 1fr 1fr; margin-inline: auto; gap: 1rem; z-index: 2; overflow-wrap: anywhere; align-items: center; aspect-ratio: 1; min-width: 0;')).toEqual([]);
  });

  it('appearance properties and custom properties fail', () => {
    expect(tokens(decl('color: var(--sidebar-primary); --w: 3px; display: flex;'))).toEqual(['color', '--w']);
  });

  it('padding is judged like the utilities', () => {
    expect(tokens(decl('padding: 1rem;'))).toEqual(['padding']);
    expect(appCssViolations('.x { padding-inline: 1rem; }', { stem: 'x' })).toEqual([]);
  });
});

describe('appCssViolations: nesting', () => {
  it('follows &:hover and @media nesting', () => {
    const css = '.x__y { @apply flex; &:hover { @apply text-sm; } @media (min-width: 640px) { @apply font-bold; } }';
    const v = appCssViolations(css, { stem: 'x' });
    expect(v.map((x) => [x.selector, x.token])).toEqual([
      ['.x__y:hover', 'text-sm'],
      ['.x__y', 'font-bold'],
    ]);
  });

  it('skips a Sass &__x rule, which styles nothing', () => {
    expect(appCssViolations('.x { &__y { @apply text-sm; color: red; } }', { stem: 'x' })).toEqual([]);
  });
});

describe('appCssViolations: block root (R7a)', () => {
  const pad = (selector, wrap = (s) => s) => appCssViolations(wrap(`${selector} { @apply p-6; }`), { stem: 'dashboard' });

  it.each(['.dashboard', '.dashboard--compact', ':host', '.dashboard, :host'])('p-6 passes on %s', (sel) => {
    expect(pad(sel)).toEqual([]);
  });

  it('p-6 passes on the block root inside @media', () => {
    expect(pad('.dashboard', (s) => `@media (min-width: 640px) { ${s} }`)).toEqual([]);
  });

  it.each(['.dashboard:hover', '.dashboard .x', '.dashboard__panel', '.other', '.dashboard, .other'])('p-6 fails on %s', (sel) => {
    expect(tokens(pad(sel))).toEqual(['p-6']);
  });

  it('a padding declaration follows the same rule', () => {
    expect(appCssViolations('.dashboard { padding: 1rem; }', { stem: 'dashboard' })).toEqual([]);
    expect(tokens(appCssViolations('.dashboard__panel { padding: 1rem; }', { stem: 'dashboard' }))).toEqual(['padding']);
  });

  it('the global stylesheet has no block root, :host included', () => {
    expect(tokens(appCssViolations(':host { @apply p-2; }', { stem: null, global: true }))).toEqual(['p-2']);
    expect(tokens(appCssViolations('.styles { @apply p-2; }', { stem: 'styles', global: true }))).toEqual(['p-2']);
  });

  it('with no stem only :host is a block root', () => {
    expect(appCssViolations(':host { @apply p-2; }', { stem: null })).toEqual([]);
    expect(tokens(appCssViolations('.x { @apply p-2; }', { stem: null }))).toEqual(['p-2']);
  });
});

describe('appCssViolations: global stylesheet', () => {
  const g = (css) => appCssViolations(css, { stem: null, global: true });
  const STYLES = process.env.APP_CSS_STYLES ?? 'D:/Repos/aj-s3/src/styles.css';

  it("the substrate's src/styles.css gives 0", (ctx) => {
    if (!existsSync(STYLES)) {
      console.warn(`skipped: ${STYLES} not found`);
      ctx.skip();
      return;
    }
    expect(g(readFileSync(STYLES, 'utf8'))).toEqual([]);
  });

  it('a class rule is judged like any app rule', () => {
    expect(tokens(g('.x { @apply text-sm; }'))).toEqual(['text-sm']);
  });

  it('@utility bodies are judged', () => {
    expect(tokens(g('@utility pad { padding: 1rem; }'))).toEqual(['padding']);
  });

  it('the theme is exempt', () => {
    expect(g(':root { color-scheme: light; --x: 1px; }')).toEqual([]);
    expect(g(':root.dark { color-scheme: dark; --x: 2px; }')).toEqual([]);
    expect(g('@theme inline { --color-x: var(--x); }')).toEqual([]);
    expect(g('@layer base { body { @apply bg-background; } * { @apply border-border; } }')).toEqual([]);
    expect(g('@import "tailwindcss";\n@source "../x";\n@custom-variant dark (&:is(.dark *));')).toEqual([]);
  });

  it('a class rule inside @layer base is judged', () => {
    expect(tokens(g('@layer base { .x { @apply text-sm; } }'))).toEqual(['text-sm']);
  });

  it('exemptions belong to the declaration own rule, not an ancestor', () => {
    expect(tokens(g(':root { .x { color: red; } }'))).toEqual(['color']);
    expect(tokens(g('@layer base { body { .c { color: red; } } }'))).toEqual(['color']);
  });

  it('a dot inside an attribute selector or string names no class', () => {
    expect(g('@layer base { a[href$=".pdf"] { @apply underline; } }')).toEqual([]);
  });

  it('element rules outside @layer base are judged', () => {
    expect(tokens(g('body { @apply bg-background; }'))).toEqual(['bg-background']);
  });
});

describe('appCssViolations: errors', () => {
  it('an unparseable stylesheet throws', () => {
    expect(() => appCssViolations('.x { color: red;', { stem: 'x' })).toThrow();
  });
});
