# BEM house style, phase B: rule, counter, pilot - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the BEM house style on a new substrate, build a counter that can see violations of it wherever they live, wire the counter into the schematic-arm mod as series 2, and run one gate-off pilot.

**Architecture:** Two branches and the mod. `substrate/schematic-arm-2` (worktree `D:/Repos/aj-s2`) is what the subject sees: triad placeholders, component schematic defaults, the rewritten house-style skill. `research/schematic-arm` (the `D:/Repos/angular-jig` checkout) is the launching branch and carries the measurement: a new `bem` counter family plus an "expanded" mode for the existing `seal` and `layout` counters, which rewrites each template with the utilities its BEM classes `@apply` before counting. The mod measures with the launching branch's `harness/counter/`, exactly as in series 1, so the subject never sees the counter.

**Tech Stack:** Node ESM (`.mjs`), vitest (`npm run test:harness`), `@angular/compiler` `parseTemplate`, `typescript` AST, `postcss`, `@tailwindcss/node` `__unstable__loadDesignSystem` (Tailwind 4.3.3), Angular 21 builder with `@tailwindcss/postcss`.

**Spec:** `harness/bem-house-style-spec.md` (same branch). Read it before any task.

**Not in this plan:** the spec's per-screen structure recording for repeatability (it needs at least two trials per arm, so it belongs to phase 2), and everything under "After the pilot".

## Global Constraints

- All rules apply to authored code under `src/app`; `libs/ui` is out of scope.
- Template class tokens: BEM only, `^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$`, and not a Tailwind utility. No allowlist, not even `sr-only`.
- Block = the component's file stem with a trailing `.component` removed (`hero-card.ts` and `hero-card.component.ts` both own `hero-card`).
- Every component is a triad: `templateUrl: './<file-stem>.html'`, `styleUrl: './<file-stem>.css'`, both files present. No exception for small components.
- Component stylesheets are `.css` with `@reference` to the theme and flat BEM selectors written out in full (`.roster__row`); never `.scss`. Nesting only for `&:pseudo`, `&::pseudo`, `&[attr]` and at-rules; Sass-style `&__x`/`&--x` is forbidden (native CSS compiles it to a selector that matches nothing). Ruling from Task 1, see ledger.
- Series 2 evidence goes to `experiments/schematic-arm/s2/<condition>/<runId>/`; series 1 evidence is never touched.
- Nothing is committed to `main`. Measurement and docs commit on `research/schematic-arm`; substrate work on `substrate/schematic-arm-2`.
- Never `--no-verify`. Commit footer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr`.
- US English in docs and comments; no hard wraps in Markdown.
- Never let `git worktree remove` run on a worktree whose `node_modules` is a junction or symlink to a real folder: it follows the link and deletes the target. The worktree in this plan gets a real `npm ci`.
- Do not edit the mod or switch branches in `D:/Repos/angular-jig` while an `/arm` run is active.

## Review Focus

1. A TypeScript data string that happens to be a valid utility (`'h-11'` as an id) is flagged `utility-in-ts`. Expected and accepted: every violation carries the literal in `detail` so a human can audit it; pinned by a test in Task 5 so the behavior is deliberate, not accidental.
2. Classes inside control flow (`@if`, `@for`, `@switch`, `@defer`) must be checked and expanded like any other. Pinned in Task 4.
3. CRLF line endings (this is Windows, `core.autocrlf` on): expansion must keep line numbers, and stylesheet parsing must not choke. Pinned in Task 4.
4. Angular's older `*.component.ts` naming must map to the block without the suffix, or every such component reports a foreign block. Pinned in Task 5.
5. `:host` rules and `@apply` nested under `@media` inside a BEM rule: `:host` is not a foreign block, and utilities under `@media` still map to the class. Pinned in Task 3.

---

## File Structure

On `research/schematic-arm` (`D:/Repos/angular-jig`):

- Create `harness/counter/bem/classify.mjs`: is a token a Tailwind utility (asks Tailwind's design system), is it BEM, what is its block.
- Create `harness/counter/bem/stylesheet.mjs`: parse a component `.css`; map each class to the utilities it `@apply`s; list every selector class; detect `@apply` and `@reference`.
- Create `harness/counter/bem/template.mjs`: walk template elements; list class uses (static, `[class.x]`, `[class]` literals); expand a template by substituting each class with its utilities.
- Create `harness/counter/bem/components.mjs`: read `@Component` decorators and collectible string literals from a `.ts` file.
- Create `harness/counter/bem-counter.mjs`: `bemTally` (the seven `bem` rules) and `expandedTally` (seal and layout on expanded templates); CLI.
- Create `harness/counter/fixtures/bem/styles.css`: the classifier theme for tests.
- Create tests: `harness/counter/bem/stylesheet.test.mjs`, `harness/counter/bem/template.test.mjs`, `harness/counter/bem-counter.test.mjs`.
- Modify `harness/bem-house-style-spec.md`: one erratum (the counter lives on the launching branch).

On `substrate/schematic-arm-2` (`D:/Repos/aj-s2`):

- Modify `src/app/{dashboard,heroes,hero-detail}/*.ts`, create sibling `.html` and `.css`.
- Modify `angular.json`: component schematic defaults.
- Modify `.claude/skills/house-style/SKILL.md`.

Mod (`C:/Users/psati/.claude/dev-mods/bbe683f7-6112-404d-accc-35881737d0b7/schematic-arm/`, not a git repo):

- Modify `bin/arm.mjs`: `outDirFor`, series 2 preflight, counters, meta.
- Modify `bin/arm.test.mjs`: `outDirFor` test.
- Modify `arm.config.json`: `series`, `substrate`, `requiredOnSubstrate`.

---

### Task 1: Spike, then the series 2 substrate

**Files:**
- Create worktree: `D:/Repos/aj-s2` on new branch `substrate/schematic-arm-2` from `substrate/schematic-arm`
- Modify: `src/app/dashboard/dashboard.ts`, `src/app/heroes/heroes.ts`, `src/app/hero-detail/hero-detail.ts`
- Create: `src/app/dashboard/dashboard.{html,css}`, `src/app/heroes/heroes.{html,css}`, `src/app/hero-detail/hero-detail.{html,css}`
- Modify: `angular.json` (`projects.angular-jig.schematics`)
- Modify (research branch): `harness/bem-house-style-spec.md`

**Interfaces:**
- Produces: a substrate whose `src/app` satisfies R1 to R4, and the confirmed `@reference` line every later stylesheet copies: `@reference "../../styles.css";`

- [ ] **Step 1: Create the worktree with a real install**

```bash
cd D:/Repos/angular-jig
git worktree add D:/Repos/aj-s2 -b substrate/schematic-arm-2 substrate/schematic-arm
cd D:/Repos/aj-s2 && npm ci
```

Expected: `npm ci` completes; `D:/Repos/aj-s2/node_modules` is a real directory (`ls -la` shows no `->`).

- [ ] **Step 2: Spike the one assumption the design rests on**

Temporarily rewrite `src/app/heroes/heroes.ts` as a triad with a variant and theme tokens:

```ts
import { Component } from '@angular/core';

// Placeholder. The hero list screen is built here.
@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.html',
  styleUrl: './heroes.css',
})
export class Heroes {}
```

`src/app/heroes/heroes.html`:

```html
<h1 class="heroes__title">Heroes</h1>
```

`src/app/heroes/heroes.css`:

```css
@reference "../../styles.css";

.heroes {
  &__title {
    @apply text-2xl font-semibold text-muted-foreground sm:text-3xl;
  }
}
```

Run: `npm run build 2>&1 | tail -20`

Expected: build succeeds with no `@apply` or `Cannot apply unknown utility class` error.

Then confirm the rule compiled with the token and the media query:

```bash
grep -o 'heroes__title[^}]*}' dist/angular-jig/browser/*.js | head -5
grep -c 'muted-foreground' dist/angular-jig/browser/*.js
grep -o '40rem' dist/angular-jig/browser/*.js | head -2
```

Expected: a `.heroes__title[_ngcontent-...]` rule containing `font-weight`, a `muted-foreground` reference, and a `40rem` media query.

If the build fails on `@reference "../../styles.css"` (most likely cause: the spartan preset `@import` inside `styles.css`), try in order:
1. `@reference "tailwindcss";` followed by `@reference "@spartan-ng/brain/hlm-tailwind-preset.css";`
2. Stop and report the exact error. Do not continue the plan on an unconfirmed `@reference`: every later task copies this line.

Record which `@reference` form worked; it is the form every stylesheet in this plan uses (the plan text assumes the first).

- [ ] **Step 3: Reduce the placeholders to parity with series 1**

The series 1 placeholders were bare headings with no classes. Keep that parity: the triad conversion is the only change. Final content for each of the three screens (shown for `heroes`; `dashboard` and `hero-detail` follow the same shape with their own selector, class name and heading text taken from the current file):

`src/app/heroes/heroes.ts`:

```ts
import { Component } from '@angular/core';

// Placeholder. The hero list screen is built here.
@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.html',
  styleUrl: './heroes.css',
})
export class Heroes {}
```

`src/app/heroes/heroes.html`:

```html
<h1>Heroes</h1>
```

`src/app/heroes/heroes.css`:

```css
@reference "../../styles.css";
```

Read each current placeholder first (`git show substrate/schematic-arm:src/app/dashboard/dashboard.ts`, same for `hero-detail`) and carry over its comment, selector, class name, imports and template text exactly; only move the template into the `.html` file. `app.ts` already uses `templateUrl`/`styleUrl` and `app.html` has no class attributes: leave the shell untouched.

- [ ] **Step 4: Make `ng g component` produce a triad**

In `angular.json`, replace `"schematics": {}` under `projects.angular-jig` with:

```json
"schematics": {
  "@schematics/angular:component": {
    "inlineTemplate": false,
    "inlineStyle": false,
    "style": "css"
  }
},
```

Verify: `npx ng g component scratch-probe --dry-run`

Expected: CREATE lines for `scratch-probe.ts`, `scratch-probe.html`, `scratch-probe.css` (and a spec), no inline template.

- [ ] **Step 5: Build and boot**

Run: `npm run build && npm run check:boot`

Expected: both pass.

- [ ] **Step 6: Commit the substrate**

```bash
cd D:/Repos/aj-s2
git add src/app angular.json
git commit -m "feat(substrate): convert placeholders to triads for series 2

Series 2 makes every component a .ts/.html/.css triad. The placeholders
were the only inline templates on the substrate; ng g component now
produces a triad by default.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr"
```

- [ ] **Step 7: Correct the spec**

In `D:/Repos/angular-jig/harness/bem-house-style-spec.md`, under "Substrate changes", replace item 4 (`Add the bem counter and its tests under harness/counter/.`) with:

```markdown
4. Nothing under `harness/counter/`. As in series 1, the counters live on the launching branch (`research/schematic-arm`) and the mod measures with them after the run, so the subject never sees the counter.
```

If Step 2 needed the fallback `@reference` form, also replace the `@reference "../../styles.css";` line in R4's example with the form that worked.

```bash
cd D:/Repos/angular-jig
git add harness/bem-house-style-spec.md
git commit -m "docs(harness): the bem counter lives on the launching branch

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr"
```

---

### Task 2: Rewrite the house-style skill

**Files:**
- Modify: `D:/Repos/aj-s2/.claude/skills/house-style/SKILL.md`

**Interfaces:**
- Consumes: the `@reference` form confirmed in Task 1.
- Produces: the only place the subject learns R1 to R6. The stage prompts are unchanged.

- [ ] **Step 1: Update the frontmatter description**

Replace the `description:` line with:

```yaml
description: The house frontend conventions for this repo, layered on top of the SpartanNG docs. Read before writing or editing any component. Covers BEM markup with Tailwind applied in the component stylesheet, the three-file component, the layout grammar (grid for regions, flex for inline runs, no nested flex faking a grid) and the no-raw-literals rule for hand-written CSS. Where these rules and the spartan docs' examples disagree about where utility classes go, these rules win.
```

- [ ] **Step 2: Fix the intro's "never contradict" claim**

The intro paragraph says these conventions never contradict spartan. That is no longer true on one point. Append this sentence to that paragraph:

```markdown
One deliberate exception: spartan's examples put Tailwind utilities in the template's `class` attribute. In this repo they never go there; see "Markup is BEM, styling lives in the stylesheet" below. Every other spartan rule stands, including "class is for layout only" on a primitive, which now means the utilities a primitive's BEM class applies must be layout only.
```

- [ ] **Step 3: Add the new section directly after the intro, before "The sealed control vocabulary"**

Insert verbatim everything between the BEGIN and END marker lines (the markers themselves are not part of the text):

<!-- BEGIN house-style section -->

## Markup is BEM, styling lives in the stylesheet

A template says what things are; the stylesheet says how they look. Utility classes in markup turn every template into a wall of `flex items-center gap-3 sm:w-48` that a reader has to decode to find the structure, and they let styling decisions spread across every file that renders the element. So:

1. **Template classes are BEM names only.** Every token in a `class` attribute, every `[class.x]` binding, and every string inside a `[class]` binding is `block`, `block__element`, `block--modifier` or `block__element--modifier`, lowercase kebab-case. No Tailwind utility appears in a template. That includes `sr-only`: write `class="roster__label"` and `@apply sr-only` it.
2. **One block per component, named after the component file.** `hero-card.ts` owns `.hero-card`, `.hero-card__name`, `.hero-card--retired`, and nothing else. A template must not use another component's block, and a stylesheet must not define one. `:host` is allowed.
3. **Every component is three files.** `hero-card.ts` with `templateUrl: './hero-card.html'` and `styleUrl: './hero-card.css'`. Never `template:` or `styles:`, however small the component. `ng g component` already produces this shape.
4. **Stylesheets are plain `.css` with every BEM class written out in full.** Not `.scss`: Tailwind v4 does not support running behind Sass. The first line is always `@reference "../../styles.css";` (adjust the `../` count to the file's depth under `src/app`), which lets `@apply` resolve the theme's tokens and variants. Write `.roster__row { ... }`, never `.roster { &__row { ... } }`: that is Sass syntax, and native CSS compiles it to a selector that matches nothing, with only a warning. Nesting is fine for states and breakpoints on the same element: `&:hover`, `&::before`, `&[aria-expanded="true"]`, `@media`.
5. **Utilities live in `@apply`, and every rule below still applies to them.** Semantic color tokens only, `gap-*` not `space-*`, grid for regions, appearance never on a primitive. Moving a utility from the template into `@apply` does not change whether it is allowed.
6. **No utility classes in TypeScript.** No `cva` variant strings, no `host: { class: '...' }`, no computed class strings. A state that changes appearance is a BEM modifier bound with `[class.block--modifier]`.

Helm directives and their inputs are not classes and stay in the template: `variant`, `size` and the directive itself are the primitive's API.

```html
<!-- roster.html -->
<section class="roster">
  <header class="roster__header">
    <h1 class="roster__title">Roster</h1>
  </header>
  <div class="roster__filters">
    <label hlmLabel for="roster-search" class="roster__label">Search</label>
    <input hlmInput id="roster-search" type="search" class="roster__search" />
    <a hlmBtn routerLink="/recruit" class="roster__recruit">Recruit</a>
  </div>
  @for (hero of vm.heroes(); track hero.id) {
    <div class="roster__row" [class.roster__row--retired]="hero.retired">{{ hero.name }}</div>
  }
</section>
```

```css
/* roster.css */
@reference "../../styles.css";

.roster { @apply grid gap-6; }
.roster__title { @apply text-2xl font-semibold; }
.roster__filters { @apply flex flex-wrap items-center gap-3; }
.roster__label { @apply sr-only; }
.roster__search { @apply w-full sm:w-64; }
.roster__recruit { @apply ms-auto; }
.roster__row {
  @apply text-sm;
  &:hover { @apply bg-accent; }
}
.roster__row--retired { @apply text-muted-foreground; }
```

Note the primitives: `roster__search` and `roster__recruit` apply only width and margin, because a primitive's class is for layout only. Color and typography for a primitive come from its own `variant`/`size` inputs.

<!-- END house-style section -->

- [ ] **Step 4: Convert every other example in the file**

Every remaining code example in `SKILL.md` that shows code to write (a "good" example) must follow the new rules: no `template:` (show the `.html` and the `.ts` with `templateUrl`), and no utility classes in a `class` attribute (move them into a `.css` block with `@apply`, named after the example's component). Examples explicitly labeled as the wrong thing ("bad", "drift", "not this") keep their utilities; they illustrate the violation. In the "Layout is a grammar" section, restate the rule as being about what a class applies (`.dashboard__tiles { @apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4; }`), and keep its examples' structure.

- [ ] **Step 5: Verify the conversion**

```bash
cd D:/Repos/aj-s2
grep -n 'template: `' .claude/skills/house-style/SKILL.md
grep -n 'styles: \[' .claude/skills/house-style/SKILL.md
grep -n 'scss' .claude/skills/house-style/SKILL.md
```

Expected: the first two print nothing. The third prints only the "Not `.scss`" sentence. Then read every `class="` line in the file (`grep -n 'class="' .claude/skills/house-style/SKILL.md`) and confirm each is either all-BEM or inside an example labeled as wrong.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/house-style/SKILL.md
git commit -m "docs(house-style): markup is BEM, styling lives in the stylesheet

Series 2 house style. Utilities move into @apply in component .css,
templates carry only the component's own BEM block, every component is
three files. States the one point where this overrides spartan.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr"
```

---

### Task 3: Classifier and stylesheet reader

All remaining code tasks run in `D:/Repos/angular-jig` on `research/schematic-arm`.

**Files:**
- Create: `harness/counter/bem/classify.mjs`
- Create: `harness/counter/bem/stylesheet.mjs`
- Create: `harness/counter/fixtures/bem/styles.css`
- Test: `harness/counter/bem/stylesheet.test.mjs`

**Interfaces:**
- Produces:
  - `BEM_RE: RegExp`
  - `blockOf(token: string): string`
  - `loadClassifier(stylesPath: string): Promise<{ isUtility(token: string): boolean }>`
  - `parseStylesheet(css: string, from?: string): { utilities: Map<string, string[]>, selectorClasses: { cls: string, line: number }[], brokenNesting: { selector: string, line: number }[], hasApply: boolean, hasReference: boolean }`

- [ ] **Step 1: Write the fixture theme**

`harness/counter/fixtures/bem/styles.css`:

```css
@import "tailwindcss";

@theme {
  --color-success: oklch(0.7 0.15 150);
}
```

- [ ] **Step 2: Write the failing tests**

`harness/counter/bem/stylesheet.test.mjs`:

```js
import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BEM_RE, blockOf, loadClassifier } from './classify.mjs';
import { parseStylesheet } from './stylesheet.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const STYLES = join(here, '..', 'fixtures', 'bem', 'styles.css');

describe('classify', () => {
  it('asks Tailwind which tokens are utilities', async () => {
    const { isUtility } = await loadClassifier(STYLES);
    for (const t of ['flex', 'w-full', 'sm:w-48', 'bg-success/15', 'bg-red-500', 'sr-only', 'space-x-2', '!font-bold', 'container']) {
      expect(isUtility(t), t).toBe(true);
    }
    for (const t of ['hero-card', 'hero-card__name', 'roster--active', 'Tank', 'on-mission']) {
      expect(isUtility(t), t).toBe(false);
    }
  });

  it('recognizes BEM names and their block', () => {
    for (const t of ['roster', 'roster__row', 'roster__row--retired', 'hero-card--retired', 'hero-detail__power-meter']) {
      expect(BEM_RE.test(t), t).toBe(true);
    }
    for (const t of ['Roster', 'roster___row', 'sm:w-48', 'roster__', 'bg-red-500/10']) {
      expect(BEM_RE.test(t), t).toBe(false);
    }
    expect(blockOf('hero-card__name--big')).toBe('hero-card');
    expect(blockOf('hero-card--retired')).toBe('hero-card');
    expect(blockOf('roster')).toBe('roster');
  });
});

describe('parseStylesheet', () => {
  const css = [
    '@reference "../../styles.css";',
    '',
    ':host { @apply block; }',
    '.roster { @apply grid gap-6; }',
    '.roster__filters { @apply flex flex-wrap gap-3; }',
    '.roster__retire {',
    '  @apply ms-auto;',
    '  &:hover { @apply bg-red-500; }',
    '}',
    '.roster__search {',
    '  @media (width >= 40rem) { @apply w-64; }',
    '}',
    '.roster__row {',
    '  &__name { @apply flex; }',
    '}',
    '.badge-lite { color: var(--primary); }',
  ].join('\n');

  it('maps each class to the utilities it applies, through pseudo-class nesting and @media', () => {
    const { utilities } = parseStylesheet(css);
    expect(utilities.get('roster')).toEqual(['grid', 'gap-6']);
    expect(utilities.get('roster__filters')).toEqual(['flex', 'flex-wrap', 'gap-3']);
    expect(utilities.get('roster__retire')).toEqual(['ms-auto', 'bg-red-500']);
    expect(utilities.get('roster__search')).toEqual(['w-64']);
  });

  it('treats Sass-style &__x as broken: it maps nothing, names no class, and is reported', () => {
    const { utilities, selectorClasses, brokenNesting } = parseStylesheet(css);
    expect(utilities.has('roster__row')).toBe(false);
    expect(utilities.has('roster__row__name')).toBe(false);
    expect(utilities.has('roster__name')).toBe(false);
    expect(selectorClasses.some((s) => s.line === 14)).toBe(false);
    expect(brokenNesting).toEqual([{ selector: '&__name', line: 14 }]);
  });

  it('lists every selector class with its line, and :host contributes none', () => {
    const { selectorClasses } = parseStylesheet(css);
    const names = [...new Set(selectorClasses.map((s) => s.cls))].sort();
    expect(names).toEqual(['badge-lite', 'roster', 'roster__filters', 'roster__retire', 'roster__row', 'roster__search']);
    expect(selectorClasses.find((s) => s.cls === 'badge-lite').line).toBe(16);
  });

  it('detects @apply and @reference', () => {
    expect(parseStylesheet(css)).toMatchObject({ hasApply: true, hasReference: true });
    expect(parseStylesheet('.a { @apply flex; }')).toMatchObject({ hasApply: true, hasReference: false });
    expect(parseStylesheet('@reference "../../styles.css";\n')).toMatchObject({ hasApply: false, hasReference: true });
  });

  it('parses CRLF stylesheets with the same lines', () => {
    const { selectorClasses } = parseStylesheet(css.replaceAll('\n', '\r\n'));
    expect(selectorClasses.find((s) => s.cls === 'badge-lite').line).toBe(16);
  });
});
```

- [ ] **Step 3: Run to verify they fail**

Run: `npx vitest run --config harness/vitest.config.mjs harness/counter/bem/stylesheet.test.mjs`

Expected: FAIL, cannot find module `./classify.mjs`.

- [ ] **Step 4: Implement `classify.mjs`**

```js
// Is a class token a Tailwind utility? Asked of Tailwind itself, through the
// design system its editor tooling uses, so the answer tracks the installed
// version and the project's own theme instead of a hand-kept list. A token is
// a utility when Tailwind would generate CSS for it.
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { __unstable__loadDesignSystem } from '@tailwindcss/node';

export const BEM_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$/;

export const blockOf = (token) => token.split('__')[0].split('--')[0];

export async function loadClassifier(stylesPath) {
  const ds = await __unstable__loadDesignSystem(readFileSync(stylesPath, 'utf8'), { base: dirname(stylesPath) });
  const cache = new Map();
  const isUtility = (raw) => {
    const token = raw.replace(/^!|!$/g, '');
    if (!cache.has(token)) cache.set(token, ds.candidatesToCss([token])[0] != null);
    return cache.get(token);
  };
  return { isUtility };
}
```

- [ ] **Step 5: Implement `stylesheet.mjs`**

```js
// Reads a component stylesheet the way the expansion needs it: which
// utilities each class applies, and which classes the selectors name.
// Nesting is resolved the way native CSS resolves it (`&` is the parent
// selector, descendant otherwise). Native CSS cannot append text to `&`, so
// a Sass-style `.roster { &__row { ... } }` styles nothing in the browser:
// such a rule, and everything nested in it, maps no utilities and names no
// class here either, and is reported in brokenNesting instead.
import postcss from 'postcss';

function ruleParent(node) {
  let p = node.parent;
  while (p && p.type !== 'rule' && p.type !== 'root') p = p.parent;
  return p && p.type === 'rule' ? p : null;
}

// `&` followed by an identifier character is concatenation, which only Sass does.
const CONCAT_RE = /&[\w-]/;

function isBroken(rule) {
  const parent = ruleParent(rule);
  if (!parent) return false;
  return rule.selectors.some((s) => CONCAT_RE.test(s)) || isBroken(parent);
}

export function resolvedSelectors(rule) {
  const parent = ruleParent(rule);
  const parents = parent ? resolvedSelectors(parent) : [''];
  return rule.selectors.flatMap((s) => parents.map((p) => (s.includes('&') ? s.replaceAll('&', p) : p ? `${p} ${s}` : s)));
}

const CLASS_RE = /\.(-?[_a-zA-Z][\w-]*)/g;
const classesIn = (sel) => [...sel.matchAll(CLASS_RE)].map((m) => m[1]);
// The element a selector styles is its last compound: `.a .b:hover` styles .b.
const lastCompound = (sel) => sel.trim().split(/\s*[>+~]\s*|\s+/).pop() ?? '';

export function parseStylesheet(css, from = 'component.css') {
  const root = postcss.parse(css, { from });
  const utilities = new Map();
  let hasApply = false;
  let hasReference = false;
  root.walkAtRules((a) => {
    if (a.name === 'reference') hasReference = true;
    if (a.name !== 'apply') return;
    hasApply = true;
    const rule = ruleParent(a);
    if (!rule || isBroken(rule)) return;
    const tokens = a.params.split(/\s+/).filter(Boolean);
    for (const sel of resolvedSelectors(rule)) {
      for (const cls of classesIn(lastCompound(sel))) {
        if (!utilities.has(cls)) utilities.set(cls, []);
        utilities.get(cls).push(...tokens);
      }
    }
  });
  const seen = new Set();
  const selectorClasses = [];
  const brokenNesting = [];
  root.walkRules((rule) => {
    const line = rule.source?.start?.line ?? 0;
    if (isBroken(rule)) {
      for (const selector of rule.selectors) if (CONCAT_RE.test(selector)) brokenNesting.push({ selector, line });
      return;
    }
    for (const sel of resolvedSelectors(rule)) {
      for (const cls of classesIn(sel)) {
        const key = `${cls}@${line}`;
        if (seen.has(key)) continue;
        seen.add(key);
        selectorClasses.push({ cls, line });
      }
    }
  });
  return { utilities, selectorClasses, brokenNesting, hasApply, hasReference };
}
```

- [ ] **Step 6: Run to verify they pass**

Run: `npx vitest run --config harness/vitest.config.mjs harness/counter/bem/stylesheet.test.mjs`

Expected: PASS, 7 tests. If a classifier expectation fails, print `ds.candidatesToCss([token])` for that token and fix the expectation only if Tailwind's answer is defensible (for example a token that really is a utility); never special-case a token in `classify.mjs`.

- [ ] **Step 7: Commit**

```bash
git add harness/counter/bem/classify.mjs harness/counter/bem/stylesheet.mjs harness/counter/bem/stylesheet.test.mjs harness/counter/fixtures/bem/styles.css
git commit -m "feat(counter): classify utility tokens and read component stylesheets

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr"
```

---

### Task 4: Template class uses and expansion

**Files:**
- Create: `harness/counter/bem/template.mjs`
- Test: `harness/counter/bem/template.test.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `elements(nodes): Generator<TmplElement>` (Angular r3 element nodes, including inside control flow)
  - `classUses(html: string, file?: string): { token: string, line: number, via: 'class' | '[class.x]' | '[class]' }[]` (line is 1-based within `html`)
  - `expandTemplate(html: string, utilities: Map<string, string[]>, file?: string): string` (same line count as input)

- [ ] **Step 1: Write the failing tests**

`harness/counter/bem/template.test.mjs`:

```js
import { describe, it, expect } from 'vitest';
import { classUses, expandTemplate } from './template.mjs';

const html = [
  '<section class="roster">',
  '  <h1 class="roster__title">Roster</h1>',
  '  @if (open) {',
  '    <div class="roster__filters flex">x</div>',
  '  }',
  '  @for (h of heroes; track h.id) {',
  '    <div class="roster__row" [class.roster__row--retired]="h.retired" [class]="h.x ? \'gap-2\' : \'roster__row--odd\'">{{ h.name }}</div>',
  '  }',
  '  <button hlmBtn [class.roster__retire]="true">Retire</button>',
  '</section>',
].join('\n');

describe('classUses', () => {
  it('lists static classes, [class.x] names and [class] string literals, inside control flow, with lines', () => {
    const uses = classUses(html).map((u) => `${u.line}:${u.via}:${u.token}`);
    expect(uses).toEqual([
      '1:class:roster',
      '2:class:roster__title',
      '4:class:roster__filters',
      '4:class:flex',
      '7:class:roster__row',
      '7:[class.x]:roster__row--retired',
      '7:[class]:gap-2',
      '7:[class]:roster__row--odd',
      '9:[class.x]:roster__retire',
    ]);
  });
});

describe('expandTemplate', () => {
  const utilities = new Map([
    ['roster', ['grid', 'gap-6']],
    ['roster__title', ['text-2xl', 'font-semibold']],
    ['roster__filters', ['flex', 'gap-3']],
    ['roster__row--retired', ['text-muted-foreground']],
    ['roster__retire', ['bg-red-500']],
  ]);

  it('replaces each class with its utilities and keeps unknown tokens', () => {
    const out = expandTemplate(html, utilities).split('\n');
    expect(out[0]).toBe('<section class="grid gap-6">');
    expect(out[1]).toBe('  <h1 class="text-2xl font-semibold">Roster</h1>');
    expect(out[3]).toBe('    <div class="flex gap-3 flex">x</div>');
  });

  it('folds [class.x] utilities into the class attribute, adding one when there is none', () => {
    const out = expandTemplate(html, utilities).split('\n');
    expect(out[6]).toContain('class="roster__row text-muted-foreground"');
    expect(out[8]).toBe('  <button class="bg-red-500" hlmBtn [class.roster__retire]="true">Retire</button>');
  });

  it('keeps the line count, including for CRLF input', () => {
    expect(expandTemplate(html, utilities).split('\n')).toHaveLength(10);
    const crlf = html.replaceAll('\n', '\r\n');
    const out = expandTemplate(crlf, utilities);
    expect(out.split('\r\n')).toHaveLength(10);
    expect(out.split('\r\n')[1]).toBe('  <h1 class="text-2xl font-semibold">Roster</h1>');
  });

  it('expands inside @switch and @defer too', () => {
    const t = '@switch (x) { @case (1) { <p class="roster__title">a</p> } }\n@defer { <p class="roster__title">b</p> }';
    expect(expandTemplate(t, utilities)).toBe(
      '@switch (x) { @case (1) { <p class="text-2xl font-semibold">a</p> } }\n@defer { <p class="text-2xl font-semibold">b</p> }',
    );
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run --config harness/vitest.config.mjs harness/counter/bem/template.test.mjs`

Expected: FAIL, cannot find module `./template.mjs`.

- [ ] **Step 3: Implement `template.mjs`**

```js
// Template side of the BEM plane. classUses() lists every class a template
// names; expandTemplate() rewrites a copy of the template with each class
// replaced by the utilities its stylesheet applies, so the series 1 seal and
// layout checks can judge the utilities where they now live. Edits are made by
// source offset, never by adding lines, so reported line numbers stay true.
import { parseTemplate, BindingType } from '@angular/compiler';

const CHILD_KEYS = ['children', 'branches', 'cases', 'empty', 'placeholder', 'loading', 'error'];

export function* elements(nodes) {
  for (const n of nodes ?? []) {
    if (!n || typeof n !== 'object') continue;
    if (typeof n.name === 'string' && Array.isArray(n.attributes) && Array.isArray(n.inputs)) yield n;
    for (const k of CHILD_KEYS) {
      const v = n[k];
      if (Array.isArray(v)) yield* elements(v);
      else if (v && typeof v === 'object') yield* elements([v]);
    }
  }
}

const parse = (html, file) => parseTemplate(html, file, { preserveWhitespaces: true }).nodes;
const staticTokens = (el) => {
  const attr = el.attributes.find((a) => a.name === 'class');
  return attr && typeof attr.value === 'string' ? attr.value.split(/\s+/).filter(Boolean) : [];
};

export function classUses(html, file = 'template.html') {
  const out = [];
  for (const el of elements(parse(html, file))) {
    const line = (el.sourceSpan?.start?.line ?? 0) + 1;
    for (const token of staticTokens(el)) out.push({ token, line, via: 'class' });
    for (const i of el.inputs) {
      if (i.type === BindingType.Class) {
        out.push({ token: i.name, line, via: '[class.x]' });
      } else if (i.name === 'class' || i.name === 'className') {
        const src = i.valueSpan ? html.slice(i.valueSpan.start.offset, i.valueSpan.end.offset) : '';
        for (const m of src.matchAll(/'([^']*)'|"([^"]*)"/g)) {
          for (const token of (m[1] ?? m[2]).split(/\s+/).filter(Boolean)) out.push({ token, line, via: '[class]' });
        }
      }
    }
  }
  return out;
}

export function expandTemplate(html, utilities, file = 'template.html') {
  const edits = [];
  for (const el of elements(parse(html, file))) {
    const own = staticTokens(el);
    const bound = el.inputs.filter((i) => i.type === BindingType.Class).map((i) => i.name);
    if (own.length === 0 && bound.length === 0) continue;
    const value = [...own, ...bound].flatMap((t) => utilities.get(t) ?? (own.includes(t) ? [t] : [])).join(' ');
    const attr = el.attributes.find((a) => a.name === 'class');
    if (attr?.valueSpan) {
      edits.push({ start: attr.valueSpan.start.offset, end: attr.valueSpan.end.offset, text: value });
    } else if (value && !el.name.startsWith(':') && el.startSourceSpan) {
      const at = el.startSourceSpan.start.offset + 1 + el.name.length;
      edits.push({ start: at, end: at, text: ` class="${value}"` });
    }
  }
  edits.sort((a, b) => b.start - a.start);
  let out = html;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}
```

Note on the `value` line: a bound `[class.x]` name with no mapping is dropped (it is not a static token the counters could judge), while an unmapped static token is kept, so a utility written straight into the template is still counted by `seal` and `layout`.

- [ ] **Step 4: Run to verify they pass**

Run: `npx vitest run --config harness/vitest.config.mjs harness/counter/bem/template.test.mjs`

Expected: PASS, 5 tests. Two places the Angular compiler may differ from this code, and what to do: if `attr.valueSpan` includes the quotes, the expected strings in the "replaces" test show doubled quotes; narrow the span by one character at each end. If `[class]` is reported with a `BindingType` other than `Property`, the `i.name === 'class'` branch still matches by name; do not add a type check.

- [ ] **Step 5: Commit**

```bash
git add harness/counter/bem/template.mjs harness/counter/bem/template.test.mjs
git commit -m "feat(counter): list template class uses and expand BEM classes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr"
```

---

### Task 5: The `bem` rules and the expanded tally

**Files:**
- Create: `harness/counter/bem/components.mjs`
- Create: `harness/counter/bem-counter.mjs`
- Test: `harness/counter/bem-counter.test.mjs`

**Interfaces:**
- Consumes: `loadClassifier`, `BEM_RE`, `blockOf` (Task 3); `parseStylesheet` (Task 3); `classUses`, `expandTemplate` (Task 4); `countTemplateSource`, `countFile`, `collectTemplateFiles`, `tally` from `./counter.mjs`; `countTemplateSource`, `layoutCountFile`, `collectLayoutFiles`, `layoutTally` from `./layout-counter.mjs`.
- Produces:
  - `BEM_KINDS: string[]`
  - `bemTally(paths: string[], opts: { root?: string, styles?: string }): Promise<{ totals: Record<string, number>, violations: { kind, file, line, detail }[] }>` (`styles` defaults to `<root>/src/styles.css`)
  - `expandedTally(paths: string[], opts: { root?: string }): { seal: { totals, violations }, layout: { totals, violations } }`
  - CLI: `node harness/counter/bem-counter.mjs --root <dir> <path...>` prints `{ bem, expanded }` as JSON.

- [ ] **Step 1: Write the failing tests**

`harness/counter/bem-counter.test.mjs`:

```js
import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { bemTally, expandedTally } from './bem-counter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const STYLES = join(here, 'fixtures', 'bem', 'styles.css');
const REF = '@reference "../../styles.css";\n';

function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), 'bem-'));
  for (const [p, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), text);
  }
  return dir;
}

const ts = (stem, body = `templateUrl: './${stem}.html',\n  styleUrl: './${stem}.css',`, extra = '') =>
  `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-${stem}',\n  ${body}\n})\nexport class X {}\n${extra}`;

const triad = (stem, html, css, file = stem) => ({
  [`app/${stem}/${file}.ts`]: ts(file),
  [`app/${stem}/${file}.html`]: html,
  [`app/${stem}/${file}.css`]: css,
});

const CLEAN_HTML = [
  '<article class="hero-card" [class.hero-card--retired]="retired">',
  '  <h2 class="hero-card__name">Name</h2>',
  '  <button hlmBtn variant="ghost" class="hero-card__retire">Retire</button>',
  '</article>',
].join('\n');
const CLEAN_CSS = `${REF}\n.hero-card { @apply grid gap-4; }\n.hero-card--retired { @apply opacity-60; }\n.hero-card__name { @apply text-lg font-semibold; }\n.hero-card__retire { @apply ms-auto; }\n`;

const bem = async (files) => {
  const dir = tree(files);
  return bemTally([dir], { root: dir, styles: STYLES });
};
const expanded = (files) => {
  const dir = tree(files);
  return expandedTally([dir], { root: dir });
};

describe('bemTally', () => {
  it('counts zero on a clean triad', async () => {
    const r = await bem(triad('hero-card', CLEAN_HTML, CLEAN_CSS));
    expect(r.violations).toEqual([]);
    expect(r.totals.all).toBe(0);
  });

  it('template-utility-class: utilities in class, [class.x] and [class], sr-only included', async () => {
    const html = '<div class="hero-card flex sm:w-48 sr-only" [class.gap-2]="x" [class]="y ? \'p-2\' : \'hero-card--on\'"></div>';
    const r = await bem(triad('hero-card', html, REF));
    expect(r.totals['template-utility-class']).toBe(5);
    expect(r.totals.all).toBe(5);
  });

  it('foreign-block: another block in the template or the stylesheet', async () => {
    const r = await bem(triad('hero-card', '<div class="hero-card roster__row"></div>', `${REF}.hero-card { @apply grid; }\n.badge-lite { @apply flex; }\n`));
    expect(r.totals['foreign-block']).toBe(2);
    expect(r.violations.map((v) => v.file).sort()).toEqual(['app/hero-card/hero-card.css', 'app/hero-card/hero-card.html']);
  });

  it('maps *.component.ts to the block without the suffix', async () => {
    const files = triad('hero-card', CLEAN_HTML, CLEAN_CSS, 'hero-card.component');
    const r = await bem(files);
    expect(r.violations).toEqual([]);
  });

  it('inline-template and inline-styles, and utilities inside the inline template still count', async () => {
    const r = await bem({ 'app/tiny/tiny.ts': ts('tiny', "template: `<p class=\"flex\">x</p>`,\n  styles: [':host { display: block }'],") });
    expect(r.totals['inline-template']).toBe(1);
    expect(r.totals['inline-styles']).toBe(1);
    expect(r.totals['template-utility-class']).toBe(1);
    expect(r.totals['missing-triad']).toBe(0);
  });

  it('missing-triad: no stylesheet, and a second component in one file', async () => {
    const r = await bem({
      'app/a/a.ts': ts('a', "templateUrl: './a.html',"),
      'app/a/a.html': '<p></p>',
      'app/b/b.ts': ts('b', "templateUrl: './b.html',\n  styleUrl: './b.css',", "\n@Component({ selector: 'app-c', templateUrl: './b.html', styleUrl: './b.css' })\nexport class C {}\n"),
      'app/b/b.html': '<p></p>',
      'app/b/b.css': REF,
    });
    expect(r.totals['missing-triad']).toBe(2);
  });

  it('broken-nesting: Sass-style &__x is counted, and its utilities are not expanded', async () => {
    const css = `${REF}.hero-card {\n  @apply grid;\n  &__name { @apply bg-red-500; }\n}\n`;
    const r = await bem(triad('hero-card', CLEAN_HTML, css));
    expect(r.totals['broken-nesting']).toBe(1);
    expect(r.violations.find((v) => v.kind === 'broken-nesting')).toMatchObject({ file: 'app/hero-card/hero-card.css', line: 4 });
    expect(expanded(triad('hero-card', CLEAN_HTML, css)).layout.totals['raw-palette-color']).toBe(0);
  });

  it('missing-reference: @apply without @reference', async () => {
    const r = await bem(triad('hero-card', '<p class="hero-card"></p>', '.hero-card { @apply grid; }\n'));
    expect(r.totals['missing-reference']).toBe(1);
  });

  it('utility-in-ts: cva strings and host class, not ordinary data strings', async () => {
    const extra = [
      "const variants = { danger: 'bg-red-500 text-white', ok: 'bg-success/15' };",
      "const hero = { name: 'Dr. Nova', role: 'Tank', status: 'on-mission', flag: 'hidden' };",
      "const id = 'h-11';",
    ].join('\n');
    const r = await bem({
      ...triad('hero-card', CLEAN_HTML, CLEAN_CSS),
      'app/hero-card/hero-card.view-model.ts': `${extra}\n`,
      'app/host/host.ts': ts('host', "templateUrl: './host.html',\n  styleUrl: './host.css',\n  host: { class: 'flex gap-2' },"),
      'app/host/host.html': '<p></p>',
      'app/host/host.css': REF,
    });
    const details = r.violations.filter((v) => v.kind === 'utility-in-ts').map((v) => v.detail);
    // 'h-11' is a real utility (height) used as data: a known false positive, kept
    // visible by carrying the literal in detail rather than special-cased away.
    expect(details.sort()).toEqual(['bg-red-500 text-white', 'bg-success/15', 'h-11', 'host class: flex gap-2']);
  });

  it('ignores spec files and import paths', async () => {
    const r = await bem({
      ...triad('hero-card', CLEAN_HTML, CLEAN_CSS),
      'app/hero-card/hero-card.spec.ts': "expect(el.className).toBe('flex gap-2');\n",
      'app/x.ts': "import { a } from 'flex-gap';\nexport const b = 1;\n",
    });
    expect(r.totals.all).toBe(0);
  });

  it('is deterministic', async () => {
    const files = triad('hero-card', '<div class="flex hero-card roster__x"></div>', `${REF}.other { @apply flex; }\n`);
    const dir = tree(files);
    const a = JSON.stringify(await bemTally([dir], { root: dir, styles: STYLES }));
    const b = JSON.stringify(await bemTally([dir], { root: dir, styles: STYLES }));
    expect(a).toBe(b);
  });
});

describe('expandedTally: planted violations hidden behind BEM', () => {
  it('counts zero on a clean triad', () => {
    const r = expanded(triad('hero-card', CLEAN_HTML, CLEAN_CSS));
    expect(r.seal.totals.all).toBe(0);
    expect(r.layout.totals.all).toBe(0);
  });

  it('sees a raw palette color applied to a primitive, at the template line', () => {
    const css = `${REF}.hero-card__retire { @apply bg-red-500; }\n`;
    const r = expanded(triad('hero-card', CLEAN_HTML, css));
    expect(r.layout.totals['raw-palette-color']).toBe(1);
    expect(r.layout.violations[0]).toMatchObject({ file: 'app/hero-card/hero-card.html', line: 3 });
    expect(r.seal.totals['appearance-on-primitive']).toBeGreaterThanOrEqual(1);
  });

  it('sees space-* and a hover-only palette color', () => {
    const css = `${REF}.hero-card { @apply space-y-4; }\n.hero-card__name {\n  &:hover { @apply text-gray-700; }\n}\n`;
    const r = expanded(triad('hero-card', CLEAN_HTML, css));
    expect(r.layout.totals['space-utility']).toBe(1);
    expect(r.layout.totals['raw-palette-color']).toBe(1);
  });

  it('sees a row of flex columns built from BEM classes', () => {
    const html = '<div class="hero-card">\n  <div class="hero-card__col">a</div>\n  <div class="hero-card__col">b</div>\n</div>';
    const css = `${REF}.hero-card { @apply flex; }\n.hero-card__col { @apply flex flex-col; }\n`;
    const r = expanded(triad('hero-card', html, css));
    expect(r.layout.totals['nested-flex-grid']).toBe(1);
  });

  it('still counts a utility written straight into the template', () => {
    const r = expanded(triad('hero-card', '<p class="hero-card bg-blue-50"></p>', REF));
    expect(r.layout.totals['raw-palette-color']).toBe(1);
  });

  it('counts inline templates the series 1 way', () => {
    const r = expanded({ 'app/tiny/tiny.ts': ts('tiny', 'template: `<p class="bg-blue-50">x</p>`,') });
    expect(r.layout.totals['raw-palette-color']).toBe(1);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run --config harness/vitest.config.mjs harness/counter/bem-counter.test.mjs`

Expected: FAIL, cannot find module `./bem-counter.mjs`.

- [ ] **Step 3: Implement `components.mjs`**

```js
// Reads the @Component decorators in a .ts file, and the string literals that
// could be class lists. Strings inside a decorator (selector, paths, inline
// template) and module specifiers are not class lists and are skipped; a
// decorator's host `class` is returned separately, because it is always one.
import ts from 'typescript';

export const stringValue = (n) => (n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : null);

export const stringList = (n) => {
  if (!n) return [];
  if (ts.isArrayLiteralExpression(n)) return n.elements.map(stringValue).filter((s) => s != null);
  const s = stringValue(n);
  return s == null ? [] : [s];
};

export function readComponents(path, text) {
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const lineOf = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const skip = new Set();
  const markSkip = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) skip.add(node);
    ts.forEachChild(node, markSkip);
  };
  const components = [];
  const hostClasses = [];
  const strings = [];
  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) markSkip(node);
    if (
      ts.isDecorator(node) &&
      ts.isCallExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'Component'
    ) {
      markSkip(node);
      const arg = node.expression.arguments[0];
      const props = {};
      if (arg && ts.isObjectLiteralExpression(arg)) {
        for (const p of arg.properties) {
          if (ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) props[p.name.text] = p.initializer;
        }
      }
      if (props.host && ts.isObjectLiteralExpression(props.host)) {
        for (const p of props.host.properties) {
          const value = ts.isPropertyAssignment(p) ? stringValue(p.initializer) : null;
          if (value != null && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === 'class') {
            hostClasses.push({ text: value, line: lineOf(p) });
          }
        }
      }
      components.push({ line: lineOf(node), props, templateLine: props.template ? lineOf(props.template) : null });
    }
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !skip.has(node)) {
      strings.push({ text: node.text, line: lineOf(node) });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { components, hostClasses, strings };
}
```

- [ ] **Step 4: Implement `bem-counter.mjs`**

```js
// The BEM plane (series 2, harness/bem-house-style-spec.md). Two exports:
//
// bemTally: the eight rules that are new in series 2 (BEM-only templates, one
// block per component, the file triad, @reference, no Sass-style nesting, no
// utilities in TS).
//
// expandedTally: the series 1 seal and layout checks, run on each template
// after its BEM classes are replaced by the utilities its stylesheet applies.
// Moving `bg-red-500` from the template into `@apply` must not hide it.
//
// Counter side only: like counter.mjs, this imports nothing the gates import.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as seal from './counter.mjs';
import * as layout from './layout-counter.mjs';
import { loadClassifier, BEM_RE, blockOf } from './bem/classify.mjs';
import { parseStylesheet } from './bem/stylesheet.mjs';
import { classUses, expandTemplate } from './bem/template.mjs';
import { readComponents, stringValue, stringList } from './bem/components.mjs';

export const BEM_KINDS = [
  'template-utility-class',
  'foreign-block',
  'inline-template',
  'inline-styles',
  'missing-triad',
  'missing-reference',
  'broken-nesting',
  'utility-in-ts',
];

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.angular', 'coverage']);
const norm = (p) => p.replaceAll('\\', '/');

function walkFiles(paths, exts) {
  const out = [];
  const visit = (p) => {
    if (statSync(p).isDirectory()) {
      for (const e of readdirSync(p)) if (!SKIP_DIRS.has(e)) visit(join(p, e));
    } else if (exts.some((x) => p.endsWith(x))) out.push(p);
  };
  for (const p of paths) visit(p);
  return out.sort();
}

const byFileLineKind = (a, b) =>
  (a.file < b.file ? -1 : a.file > b.file ? 1 : 0) || a.line - b.line || (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0);

function withTotals(zero, violations) {
  const totals = { ...zero };
  for (const v of violations) {
    totals[v.kind] += 1;
    totals.all += 1;
  }
  violations.sort(byFileLineKind);
  return { totals, violations };
}

// A string that reads as a class list: two or more tokens that are all
// utilities, or one utility with a separator in it (`w-full`, `sm:x`, `a/50`).
// A lone bare word (`hidden`, `block`) is too often ordinary data.
function looksLikeClasses(text, isUtility) {
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) return tokens.every(isUtility);
  return tokens.length === 1 && isUtility(tokens[0]) && /[-:/[]/.test(tokens[0]);
}

export async function bemTally(paths, { root, styles } = {}) {
  const { isUtility } = await loadClassifier(styles ?? join(root, 'src', 'styles.css'));
  const rel = (p) => norm(root ? relative(root, p) : p);
  const v = [];
  const add = (kind, file, line, detail) => v.push({ kind, file: rel(file), line, detail });

  const checkUses = (uses, file, block, lineOffset = 0) => {
    for (const u of uses) {
      if (isUtility(u.token) || !BEM_RE.test(u.token)) add('template-utility-class', file, u.line + lineOffset, `${u.via} ${u.token}`);
      else if (blockOf(u.token) !== block) add('foreign-block', file, u.line + lineOffset, `${u.token} in ${block}`);
    }
  };

  for (const tsPath of walkFiles(paths, ['.ts']).filter((p) => !p.endsWith('.spec.ts'))) {
    const text = readFileSync(tsPath, 'utf8');
    const { components, hostClasses, strings } = readComponents(tsPath, text);
    const dir = dirname(tsPath);
    const fileStem = basename(tsPath, '.ts');
    const block = fileStem.replace(/\.component$/, '');
    const htmlPath = join(dir, `${fileStem}.html`);
    const cssPath = join(dir, `${fileStem}.css`);

    components.forEach((c, index) => {
      const p = c.props;
      const inlineTemplate = stringValue(p.template);
      if (p.template) add('inline-template', tsPath, c.line, 'template: in @Component');
      if (p.styles) add('inline-styles', tsPath, c.line, 'styles: in @Component');
      if (inlineTemplate != null) checkUses(classUses(inlineTemplate, rel(tsPath)), tsPath, block, c.templateLine - 1);
      if (index > 0) {
        add('missing-triad', tsPath, c.line, 'a second @Component in one file cannot own a triad');
        return;
      }
      const templateOk = stringValue(p.templateUrl) === `./${fileStem}.html` && existsSync(htmlPath);
      const styleUrls = [...stringList(p.styleUrl), ...stringList(p.styleUrls)];
      const styleOk = styleUrls.length === 1 && styleUrls[0] === `./${fileStem}.css` && existsSync(cssPath);
      if (!p.template && !templateOk) add('missing-triad', tsPath, c.line, `expected templateUrl './${fileStem}.html'`);
      if (!p.styles && !styleOk) add('missing-triad', tsPath, c.line, `expected styleUrl './${fileStem}.css'`);
      if (templateOk) checkUses(classUses(readFileSync(htmlPath, 'utf8'), rel(htmlPath)), htmlPath, block);
      if (styleOk) {
        const s = parseStylesheet(readFileSync(cssPath, 'utf8'), cssPath);
        for (const { cls, line } of s.selectorClasses) {
          if (blockOf(cls) !== block) add('foreign-block', cssPath, line, `.${cls} in ${fileStem}.css`);
        }
        if (s.hasApply && !s.hasReference) add('missing-reference', cssPath, 1, '@apply without @reference');
        for (const b of s.brokenNesting) add('broken-nesting', cssPath, b.line, `${b.selector} appends to & (Sass only)`);
      }
    });

    for (const h of hostClasses) {
      if (h.text.split(/\s+/).some((t) => t && isUtility(t))) add('utility-in-ts', tsPath, h.line, `host class: ${h.text}`);
    }
    for (const s of strings) {
      if (looksLikeClasses(s.text, isUtility)) add('utility-in-ts', tsPath, s.line, s.text);
    }
  }

  return withTotals(Object.fromEntries([...BEM_KINDS.map((k) => [k, 0]), ['all', 0]]), v);
}

export function expandedTally(paths, { root } = {}) {
  const rel = (p) => norm(root ? relative(root, p) : p);
  const siblingCss = (f) => {
    if (!f.endsWith('.html')) return null;
    const css = f.replace(/\.html$/, '.css');
    return existsSync(css) ? css : null;
  };
  const expand = (html, css) =>
    expandTemplate(readFileSync(html, 'utf8'), parseStylesheet(readFileSync(css, 'utf8'), css).utilities, rel(html));
  const filesOf = (collect) => paths.flatMap((p) => (statSync(p).isDirectory() ? collect(p) : [p]));

  const sealV = [];
  for (const f of filesOf(seal.collectTemplateFiles)) {
    const css = siblingCss(f);
    sealV.push(...(css ? seal.countTemplateSource(expand(f, css), { file: rel(f) }) : seal.countFile(f, { root })));
  }
  const layoutV = [];
  for (const f of filesOf(layout.collectLayoutFiles)) {
    const css = siblingCss(f);
    layoutV.push(...(css ? layout.countTemplateSource(expand(f, css), { file: rel(f) }) : layout.layoutCountFile(f, { root })));
  }
  return {
    seal: withTotals(seal.tally([]).totals, sealV),
    layout: withTotals(layout.layoutTally([]).totals, layoutV),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  let root;
  const ri = args.indexOf('--root');
  if (ri >= 0) {
    root = args[ri + 1];
    args.splice(ri, 2);
  }
  if (args.length === 0) {
    process.stderr.write('usage: node bem-counter.mjs [--root <dir>] <path...>\n');
    process.exit(2);
  }
  const bem = await bemTally(args, { root: root ?? process.cwd() });
  process.stdout.write(JSON.stringify({ bem, expanded: expandedTally(args, { root }) }, null, 2) + '\n');
}
```

- [ ] **Step 5: Run to verify they pass**

Run: `npx vitest run --config harness/vitest.config.mjs harness/counter/bem-counter.test.mjs`

Expected: PASS, 17 tests. If `seal.tally([])` or `layout.layoutTally([])` throws on an empty list, build the zero totals by calling them on an empty temporary directory instead; do not export new functions from `counter.mjs` or `layout-counter.mjs`.

- [ ] **Step 6: Run the whole harness suite**

Run: `npm run test:harness`

Expected: every test passes, including all series 1 counter tests unchanged.

- [ ] **Step 7: Commit**

```bash
git add harness/counter/bem/components.mjs harness/counter/bem-counter.mjs harness/counter/bem-counter.test.mjs
git commit -m "feat(counter): add the bem family and the expanded seal and layout tally

Series 2 moves utilities into @apply, which hides them from the series 1
template checks. The expanded tally puts them back before counting; the
bem family counts what is new: BEM-only markup, one block per component,
the triad, @reference, and utilities in TypeScript.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr"
```

---

### Task 6: Substrate baseline, then the mod as series 2

**Files:**
- Modify: `C:/Users/psati/.claude/dev-mods/bbe683f7-6112-404d-accc-35881737d0b7/schematic-arm/bin/arm.mjs` (around lines 282-356 `preflight`, 460 `out:`, 747-756 `importCounters`, 940-953 counters, 1064-1072 per-screen, 1087-1130 meta)
- Modify: `.../schematic-arm/bin/arm.test.mjs`
- Modify: `.../schematic-arm/arm.config.json`

**Interfaces:**
- Consumes: `bemTally`, `expandedTally` (Task 5) from `<root>/harness/counter/bem-counter.mjs`.
- Produces: `export function outDirFor(root, cfg, condition, runId): string`; meta fields `counterMode` and `counterTotals.bem`; evidence file `bem-tally.json`.

- [ ] **Step 1: Prove the substrate counts zero**

```bash
cd D:/Repos/angular-jig
node harness/counter/bem-counter.mjs --root D:/Repos/aj-s2 D:/Repos/aj-s2/src > C:/Users/psati/AppData/Local/Temp/claude/D--Repos-blog/bbe683f7-6112-404d-accc-35881737d0b7/scratchpad/s2-baseline.json
node -e "const r=require('C:/Users/psati/AppData/Local/Temp/claude/D--Repos-blog/bbe683f7-6112-404d-accc-35881737d0b7/scratchpad/s2-baseline.json'); console.log(r.bem.totals.all, r.expanded.seal.totals.all, r.expanded.layout.totals.all, JSON.stringify(r.bem.violations))"
```

Expected: `0 0 0 []`. This also proves the classifier loads the real `src/styles.css` (spartan preset import included). If it fails to load, stop: the mod would record a measurement error on every run.

- [ ] **Step 2: Write the failing mod test**

Append to `bin/arm.test.mjs`, and add `outDirFor` to its import list from `./arm.mjs`:

```js
test('outDirFor keeps series 1 paths and nests later series under s<N>', () => {
  const root = 'D:/r';
  assert.equal(outDirFor(root, {}, 'gate-off', 'x').replaceAll('\\', '/'), 'D:/r/experiments/schematic-arm/gate-off/x');
  assert.equal(outDirFor(root, { series: 1 }, 'gate-on', 'y').replaceAll('\\', '/'), 'D:/r/experiments/schematic-arm/gate-on/y');
  assert.equal(outDirFor(root, { series: 2 }, 'schematic', 'z').replaceAll('\\', '/'), 'D:/r/experiments/schematic-arm/s2/schematic/z');
});
```

Run: `cd C:/Users/psati/.claude/dev-mods/bbe683f7-6112-404d-accc-35881737d0b7/schematic-arm && node --test bin/arm.test.mjs`

Expected: FAIL, `outDirFor` is not exported.

- [ ] **Step 3: Implement the mod changes**

Add next to `screenOf`:

```js
// Series 1 evidence keeps the paths it was committed under; each later series
// gets its own folder so the two can never mix.
export function outDirFor(root, cfg, condition, runId) {
  const series = cfg.series ?? 1;
  return series === 1
    ? join(root, 'experiments', 'schematic-arm', condition, runId)
    : join(root, 'experiments', 'schematic-arm', `s${series}`, condition, runId);
}
```

In `cmdPrepare`, replace `out: join(root, 'experiments', 'schematic-arm', condition, runId),` with:

```js
    out: outDirFor(root, cfg, condition, runId),
```

In `preflight`, after the `HEAD has no harness/counter` check:

```js
  if ((cfg.series ?? 1) >= 2 && !gitOk(root, ['cat-file', '-e', 'HEAD:harness/counter/bem-counter.mjs'])) {
    problems.push('series 2 measures with harness/counter/bem-counter.mjs, and HEAD has none');
  }
```

Replace `importCounters` with:

```js
async function importCounters(root) {
  const at = (p) => pathToFileURL(join(root, 'harness', 'counter', p)).href;
  const [seal, layout, shape, freeloader] = await Promise.all([
    import(at('counter.mjs')),
    import(at('layout-counter.mjs')),
    import(at('component-shape-counter.mjs')),
    import(at('freeloader-counter.mjs')),
  ]);
  const bem = existsSync(join(root, 'harness', 'counter', 'bem-counter.mjs')) ? await import(at('bem-counter.mjs')) : null;
  return {
    seal: seal.tally,
    layout: layout.layoutTally,
    shape: shape.tally,
    freeloader: freeloader.tally,
    bem: bem?.bemTally ?? null,
    expanded: bem?.expandedTally ?? null,
  };
}
```

In `cmdFinish`, replace the body of the `measure('counters', ...)` callback with:

```js
      const counters = await importCounters(root);
      const src = join(root, 'src');
      const series = state.config.series ?? 1;
      const t = {
        shape: counters.shape([src], { root }),
        freeloader: counters.freeloader([src], { root }),
      };
      if (series >= 2) {
        // Series 2 utilities live in @apply; the template-text counters would
        // see none of them. Seal and layout are counted on expanded templates.
        const ex = counters.expanded([src], { root });
        t.seal = ex.seal;
        t.layout = ex.layout;
        t.bem = await counters.bem([src], { root });
        writeJson(join(work, 'bem-tally.json'), t.bem);
      } else {
        t.seal = counters.seal([src], { root });
        t.layout = counters.layout([src], { root });
      }
      writeJson(join(work, 'tally.json'), t.seal);
      writeJson(join(work, 'layout-tally.json'), t.layout);
      writeJson(join(work, 'shape-tally.json'), t.shape);
      writeJson(join(work, 'freeloader-tally.json'), t.freeloader);
      return t;
```

In the per-screen block (the object with `seal: groupByScreen(tallies.seal.violations, root)`), add after the `freeloader` line:

```js
          ...(tallies.bem ? { bem: groupByScreen(tallies.bem.violations, root) } : {}),
```

In the meta object, replace the `counterTotals` entry with:

```js
    counterMode: (state.config.series ?? 1) >= 2 ? 'expanded' : 'template-text',
    counterTotals: tallies
      ? {
          seal: tallies.seal.totals,
          layout: tallies.layout.totals,
          shape: tallies.shape.totals,
          freeloader: tallies.freeloader.totals,
          ...(tallies.bem ? { bem: tallies.bem.totals } : {}),
        }
      : null,
```

and append to `differencesFromCapstoneDriver`:

```js
      ...((state.config.series ?? 1) >= 2
        ? ['series 2: seal and layout counted on templates expanded with their stylesheet @apply utilities, plus the bem family (harness/bem-house-style-spec.md)']
        : []),
```

- [ ] **Step 4: Update the config**

`arm.config.json`: add `"series": 2,` after `"model"`, set `"substrate": "substrate/schematic-arm-2"`, and add `".claude/skills/house-style/SKILL.md"` to the top-level `requiredOnSubstrate`. Extend `$comment` with: `Series 2 (2026-10-16) is the BEM house style; series 1 evidence stays under experiments/schematic-arm/<condition>/.`

- [ ] **Step 5: Run the mod tests and a preflight**

```bash
cd C:/Users/psati/.claude/dev-mods/bbe683f7-6112-404d-accc-35881737d0b7/schematic-arm
node --test bin/arm.test.mjs
cd D:/Repos/angular-jig && node C:/Users/psati/.claude/dev-mods/bbe683f7-6112-404d-accc-35881737d0b7/schematic-arm/bin/arm.mjs check --condition gate-off --trial 1
```

Expected: 6 tests pass. The check reports no problems (if the check subcommand takes its arguments in another form, read `parseArgs` and `cmdCheck` and use that form; do not change them).

- [ ] **Step 6: Commit the measurement branch**

The mod is not under git. Commit only angular-jig:

```bash
cd D:/Repos/angular-jig
git status --short
```

Expected: clean (Tasks 3 to 5 already committed). Nothing to commit here; the mod changes are recorded by the `configSha256` and the `differencesFromCapstoneDriver` line in every series 2 meta.

---

### Task 7: The gate-off pilot

**Files:**
- Create (by the mod): `experiments/schematic-arm/s2/gate-off/<runId>/`
- Create: `experiments/schematic-arm/s2/pilot-readout.md`

- [ ] **Step 1: Hand the run to the owner**

The agent cannot type slash commands. With `D:/Repos/angular-jig` on `research/schematic-arm` and a clean tree, the owner runs:

```
/arm start gate-off 1
```

Do not edit the mod or switch branches in `D:/Repos/angular-jig` until it finishes.

- [ ] **Step 2: Read the result**

```bash
cd D:/Repos/angular-jig
d=$(ls -d experiments/schematic-arm/s2/gate-off/*/ | tail -1)
node -e "const m=require('./'+process.argv[1]+'meta.json'); console.log(m.ok, m.voidReasons, m.counterMode, JSON.stringify(Object.fromEntries(Object.entries(m.counterTotals).map(([k,v])=>[k,v.all]))), m.cost.costUsd, m.cost.numTurns)" "$d"
node -e "const t=require('./'+process.argv[1]+'bem-tally.json'); console.log(JSON.stringify(t.totals)); for (const v of t.violations.slice(0,40)) console.log(v.kind, v.file+':'+v.line, v.detail)" "$d"
```

Expected: `ok` true and `counterMode` `expanded`. If the run is void, report the void reasons and stop.

- [ ] **Step 3: Apply the spec's decision rule and write it down**

Write `experiments/schematic-arm/s2/pilot-readout.md` with: the run id and commit, cost and turns, each family's total, the `bem` totals by kind, the 10 most frequent violation details, and the decision:

- any `bem`, expanded `seal` or expanded `layout` violation: "Drift present. Phase 2 (gates and schematic) proceeds."
- all zero: "No drift. Stop before phase 2 and rethink the rule."

- [ ] **Step 4: Commit the evidence and the readout**

```bash
git add experiments/schematic-arm/s2
git commit -m "research(schematic-arm): series 2 gate-off pilot

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr"
```

- [ ] **Step 5: Final review**

Before reporting phase B done, run the final Opus review over `research/schematic-arm` (Tasks 3 to 7) and `substrate/schematic-arm-2` (Tasks 1 and 2) against the spec, plus the mod diff. The review checks one thing above all: that a violation of R1 to R6 written anywhere in `src/app` is counted by at least one counter.
