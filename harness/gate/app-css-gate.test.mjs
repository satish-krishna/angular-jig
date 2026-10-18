import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkStylesheet, stemOf, isGlobalStylesheet, loadUtilityOracle, templateUtilities, remedyFor } from './app-css/index.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ref = '@reference "../../styles.css";\n';
const component = (body, stem = 'dashboard') => checkStylesheet(ref + body, { stem, global: false });
const tokens = (vs) => vs.map((v) => v.token);

describe('R7 layout list', () => {
  it.each([
    'grid', 'flex', 'hidden', 'sr-only', 'contents', 'flex-1', 'flex-wrap', 'grow', 'shrink-0', 'basis-1/2', 'order-2',
    'grid-cols-2', 'col-span-full', 'row-span-2', 'auto-rows-min', 'grid-flow-col', 'items-center', 'justify-between',
    'content-center', 'self-start', 'place-items-center', 'gap-4', 'gap-x-2', 'w-full', 'h-8', 'size-4', 'min-w-0',
    'max-w-prose', 'aspect-video', 'm-2', 'mx-auto', 'ms-auto', '-mt-2', 'relative', 'sticky', 'inset-0', 'top-0',
    'start-0', 'z-10', 'overflow-hidden', 'overscroll-contain', 'truncate', 'whitespace-nowrap', 'break-words',
    'text-center', 'text-start', 'object-cover', 'isolate', 'container', 'sm:grid-cols-2', 'md:hidden', '!w-full', 'w-full!',
    'supports-[display:grid]:grid', '[&:nth-child(2)]:mt-2', 'w-[calc(100%-2rem)]', 'inset-0', 'inset-x-4', 'inset-y-0', '-inset-1', 'inset-px', 'inset-full',
  ])('%s is layout', (t) => {
    expect(component(`.dashboard__x { @apply ${t}; }`)).toEqual([]);
  });

  it.each([
    'text-sm', 'text-muted-foreground', 'font-semibold', 'leading-7', 'tracking-tight', 'bg-muted/50', 'border', 'border-b',
    'rounded-md', 'shadow-sm', 'ring-1', 'opacity-50', 'cursor-pointer', 'pointer-events-none', 'select-none', 'transition-colors',
    'tabular-nums', 'underline', 'content-[\'x\']', '[color:red]', 'hover:bg-accent', 'dark:text-foreground', 'zz-custom-thing', 'inset-shadow-sm', 'inset-ring-1', 'inset-ring', 'inset-shadow',
  ])('%s is appearance', (t) => {
    const vs = component(`.dashboard__x { @apply ${t}; }`);
    expect(tokens(vs)).toEqual([t]);
    expect(vs[0].reason).toBe('appearance');
  });

  it('reports one violation per utility', () => {
    expect(tokens(component('.dashboard__x { @apply flex py-8 text-sm text-muted-foreground; }'))).toEqual(['py-8', 'text-sm', 'text-muted-foreground']);
  });

  it('judges plain declarations by property', () => {
    expect(component('.dashboard__x { display: grid; grid-template-columns: 1fr 2fr; margin-inline: auto; }')).toEqual([]);
    expect(component('.dashboard__x { min-inline-size: 0; max-block-size: 10rem; min-height: 0; max-width: 40rem; }')).toEqual([]);
    const vs = component('.dashboard__x { color: var(--sidebar-primary); --w: 10rem; }');
    expect(vs.map((v) => [v.token, v.kind])).toEqual([['color', 'property'], ['--w', 'property']]);
  });

  it('reports one violation per rule and token, keeping the first line', () => {
    const vs = component('.dashboard__x {\n  color: red;\n  color: blue;\n  @apply text-sm text-sm;\n}');
    expect(vs.map((v) => [v.token, v.line])).toEqual([['color', 3], ['text-sm', 5]]);
    expect(tokens(component('.dashboard__x { color: red; } .dashboard__y { color: red; }'))).toEqual(['color', 'color']);
  });

  it('follows nesting and at-rules', () => {
    expect(tokens(component('.dashboard__x { @apply flex; &:hover { @apply bg-accent; } @media (width >= 40rem) { @apply text-lg; } }'))).toEqual(['bg-accent', 'text-lg']);
  });

  it('skips Sass-style concatenation, which styles nothing', () => {
    expect(component('.dashboard { &__x { @apply text-sm; } }')).toEqual([]);
  });

  it('throws on an unparseable stylesheet', () => {
    expect(() => component('.dashboard__x { @apply text-sm;')).toThrow();
  });
});

describe('R7a block root', () => {
  it.each(['.dashboard', '.dashboard--compact', ':host', '.dashboard, .dashboard--compact'])('padding passes on %s', (sel) => {
    expect(component(`${sel} { @apply p-6; padding-block: 1rem; }`)).toEqual([]);
  });
  it('padding passes on the block root inside @media', () => {
    expect(component('@media (width >= 40rem) { .dashboard { @apply px-8; } }')).toEqual([]);
  });
  it.each(['.dashboard:hover', '.dashboard .x', '.dashboard__panel', '.dashboard, .dashboard__panel', '.other'])('padding fails on %s', (sel) => {
    const vs = component(`${sel} { @apply p-6; }`);
    expect(vs.map((v) => [v.token, v.reason])).toEqual([['p-6', 'padding-off-root']]);
  });
  it('strips .component from the stem', () => {
    expect(stemOf('src/app/hero-card/hero-card.component.css')).toBe('hero-card');
    expect(stemOf('src/app/hero-card/hero-card.css')).toBe('hero-card');
  });
});

describe('global stylesheet', () => {
  const global = (css) => checkStylesheet(css, { stem: null, global: true });
  it('the substrate styles.css passes', () => {
    expect(global(readFileSync(join(root, 'src', 'styles.css'), 'utf8'))).toEqual([]);
  });
  it('a class rule is judged', () => {
    expect(tokens(global('.x { @apply text-sm; }'))).toEqual(['text-sm']);
  });
  it('a @utility body is judged and padding there is off-root', () => {
    expect(global('@utility pad { padding: 1rem; }').map((v) => v.reason)).toEqual(['padding-off-root']);
  });
  it('theme rules and base element rules pass', () => {
    expect(global(':root { color-scheme: light; --x: 1px; } :root.dark { --x: 2px; } @theme inline { --color-x: var(--x); } @layer base { body { @apply bg-background text-foreground; } }')).toEqual([]);
  });
  it('a class rule inside @layer base is judged', () => {
    expect(tokens(global('@layer base { .x { @apply text-sm; } }'))).toEqual(['text-sm']);
  });
  it.each([
    ':root { .x { color: red } }',
    ':root { &:hover { color: red } }',
    '@layer base { body { .c { color: red } } }',
  ])('a class rule nested in an exempt rule is judged: %s', (css) => {
    expect(tokens(global(css))).toEqual(['color']);
  });
  it.each([
    '* { @apply border-border; }',
    'body { @apply bg-background text-foreground; }',
    'a:hover { text-decoration: underline; }',
    'ul li::marker { color: red; }',
    'html { color-scheme: light; }',
    'ul > li:not(:last-child) { color: red; }',
  ])('an element rule in @layer base is exempt: %s', (rule) => {
    expect(global(`@layer base { ${rule} }`)).toEqual([]);
  });
  it.each([
    ['app-stat-tile p { @apply text-2xl font-bold; }', 2],
    ['[data-stat] { color: red; }', 1],
    ['#hero-title { color: red; }', 1],
    ['p.lead { color: red; }', 1],
    ['a[href$=".pdf"] { color: red; }', 1],
    ['p:not(.lead) { color: red; }', 1],
  ])('a component or attribute selector in @layer base is judged: %s', (rule, count) => {
    expect(global(`@layer base { ${rule} }`)).toHaveLength(count);
  });
  it('recognizes the global path', () => {
    expect(isGlobalStylesheet('src/styles.css')).toBe(true);
    expect(isGlobalStylesheet('src/app/app.css')).toBe(false);
  });
});

describe('remedies', () => {
  it('names the fitting home for each kind', () => {
    expect(remedyFor({ token: 'text-sm', reason: 'appearance' }, 'roster')).toMatch(/typography/);
    expect(remedyFor({ token: 'py-8', reason: 'padding-off-root' }, 'roster')).toMatch(/\.roster\b/);
    expect(remedyFor({ token: 'rounded-md', reason: 'appearance' }, 'roster')).toMatch(/variant/);
  });
});

describe('template utilities', () => {
  let isUtility;
  beforeAll(async () => {
    isUtility = await loadUtilityOracle(join(root, 'src', 'styles.css'));
  });
  it('flags utilities in class attributes and [class.x] bindings, not BEM names', () => {
    const html = '<div class="roster__row flex gap-2">\n  <span [class.text-sm]="on" [class.roster__x--on]="on">x</span>\n</div>';
    expect(templateUtilities(html, 'x.html', isUtility).map((v) => [v.line, v.token, v.via])).toEqual([
      [1, 'flex', 'class'],
      [1, 'gap-2', 'class'],
      [2, 'text-sm', '[class.x]'],
    ]);
  });
  it('reads elements inside control flow and ng-template', () => {
    const html = '@if (a) {\n<p class="py-2">x</p>\n}\n<ng-template><i class="size-4"></i></ng-template>';
    expect(templateUtilities(html, 'x.html', isUtility).map((v) => v.token)).toEqual(['py-2', 'size-4']);
  });
  it('reads @switch cases, @for empty and @defer sub-blocks', () => {
    const sw = '@switch (x) { @case (1) { <p class="text-sm">a</p> } @default { <i class="size-4"></i> } }';
    expect(templateUtilities(sw, 'x.html', isUtility).map((v) => v.token)).toEqual(['text-sm', 'size-4']);
    const rest = '@for (i of xs; track i) { <b class="flex"></b> } @empty { <u class="py-2"></u> } @defer { <a class="gap-2"></a> } @placeholder { <s class="p-1"></s> } @loading { <q class="m-1"></q> } @error { <r class="w-1"></r> }';
    expect(templateUtilities(rest, 'x.html', isUtility).map((v) => v.token).sort()).toEqual(['flex', 'gap-2', 'm-1', 'p-1', 'py-2', 'w-1']);
  });
  it('passes a BEM-only template', () => {
    expect(templateUtilities('<section class="roster"><h1 hlmH3>R</h1></section>', 'x.html', isUtility)).toEqual([]);
  });
});
