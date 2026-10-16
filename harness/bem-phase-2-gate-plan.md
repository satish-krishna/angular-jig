# Phase 2 applied-appearance gate - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a gate-on-only hook that blocks appearance utilities reaching a spartan primitive through a component stylesheet's `@apply`, prove it agrees with the counter on both pilots, register it for series 2 gate-on, and run 3 gate-off plus 3 gate-on trials.

**Architecture:** A new eslint template rule, `no-applied-appearance-on-primitive`, in its own plugin (`applied`), reads the template's sibling `.css` with a small gate-side reader (`applied-utilities.ts`) and reports any primitive element whose classes receive an appearance utility. A new hook, `check-applied-appearance.mjs`, builds its own eslint config (the `check-layout.mjs` pattern) and runs on `.html` and `.css` edits under `src/`. The rule reuses the existing gate's primitive vocabulary and appearance classifier (gate-internal sharing) and shares no code with the counter. A new settings file on the launching branch registers it next to every series 1 gate-on hook.

**Tech Stack:** TypeScript eslint rules run by node type stripping (as every gate rule here), `@angular-eslint` template parser, `postcss`, vitest (`npm run test:harness`), the schematic-arm mod.

**Spec:** `harness/bem-phase-2-gate-spec.md` (branch `research/schematic-arm`). Read it before any task.

## Global Constraints

- Gate code lives on `substrate/schematic-arm-2` (worktree `D:/Repos/aj-s2`); the settings file and the trials' evidence live on `research/schematic-arm` (`D:/Repos/angular-jig`). Nothing is committed to `main`.
- The gate shares no code with `harness/counter/` (no import, no copy). It may reuse gate code under `harness/gate/`.
- The new rule is NOT added to the repo's `eslint.config.mjs` or to the `seal` plugin in `harness/gate/index.mjs`; it exists only in the hook's own config.
- Appearance is exactly the existing rule's classifier (`APPEARANCE_RE` in `harness/gate/rules/no-appearance-on-primitive.ts`), after stripping a leading or trailing `!`.
- One report per primitive element (the first offending class and utility), matching the counter's per-element semantics.
- Out of scope for the gate: global stylesheets, `:host` rules, interpolated classes and `[class]` bindings, `:is()`/`:where()` alternatives, Sass-style `&__x` (which styles nothing).
- Never `--no-verify`. Commit footer exactly: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr`.
- Markdown: one line per paragraph, US English, no em dashes. Rule docs must be LF (the rule-docs regex is anchored on `\n`; `.gitattributes` already pins `harness/rules/*.md`).
- Pilot code never goes onto the substrate: the acceptance check reads the pilots from `D:/Repos/angular-jig/experiments/` in a scratch script, because a fixture copied onto the substrate would hand the subject a prior trial's answers.
- No `/arm` run may be active while the mod is edited or branches are switched in `D:/Repos/angular-jig`.

## Review Focus

1. Selectors the reader must not misread: `.a:not(.b)` (b is not styled), `.a:nth-child(2n+1)` (the `+` is not a combinator), `.x > .a`, `.a::before`, an escaped class (`.sm\:x`). Pinned in Task 1.
2. A stylesheet edit must re-check the sibling template, or the most common drift (editing `.css` only) is never gated. Pinned in Task 2.
3. A stylesheet postcss cannot parse must block the edit with a clear message, not crash or pass. Pinned in Task 1 (rule) and Task 2 (hook).
4. Bound modifiers (`[class.x__row--active]="on"`) carry classes too. Pinned in Task 1.
5. A file outside `src/`, or a template with no sibling stylesheet, must pass silently. Pinned in Tasks 1 and 2.

---

## File Structure

On `substrate/schematic-arm-2` (`D:/Repos/aj-s2`):

- Create `harness/gate/rules/applied-utilities.ts`: the gate-side stylesheet reader (`appliedUtilities`, `styledClasses`).
- Modify `harness/gate/rules/no-appearance-on-primitive.ts`: export `isPrimitive` and `isAppearance` (no behavior change).
- Create `harness/gate/rules/no-applied-appearance-on-primitive.ts`: the rule.
- Create `harness/gate/applied-index.mjs`: the `applied` plugin.
- Create `harness/gate/applied-appearance-gate.test.mjs`: rule tests.
- Create `harness/rules/no-applied-appearance-on-primitive.md`: the rule doc.
- Create `.claude/hooks/check-applied-appearance.mjs`: the hook.
- Create `harness/gate/applied-appearance-hook.test.mjs`: hook tests.

On `research/schematic-arm` (`D:/Repos/angular-jig`):

- Create `harness/gate/s2-gate-on.settings.json`.
- Create `experiments/schematic-arm/s2/gate-arm-readout.md` (Task 5).

Mod (`C:/Users/psati/.claude/dev-mods/bbe683f7-6112-404d-accc-35881737d0b7/schematic-arm/`, not git):

- Modify `arm.config.json`: `gateSettings`.

---

### Task 1: The reader and the rule

**Files:**
- Create: `harness/gate/rules/applied-utilities.ts`
- Modify: `harness/gate/rules/no-appearance-on-primitive.ts` (two `const` declarations become `export const`)
- Create: `harness/gate/rules/no-applied-appearance-on-primitive.ts`
- Create: `harness/gate/applied-index.mjs`
- Test: `harness/gate/applied-appearance-gate.test.mjs`

**Interfaces:**
- Produces: `appliedUtilities(css: string): Map<string, string[]>`, `styledClasses(selector: string): string[]`; the plugin default export `{ meta: { name: 'applied' }, rules: { 'no-applied-appearance-on-primitive': rule } }`; messageIds `appliedAppearanceOnPrimitive` and `appliedStylesheetUnreadable`.

All commands run in `D:/Repos/aj-s2` (branch `substrate/schematic-arm-2`).

- [ ] **Step 1: Write the failing tests**

`harness/gate/applied-appearance-gate.test.mjs`:

```js
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
  it.each(['px-2', 'rounded-md', 'font-semibold', 'text-sm', 'shadow-sm', '!py-8'])('fires on %s applied to a primitive', (u) => {
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
```

- [ ] **Step 2: Run to verify they fail**

Run: `cd D:/Repos/aj-s2 && npx vitest run --config harness/vitest.config.mjs harness/gate/applied-appearance-gate.test.mjs`

Expected: FAIL, cannot find `./applied-index.mjs`.

- [ ] **Step 3: Export the two helpers from the existing rule**

In `harness/gate/rules/no-appearance-on-primitive.ts`, change `const isPrimitive = ` to `export const isPrimitive = ` and `const isAppearance = ` to `export const isAppearance = `. Nothing else changes. Its existing tests must still pass.

- [ ] **Step 4: Write the reader**

`harness/gate/rules/applied-utilities.ts`:

```ts
import postcss, { type Node, type Rule } from 'postcss';

// The gate's own reader for a component stylesheet: which utilities each class
// receives through @apply. Written from ../../bem-phase-2-gate-spec.md, not from
// the counter's harness/counter/bem/ reader: two engines, one spec, so a defect
// in one cannot blind both.

function parentRule(node: Node): Rule | null {
  let p = node.parent as Node | undefined;
  while (p && p.type !== 'rule' && p.type !== 'root') p = p.parent as Node | undefined;
  return p && p.type === 'rule' ? (p as Rule) : null;
}

// `&` followed by an identifier character is Sass concatenation; native CSS
// compiles it to a selector that matches nothing.
const CONCAT = /&[\w-]/;

function isConcatenated(rule: Rule): boolean {
  const parent = parentRule(rule);
  if (!parent) return false;
  return rule.selectors.some((s) => CONCAT.test(s)) || isConcatenated(parent);
}

function resolve(rule: Rule): string[] {
  const parent = parentRule(rule);
  const outer = parent ? resolve(parent) : [''];
  return rule.selectors.flatMap((s) => outer.map((o) => (s.includes('&') ? s.split('&').join(o) : o ? `${o} ${s}` : s)));
}

// The element a selector styles is its last compound. Combinators and class
// dots are only read at bracket depth 0, so `:nth-child(2n+1)`, `:not(.b)` and
// `[href$=".pdf"]` are never misread; a backslash escapes the next character.
export function styledClasses(selector: string): string[] {
  const s = selector.trim();
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') {
      i++;
      continue;
    }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (depth === 0 && /[\s>+~]/.test(c)) start = i + 1;
  }
  const compound = s.slice(start);
  const out: string[] = [];
  depth = 0;
  for (let i = 0; i < compound.length; i++) {
    const c = compound[i];
    if (c === '\\') {
      i++;
      continue;
    }
    if (c === '(' || c === '[') {
      depth++;
      continue;
    }
    if (c === ')' || c === ']') {
      depth--;
      continue;
    }
    if (depth !== 0 || c !== '.') continue;
    let name = '';
    let j = i + 1;
    while (j < compound.length) {
      const d = compound[j];
      if (d === '\\') {
        name += compound[j + 1] ?? '';
        j += 2;
      } else if (/[\w-]/.test(d)) {
        name += d;
        j++;
      } else break;
    }
    if (name) out.push(name);
    i = j - 1;
  }
  return out;
}

export function appliedUtilities(css: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  postcss.parse(css).walkAtRules('apply', (a) => {
    const rule = parentRule(a);
    if (!rule || isConcatenated(rule)) return;
    const tokens = a.params.split(/\s+/).filter((t) => t && t !== '!important');
    for (const sel of resolve(rule)) {
      for (const cls of styledClasses(sel)) {
        const list = map.get(cls) ?? [];
        for (const t of tokens) if (!list.includes(t)) list.push(t);
        map.set(cls, list);
      }
    }
  });
  return map;
}
```

- [ ] **Step 5: Write the rule and the plugin**

`harness/gate/rules/no-applied-appearance-on-primitive.ts`:

```ts
import { getTemplateParserServices } from '@angular-eslint/utils';
import { BindingType, type TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { createRule } from './create-rule.ts';
import { isAppearance, isPrimitive } from './no-appearance-on-primitive.ts';
import { appliedUtilities } from './applied-utilities.ts';

// What this forbids, why, and its known blind spots: see
// ../../rules/no-applied-appearance-on-primitive.md. The series 1 rule judged
// the template's class text; under the series 2 house style the utilities live
// in the component stylesheet behind BEM names, so this rule follows each class
// on a primitive into the sibling .css and judges what it @applies there.

export type Options = [];
export type MessageIds = 'appliedAppearanceOnPrimitive' | 'appliedStylesheetUnreadable';
export const RULE_NAME = 'no-applied-appearance-on-primitive';

const classesOf = (node: TmplAstElement): string[] => {
  const attr = node.attributes.find((a) => a.name === 'class');
  const own = attr && typeof attr.value === 'string' ? attr.value.split(/\s+/).filter(Boolean) : [];
  const bound = node.inputs.filter((i) => i.type === BindingType.Class).map((i) => i.name);
  return [...own, ...bound];
};

const bare = (u: string): string => u.replace(/^!|!$/g, '');

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: { description: 'Disallow appearance utilities reaching a spartan primitive through the component stylesheet.' },
    schema: [],
    messages: {
      appliedAppearanceOnPrimitive:
        'Applied appearance: "{{utility}}" reaches <{{element}}> through .{{cls}} in {{css}}. A primitive takes layout only from the app; give it the look with a variant on the primitive in libs/ui and select it with its variant input.',
      appliedStylesheetUnreadable: 'Could not read {{css}} to check what it applies to primitives: {{error}}. Fix the stylesheet.',
    },
  },
  defaultOptions: [],
  create(context) {
    const file = context.filename;
    if (!file.endsWith('.html')) return {};
    const cssPath = file.slice(0, -'.html'.length) + '.css';
    if (!existsSync(cssPath)) return {};
    const css = basename(cssPath);
    const parserServices = getTemplateParserServices(context);
    let applied: Map<string, string[]> | null = null;
    let error: string | null = null;
    try {
      applied = appliedUtilities(readFileSync(cssPath, 'utf8'));
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
    let reportedUnreadable = false;
    return {
      Element(node: TmplAstElement) {
        const loc = parserServices.convertElementSourceSpanToLoc(context, node);
        if (error !== null) {
          if (!reportedUnreadable) context.report({ loc, messageId: 'appliedStylesheetUnreadable', data: { css, error } });
          reportedUnreadable = true;
          return;
        }
        if (!isPrimitive(node)) return;
        for (const cls of classesOf(node)) {
          const utility = (applied?.get(cls) ?? []).find((u) => isAppearance(bare(u)));
          if (utility) {
            context.report({ loc, messageId: 'appliedAppearanceOnPrimitive', data: { utility, element: node.name, cls, css } });
            return;
          }
        }
      },
    };
  },
});
```

`harness/gate/applied-index.mjs`:

```js
import noAppliedAppearanceOnPrimitive from './rules/no-applied-appearance-on-primitive.ts';

// The `applied` eslint plugin: series 2's one gate. Deliberately NOT part of the
// `seal` plugin or the repo's eslint.config.mjs: it runs only inside
// .claude/hooks/check-applied-appearance.mjs, which only the gate-on settings
// register, so a gate-off run that calls `npm run lint` never receives it.
// Its counter twin is the expanded appearance-on-primitive count in
// harness/counter/bem-counter.mjs (launching branch); the two share no code.
const plugin = {
  meta: { name: 'applied', version: '1.0.0' },
  rules: { 'no-applied-appearance-on-primitive': noAppliedAppearanceOnPrimitive },
};

export default plugin;
```

- [ ] **Step 6: Run to verify they pass**

Run: `cd D:/Repos/aj-s2 && npx vitest run --config harness/vitest.config.mjs harness/gate/applied-appearance-gate.test.mjs`

Expected: PASS (18 tests: 1 + 2 + 6 + 9). If `BindingType` is not exported by `@angular-eslint/bundled-angular-compiler` in this install, report it; do not substitute a magic number.

- [ ] **Step 7: Run the whole harness suite**

Run: `cd D:/Repos/aj-s2 && npm run test:harness`

Expected: every suite that passed before still passes, including the existing `no-appearance-on-primitive` tests. Report any suite that failed before this task as pre-existing, with its error.

- [ ] **Step 8: Commit**

```bash
cd D:/Repos/aj-s2
git add harness/gate/rules/applied-utilities.ts harness/gate/rules/no-appearance-on-primitive.ts harness/gate/rules/no-applied-appearance-on-primitive.ts harness/gate/applied-index.mjs harness/gate/applied-appearance-gate.test.mjs
git commit -m "feat(gate): judge appearance that reaches a primitive through @apply

Both series 2 gate-off pilots styled primitives from the component
stylesheet, where the series 1 rule cannot see. The rule follows each
class on a primitive into the sibling .css; it shares no code with the
counter.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr"
```

---

### Task 2: The rule doc and the hook

**Files:**
- Create: `harness/rules/no-applied-appearance-on-primitive.md`
- Create: `.claude/hooks/check-applied-appearance.mjs`
- Test: `harness/gate/applied-appearance-hook.test.mjs`

**Interfaces:**
- Consumes: `harness/gate/applied-index.mjs` (Task 1); `docsPointersFor`, `agentGuidanceFor`, `formatDocPointerBlock` from `.claude/hooks/rule-docs.mjs`; `logFiring` from `.claude/hooks/_hook-log.mjs`.
- Produces: the hook command `node .claude/hooks/check-applied-appearance.mjs`.

- [ ] **Step 1: Write the rule doc**

`harness/rules/no-applied-appearance-on-primitive.md` (LF line endings):

```markdown
# no-applied-appearance-on-primitive

> Plane: sealing, series 2. Spec: [../bem-phase-2-gate-spec.md](../bem-phase-2-gate-spec.md). messageId: `appliedAppearanceOnPrimitive`. Counter twin: expanded `appearance-on-primitive` (launching branch).

## What it forbids

An appearance utility reaching a primitive element through the component's own stylesheet. A class on a primitive (`<button hlmBtn class="roster__retire">`) is followed into the sibling `.css`, and every utility that class receives through `@apply` is judged, including under `&:hover` and `@media`. Appearance is the same set as `no-appearance-on-primitive`: color, typography, border, radius, shadow, ring, and internal padding.

## Why

Series 2 moved utilities out of templates into component stylesheets behind BEM names. The series 1 rule reads the template's class text, so it stopped seeing appearance on primitives. Both series 2 gate-off pilots put padding, radius and typography on primitives this way, 13 and 11 times, while the same model never did it in series 1, where the utilities sat beside the primitive in the template.

## Accepted form

    <input hlmInput variant="search" class="roster__search">
    .roster__search { @apply w-full sm:w-64; }

## Agent guidance

A primitive takes only layout from the app stylesheet: width, margin, position, grid placement. Its color, typography, border, radius, shadow and padding come from its own `variant` and `size` inputs. When no variant gives the look you need, add one to the primitive itself: edit its owned copy in `libs/ui`, add the variant to its `cva` with semantic tokens, and select it from the template.

    Good: <input hlmInput variant="search" class="roster__search">   .roster__search { @apply w-full sm:w-64; }
    Bad:  <input hlmInput class="roster__search">                    .roster__search { @apply w-full ps-9; }

## Known blind spots

- Global stylesheets and `:host` rules are not read; the counter still counts the first.
- Classes from an interpolation or a `[class]` binding are not followed; `[class.x]` modifiers are.
- `:is()` and `:where()` alternatives are not treated as the styled element.
```

- [ ] **Step 2: Write the failing hook tests**

`harness/gate/applied-appearance-hook.test.mjs`:

```js
import { describe, it, expect, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const probeDir = join(repoRoot, 'src', 'app', 'zz-applied-probe');
const html = join(probeDir, 'zz-applied-probe.html');
const css = join(probeDir, 'zz-applied-probe.css');
const hookLog = join(probeDir, 'firings.jsonl');

function probe(cssBody) {
  mkdirSync(probeDir, { recursive: true });
  writeFileSync(html, '<button hlmBtn class="zz-applied-probe__go">Go</button>\n');
  writeFileSync(css, `@reference "../../styles.css";\n${cssBody}\n`);
}
const run = (payload) =>
  spawnSync('node', ['.claude/hooks/check-applied-appearance.mjs'], {
    cwd: repoRoot,
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    env: { ...process.env, HOOK_LOG: hookLog },
    encoding: 'utf8',
  });
const edit = (file_path) => ({ tool_name: 'Edit', tool_input: { file_path } });

afterAll(() => rmSync(probeDir, { recursive: true, force: true }));

describe('check-applied-appearance hook', () => {
  it('blocks a stylesheet edit that puts appearance on a primitive, with the rule doc guidance', () => {
    probe('.zz-applied-probe__go { @apply ps-9; }');
    const r = run(edit(css));
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('ps-9');
    expect(r.stderr).toContain('harness/rules/no-applied-appearance-on-primitive.md');
    expect(r.stderr).toContain('add the variant to its `cva`');
  });

  it('blocks the same violation when the template is the file edited', () => {
    probe('.zz-applied-probe__go { @apply rounded-md; }');
    expect(run(edit(html)).status).toBe(2);
  });

  it('passes layout-only utilities', () => {
    probe('.zz-applied-probe__go { @apply w-full ms-auto; }');
    expect(run(edit(css)).status).toBe(0);
  });

  it('passes files outside src/ and files that are neither template nor stylesheet', () => {
    expect(run(edit(join(repoRoot, 'README.md'))).status).toBe(0);
    expect(run(edit(join(repoRoot, 'harness', 'x.css'))).status).toBe(0);
    probe('.zz-applied-probe__go { @apply ps-9; }');
    expect(run(edit(join(probeDir, 'zz-applied-probe.ts'))).status).toBe(0);
  });

  it('blocks an unreadable stylesheet', () => {
    probe('.zz-applied-probe__go { @apply ps-9;');
    expect(run(edit(css)).status).toBe(2);
  });

  it('fails closed on an unparseable payload', () => {
    expect(run('not json').status).toBe(2);
  });
});
```

Run: `cd D:/Repos/aj-s2 && npx vitest run --config harness/vitest.config.mjs harness/gate/applied-appearance-hook.test.mjs`

Expected: FAIL (the hook file does not exist; `node` exits 1, not 2 or 0).

- [ ] **Step 3: Write the hook**

`.claude/hooks/check-applied-appearance.mjs`:

```js
#!/usr/bin/env node
// PostToolUse applied-appearance gate (series 2, harness/bem-phase-2-gate-spec.md).
// When the agent edits a component template or stylesheet under src/, lint the
// template with the `applied` rule, which follows each class on a primitive into
// the sibling stylesheet. A stylesheet edit re-checks its sibling template,
// because changing an @apply changes what lands on the template's primitives.
//
// Self-contained, like check-layout.mjs: it builds its own eslint config and
// does not touch the repo's eslint.config.mjs, so the rule exists only when this
// hook is registered, and only harness/gate/s2-gate-on.settings.json (launching
// branch) registers it. Present-but-unregistered in gate-off.
//
// Fails closed on an unparseable payload or an eslint failure.

import { ESLint } from 'eslint';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import angular from 'angular-eslint';
import applied from '../../harness/gate/applied-index.mjs';
import { logFiring } from './_hook-log.mjs';
import { docsPointersFor, agentGuidanceFor, formatDocPointerBlock } from './rule-docs.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const config = [
  { ignores: ['dist/**', '.angular/**', 'node_modules/**', 'coverage/**', 'libs/**'] },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { applied },
    linterOptions: { noInlineConfig: true },
    rules: { 'applied/no-applied-appearance-on-primitive': 'error' },
  },
];

async function main() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.stderr.write('check-applied-appearance: could not parse hook payload; failing closed.\n');
    process.exit(2);
  }

  const file = payload.tool_input?.file_path ?? payload.tool_input?.filePath ?? null;
  if (!file) process.exit(0);
  const normalized = String(file).replaceAll('\\', '/');
  if (!/(^|\/)src\//.test(normalized)) process.exit(0);
  let template;
  if (normalized.endsWith('.html')) template = file;
  else if (normalized.endsWith('.css')) template = String(file).replace(/\.css$/, '.html');
  else process.exit(0);
  if (!existsSync(template)) process.exit(0);

  let eslint;
  let results;
  try {
    eslint = new ESLint({ cwd: ROOT, overrideConfigFile: true, overrideConfig: config });
    results = await eslint.lintFiles([template]);
  } catch (err) {
    process.stderr.write(`check-applied-appearance: eslint failed (${err?.message ?? err}).\n`);
    process.exit(2);
  }

  const shown = String(template).replaceAll('\\', '/');
  const messages = [];
  for (const r of results) {
    for (const m of r.messages) {
      if (m.severity === 2) messages.push(`${shown}:${m.line}:${m.column}  ${m.message}`);
    }
  }
  if (messages.length === 0) process.exit(0);

  let pointers = [];
  let guidance = [];
  try {
    pointers = docsPointersFor(eslint, results);
    guidance = agentGuidanceFor(pointers);
  } catch {
    pointers = [];
    guidance = [];
  }
  logFiring('check-applied-appearance', normalized, messages, pointers.map((p) => p.ruleId));
  process.stderr.write(
    `Applied-appearance gate blocked this edit: ${messages.length} violation(s).\n` +
      messages.map((m) => `  ${m}`).join('\n') +
      '\n' +
      formatDocPointerBlock(pointers.map((p) => `  ${p.ruleId}  ->  ${p.url}`)) +
      (guidance.length ? `${guidance.join('\n\n')}\n\n` : '') +
      'Fix the above before continuing.\n',
  );
  process.exit(2);
}

main();
```

- [ ] **Step 4: Run to verify the hook tests pass**

Run: `cd D:/Repos/aj-s2 && npx vitest run --config harness/vitest.config.mjs harness/gate/applied-appearance-hook.test.mjs`

Expected: PASS, 6 tests. Then `git status --short` shows no `src/app/zz-applied-probe` left behind.

- [ ] **Step 5: Run the whole harness suite**

Run: `cd D:/Repos/aj-s2 && npm run test:harness`

Expected: as after Task 1, plus the 6 new hook tests. `harness/gate/protected-paths.test.mjs` and `protect-enforcement.test.mjs` still pass (the new files sit under already-protected paths).

- [ ] **Step 6: Commit**

```bash
cd D:/Repos/aj-s2
git add harness/rules/no-applied-appearance-on-primitive.md .claude/hooks/check-applied-appearance.mjs harness/gate/applied-appearance-hook.test.mjs
git commit -m "feat(gate): the applied-appearance hook and its rule doc

Runs on template and stylesheet edits under src/, re-checking the
sibling template when a stylesheet changes. Builds its own eslint
config, so only the series 2 gate-on settings can turn it on.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr"
```

---

### Task 3: Acceptance: the gate agrees with the counter on both pilots

**Files:**
- Create (scratch, not committed): `C:/Users/psati/AppData/Local/Temp/claude/D--Repos-blog/bbe683f7-6112-404d-accc-35881737d0b7/scratchpad/agree.mjs`

**Interfaces:**
- Consumes: `D:/Repos/aj-s2/harness/gate/applied-index.mjs`; the pilots' `impl/src/app` trees and `tally.json` under `D:/Repos/angular-jig/experiments/schematic-arm/s2/gate-off/`.

- [ ] **Step 1: Write the agreement script**

```js
// Lints every pilot template that has a sibling stylesheet with the gate's rule,
// then compares (file, line) pairs with the counter's committed
// appearance-on-primitive violations from the same run.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

// Bare imports resolve from the script's folder, so resolve the worktree's
// packages explicitly.
const AJ = 'D:/Repos/aj-s2';
const req = createRequire(join(AJ, 'package.json'));
const load = async (id) => import(pathToFileURL(req.resolve(id)).href);
const { Linter } = await load('eslint');
const { default: angular } = await load('angular-eslint');
const { default: applied } = await import(pathToFileURL(join(AJ, 'harness/gate/applied-index.mjs')).href);
const config = [{ files: ['**/*.html'], plugins: { applied }, languageOptions: { parser: angular.templateParser }, rules: { 'applied/no-applied-appearance-on-primitive': 'error' } }];

const runs = readdirSync('D:/Repos/angular-jig/experiments/schematic-arm/s2/gate-off').map((r) => join('D:/Repos/angular-jig/experiments/schematic-arm/s2/gate-off', r));
const walk = (d) => readdirSync(d).flatMap((e) => (statSync(join(d, e)).isDirectory() ? walk(join(d, e)) : [join(d, e)]));
let ok = true;
for (const run of runs) {
  const impl = join(run, 'impl');
  const gate = new Set();
  for (const f of walk(join(impl, 'src/app')).filter((f) => f.endsWith('.html') && existsSync(f.replace(/\.html$/, '.css')))) {
    const rel = relative(impl, f).replaceAll('\\', '/');
    for (const m of new Linter({ cwd: impl }).verify(readFileSync(f, 'utf8'), config, { filename: f })) gate.add(`${rel}:${m.line}`);
  }
  const counter = new Set(JSON.parse(readFileSync(join(run, 'tally.json'), 'utf8')).violations.filter((v) => v.kind === 'appearance-on-primitive').map((v) => `${v.file}:${v.line}`));
  const onlyGate = [...gate].filter((k) => !counter.has(k));
  const onlyCounter = [...counter].filter((k) => !gate.has(k));
  console.log(run.split(/[\\/]/).pop(), 'counter', counter.size, 'gate', gate.size, 'onlyGate', onlyGate, 'onlyCounter', onlyCounter);
  if (onlyGate.length || onlyCounter.length) ok = false;
}
console.log(ok ? 'AGREE' : 'DISAGREE');
```

- [ ] **Step 2: Run it**

Run: `node C:/Users/psati/AppData/Local/Temp/claude/D--Repos-blog/bbe683f7-6112-404d-accc-35881737d0b7/scratchpad/agree.mjs`

Expected: two lines, counter 13 / gate 13 and counter 11 / gate 11, both with empty `onlyGate` and `onlyCounter`, then `AGREE`.

- [ ] **Step 3: On disagreement, decide which engine is wrong**

For each `onlyGate` or `onlyCounter` entry, read the template line and its stylesheet and decide from the spec which engine is right. If the gate is wrong, fix the gate (Task 1 files) with a new test that pins the case, re-run Task 1's tests and this script, and commit as `fix(gate): ...`. If the counter is wrong, do not change it (it is frozen for the series); record the case in the task report as a counter defect for the owner. Report every disagreement and its ruling.

---

### Task 4: Register the gate for series 2 gate-on

**Files:**
- Create: `D:/Repos/angular-jig/harness/gate/s2-gate-on.settings.json`
- Modify: mod `arm.config.json` (`gateSettings`)

- [ ] **Step 1: Write the settings file on the launching branch**

`D:/Repos/angular-jig/harness/gate/s2-gate-on.settings.json`:

```json
{
  "$comment": "Series 2 gate-ON condition (harness/bem-phase-2-gate-spec.md): every hook capstone-gate-on.settings.json registers, plus check-applied-appearance.mjs, the one gate series 2 adds. The series 1 file is left unchanged. protect-enforcement is present in both conditions and is an experimental control, not a gate.",
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
          { "type": "command", "command": "node .claude/hooks/seal-templates.mjs" },
          { "type": "command", "command": "node .claude/hooks/check-layout.mjs" },
          { "type": "command", "command": "node .claude/hooks/check-component-shape.mjs" },
          { "type": "command", "command": "node .claude/hooks/check-freeloader.mjs" },
          { "type": "command", "command": "node .claude/hooks/check-applied-appearance.mjs" }
        ]
      }
    ]
  }
}
```

Verify the PreToolUse and the first four PostToolUse entries are byte-for-byte the same as `harness/gate/capstone-gate-on.settings.json`'s (compare with `node -e` parsing both and deep-comparing `hooks.PreToolUse` and `hooks.PostToolUse[0].hooks.slice(0,4)`).

- [ ] **Step 2: Commit on the launching branch**

```bash
cd D:/Repos/angular-jig
git add harness/gate/s2-gate-on.settings.json
git commit -m "feat(gate): series 2 gate-on settings with the applied-appearance hook

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr"
```

- [ ] **Step 3: Point the mod at it**

In the mod's `arm.config.json`, set `"gateSettings": "harness/gate/s2-gate-on.settings.json"`. Extend `$comment` with: `Series 2 gate-on registers check-applied-appearance (harness/bem-phase-2-gate-spec.md).` Leave `gateOffSettings` unchanged.

- [ ] **Step 4: Preflight both conditions**

From `D:/Repos/angular-jig` run the mod's check for `gate-off` and for `gate-on`, trial 1 each, in the same form as before (`node C:/Users/psati/.claude/dev-mods/bbe683f7-6112-404d-accc-35881737d0b7/schematic-arm/bin/arm.mjs check --condition <c> --trial 1`).

Expected: both print `{"ok":true,"problems":[]}`.

- [ ] **Step 5: Confirm the substrate tip carries the gate**

Run: `git -C D:/Repos/angular-jig show substrate/schematic-arm-2:.claude/hooks/check-applied-appearance.mjs | head -3`

Expected: the hook's header comment (the worktree's commits are on the shared branch).

---

### Task 5: The six trials and the readout

Before Task 5: the final whole-branch review over Tasks 1 to 4 has come back clean.

- [ ] **Step 1: The owner runs the trials**

With `D:/Repos/angular-jig` on `research/schematic-arm` and a clean tree, the owner types, one at a time, committing each trial's evidence before the next (the mod refuses to start while `experiments/` has uncommitted evidence):

```
/arm start gate-off 1
/arm start gate-on 1
/arm start gate-off 2
/arm start gate-on 2
/arm start gate-off 3
/arm start gate-on 3
```

Interleaving the arms spreads any time-of-day drift in the model service across both.

After each run, commit its evidence: `git add experiments/schematic-arm/s2 && git commit` with subject `research(schematic-arm): series 2 <condition> trial <n>` and the footer.

- [ ] **Step 2: Tabulate**

For each of the six runs read `meta.json`: `ok`, `voidReasons`, `counterTotals` (`seal['appearance-on-primitive']` and every family's `all`), `cost.costUsd`, `cost.numTurns`, `guardBlocks`, `hookFirings`, and `changedFiles` outside `src/`. Void runs are replaced with a re-run of the same condition before the readout.

- [ ] **Step 3: Apply the spec's rule and write the readout**

`experiments/schematic-arm/s2/gate-arm-readout.md`: the six-row table, the two arm means for expanded `appearance-on-primitive`, cost and turns, and the verdict:

- works: gate-on mean at most 1 and gate-off mean at least 5;
- does not work: gate-on mean above half the gate-off mean;
- otherwise: partial effect, with the numbers.

Commit it with subject `research(schematic-arm): series 2 gate arm readout`.
