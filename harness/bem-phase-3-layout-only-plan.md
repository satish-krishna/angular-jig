# Phase 3 layout-only app stylesheets - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make app stylesheets layout-only (R7, R7a), give the substrate the primitives that make that possible (spartan typography, `hlmIcon`, success and warning tokens), enforce it with a gate-on-only hook on file edits and on Bash, count it with an independent counter kind, prove the two agree on the eight phase 2 trees, register it as series 3, and run the first discovery round.

**Architecture:** A new substrate branch `substrate/schematic-arm-3` (worktree `D:/Repos/aj-s3`) carries the primitives, the rewritten skill, the rule doc and the gate. The gate is a plain module (`harness/gate/app-css/`), not an eslint rule: R7 judges a stylesheet by itself, because the block root is known from the file stem. Two hooks call it: `check-app-css.mjs` on `Write|Edit|MultiEdit`, and `check-src-after-bash.mjs` on `Bash`, which checks every file git reports as changed under `src/` and also runs the phase 2 applied-appearance rule on them. The counter gains one kind, `appearance-in-app-css`, written from the spec by a different implementer, on `research/schematic-arm`.

**Tech Stack:** TypeScript gate modules run by node 24 type stripping (as every gate module here), `postcss`, `@angular/compiler` `parseTemplate`, `@tailwindcss/node` design system, eslint with `angular-eslint` (phase 2 rule), vitest (`npm run test:harness`), spartan CLI, the schematic-arm mod.

**Spec:** `harness/bem-phase-3-layout-only-spec.md` (branch `research/schematic-arm`). Read it before any task.

## Global Constraints

- Substrate work lives on `substrate/schematic-arm-3` (worktree `D:/Repos/aj-s3`, created in Task 1 from `substrate/schematic-arm-2`); settings, counter, evidence and readouts live on `research/schematic-arm` (`D:/Repos/angular-jig`). Nothing is committed to `main`. `substrate/schematic-arm-2` is not changed.
- The gate shares no code with `harness/counter/` (no import, no copy, and the counter implementer does not read the gate's source). Gate-internal sharing under `harness/gate/` is allowed. Tailwind's own design system may be asked by both engines: it is the oracle for "is this token a utility", not our code.
- The new checks are NOT added to the repo's `eslint.config.mjs`, `npm run lint`, or any gate-off settings. They exist only in the two new hooks, registered only by `harness/gate/s3-gate-on.settings.json`.
- R7 layout list, verbatim from the spec, after stripping variant prefixes (split on `:` at bracket depth 0, keep the last segment), a leading `-`, and a leading or trailing `!`:
  - display and box: `block`, `inline`, `inline-block`, `flex`, `inline-flex`, `grid`, `inline-grid`, `contents`, `hidden`, `sr-only`, `not-sr-only`, `box-border`, `box-content`;
  - flex and grid: `flex-*`, `grow*`, `shrink*`, `basis-*`, `order-*`, `grid-cols-*`, `grid-rows-*`, `col-*`, `row-*`, `auto-cols-*`, `auto-rows-*`, `grid-flow-*`, `items-*`, `justify-*`, `content-*` (alignment values only: `normal|center|start|end|between|around|evenly|baseline|stretch`), `self-*`, `place-*`, `gap-*`;
  - sizing: `w-*`, `h-*`, `size-*`, `min-w-*`, `min-h-*`, `max-w-*`, `max-h-*`, `aspect-*`;
  - margin: `m-*`, `mx-*`, `my-*`, `mt-*`, `mr-*`, `mb-*`, `ml-*`, `ms-*`, `me-*`;
  - position: `static`, `relative`, `absolute`, `fixed`, `sticky`, `inset-*`, `top-*`, `right-*`, `bottom-*`, `left-*`, `start-*`, `end-*`, `z-*`;
  - overflow and flow: `overflow-*`, `overscroll-*`, `truncate`, `text-ellipsis`, `text-clip`, `whitespace-*`, `break-*`, `text-left`, `text-center`, `text-right`, `text-start`, `text-end`, `text-justify`, `object-*`, `isolate`, `container`;
  - padding (`p-*`, `px-*`, `py-*`, `pt-*`, `pr-*`, `pb-*`, `pl-*`, `ps-*`, `pe-*`) only at the block root.
- R7 layout properties for plain declarations: `display`, `flex*`, `grid*`, `gap`, `row-gap`, `column-gap`, `width`, `height`, `min-width`, `min-height`, `max-width`, `max-height`, `aspect-ratio`, `margin*`, `position`, `inset*`, `top`, `right`, `bottom`, `left`, `z-index`, `overflow*`, `text-overflow`, `white-space`, `word-break`, `overflow-wrap`, `text-align`, `object-fit`, `object-position`, `isolation`, `order`, `align-*`, `justify-*`, `place-*`; `padding*` only at the block root. Every other property is appearance, custom properties (`--x`) included.
- Owner ruling (2026-10-16): `cursor-*`, `pointer-events-*`, `select-*`, `transition*`, `opacity-*` and `tabular-nums` stay appearance, as the list implies.
- Block root (R7a): a rule whose every resolved selector is exactly `.<stem>`, `.<stem>--<modifier>`, or `:host`, where `<stem>` is the stylesheet's file name without `.css` and without a trailing `.component`. `src/styles.css` has no block root.
- `src/styles.css` exemptions: declarations and `@apply` inside a rule whose resolved selector list is exactly `:root` or `:root.dark` (any property: this is the theme, and the substrate's `:root` already sets `color-scheme`); anything inside `@theme`; rules inside `@layer base` whose selectors name no class. Everything else in `src/styles.css`, including `@utility` bodies, is judged with no block root. Ruling: the spec says "custom property declarations inside `:root`"; the substrate's own `:root { color-scheme: light; }` would fail that, and the spec also requires the substrate to pass its own rule, so the exemption is any declaration in those two theme rules.
- Ruling on `hlmIcon`: it has a `tone` input only. The spec also names a `size` input, but `ng-icon` already owns an input called `size`, and a second directive input of the same name on the same element would feed both. Icons are sized by `ng-icon`'s own `size` attribute or by layout (`size-*` is on the layout list).
- Ruling on tones: the substrate has no success or warning token, so Task 1 adds `--success`, `--success-foreground`, `--warning`, `--warning-foreground` to `:root` and `:root.dark` and maps them in `@theme inline`. Every phase 2 run added these itself in stage 1; giving them up front keeps the tones real.
- Ruling on the spec's "the counter also reports variants added and directive uses": these are tabulated in the readout from each run's `diff.patch` and final templates (Task 8), not computed by the counter, because the owner ruled that nothing measures `libs/ui` as a counter does. Counting variants added in a diff is reporting, not policing.
- One violation per (rule, utility or property), in both engines. A Sass-style concatenated selector (`&__x`) styles nothing and is not judged by R7 (the counter's `broken-nesting` covers it).
- Never `--no-verify`. Commit footer exactly: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr`.
- Markdown: one line per paragraph, US English, no em dashes. Rule docs are LF (`.gitattributes` pins `harness/rules/*.md`).
- Phase 2 trial code never goes onto the substrate: Task 6 reads those trees from `D:/Repos/angular-jig/experiments/` in a scratch script.
- No `/arm` run may be active while the mod is edited or branches are switched in `D:/Repos/angular-jig`.

## Review Focus

1. A variant prefix whose arbitrary value contains a colon (`supports-[display:grid]:grid`, `[&:nth-child(2)]:mt-2`) must strip to its base utility, and an arbitrary property (`[color:red]`) must be appearance. Pinned in Task 3.
2. Block root exactness: `p-6` passes on `.dashboard`, `.dashboard--compact`, `:host`, and on `.dashboard` inside `@media`; it fails on `.dashboard:hover`, `.dashboard .x`, `.dashboard__panel`, and on any rule in `src/styles.css`. Pinned in Task 3.
3. The global stylesheet: the substrate's own `src/styles.css` passes; `.x { @apply text-sm; }` in it fails; `@utility pad { padding: 1rem; }` fails; `@layer base { body { @apply bg-background; } }` passes. Pinned in Task 3.
4. The Bash hook on a clean tree, a deleted file, a renamed file and an untracked directory must not crash, and must fail closed when git itself fails. Pinned in Task 4.
5. An unparseable stylesheet must block, not crash or pass, in both hooks. Pinned in Tasks 3 and 4.

---

## File Structure

On `substrate/schematic-arm-3` (`D:/Repos/aj-s3`):

- Modify `src/styles.css`: success and warning tokens.
- Create `libs/ui/typography/` (spartan CLI) and `libs/ui/icon/` (`HlmIcon`, `iconVariants`).
- Modify `tsconfig.json`: path aliases for both.
- Modify `harness/gate/rules/primitive-vocabulary.ts`: typography directives and `hlmIcon`.
- Create `harness/gate/icon-variants.test.mjs`.
- Modify `.claude/skills/house-style/SKILL.md` and `.agents/skills/house-style/SKILL.md` (byte-identical).
- Create `harness/rules/app-css-layout-only.md`.
- Create `harness/gate/app-css/layout-only.ts`, `harness/gate/app-css/template-utilities.ts`, `harness/gate/app-css/index.mjs`.
- Create `harness/gate/app-css-gate.test.mjs`.
- Modify `harness/gate/rules/applied-utilities.ts`: export `resolveSelectors` (rename of `resolve`, no behavior change).
- Modify `tsconfig.harness.json`: include `harness/gate/app-css/**/*.ts`.
- Create `.claude/hooks/check-app-css.mjs`, `.claude/hooks/check-src-after-bash.mjs`.
- Create `harness/gate/app-css-hook.test.mjs`.

On `research/schematic-arm` (`D:/Repos/angular-jig`):

- Create `harness/counter/bem/app-css.mjs`, `harness/counter/bem/app-css.test.mjs`.
- Modify `harness/counter/bem-counter.mjs` (new kind), `harness/counter/counter.mjs` (primitive list).
- Create `harness/gate/s3-gate-on.settings.json`.
- Create `experiments/schematic-arm/s2/app-css-rescore.md` (Task 6) and `experiments/schematic-arm/s3/round-1-readout.md` (Task 8).

Mod (`C:/Users/psati/.claude/dev-mods/bbe683f7-6112-404d-accc-35881737d0b7/schematic-arm/`, not git): `arm.config.json`.

---

### Task 1: Substrate branch and the new primitives

**Files:**
- Create: worktree `D:/Repos/aj-s3` on new branch `substrate/schematic-arm-3`
- Modify: `src/styles.css`, `tsconfig.json`, `harness/gate/rules/primitive-vocabulary.ts`
- Create: `libs/ui/typography/**`, `libs/ui/icon/src/index.ts`, `libs/ui/icon/src/lib/hlm-icon.ts`, `libs/ui/icon/src/lib/icon-variants.ts`
- Test: `harness/gate/icon-variants.test.mjs`

**Interfaces:**
- Produces: import paths `@spartan-ng/helm/typography` (exports `HlmTypographyImports` or the CLI's equivalent; record the exact export names in the report) and `@spartan-ng/helm/icon` (exports `HlmIcon`, `HlmIconImports`, `iconVariants`, `IconVariants`); selectors `ng-icon[hlmIcon]` and the twelve typography attributes; tokens `success`, `success-foreground`, `warning`, `warning-foreground` usable as `text-success`, `bg-warning` and so on.

- [ ] **Step 1: Create the worktree and install**

Run (Git Bash):

```bash
git -C D:/Repos/angular-jig worktree add -b substrate/schematic-arm-3 D:/Repos/aj-s3 substrate/schematic-arm-2
cd D:/Repos/aj-s3 && npm ci
```

Expected: worktree created, install succeeds.

- [ ] **Step 2: Generate the typography primitives**

Run in `D:/Repos/aj-s3`: `npx ng g @spartan-ng/cli:ui typography`. If it prompts, accept the defaults that put it in `libs/ui` (the repo's `components.json` already says `componentsPath: libs/ui`, `importAlias: @spartan-ng/helm`). Expected: `libs/ui/typography/src/lib/hlm-{h1,h2,h3,h4,p,lead,large,small,muted,code,blockquote,ul}.ts` and a `tsconfig.json` path `@spartan-ng/helm/typography`. If the CLI cannot run non-interactively, copy `node_modules/@spartan-ng/cli/src/generators/ui/libs/typography/files/` to `libs/ui/typography/src/`, drop the `.template` suffixes, resolve any template variables the same way `libs/ui/badge` shows them resolved, and add the path alias by hand. Report which way it went.

- [ ] **Step 3: Write the failing icon test**

`harness/gate/icon-variants.test.mjs`:

```js
import { describe, it, expect } from 'vitest';
import { iconVariants } from '../../libs/ui/icon/src/lib/icon-variants.ts';

describe('hlmIcon tones', () => {
  it('default tone inherits the current color', () => {
    expect(iconVariants({ tone: 'default' })).not.toMatch(/\btext-/);
  });
  it.each([
    ['muted', 'text-muted-foreground'],
    ['primary', 'text-primary'],
    ['destructive', 'text-destructive'],
    ['success', 'text-success'],
    ['warning', 'text-warning'],
  ])('%s maps to %s', (tone, cls) => {
    expect(iconVariants({ tone }).split(/\s+/)).toContain(cls);
  });
});
```

Run: `npx vitest run --config harness/vitest.config.mjs harness/gate/icon-variants.test.mjs`. Expected: FAIL, module not found.

- [ ] **Step 4: Write the icon primitive**

`libs/ui/icon/src/lib/icon-variants.ts` (kept free of Angular so the harness can import it):

```ts
import { type VariantProps, cva } from 'class-variance-authority';

export const iconVariants = cva('inline-flex shrink-0', {
  variants: {
    tone: {
      default: '',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      destructive: 'text-destructive',
      success: 'text-success',
      warning: 'text-warning',
    },
  },
  defaultVariants: { tone: 'default' },
});

export type IconVariants = VariantProps<typeof iconVariants>;
```

`libs/ui/icon/src/lib/hlm-icon.ts`:

```ts
import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { type IconVariants, iconVariants } from './icon-variants';

// An icon's color comes from its tone, never from the app stylesheet. Size it
// with ng-icon's own `size` input or with layout (`size-*`); this directive has
// no size input because ng-icon already owns that name.
@Directive({
  selector: 'ng-icon[hlmIcon]',
  host: { 'data-slot': 'icon', '[attr.data-tone]': 'tone()' },
})
export class HlmIcon {
  public readonly tone = input<IconVariants['tone']>('default');

  constructor() {
    classes(() => iconVariants({ tone: this.tone() }));
  }
}
```

`libs/ui/icon/src/index.ts`:

```ts
import { HlmIcon } from './lib/hlm-icon';

export * from './lib/hlm-icon';
export * from './lib/icon-variants';

export const HlmIconImports = [HlmIcon] as const;
```

Add to `tsconfig.json` `paths`, next to the other helm entries: `"@spartan-ng/helm/icon": ["./libs/ui/icon/src/index.ts"]`.

- [ ] **Step 5: Add the tokens**

In `src/styles.css`, inside the existing `:root` block add:

```css
  --success: oklch(0.6 0.15 150);
  --success-foreground: oklch(0.98 0 0);
  --warning: oklch(0.75 0.15 75);
  --warning-foreground: oklch(0.2 0 0);
```

inside `:root.dark` add:

```css
  --success: oklch(0.7 0.15 150);
  --success-foreground: oklch(0.15 0 0);
  --warning: oklch(0.8 0.15 75);
  --warning-foreground: oklch(0.15 0 0);
```

and after the `:root.dark` block add:

```css
@theme inline {
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

- [ ] **Step 6: Add the primitives to the gate vocabulary**

In `harness/gate/rules/primitive-vocabulary.ts`, add to `PRIMITIVE_ATTRS`: `'hlmH1'`, `'hlmH2'`, `'hlmH3'`, `'hlmH4'`, `'hlmP'`, `'hlmLead'`, `'hlmLarge'`, `'hlmSmall'`, `'hlmMuted'`, `'hlmCode'`, `'hlmBlockquote'`, `'hlmUl'`, `'hlmIcon'`, using the exact attribute names the generated typography selectors declare (check each `selector:`). Update the header comment: `ng-icon` alone is still not a primitive; `ng-icon[hlmIcon]` is.

- [ ] **Step 7: Verify**

Run: `npx vitest run --config harness/vitest.config.mjs harness/gate/icon-variants.test.mjs` (PASS, 6 tests), `npm run typecheck:harness` (no errors), `npx ng build` (succeeds). Then prove both primitives compile in a template: temporarily put `<h1 hlmH2>x</h1><ng-icon hlmIcon tone="success" name="lucideShield" />` into `src/app/app.html` with the imports and `provideIcons({ lucideShield })` in `app.ts`, run `npx ng build`, then revert both files with `git checkout -- src/app/app.html src/app/app.ts`. Expected: build succeeds; `git status --short` lists only this task's intended files.

- [ ] **Step 8: Commit**

```bash
git add libs/ui/typography libs/ui/icon tsconfig.json src/styles.css harness/gate/rules/primitive-vocabulary.ts harness/gate/icon-variants.test.mjs
git commit -F- <<'EOF'
feat(ui): add typography, hlmIcon tones and status tokens

Layout-only app stylesheets need somewhere for text, icon color and status color to come from.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr
EOF
```

---

### Task 2: The skill and the rule doc

**Files:**
- Modify: `.claude/skills/house-style/SKILL.md`, `.agents/skills/house-style/SKILL.md`
- Create: `harness/rules/app-css-layout-only.md`

**Interfaces:**
- Consumes: Task 1's selectors and import paths.
- Produces: the rule doc path `harness/rules/app-css-layout-only.md` with a `## Agent guidance` section (Task 4's hooks splice it).

All edits in `D:/Repos/aj-s3`. Edit the `.claude` copy, then copy it byte for byte to `.agents`.

- [ ] **Step 1: Replace rule 5 in "Markup is BEM, styling lives in the stylesheet"**

Replace the whole line beginning `5. **Utilities live in \`@apply\`` with:

```markdown
5. **App stylesheets are layout only.** Every utility in `@apply` and every plain declaration in a stylesheet under `src/app`, and every class rule in `src/styles.css`, must be layout: display, flex and grid arrangement, gap, sizing, margin, position, overflow and text alignment (the full list is under "The layout list" below). Color, typography, border, radius, shadow, ring, opacity, transitions, cursor, custom properties and anything not on the list are appearance, and appearance lives in `libs/ui`. Padding is allowed in one place: the component's block root (`.roster`, `.roster--compact`, or `:host`), for the region's inset, and only when that element is not a primitive. Semantic tokens only, `gap-*` not `space-*`, grid for regions. Moving appearance onto a wrapper element, or removing a primitive's directive to keep its look, does not make it allowed.
```

- [ ] **Step 2: Replace the worked example**

Replace the body of the `html` code block (`roster.html`) with the first block below, and the body of the `css` code block (`roster.css`) with the second. Keep each block's existing fence and language tag.

```html
<!-- roster.html -->
<section class="roster">
  <header class="roster__header">
    <h1 hlmH3>Roster</h1>
    <p hlmMuted>Every hero on the books.</p>
  </header>
  <div class="roster__filters">
    <label hlmLabel for="roster-search" class="roster__label">Search</label>
    <input hlmInput id="roster-search" type="search" class="roster__search" />
    <a hlmBtn routerLink="/recruit" class="roster__recruit">
      <ng-icon hlmIcon name="lucideUserPlus" />
      Recruit
    </a>
  </div>
  @for (hero of vm.heroes(); track hero.id) {
    <div class="roster__row">
      <ng-icon hlmIcon name="lucideShield" [tone]="hero.retired ? 'muted' : 'primary'" />
      <span hlmSmall>{{ hero.name }}</span>
      @if (hero.retired) {
        <span hlmBadge variant="outline">Retired</span>
      }
    </div>
  }
</section>
```

```css
/* roster.css */
@reference "../../styles.css";

.roster { @apply grid gap-6 p-6; }
.roster__header { @apply grid gap-1; }
.roster__filters { @apply flex flex-wrap items-center gap-3; }
.roster__label { @apply sr-only; }
.roster__search { @apply w-full sm:w-64; }
.roster__recruit { @apply ms-auto; }
.roster__row { @apply flex items-center gap-2; }
```

- [ ] **Step 3: Replace the paragraph after the example that begins "Note the primitives:"**

With:

```markdown
Note what the stylesheet does not say. No rule picks a color, a font size, a weight or a radius: the title is `hlmH3`, the caption `hlmMuted`, the icon's color its `tone`, the retired state a badge variant. `p-6` sits on `.roster`, the block root, as the region's inset. `roster__search` and `roster__recruit` sit on primitives and apply only width and margin.
```

Keep the following paragraph ("When no existing variant gives the look you need ...") unchanged.

- [ ] **Step 4: Add two subsections right after that paragraph**

```markdown
### The layout list

After any variant prefix (`sm:`, `hover:`, `dark:`) and a `!` marker are removed, these are layout. Anything else is appearance.

- Display and box: `block`, `inline`, `inline-block`, `flex`, `inline-flex`, `grid`, `inline-grid`, `contents`, `hidden`, `sr-only`, `not-sr-only`, `box-border`, `box-content`.
- Flex and grid: `flex-*`, `grow*`, `shrink*`, `basis-*`, `order-*`, `grid-cols-*`, `grid-rows-*`, `col-*`, `row-*`, `auto-cols-*`, `auto-rows-*`, `grid-flow-*`, `items-*`, `justify-*`, `content-*` (alignment), `self-*`, `place-*`, `gap-*`.
- Sizing: `w-*`, `h-*`, `size-*`, `min-w-*`, `min-h-*`, `max-w-*`, `max-h-*`, `aspect-*`.
- Margin: `m-*`, `mx-*`, `my-*`, `mt-*`, `mr-*`, `mb-*`, `ml-*`, `ms-*`, `me-*`, and negatives.
- Position: `static`, `relative`, `absolute`, `fixed`, `sticky`, `inset-*`, `top-*`, `right-*`, `bottom-*`, `left-*`, `start-*`, `end-*`, `z-*`.
- Overflow and flow: `overflow-*`, `overscroll-*`, `truncate`, `text-ellipsis`, `text-clip`, `whitespace-*`, `break-*`, `text-left`, `text-center`, `text-right`, `text-start`, `text-end`, `text-justify`, `object-*`, `isolate`, `container`.
- Padding: only on the block root.

Plain declarations follow the same line: `display`, `flex*`, `grid*`, `gap`, sizing, `margin*`, `position`, `inset*`, `top`/`right`/`bottom`/`left`, `z-index`, `overflow*`, `text-overflow`, `white-space`, `word-break`, `overflow-wrap`, `text-align`, `object-fit`, `object-position`, `isolation`, `order`, `align-*`, `justify-*`, `place-*`. `color: var(--sidebar-primary)` is appearance.

### Where appearance comes from

- **A primitive's look:** its `variant`/`size` inputs; when none fits, a new variant on the primitive in `libs/ui` (above).
- **Text:** a typography directive from `@spartan-ng/helm/typography`: `hlmH1` to `hlmH4`, `hlmP`, `hlmLead`, `hlmLarge`, `hlmSmall`, `hlmMuted`, `hlmCode`, `hlmBlockquote`, `hlmUl`. `<p hlmMuted>{{ hint }}</p>`, not `<p class="tile__hint">` with `text-sm text-muted-foreground`. When none fits (a stat value, an emphasized table number), add a variant to the closest one in `libs/ui/typography`.
- **Icon color:** `<ng-icon hlmIcon name="lucideShield" tone="muted" />` from `@spartan-ng/helm/icon`. Tones: `default` (inherits the surrounding color), `muted`, `primary`, `destructive`, `success`, `warning`. Size icons with `ng-icon`'s `size` input or `size-*` in the stylesheet.
- **A region's inset:** padding on the block root.
- **Status colors:** `success` and `warning` exist as tokens next to `destructive`; use them through a primitive's variant, a tone, or a typography variant, never from the app stylesheet.
```

- [ ] **Step 5: Write the rule doc**

`harness/rules/app-css-layout-only.md` (LF line endings):

```markdown
# app-css-layout-only

> Plane: sealing, series 2 phase 3. Spec: [../bem-phase-3-layout-only-spec.md](../bem-phase-3-layout-only-spec.md) (launching branch). Counter twin: `appearance-in-app-css` (launching branch). Also carries BEM rule 1: no utility class in a template.

## What it forbids

Any appearance in an app stylesheet. Every utility in `@apply` and every plain declaration in a stylesheet under `src/app`, and in any class rule of `src/styles.css`, must be on the layout list in the house-style skill. Padding is allowed only on the component's block root (`.<file-stem>`, `.<file-stem>--<modifier>`, `:host`). Unknown utilities count as appearance. In templates, no Tailwind utility may appear in a `class` attribute or a `[class.x]` binding.

## Why

Phase 2 gated appearance that reached a primitive through `@apply`. The model met that gate by moving the class onto a wrapper inside the primitive, or by deleting the primitive's directive and keeping its look on a plain element. Both kept the appearance in the app. This rule moves the line to where appearance may live: `libs/ui`.

## Accepted form

    <p hlmMuted>{{ hint }}</p>
    <ng-icon hlmIcon name="lucideShield" tone="muted" />
    .roster { @apply grid gap-6 p-6; }

## Agent guidance

The app stylesheet arranges things; it never decides how they look. For text, use a typography directive (`hlmH1`-`hlmH4`, `hlmP`, `hlmLead`, `hlmLarge`, `hlmSmall`, `hlmMuted`, `hlmCode`) or add a variant to one in `libs/ui/typography`. For an icon's color, use `<ng-icon hlmIcon tone="muted">` (`default`, `muted`, `primary`, `destructive`, `success`, `warning`). For a primitive's look, use its `variant` input, or add a variant to its `cva` in `libs/ui`. For a region's inset, put the padding on the block root (`.<file-stem>`). Moving the utilities onto a wrapper element, or removing a primitive's directive and keeping its look, is the same violation. In a template, use BEM class names only and put any layout utilities in the stylesheet.

    Good: <p hlmMuted>No heroes match.</p>                       .roster__empty { @apply col-span-full; }
    Bad:  <p class="roster__empty">No heroes match.</p>          .roster__empty { @apply py-8 text-muted-foreground; }

## Known blind spots

- Writes the hooks never see: a file changed outside `src/`, and changes made by a tool other than Write, Edit, MultiEdit or Bash.
- Inline `style` attributes and `[style.x]` bindings are not judged here (the series 1 `style-attribute` counter kind still counts the first).
- Classes built in TypeScript are not judged here (the counter's `utility-in-ts` kind counts them).
- A new component whose block-root padding exists only to pad one element is allowed by the letter of R7a; the readout reports such components.
```

- [ ] **Step 6: Copy, verify, commit**

Copy the `.claude` skill to `.agents/skills/house-style/SKILL.md`. Run `cmp .claude/skills/house-style/SKILL.md .agents/skills/house-style/SKILL.md` (no output), `grep -c "Utilities live in" .claude/skills/house-style/SKILL.md` (0), `grep -n "text-2xl\|text-sm;" .claude/skills/house-style/SKILL.md` (no hit inside the BEM section's example). Then:

```bash
git add .claude/skills/house-style/SKILL.md .agents/skills/house-style/SKILL.md harness/rules/app-css-layout-only.md
git commit -F- <<'EOF'
docs(skill): make app stylesheets layout only

Appearance now has a home for every case phase 2 put in the app: typography, icon tones, primitive variants and block-root padding.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr
EOF
```

---

### Task 3: The gate's classifier and checkers

**Files:**
- Modify: `harness/gate/rules/applied-utilities.ts` (rename `resolve` to exported `resolveSelectors`; update its one call site)
- Create: `harness/gate/app-css/layout-only.ts`, `harness/gate/app-css/template-utilities.ts`, `harness/gate/app-css/index.mjs`
- Modify: `tsconfig.harness.json` (`include` gains `"harness/gate/app-css/**/*.ts"`)
- Test: `harness/gate/app-css-gate.test.mjs`

**Interfaces:**
- Produces: `checkStylesheet(css: string, opts: { stem: string | null; global: boolean }): CssViolation[]` where `CssViolation = { line: number; selector: string; token: string; kind: 'utility' | 'property'; reason: 'appearance' | 'padding-off-root' }`, throws on unparseable CSS; `stemOf(path: string): string`; `isGlobalStylesheet(relPath: string): boolean`; `loadUtilityOracle(stylesPath: string): Promise<(token: string) => boolean>`; `templateUtilities(html: string, path: string, isUtility: (t: string) => boolean): TemplateViolation[]` where `TemplateViolation = { line: number; token: string; via: 'class' | '[class.x]' }`; `remedyFor(v: CssViolation, stem: string | null): string`.

- [ ] **Step 1: Write the failing tests**

`harness/gate/app-css-gate.test.mjs`:

```js
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
    'supports-[display:grid]:grid', '[&:nth-child(2)]:mt-2', 'w-[calc(100%-2rem)]',
  ])('%s is layout', (t) => {
    expect(component(`.dashboard__x { @apply ${t}; }`)).toEqual([]);
  });

  it.each([
    'text-sm', 'text-muted-foreground', 'font-semibold', 'leading-7', 'tracking-tight', 'bg-muted/50', 'border', 'border-b',
    'rounded-md', 'shadow-sm', 'ring-1', 'opacity-50', 'cursor-pointer', 'pointer-events-none', 'select-none', 'transition-colors',
    'tabular-nums', 'underline', 'content-[\'x\']', '[color:red]', 'hover:bg-accent', 'dark:text-foreground', 'zz-custom-thing',
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
    const vs = component('.dashboard__x { color: var(--sidebar-primary); --w: 10rem; }');
    expect(vs.map((v) => [v.token, v.kind])).toEqual([['color', 'property'], ['--w', 'property']]);
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
  it('passes a BEM-only template', () => {
    expect(templateUtilities('<section class="roster"><h1 hlmH3>R</h1></section>', 'x.html', isUtility)).toEqual([]);
  });
});
```

Run: `npx vitest run --config harness/vitest.config.mjs harness/gate/app-css-gate.test.mjs`. Expected: FAIL, module not found.

- [ ] **Step 2: Export the selector resolver**

In `harness/gate/rules/applied-utilities.ts`, rename `function resolve(rule: Rule): string[]` to `export function resolveSelectors(rule: Rule): string[]`, and change its recursive call and the call in `appliedUtilities` to `resolveSelectors`. Also export `parentRule` and `CONCAT` by adding `export` to their declarations. No behavior change: `npx vitest run --config harness/vitest.config.mjs harness/gate/applied-appearance-gate.test.mjs` still passes 20.

- [ ] **Step 3: Write `harness/gate/app-css/layout-only.ts`**

```ts
import postcss, { type AtRule, type Container, type Declaration, type Node, type Rule } from 'postcss';
import { CONCAT, parentRule, resolveSelectors } from '../rules/applied-utilities.ts';

// R7 and R7a of ../../bem-phase-3-layout-only-spec.md, judged per stylesheet:
// the block root is known from the file stem, so no template is needed.
// Written from the spec, not from the counter's harness/counter/bem/ code.

export type CssViolation = {
  line: number;
  selector: string;
  token: string;
  kind: 'utility' | 'property';
  reason: 'appearance' | 'padding-off-root';
};

const LAYOUT_EXACT = new Set([
  'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents', 'hidden', 'sr-only',
  'not-sr-only', 'box-border', 'box-content', 'static', 'relative', 'absolute', 'fixed', 'sticky', 'truncate',
  'text-ellipsis', 'text-clip', 'text-left', 'text-center', 'text-right', 'text-start', 'text-end', 'text-justify',
  'isolate', 'container', 'grow', 'shrink',
]);
const LAYOUT_PREFIX =
  /^(flex-|grow-|shrink-|basis-|order-|grid-cols-|grid-rows-|grid-flow-|col-|row-|auto-cols-|auto-rows-|items-|justify-|self-|place-|gap-|w-|h-|size-|min-w-|min-h-|max-w-|max-h-|aspect-|m[xytrblse]?-|inset-|top-|right-|bottom-|left-|start-|end-|z-|overflow-|overscroll-|whitespace-|break-|object-)/;
const CONTENT_ALIGN = /^content-(normal|center|start|end|between|around|evenly|baseline|stretch)$/;
const PADDING = /^p[xytrblse]?-/;

const LAYOUT_PROPS =
  /^(display|flex(-.*)?|grid(-.*)?|gap|row-gap|column-gap|width|height|min-width|min-height|max-width|max-height|aspect-ratio|margin(-.*)?|position|inset(-.*)?|top|right|bottom|left|z-index|overflow(-.*)?|text-overflow|white-space|word-break|overflow-wrap|text-align|object-fit|object-position|isolation|order|align-.*|justify-.*|place-.*)$/;
const PADDING_PROP = /^padding(-.*)?$/;

// The utility after its variant prefixes: split on `:` outside brackets and
// parentheses, keep the last part, then drop `!` and a negative sign.
export function baseUtility(token: string): string {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    const c = token[i];
    if (c === '[' || c === '(') depth++;
    else if (c === ']' || c === ')') depth--;
    else if (c === ':' && depth === 0) start = i + 1;
  }
  return token.slice(start).replace(/^!|!$/g, '').replace(/^-/, '');
}

type Verdict = 'layout' | 'padding' | 'appearance';

function utilityVerdict(token: string): Verdict {
  const u = baseUtility(token);
  if (u.startsWith('[')) return 'appearance';
  if (PADDING.test(u)) return 'padding';
  if (LAYOUT_EXACT.has(u) || CONTENT_ALIGN.test(u)) return 'layout';
  if (u.startsWith('content-')) return 'appearance';
  return LAYOUT_PREFIX.test(u) ? 'layout' : 'appearance';
}

function propertyVerdict(prop: string): Verdict {
  const p = prop.toLowerCase();
  if (PADDING_PROP.test(p)) return 'padding';
  return LAYOUT_PROPS.test(p) ? 'layout' : 'appearance';
}

export const stemOf = (path: string): string =>
  path.replaceAll('\\', '/').split('/').pop()!.replace(/\.css$/, '').replace(/\.component$/, '');

export const isGlobalStylesheet = (relPath: string): boolean => /(^|\/)src\/styles\.css$/.test(relPath.replaceAll('\\', '/'));

function isConcatenated(rule: Rule): boolean {
  const parent = parentRule(rule);
  return rule.selectors.some((s) => CONCAT.test(s)) || (parent ? isConcatenated(parent) : false);
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function isBlockRoot(rule: Rule | null, stem: string | null): boolean {
  if (!rule || !stem) return false;
  const root = new RegExp(`^(\\.${escape(stem)}(--[a-z0-9]+(-[a-z0-9]+)*)?|:host)$`);
  return resolveSelectors(rule).every((s) => root.test(s.trim()));
}

function ancestors(node: Node): Container[] {
  const out: Container[] = [];
  let p = node.parent as Container | undefined;
  while (p && p.type !== 'root') {
    out.push(p);
    p = p.parent as Container | undefined;
  }
  return out;
}

// The global stylesheet's theme: any declaration or @apply under `:root`,
// `:root.dark`, `@theme`, or a classless rule inside `@layer base`.
function isThemeContext(node: Node): boolean {
  for (const a of ancestors(node)) {
    if (a.type === 'atrule' && (a as AtRule).name === 'theme') return true;
    if (a.type === 'rule') {
      const sels = resolveSelectors(a as Rule).map((s) => s.trim());
      if (sels.every((s) => s === ':root' || s === ':root.dark')) return true;
      const inBase = ancestors(a).some((x) => x.type === 'atrule' && (x as AtRule).name === 'layer' && (x as AtRule).params.trim() === 'base');
      if (inBase && sels.every((s) => !s.includes('.'))) return true;
    }
  }
  return false;
}

export function checkStylesheet(css: string, opts: { stem: string | null; global: boolean }): CssViolation[] {
  const root = postcss.parse(css);
  const out: CssViolation[] = [];
  const judge = (node: Node, items: { token: string; kind: 'utility' | 'property'; verdict: Verdict }[]) => {
    const rule = parentRule(node);
    if (rule && isConcatenated(rule)) return;
    if (opts.global && isThemeContext(node)) return;
    const selector = rule ? resolveSelectors(rule).join(', ') : (node.parent as AtRule | undefined)?.type === 'atrule' ? `@${(node.parent as AtRule).name} ${(node.parent as AtRule).params}`.trim() : '';
    const rootOk = !opts.global && isBlockRoot(rule, opts.stem);
    for (const it of items) {
      if (it.verdict === 'layout') continue;
      if (it.verdict === 'padding' && rootOk) continue;
      out.push({
        line: node.source?.start?.line ?? 0,
        selector,
        token: it.token,
        kind: it.kind,
        reason: it.verdict === 'padding' ? 'padding-off-root' : 'appearance',
      });
    }
  };
  root.walk((node) => {
    if (node.type === 'atrule' && (node as AtRule).name === 'apply') {
      const tokens = (node as AtRule).params.split(/\s+/).filter((t) => t && t !== '!important');
      judge(node, tokens.map((token) => ({ token, kind: 'utility' as const, verdict: utilityVerdict(token) })));
    } else if (node.type === 'decl') {
      const d = node as Declaration;
      judge(node, [{ token: d.prop, kind: 'property' as const, verdict: propertyVerdict(d.prop) }]);
    }
  });
  return out;
}

const TEXT = /^(text-|font-|leading-|tracking-|italic$|not-italic$|underline|line-through|no-underline|uppercase$|lowercase$|capitalize$|normal-case$|tabular-nums$)/;

export function remedyFor(v: Pick<CssViolation, 'token' | 'reason'>, stem: string | null): string {
  if (v.reason === 'padding-off-root') {
    return stem
      ? `padding belongs on the block root .${stem} (the region's inset) or in a primitive's variant in libs/ui`
      : 'padding in the global stylesheet is never allowed; put it on a component block root or in a primitive variant';
  }
  if (TEXT.test(baseUtility(v.token)) || v.token === 'color') {
    return 'use a typography directive (hlmH1-hlmH4, hlmP, hlmLead, hlmLarge, hlmSmall, hlmMuted, hlmCode) or, for an icon, <ng-icon hlmIcon tone="...">';
  }
  return "add a variant to the primitive's cva in libs/ui and select it with its variant input";
}
```

- [ ] **Step 4: Write `harness/gate/app-css/template-utilities.ts`**

```ts
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseTemplate, BindingType, TmplAstElement, TmplAstTemplate, type TmplAstNode } from '@angular/compiler';
import { __unstable__loadDesignSystem } from '@tailwindcss/node';

// BEM rule 1, gate side: no Tailwind utility in a template's class attribute
// or a [class.x] binding. Tailwind's own design system decides what a utility
// is (the oracle both engines may ask); the template walk is the gate's own.

export type TemplateViolation = { line: number; token: string; via: 'class' | '[class.x]' };

export async function loadUtilityOracle(stylesPath: string): Promise<(token: string) => boolean> {
  const ds = await __unstable__loadDesignSystem(readFileSync(stylesPath, 'utf8'), { base: dirname(stylesPath) });
  const cache = new Map<string, boolean>();
  return (raw: string) => {
    const token = raw.replace(/^!|!$/g, '');
    if (!cache.has(token)) cache.set(token, ds.candidatesToCss([token])[0] != null);
    return cache.get(token)!;
  };
}

export function templateUtilities(html: string, path: string, isUtility: (t: string) => boolean): TemplateViolation[] {
  const parsed = parseTemplate(html, path, { preserveWhitespaces: true });
  if (parsed.errors?.length) throw new Error(`${path}: ${parsed.errors[0].msg}`);
  const out: TemplateViolation[] = [];
  const visit = (nodes: TmplAstNode[]) => {
    for (const n of nodes as any[]) {
      if (n instanceof TmplAstElement || n instanceof TmplAstTemplate) {
        for (const a of n.attributes) {
          if (a.name !== 'class') continue;
          for (const t of String(a.value).split(/\s+/).filter(Boolean)) {
            if (isUtility(t)) out.push({ line: a.sourceSpan.start.line + 1, token: t, via: 'class' });
          }
        }
        for (const i of n.inputs) {
          if (i.type === BindingType.Class && isUtility(i.name)) out.push({ line: i.sourceSpan.start.line + 1, token: i.name, via: '[class.x]' });
        }
      }
      for (const key of ['children', 'branches', 'cases', 'expression']) {
        const v = n?.[key];
        if (Array.isArray(v)) visit(v);
      }
      if (n?.empty) visit([n.empty]);
      if (n?.placeholder) visit([n.placeholder]);
      if (n?.loading) visit([n.loading]);
      if (n?.error) visit([n.error]);
    }
  };
  visit(parsed.nodes);
  return out;
}
```

If `parseTemplate`'s node classes or block fields differ in the installed `@angular/compiler`, adapt the walk so the control-flow test passes (an `@if` branch, `@for`, `@switch` cases, `@defer` sub-blocks, `ng-template` children) and say what changed in the report.

- [ ] **Step 5: Write `harness/gate/app-css/index.mjs`**

```js
// The app-css gate (series 2 phase 3). Used only by .claude/hooks/check-app-css.mjs
// and .claude/hooks/check-src-after-bash.mjs, which only the series 3 gate-on
// settings register. Its counter twin is `appearance-in-app-css` in
// harness/counter/bem-counter.mjs on the launching branch; the two share no code.
export { checkStylesheet, stemOf, isGlobalStylesheet, remedyFor, baseUtility } from './layout-only.ts';
export { loadUtilityOracle, templateUtilities } from './template-utilities.ts';
```

Add `"harness/gate/app-css/**/*.ts"` to `tsconfig.harness.json` `include`.

- [ ] **Step 6: Run the tests and the typecheck**

Run: `npx vitest run --config harness/vitest.config.mjs harness/gate/app-css-gate.test.mjs harness/gate/applied-appearance-gate.test.mjs` and `npm run typecheck:harness`. Expected: all pass, no type errors (add to `harness/gate/rules/node-shim.d.ts` only if a `node:` import needs it).

- [ ] **Step 7: Commit**

```bash
git add harness/gate/app-css harness/gate/app-css-gate.test.mjs harness/gate/rules/applied-utilities.ts tsconfig.harness.json
git commit -F- <<'EOF'
feat(gate): judge app stylesheets as layout only

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr
EOF
```

---

### Task 4: The two hooks

**Files:**
- Create: `.claude/hooks/check-app-css.mjs`, `.claude/hooks/check-src-after-bash.mjs`
- Test: `harness/gate/app-css-hook.test.mjs`

**Interfaces:**
- Consumes: Task 3's `index.mjs` exports; `../../harness/gate/applied-index.mjs` (phase 2 plugin); `./_hook-log.mjs` `logFiring(hook, file, messages, ruleIds)`; `./rule-docs.mjs` `agentGuidanceFor([{ ruleId, url }])`, `formatDocPointerBlock(lines)`, `docsPointersFor(eslint, results)`.
- Produces: hook names `check-app-css` and `check-src-after-bash` in `hook-firings.jsonl`.

- [ ] **Step 1: Write the failing hook tests**

`harness/gate/app-css-hook.test.mjs`:

```js
import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const probeDir = join(repoRoot, 'src', 'app', 'zz-css-probe');
const html = join(probeDir, 'zz-css-probe.html');
const css = join(probeDir, 'zz-css-probe.css');
const hookLog = join(repoRoot, 'harness', 'gate', '.zz-css-probe-firings.jsonl');

function probe(cssBody, htmlBody = '<section class="zz-css-probe"><p class="zz-css-probe__hint">x</p></section>\n') {
  mkdirSync(probeDir, { recursive: true });
  writeFileSync(html, htmlBody);
  writeFileSync(css, `@reference "../../styles.css";\n${cssBody}\n`);
}
const run = (hook, payload, cwd = repoRoot) =>
  spawnSync('node', [join(repoRoot, '.claude', 'hooks', hook)], {
    cwd,
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    env: { ...process.env, HOOK_LOG: hookLog },
    encoding: 'utf8',
  });
const edit = (file_path) => ({ tool_name: 'Edit', tool_input: { file_path } });
const bash = { tool_name: 'Bash', tool_input: { command: 'ls' } };

beforeEach(() => rmSync(probeDir, { recursive: true, force: true }));
afterAll(() => {
  rmSync(probeDir, { recursive: true, force: true });
  rmSync(hookLog, { force: true });
});

describe('check-app-css (Write/Edit)', () => {
  it('blocks appearance in a component stylesheet, naming the remedy and the rule doc guidance', () => {
    probe('.zz-css-probe__hint { @apply py-8 text-muted-foreground; }');
    const r = run('check-app-css.mjs', edit(css));
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('py-8');
    expect(r.stderr).toContain('text-muted-foreground');
    expect(r.stderr).toContain('typography directive');
    expect(r.stderr).toContain('harness/rules/app-css-layout-only.md');
    expect(r.stderr).toContain('The app stylesheet arranges things');
  });
  it('passes layout and block-root padding', () => {
    probe('.zz-css-probe { @apply grid gap-4 p-6; } .zz-css-probe__hint { @apply col-span-full; }');
    expect(run('check-app-css.mjs', edit(css)).status).toBe(0);
  });
  it('blocks a utility in the template', () => {
    probe('.zz-css-probe { @apply grid; }', '<section class="zz-css-probe flex"></section>\n');
    const r = run('check-app-css.mjs', edit(html));
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('flex');
  });
  it('passes the substrate global stylesheet', () => {
    expect(run('check-app-css.mjs', edit(join(repoRoot, 'src', 'styles.css'))).status).toBe(0);
  });
  it('blocks an unparseable stylesheet', () => {
    probe('.zz-css-probe__hint { @apply text-sm;');
    expect(run('check-app-css.mjs', edit(css)).status).toBe(2);
  });
  it('ignores files outside src/ and other extensions', () => {
    expect(run('check-app-css.mjs', edit(join(repoRoot, 'README.md'))).status).toBe(0);
    expect(run('check-app-css.mjs', edit(join(repoRoot, 'harness', 'x.css'))).status).toBe(0);
  });
  it('fails closed on an unparseable payload', () => {
    expect(run('check-app-css.mjs', 'not json').status).toBe(2);
  });
  it('loads from a subfolder through an absolute path', () => {
    probe('.zz-css-probe__hint { @apply text-sm; }');
    expect(run('check-app-css.mjs', edit(css), probeDir).status).toBe(2);
  });
});

// Vitest runs test files in parallel, and other hook tests write their own
// zz-*-probe folders under src/app. The Bash hook sees those too, so "clean"
// means: nothing reported outside a probe folder.
const onlyProbes = (r) =>
  r.status === 0 || r.stderr.split('\n').filter((l) => /src\/app\//.test(l)).every((l) => /src\/app\/zz-[a-z]+-probe\//.test(l));

describe('check-src-after-bash', () => {
  it('reports nothing on a tree with no changes outside probe folders', () => {
    expect(onlyProbes(run('check-src-after-bash.mjs', bash))).toBe(true);
  });
  it('blocks an untracked violating stylesheet written by a shell command', () => {
    probe('.zz-css-probe__hint { @apply rounded-md; }');
    const r = run('check-src-after-bash.mjs', bash);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('zz-css-probe.css');
    expect(r.stderr).toContain('rounded-md');
  });
  it('also runs the phase 2 rule: block-root padding on a primitive passes R7a but not the primitive rule', () => {
    probe('.zz-css-probe { @apply p-4; }', '<button hlmBtn class="zz-css-probe">Go</button>\n');
    expect(run('check-app-css.mjs', edit(css)).status).toBe(0);
    const r = run('check-src-after-bash.mjs', bash);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('p-4');
  });
  it('fails closed on an unparseable payload', () => {
    expect(run('check-src-after-bash.mjs', 'not json').status).toBe(2);
  });
  it('skips a deleted tracked file without crashing', () => {
    const tracked = join(repoRoot, 'src', 'app', 'heroes', 'heroes.css');
    const backup = existsSync(tracked) ? readFileSync(tracked, 'utf8') : null;
    rmSync(tracked, { force: true });
    try {
      const r = run('check-src-after-bash.mjs', bash);
      expect(r.stderr).not.toContain('failing closed');
      expect(onlyProbes(r)).toBe(true);
    } finally {
      if (backup !== null) writeFileSync(tracked, backup);
    }
  });
});
```

Run: `npx vitest run --config harness/vitest.config.mjs harness/gate/app-css-hook.test.mjs`. Expected: FAIL, hooks missing.

- [ ] **Step 2: Write `.claude/hooks/check-app-css.mjs`**

```js
#!/usr/bin/env node
// PostToolUse app-css gate (series 2 phase 3, harness/bem-phase-3-layout-only-spec.md
// on the launching branch). On a Write/Edit/MultiEdit of a stylesheet under src/app
// or src/styles.css: every @apply utility and declaration must be layout (R7), with
// padding only on the block root (R7a). On a template under src/app: no Tailwind
// utility in a class attribute or [class.x] binding (BEM rule 1).
//
// Self-contained: only harness/gate/s3-gate-on.settings.json (launching branch)
// registers it. Present-but-unregistered in gate-off. Fails closed on an
// unparseable payload, stylesheet or template.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkStylesheet, stemOf, isGlobalStylesheet, remedyFor, loadUtilityOracle, templateUtilities } from '../../harness/gate/app-css/index.mjs';
import { logFiring } from './_hook-log.mjs';
import { agentGuidanceFor, formatDocPointerBlock } from './rule-docs.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DOC = { ruleId: 'app-css/layout-only', url: 'harness/rules/app-css-layout-only.md' };

export const inScope = (rel) => /^src\/app\/.+\.(css|html)$/.test(rel) || rel === 'src/styles.css';

// Messages for one file. `oracle` is loaded lazily, once per process.
export async function messagesFor(absPath, oracleRef) {
  const rel = relative(ROOT, absPath).replaceAll('\\', '/');
  const text = readFileSync(absPath, 'utf8');
  if (rel.endsWith('.css')) {
    const global = isGlobalStylesheet(rel);
    const stem = global ? null : stemOf(rel);
    let vs;
    try {
      vs = checkStylesheet(text, { stem, global });
    } catch (err) {
      return [`${rel}: unreadable stylesheet (${err?.message ?? err}); fix the syntax.`];
    }
    return vs.map((v) => `${rel}:${v.line}  ${v.selector || '(top level)'}  "${v.token}" is ${v.reason === 'padding-off-root' ? 'padding off the block root' : 'appearance'}: ${remedyFor(v, stem)}.`);
  }
  oracleRef.isUtility ??= await loadUtilityOracle(join(ROOT, 'src', 'styles.css'));
  let vs;
  try {
    vs = templateUtilities(text, rel, oracleRef.isUtility);
  } catch (err) {
    return [`${rel}: unreadable template (${err?.message ?? err}).`];
  }
  return vs.map((v) => `${rel}:${v.line}  "${v.token}" is a Tailwind utility in a template ${v.via}: give the element a BEM class and @apply layout in its stylesheet.`);
}

export function report(hook, file, messages) {
  logFiring(hook, file, messages, [DOC.ruleId]);
  const guidance = agentGuidanceFor([DOC]);
  process.stderr.write(
    `App-css gate blocked this change: ${messages.length} violation(s).\n` +
      messages.map((m) => `  ${m}`).join('\n') +
      '\n' +
      formatDocPointerBlock([`  ${DOC.ruleId}  ->  ${DOC.url}`]) +
      (guidance.length ? `${guidance.join('\n\n')}\n\n` : '') +
      'Fix the above before continuing.\n',
  );
}

async function main() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.stderr.write('check-app-css: could not parse hook payload; failing closed.\n');
    process.exit(2);
  }
  const file = payload.tool_input?.file_path ?? payload.tool_input?.filePath ?? null;
  if (!file) process.exit(0);
  const rel = relative(ROOT, String(file)).replaceAll('\\', '/');
  if (!inScope(rel) || !existsSync(file)) process.exit(0);
  let messages;
  try {
    messages = await messagesFor(String(file), {});
  } catch (err) {
    process.stderr.write(`check-app-css: check failed (${err?.message ?? err}); failing closed.\n`);
    process.exit(2);
  }
  if (messages.length === 0) process.exit(0);
  report('check-app-css', rel, messages);
  process.exit(2);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
```

Add `pathToFileURL` to the `node:url` import. The last line runs `main` only when the file is executed directly, so the Bash hook can import `messagesFor`, `inScope` and `report` without reading stdin.

- [ ] **Step 3: Write `.claude/hooks/check-src-after-bash.mjs`**

```js
#!/usr/bin/env node
// PostToolUse on Bash (series 2 phase 3). A shell command can write any file
// (sed, a heredoc, a Python script) and no Write/Edit hook sees it. So this hook
// ignores the command, asks git which files under src/ are modified or untracked,
// and runs the app-css checks and the phase 2 applied-appearance rule on those.
// It reports on the whole changed tree after every Bash command: while a
// violation is anywhere in src/, every command reports it.
//
// Fails closed on an unparseable payload or a git failure.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import angular from 'angular-eslint';
import applied from '../../harness/gate/applied-index.mjs';
import { messagesFor, inScope, report } from './check-app-css.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const appliedConfig = [
  { ignores: ['dist/**', '.angular/**', 'node_modules/**', 'coverage/**', 'libs/**'] },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { applied },
    linterOptions: { noInlineConfig: true },
    rules: { 'applied/no-applied-appearance-on-primitive': 'error' },
  },
];

export function changedFiles() {
  const r = spawnSync('git', ['-C', ROOT, 'status', '--porcelain=v1', '-z', '-uall', '--', 'src'], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git status failed: ${r.stderr.trim()}`);
  const parts = r.stdout.split('\0').filter(Boolean);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const status = parts[i].slice(0, 2);
    const path = parts[i].slice(3);
    if (status.startsWith('R') || status.startsWith('C')) i++; // -z puts the source path next
    if (status.includes('D')) continue;
    out.push(path);
  }
  return out.filter(inScope).filter((p) => existsSync(join(ROOT, p)));
}

async function main() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  try {
    JSON.parse(raw);
  } catch {
    process.stderr.write('check-src-after-bash: could not parse hook payload; failing closed.\n');
    process.exit(2);
  }
  let messages = [];
  try {
    const files = changedFiles();
    if (files.length === 0) process.exit(0);
    const oracleRef = {};
    for (const f of files) messages.push(...(await messagesFor(join(ROOT, f), oracleRef)));
    const templates = new Set();
    for (const f of files) {
      const html = f.endsWith('.css') ? f.replace(/\.css$/, '.html') : f;
      if (html.endsWith('.html') && html.startsWith('src/app/') && existsSync(join(ROOT, html))) templates.add(join(ROOT, html));
    }
    if (templates.size) {
      const eslint = new ESLint({ cwd: ROOT, overrideConfigFile: true, overrideConfig: appliedConfig });
      for (const r of await eslint.lintFiles([...templates])) {
        const shown = r.filePath.replaceAll('\\', '/').replace(`${ROOT.replaceAll('\\', '/')}/`, '');
        for (const m of r.messages) if (m.severity === 2) messages.push(`${shown}:${m.line}:${m.column}  ${m.message}`);
      }
    }
  } catch (err) {
    process.stderr.write(`check-src-after-bash: check failed (${err?.message ?? err}); failing closed.\n`);
    process.exit(2);
  }
  if (messages.length === 0) process.exit(0);
  report('check-src-after-bash', 'src/', messages);
  process.exit(2);
}

main();
```

- [ ] **Step 4: Run the hook tests**

Run: `npx vitest run --config harness/vitest.config.mjs harness/gate/app-css-hook.test.mjs`. Expected: all pass. Then run the whole harness suite once, `npm run test:harness`, and record the pass and fail counts in the report next to the counts before this task (the substrate has pre-existing failures in suites that import `../counter`; no new failure is allowed). Confirm `git status --short` shows no probe residue.

- [ ] **Step 5: Measure the Bash hook's cost**

With a realistic changed tree (copy any phase 2 trial's `impl/src/app` over `src/app` temporarily, run the hook with a Bash payload three times, then restore with `git checkout -- src && git clean -fd src`), record the wall time of each run in the report. Expected: under 10 seconds. If it is slower, report it; do not optimize in this task.

- [ ] **Step 6: Commit**

```bash
git add .claude/hooks/check-app-css.mjs .claude/hooks/check-src-after-bash.mjs harness/gate/app-css-hook.test.mjs
git commit -F- <<'EOF'
feat(gate): run the app-css checks on file edits and after Bash

Phase 2's gate-on t1 rewrote app.html with a Python heredoc that no file-tool hook saw.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr
EOF
```

---

### Task 5: The counter kind (written from the spec, not from the gate)

**Files (on `research/schematic-arm`, `D:/Repos/angular-jig`):**
- Create: `harness/counter/bem/app-css.mjs`
- Modify: `harness/counter/bem-counter.mjs` (add `'appearance-in-app-css'` to `BEM_KINDS`; call the new module for every `.css` file `bemTally` walks)
- Modify: `harness/counter/counter.mjs` (`PRIMITIVE_ATTRS` gains `hlmH1`, `hlmH2`, `hlmH3`, `hlmH4`, `hlmP`, `hlmLead`, `hlmLarge`, `hlmSmall`, `hlmMuted`, `hlmCode`, `hlmBlockquote`, `hlmUl`, `hlmIcon`)
- Test: `harness/counter/bem/app-css.test.mjs`, plus one integration case in `harness/counter/bem-counter.test.mjs`

**Interfaces:**
- Produces: `appCssViolations(css: string, { stem: string | null, global: boolean }) => Array<{ line, selector, token }>`; bem tally kind `appearance-in-app-css` with `detail` `"<selector>: <token>"` and `file` relative to root.

The implementer works from `harness/bem-phase-3-layout-only-spec.md` and this plan's Global Constraints only, and must not open `D:/Repos/aj-s3/harness/gate/app-css/` or Task 3's text. That is the independence the spec requires. Reuse counter-side code freely (`bem/stylesheet.mjs` exports `resolvedSelectors` and `isConcat`).

- [ ] **Step 1: Write the failing tests**

`harness/counter/bem/app-css.test.mjs` must cover, with one `it` per bullet:

- each layout family in the Global Constraints passes, with at least two utilities per family, plus `sm:grid-cols-2`, `!w-full`, `w-full!`, `-mt-2`, `supports-[display:grid]:grid`, `[&:nth-child(2)]:mt-2`;
- `text-sm`, `text-muted-foreground`, `font-semibold`, `bg-muted/50`, `rounded-md`, `shadow-sm`, `border-b`, `ring-1`, `opacity-50`, `cursor-pointer`, `transition-colors`, `tabular-nums`, `[color:red]`, `content-['x']`, `hover:bg-accent` and an unknown `zz-custom-thing` are each one violation (not `my-...`: `my-` is the margin-y prefix);
- one violation per utility: `.x__y { @apply flex py-8 text-sm; }` in stem `x` gives `py-8` and `text-sm`;
- plain declarations: `display`, `grid-template-columns`, `margin-inline` pass; `color` and `--w` fail;
- `&:hover` and `@media` nesting are followed; a Sass `&__x` rule is skipped;
- block root: `p-6` passes on `.dashboard`, `.dashboard--compact`, `:host`, `.dashboard` inside `@media`; fails on `.dashboard:hover`, `.dashboard .x`, `.dashboard__panel`, `.other`;
- global: the substrate's `src/styles.css` (read from `D:/Repos/aj-s3/src/styles.css` through an env var `APP_CSS_STYLES` with that default, skipped with a message if absent) gives 0; `.x { @apply text-sm; }` gives 1; `@utility pad { padding: 1rem; }` gives 1; `:root { color-scheme: light; --x: 1px; }`, `@theme inline { --color-x: var(--x); }` and `@layer base { body { @apply bg-background; } }` give 0; `@layer base { .x { @apply text-sm; } }` gives 1;
- an unparseable stylesheet throws.

In `bem-counter.test.mjs`, add one case: a fixture component `widget.ts`/`widget.html`/`widget.css` whose stylesheet is `.widget { @apply grid p-4; } .widget__hint { @apply py-2 text-sm; }` gives exactly two `appearance-in-app-css` violations in `widget.css` (`py-2`, `text-sm`) and `totals['appearance-in-app-css'] === 2`.

Run: `npx vitest run harness/counter/bem/app-css.test.mjs harness/counter/bem-counter.test.mjs` (use the repo's own vitest invocation for `harness/counter`, the one the existing bem tests use). Expected: FAIL.

- [ ] **Step 2: Implement `harness/counter/bem/app-css.mjs` from the spec**

Write it from the spec's R7, R7a and global-stylesheet text and this plan's Global Constraints. In `bemTally`, call it for every `.css` file in the walk: `global` when the relative path is `src/styles.css`, otherwise `stem` = file name without `.css` and a trailing `.component`. An unparseable stylesheet must not crash the tally: record nothing for that file under this kind (the existing `broken-nesting` handling already reports unparseable selectors) and add a test that proves the tally completes.

- [ ] **Step 3: Add the primitives to `counter.mjs`**

Add the thirteen attribute names to `PRIMITIVE_ATTRS`. Run the full counter suite: every existing test still passes.

- [ ] **Step 4: Run and commit**

Run all counter tests (pass), then:

```bash
git add harness/counter/bem/app-css.mjs harness/counter/bem/app-css.test.mjs harness/counter/bem-counter.mjs harness/counter/bem-counter.test.mjs harness/counter/counter.mjs
git commit -F- <<'EOF'
feat(counter): count appearance in app stylesheets

The counter twin of the phase 3 gate, written from the spec alone.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr
EOF
```

---

### Task 6: Acceptance and the phase 2 rescore

**Files:**
- Create (scratch, not committed): `C:/Users/psati/AppData/Local/Temp/claude/D--Repos-blog/bbe683f7-6112-404d-accc-35881737d0b7/scratchpad/phase3-acceptance.mjs`
- Create: `experiments/schematic-arm/s2/app-css-rescore.md` (on `research/schematic-arm`)

**Interfaces:**
- Consumes: gate `checkStylesheet`, `stemOf`, `isGlobalStylesheet` from `D:/Repos/aj-s3/harness/gate/app-css/index.mjs`; counter `appCssViolations` from `D:/Repos/angular-jig/harness/counter/bem/app-css.mjs`.

The eight trees are the `impl/src` folders of: `s2/gate-off/gate-off-t1-2026-10-16_13-40-31`, `s2/gate-off/gate-off-t1-2026-10-16_14-41-17` (the pilots), `s2/gate-off/gate-off-t1-2026-10-16_18-52-50`, `s2/gate-off/gate-off-t2-2026-10-16_20-13-33`, `s2/gate-off/gate-off-t3-2026-10-16_21-26-13`, `s2/gate-on/gate-on-t1-2026-10-16_19-25-51`, `s2/gate-on/gate-on-t2-2026-10-16_20-48-54`, `s2/gate-on/gate-on-t3-2026-10-16_22-08-24`, all under `D:/Repos/angular-jig/experiments/schematic-arm/`. Each `impl/` holds only the files a run changed; an unchanged stylesheet is the substrate's placeholder (only `@reference`), which has no violation, so the impl trees are complete for this kind.

- [ ] **Step 1: Write the scratch script**

It walks every `.css` under each tree's `impl/src`, runs both engines on each file with the same `stem`/`global` derivation, and prints per tree: the gate count, the counter count, and every (file, line, token) present in one engine and not the other. Run it with node from `D:/Repos/aj-s3` as the working directory so the gate's `.ts` imports and `postcss` resolve.

- [ ] **Step 2: Agreement**

Expected: both engines give identical (file, line, token) sets on all eight trees. Any difference is a defect in one engine: find which by reading the spec, fix that engine (gate on `substrate/schematic-arm-3`, counter on `research/schematic-arm`), add a test that pins the case, and rerun until they agree. Record each difference and its fix in the report.

- [ ] **Step 3: The phase 2 firings in their final form**

Check that these final-state rules are flagged by both engines (the 6 wrappers and the 2 dropped primitives; the footer case is flagged on the children that carry its old text styling):

| tree | file | selector | escape |
| --- | --- | --- | --- |
| gate-on t1 | `app/app.css` | `.app__brand` | wrapper |
| gate-on t1 | `app/heroes/heroes.css` | `.roster__power` | wrapper |
| gate-on t1 | `app/heroes/heroes.css` | `.roster__empty` | wrapper |
| gate-on t1 | `app/heroes/heroes.css` | `.roster__summary` | dropped `hlmCardFooter` |
| gate-on t2 | `app/ui/stat-tile.css` | `.stat-tile__label` | dropped `hlmCardDescription` |
| gate-on t3 | `app/heroes/heroes.css` | `.roster__power` | wrapper |
| gate-on t3 | `app/heroes/heroes.css` | `.roster__empty` | wrapper |
| gate-on t3 | `app/dashboard/dashboard.css` | `.dashboard__power` | wrapper |

If a listed selector carries only layout in its final file, report it with the file's text; do not change either engine to flag it.

- [ ] **Step 4: The substrate passes its own rule**

Run both engines over `D:/Repos/aj-s3/src` (every `.css`), and the Task 3 template check over every `D:/Repos/aj-s3/src/app/**/*.html`. Expected: 0 everywhere.

- [ ] **Step 5: Write the rescore**

`experiments/schematic-arm/s2/app-css-rescore.md`: one paragraph stating what this is (the eight phase 2 trees rescored with `appearance-in-app-css`, a reference for phase 3, from runs that had neither the rule nor the typography and icon primitives), a table per tree (arm, run id, `appearance-in-app-css` total, and its split into text utilities, padding off the root, and other appearance), arm means, and one paragraph on what the numbers say about the size of the gate-off baseline under the new rule. One line per paragraph, no em dashes.

- [ ] **Step 6: Commit**

```bash
git add experiments/schematic-arm/s2/app-css-rescore.md
git commit -F- <<'EOF'
research(schematic-arm): rescore phase 2 trees for appearance in app css

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr
EOF
```

---

### Task 7: Registration as series 3

**Files:**
- Create: `harness/gate/s3-gate-on.settings.json` (on `research/schematic-arm`)
- Modify: mod `arm.config.json`

- [ ] **Step 1: Write the settings file**

```json
{
  "$comment": "Series 3 gate-ON condition (harness/bem-phase-3-layout-only-spec.md): every hook s2-gate-on.settings.json registers, plus check-app-css.mjs on file edits and check-src-after-bash.mjs on Bash. protect-enforcement is present in both conditions and is an experimental control, not a gate. PostToolUse hooks are registered through $CLAUDE_PROJECT_DIR so they load when the subject has cd'd into a subfolder; the shared guard keeps its series 1 form in both arms.",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|NotebookEdit|Bash|PowerShell",
        "hooks": [{ "type": "command", "command": "node .claude/hooks/protect-enforcement.mjs" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/seal-templates.mjs\"" },
          { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/check-layout.mjs\"" },
          { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/check-component-shape.mjs\"" },
          { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/check-freeloader.mjs\"" },
          { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/check-applied-appearance.mjs\"" },
          { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/check-app-css.mjs\"" }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/check-src-after-bash.mjs\"" }]
      }
    ]
  }
}
```

Verify with a node one-liner that the `PreToolUse` block is byte-identical (after `JSON.stringify`) to `s2-gate-on.settings.json`'s, and that the first six `Write|Edit|MultiEdit` commands of s3 equal s2's five plus `check-app-css`.

- [ ] **Step 2: Point the mod at series 3**

Only when no `/arm` run is active. In `arm.config.json` set `"series": 3`, `"substrate": "substrate/schematic-arm-3"`, `"gateSettings": "harness/gate/s3-gate-on.settings.json"`; add to `requiredOnSubstrate`: `.claude/hooks/check-app-css.mjs`, `.claude/hooks/check-src-after-bash.mjs`, `harness/gate/app-css/index.mjs`, `harness/rules/app-css-layout-only.md`, `libs/ui/typography/src/index.ts`, `libs/ui/icon/src/index.ts`; append to `$comment`: ` Series 3 (2026-10-16) is layout-only app stylesheets; gate-on adds check-app-css and check-src-after-bash (harness/bem-phase-3-layout-only-spec.md).` Leave `stagesRef` at `e617dca26e4caaa29cf609d80da1a17f222f2ff5`.

- [ ] **Step 3: Preflight**

From `D:/Repos/angular-jig`: `node C:/Users/psati/.claude/dev-mods/bbe683f7-6112-404d-accc-35881737d0b7/schematic-arm/bin/arm.mjs check --condition gate-off --trial 1` and the same for `gate-on`. Expected: `{"ok":true,"problems":[]}` for both. Confirm `outDirFor` places series 3 runs under `experiments/schematic-arm/s3/<condition>/` (it derives `s${series}`), and that `importCounters` loads the bem counter for series 3 (`series >= 2`).

- [ ] **Step 4: Commit**

```bash
git add harness/gate/s3-gate-on.settings.json
git commit -F- <<'EOF'
chore(gate): register the series 3 gate-on hooks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr
EOF
```

---

### Task 8: Discovery round 1

**Files:**
- Create: `experiments/schematic-arm/s3/round-1-readout.md`

- [ ] **Step 1: The owner runs six trials, one at a time**

`/arm start gate-off 1`, `/arm start gate-on 1`, `/arm start gate-off 2`, `/arm start gate-on 2`, `/arm start gate-off 3`, `/arm start gate-on 3`. After each, commit its evidence with subject `research(schematic-arm): series 3 <condition> trial <n>`. A void run is committed as a discard with its reason, and the same trial is rerun only if the void is not arm-asymmetric; an arm-asymmetric void stops the round for a ruling, as the phase 2 missions void did.

- [ ] **Step 2: After gate-on 1, confirm both hooks fire**

`hook-firings.jsonl` must show `check-app-css` and `check-src-after-bash` entries, or, if it shows neither, the run must contain no stylesheet appearance at all. Zero firings with `appearance-in-app-css > 0` stops the round.

- [ ] **Step 3: Tabulate per run**

ok, void reasons, `appearance-in-app-css`, `appearance-on-primitive` (expanded), every family's `all`, cost, turns, wall minutes, guard blocks, hook firings per hook, files changed outside `src/`, variants added per `libs/ui` primitive (from `diff.patch`), and counts of typography directives and `hlmIcon` uses in the final templates.

- [ ] **Step 4: Classify every gate firing's resolution**

For each distinct element or rule a gate-on hook fired on, trace it from the firing message to its final file and classify it: typography directive used, `hlmIcon` tone used, variant added in `libs/ui`, padding moved to the block root, styling removed, moved to a wrapper, primitive directive removed, new component created to hold block-root padding, written through the shell, or other (describe). Every class except the first four and "styling removed" is a candidate escape.

- [ ] **Step 5: Write the readout**

`experiments/schematic-arm/s3/round-1-readout.md`: setup (substrate sha, stages sha, counter sha), the per-trial table, arm means, the resolution table, the list of escapes found (each with one example), and the decision: "no new escape" (gates freeze; the confirmatory round is next) or "escapes found" (each gets a proposed rule, stated as what is allowed, for the next round). Record: the stage-6 responsive suffix exists only in gate-on; files outside `src/`; any `zz-*probe` paths. One line per paragraph, no em dashes.

- [ ] **Step 6: Commit**

```bash
git add experiments/schematic-arm/s3/round-1-readout.md
git commit -F- <<'EOF'
research(schematic-arm): series 3 discovery round 1 readout

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr
EOF
```
