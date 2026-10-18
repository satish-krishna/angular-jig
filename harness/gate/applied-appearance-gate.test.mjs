import { describe, it, expect } from 'vitest';
import { Linter } from 'eslint';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import angular from 'angular-eslint';
import applied from './applied-index.mjs';
import { appliedUtilities, styledClasses } from './rules/applied-utilities.ts';

const config = [
  {
    files: ['**/*.html'],
    plugins: { applied },
    languageOptions: { parser: angular.templateParser },
    linterOptions: { noInlineConfig: true },
    rules: { 'applied/no-applied-appearance-on-primitive': 'error' },
  },
];

// Writes x.html and (unless cssBody is null) x.css into a fresh dir, lints the html.
function lint(html, cssBody) {
  const dir = mkdtempSync(join(tmpdir(), 'applied-'));
  writeFileSync(join(dir, 'x.html'), html);
  if (cssBody !== null) writeFileSync(join(dir, 'x.css'), `@reference "../../styles.css";\n${cssBody}\n`);
  return new Linter({ cwd: dir }).verify(html, config, { filename: join(dir, 'x.html') });
}
const ids = (messages) => messages.map((m) => m.messageId);
const BTN = '<button hlmBtn class="x__retire">Retire</button>';

describe('styledClasses', () => {
  it('returns the classes of the last compound only', () => {
    expect(styledClasses('.x .x__a')).toEqual(['x__a']);
    expect(styledClasses('.x > .x__a:hover')).toEqual(['x__a']);
    expect(styledClasses('.x__a.x__a--on::before')).toEqual(['x__a', 'x__a--on']);
    expect(styledClasses('.x__a:not(.x__b)')).toEqual(['x__a']);
    expect(styledClasses('.x__a:nth-child(2n+1)')).toEqual(['x__a']);
    expect(styledClasses('a[href$=".pdf"].x__m')).toEqual(['x__m']);
    expect(styledClasses('.sm\\:x')).toEqual(['sm:x']);
  });
});

describe('appliedUtilities', () => {
  it('maps flat rules, &:hover nesting and @media inside a rule, and drops !important', () => {
    const map = appliedUtilities(
      '.x__a { @apply px-2 !important; }\n.x__b { &:hover { @apply bg-red-500; } }\n.x__c { @media (width >= 40rem) { @apply py-6; } }',
    );
    expect(map.get('x__a')).toEqual(['px-2']);
    expect(map.get('x__b')).toEqual(['bg-red-500']);
    expect(map.get('x__c')).toEqual(['py-6']);
  });

  it('maps nothing for Sass-style &__x, which styles nothing in native CSS', () => {
    const map = appliedUtilities('.x { &__a { @apply px-2; } }');
    expect(map.has('x__a')).toBe(false);
    expect(map.has('x')).toBe(false);
  });
});

describe('no-applied-appearance-on-primitive', () => {
  it.each(['px-2', 'rounded-md', 'font-semibold', 'text-sm', 'shadow-sm', '!py-8', 'hover:!bg-red-500'])('fires on %s applied to a primitive', (u) => {
    expect(ids(lint(BTN, `.x__retire { @apply ${u}; }`))).toEqual(['appliedAppearanceOnPrimitive']);
  });

  it('fires on a hover-only and an @media-wrapped appearance utility', () => {
    expect(ids(lint(BTN, '.x__retire { &:hover { @apply bg-red-500; } }'))).toEqual(['appliedAppearanceOnPrimitive']);
    expect(ids(lint(BTN, '.x__retire { @media (width >= 40rem) { @apply py-6; } }'))).toEqual(['appliedAppearanceOnPrimitive']);
  });

  it('fires through a bound modifier class', () => {
    const html = '<div hlmCard class="x__card" [class.x__card--on]="on">a</div>';
    expect(ids(lint(html, '.x__card { @apply grid; }\n.x__card--on { @apply shadow-sm; }'))).toEqual(['appliedAppearanceOnPrimitive']);
  });

  it('fires through a bound class on an element wrapped by a structural directive', () => {
    const html = '<button hlmBtn *ngIf="a" class="x__retire" [class.x__on]="on">Retire</button>';
    expect(ids(lint(html, '.x__retire { @apply ms-auto; }\n.x__on { @apply shadow-sm; }'))).toEqual(['appliedAppearanceOnPrimitive']);
  });

  it('reports once per element, naming the class, the utility and the stylesheet', () => {
    const messages = lint(BTN, '.x__retire { @apply px-2 font-semibold rounded-md; }');
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toContain('x__retire');
    expect(messages[0].message).toContain('px-2');
    expect(messages[0].message).toContain('x.css');
    expect(messages[0].line).toBe(1);
  });

  it('passes layout-only utilities on a primitive', () => {
    expect(lint(BTN, '.x__retire { @apply w-full sm:w-64 ms-auto grid; }')).toEqual([]);
  });

  it('passes appearance on an element that is not a primitive', () => {
    expect(lint('<p class="x__note">n</p>', '.x__note { @apply px-2 font-semibold; }')).toEqual([]);
  });

  it('passes when the class is only named inside :not(), and fires through :nth-child(2n+1)', () => {
    expect(lint(BTN, '.x__other:not(.x__retire) { @apply px-2; }')).toEqual([]);
    expect(ids(lint(BTN, '.x__retire:nth-child(2n+1) { @apply px-2; }'))).toEqual(['appliedAppearanceOnPrimitive']);
  });

  it('passes a template with no sibling stylesheet', () => {
    expect(lint(BTN, null)).toEqual([]);
  });

  it('passes Sass-style &__x, which styles nothing', () => {
    expect(lint(BTN, '.x { &__retire { @apply px-2; } }')).toEqual([]);
  });

  it('reports an unreadable stylesheet once instead of passing', () => {
    expect(ids(lint(`${BTN}\n${BTN}`, '.x__retire { @apply px-2;'))).toEqual(['appliedStylesheetUnreadable']);
  });
});
