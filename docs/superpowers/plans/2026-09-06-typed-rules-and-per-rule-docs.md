# Typed Rules and Per-Rule Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the 26 gate rules from untyped `.mjs` object literals to TypeScript `ESLintUtils.RuleCreator` rules with a generated docs URL, split the monolithic specs into one doc per rule, and surface that pointer to the agent through the hooks — without changing what a single rule detects.

**Architecture:** Rules move to `.ts` and run under Node's native type stripping, so there is no build step and no output directory. `RuleCreator` is instantiated with a URL function so `harness/rules/<rule-name>.md` is derived from the rule name and cannot drift. The four plugin index files and the hooks are the only consumers that change. The counter engine is not touched, which is what keeps the gate-versus-counter cross-check a real check rather than a tautology.

**Tech Stack:** Node 24.18.0 (native `--experimental-strip-types`, on by default), eslint 10.9.1, typescript-eslint 8.69, angular-eslint 22.2, TypeScript 6.0, vitest 4.

**Spec:** `/Repos/prompt-angular-jig.md` (the originating brief). Findings that correct it are recorded in `docs/findings/2026-09-06-prompt-corrections.md`, produced by Task 7.

---

## Global Constraints

- **No build step, no bundler, no output directory.** If a case appears to need one, stop and report rather than adding one.
- **No enums, no namespaces, no parameter properties** anywhere under `harness/gate/`. Node runs in strip-only mode and rejects any TypeScript construct that needs code generation. Use union types or `as const` objects.
- **`noInlineConfig` stays `true`** in every eslint config in this repo. Nothing in this work may introduce a suppression path.
- **Do not touch `harness/counter/*`.** The two engines are deliberately independent.
- **`npm run test:harness` must report 107 passing tests** at the end of Task 0 and at the end of Task 1. See Task 0 — the pre-existing count is 103 passing plus one suite that never loads. From Task 2 onward the count may only *grow*, by exactly the tests that task adds (134 after Task 2, 136 after Task 3); **no pre-existing test may be deleted, skipped, or changed.** The frozen thing is the existing suite, not the integer.
- **Every `countByMessageId` assertion is the contract.** If one appears to need changing, stop and report rather than updating the expectation.
- **Every rule keeps `type: 'problem'`, `schema: []`, and exactly one messageId,** spelled exactly as it is spelled today. The messageId is the join key to the counter's `kind`; renaming one silently unhooks a rule from its cross-check.
- **Separate commits** per task as specified. A bisect has to be able to tell the migration from the docs split from the hook change.

## Established facts (verified in-repo on 2026-09-06, do not re-verify)

| Claim | Status |
|---|---|
| Node 24.18.0 imports a `.ts` rule through `eslint.config.mjs` with no loader | Verified, lints correctly |
| `ESLintUtils.RuleCreator(url)` sets `meta.docs.url`, readable via `eslint.getRulesMetaForResults(results)` | Verified, returns `{description, url}` |
| A lint *message* object has no URL field (`ruleId, severity, message, line, column, messageId, endLine, endColumn`) | Verified |
| `tsc --strict` rejects a misspelled `messageId` inside a `RuleCreator` template-rule visitor | Verified — `TS2322: Type '"probeHitTypo"' is not assignable to type '"probeHit"'` |
| `"type": "module"` in `package.json` breaks nothing (`ng build`, `eslint src`, `vitest` all pass; zero tracked `.js` files) | Verified |
| The helpers are imported only by rules under `harness/gate/rules/`, never by the counter | Verified |
| All 26 rules are `type: 'problem'`, `schema: []`, one messageId each | Verified |

## The rules, and which plugin owns each

| Plugin | Surface | Rule | messageId |
|---|---|---|---|
| `seal` | template | `no-raw-control` | `rawControl` |
| `seal` | template | `no-appearance-on-primitive` | `appearanceOnPrimitive` |
| `seal` | template | `no-style-attribute` | `styleAttribute` |
| `seal` | template | `no-raw-icon` | `rawIcon` |
| `seal` | template | `no-unknown-primitive` | `unknownPrimitive` |
| `seal` | template | `no-missing-composition-part` | `missingCompositionPart` |
| `layout` | template | `no-raw-palette-color` | `rawPaletteColor` |
| `layout` | template | `no-space-utility` | `spaceUtility` |
| `layout` | template | `no-nested-flex-grid` | `nestedFlexGrid` |
| `freeloader` | template | `no-legacy-control-flow` | `legacyControlFlow` |
| `freeloader` | template | `no-ng-class-style` | `ngClassStyle` |
| `shape` | TypeScript | `no-hand-set-change-detection` | `handSetChangeDetection` |
| `shape` | TypeScript | `no-component-subscribe` | `componentSubscribe` |
| `shape` | TypeScript | `no-forms-module` | `formsModule` |
| `shape` | TypeScript | `no-restated-validator` | `restatedValidator` |
| `shape` | TypeScript | `no-presentational-inject` | `presentationalInject` |
| `shape` | TypeScript | `no-reactive-form` | `reactiveForm` |
| `shape` | TypeScript | `no-root-provided-view-model` | `vmNotComponentScoped` |
| `shape` | TypeScript | `no-state-outside-view-model` | `stateOutsideVm` |
| `shape` | TypeScript | `no-feature-inject-data` | `featureInjectsData` |
| `shape` | TypeScript | `no-unprovided-view-model` | `vmNotProvided` |
| `shape` | TypeScript | `no-explicit-standalone` | `explicitStandalone` |
| `shape` | TypeScript | `no-legacy-icon-module` | `legacyIconModule` |
| `shape` | TypeScript | `no-unregistered-icon` | `unregisteredIcon` |
| `shape` | template | `no-ng-model` | `ngModel` |
| `shape` | template | `no-orphan-ng-submit` | `orphanNgSubmit` |

Helpers (no rule, but they convert too): `component-util`, `primitive-vocabulary`.

---

## Task 0: repair the red baseline before measuring anything

**Why first:** the safety gate is "same test count before and after". Today `harness/gate/check-boot.test.mjs` does not run at all — vitest reports `SyntaxError: Invalid or unexpected token` and the suite loads zero tests. The cause is the `#!/usr/bin/env node` shebang on line 1 of `harness/gate/check-boot.mjs`: vitest wraps each transformed module in a function, and a `#!` inside a function body is a V8 syntax error. `node --check` passes on the same file, which is why this was not caught. Four tests are currently invisible. Measuring a refactor against a baseline that is already red is how you lose a regression.

**Files:**
- Modify: `harness/gate/check-boot.mjs:1` (delete the shebang line)

**Interfaces:**
- Produces: a green baseline of **107 passing tests across 13 suites**, which every later task asserts against.

- [ ] **Step 1: Confirm the red baseline and record it**

```bash
npm run test:harness 2>&1 | tail -8
```

Expected: `Test Files  1 failed | 12 passed (13)` and `Tests  103 passed (103)`. Save this output — it is the "before" evidence the brief asks for.

- [ ] **Step 2: Confirm the shebang is the cause, not a guess**

```bash
node --check harness/gate/check-boot.mjs && echo "node parses it fine"
```

Expected: `node parses it fine`. Node is happy; only vitest's function-wrapping transform is not.

- [ ] **Step 3: Delete the shebang**

Remove line 1 of `harness/gate/check-boot.mjs`, which is exactly:

```
#!/usr/bin/env node
```

The file is invoked as `node harness/gate/check-boot.mjs` by the `check:boot` npm script and by the driver, never as a bare executable, so the shebang bought nothing. Leave every other line untouched, including the `process.argv[1]?.endsWith('check-boot.mjs')` CLI guard at the bottom, which is what actually decides whether `cli()` runs.

- [ ] **Step 4: Verify the four tests come back**

```bash
npm run test:harness 2>&1 | tail -8
```

Expected: `Test Files  13 passed (13)` and `Tests  107 passed (107)`.

- [ ] **Step 5: Check the other shebanged files for the same latent trap**

```bash
grep -rl '^#!' harness/ .claude/hooks/
```

Expected list: `harness/driver/backfill-impl.mjs`, `harness/driver/normalize-markup.mjs`, `harness/driver/run-capstone.mjs`, `harness/driver/run-trial.mjs`, `harness/driver/summarize-capstone.mjs`, `harness/gate/check-boot.mjs` (now clean), and the six `.claude/hooks/*.mjs`. **Do not strip those.** None of them is imported by a `*.test.mjs`, so none is hit by the vitest transform, and the hooks genuinely benefit from the shebang. Only remove a shebang from a file a test imports.

- [ ] **Step 6: Commit**

```bash
git add harness/gate/check-boot.mjs
git commit -m "fix(harness): let the boot-gate suite load under vitest

A shebang on line 1 of check-boot.mjs is a V8 syntax error once vitest
wraps the module in a function, so check-boot.test.mjs loaded zero tests
and its four assertions were silently absent from every run. node --check
passes on the same file, which is why it went unnoticed. 103 -> 107.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0162mqAx9gjJyZ6DEEFidnMw"
```

---

## Task 1: TypeScript and RuleCreator

**Files:**
- Modify: `package.json` (add `"type": "module"`, add a `typecheck:harness` script)
- Create: `tsconfig.harness.json`
- Rename + rewrite: all 26 `harness/gate/rules/*.mjs` rule files to `.ts`
- Rename + rewrite: `harness/gate/rules/component-util.mjs` → `.ts`, `harness/gate/rules/primitive-vocabulary.mjs` → `.ts`
- Modify: `harness/gate/index.mjs`, `layout-index.mjs`, `component-shape-index.mjs`, `freeloader-index.mjs` (import paths only)
- Modify: `.claude/hooks/check-layout.mjs`, `check-component-shape.mjs`, `check-component-shape-guided.mjs`, `check-freeloader.mjs` (import paths only, if they name a rule file directly)

**Interfaces:**
- Produces: every rule file exports `RULE_NAME`, `Options`, `MessageIds`, and a default-exported rule built by the shared `createRule` factory.
- Produces: `harness/gate/rules/create-rule.ts` exporting `createRule`, consumed by all 26 rule files.
- Consumes: nothing from later tasks.

### Why `"type": "module"` is part of this task, not optional

Without it, every Node process that imports a `.ts` file from this repo prints to **stderr**:

```
(node:8624) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///.../no-raw-control.ts
is not specified and it doesn't parse as CommonJS. Reparsing as ES module...
```

stderr is precisely the channel the `PostToolUse` hooks use to hand the agent its corrective message. Leaving the warning in place would prepend twenty lines of Node noise to the highest-salience teaching moment the agent gets — in a repo whose Part 3 result was that corrective-message quality moved a fix rate from 0/3 to 3/3. This has been verified safe: there are zero tracked `.js` files, and `ng build`, `eslint src` and `vitest` all pass with the flag set.

- [ ] **Step 1: Add `"type": "module"` and the typecheck script to `package.json`**

Insert `"type": "module",` immediately after the `"version"` line, and add one script:

```json
    "typecheck:harness": "tsc -p tsconfig.harness.json --noEmit"
```

- [ ] **Step 2: Create `tsconfig.harness.json`**

**This file is the entire point of Task 1.** Node strips types without checking them, `tsconfig.app.json` covers only `src`, and vitest's esbuild transform also strips without checking. Without this config *nothing whatsoever* type-checks the rule files, the `MessageIds` union is decorative, and the migration buys exactly zero of the insurance it is being bought for.

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "ES2022",
    "module": "preserve",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "types": []
  },
  "include": ["harness/gate/rules/**/*.ts"]
}
```

`allowImportingTsExtensions` is required because Node's type stripping needs the literal `.ts` in the specifier; `verbatimModuleSyntax` keeps `import type` erasable, which strip-only mode requires.

- [ ] **Step 3: Verify the typecheck script fails loudly on a deliberate typo**

Before migrating anything, prove the safety net works. Create `harness/gate/rules/__probe.ts`:

```ts
import { ESLintUtils } from '@typescript-eslint/utils';
import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';

export type Options = [];
export type MessageIds = 'probeHit';

export const rule = ESLintUtils.RuleCreator((n: string) => `harness/rules/${n}.md`)<Options, MessageIds>({
  name: 'probe',
  meta: {
    type: 'problem',
    docs: { description: 'probe' },
    schema: [],
    messages: { probeHit: 'hit <{{element}}>' },
  },
  defaultOptions: [],
  create(context) {
    const services = getTemplateParserServices(context);
    return {
      Element(node: TmplAstElement) {
        context.report({
          loc: services.convertElementSourceSpanToLoc(context, node),
          messageId: 'probeHitTypo',
        });
      },
    };
  },
});
```

Run: `npm run typecheck:harness`
Expected: `error TS2322: Type '"probeHitTypo"' is not assignable to type '"probeHit"'.`

Then `rm harness/gate/rules/__probe.ts`. If that error did **not** appear, stop and report — the rest of this task is pointless without it.

- [ ] **Step 4: Create the shared rule factory**

Create `harness/gate/rules/create-rule.ts`:

```ts
// The single RuleCreator for every gate rule. The URL function derives the
// docs pointer from the rule's own name, so `harness/rules/no-raw-control.md`
// cannot drift out of sync with `no-raw-control.ts` the way a hand-written
// string would. ESLint core never dereferences this: it is inert metadata,
// reachable only through eslint.getRulesMetaForResults(). What makes it reach
// the agent is the hook change in Task 3, not this line.
//
// A repo-relative path rather than an https:// URL, deliberately. The two
// consumers are a human in an editor and an agent under test; the agent has a
// file-reading tool and no browser, and this repo is private, so a URL would be
// worthless to exactly the reader the docs are for.
import { ESLintUtils } from '@typescript-eslint/utils';

export const createRule = ESLintUtils.RuleCreator(
  (name: string) => `harness/rules/${name}.md`,
);
```

- [ ] **Step 5: Migrate the two helpers first, because every rule imports them**

Rename `component-util.mjs` → `component-util.ts` and `primitive-vocabulary.mjs` → `primitive-vocabulary.ts` with `git mv`, so the rename is visible in history:

```bash
git mv harness/gate/rules/component-util.mjs harness/gate/rules/component-util.ts
git mv harness/gate/rules/primitive-vocabulary.mjs harness/gate/rules/primitive-vocabulary.ts
```

**In the same step, repoint every rule that imports them.** Fourteen `.mjs` rule files still import `./component-util.mjs` or `./primitive-vocabulary.mjs`; those specifiers now name files that no longer exist, and Step 7's `gate.test.mjs` run loads all six seal rules, two of which import `primitive-vocabulary`. Rewrite the specifiers to `./component-util.ts` and `./primitive-vocabulary.ts` — Node imports a `.ts` from an `.mjs` without complaint. Find them with:

```bash
grep -rln "component-util\.mjs\|primitive-vocabulary\.mjs" harness/gate/rules/
```

Then add type annotations. **Change no logic and no exported name.** `primitive-vocabulary.ts` holds `PRIMITIVE_ATTRS` and `PRIMITIVE_ELEMENTS`; type them as `readonly string[]` or `ReadonlySet<string>` matching how they are actually used, and add `as const` where the values are literal collections. `component-util.ts` exports `isViewModelName`, `nearestComponentClass`, `componentDecoratorObject`, `decoratorObjectByNames`, `inComponentClass`, `inComponentOrViewModelClass`, `hasComponentDecorator`, `isUiPath`, `isDataServiceToken` — give each an explicit parameter and return type using `TSESTree` node types from `@typescript-eslint/utils`.

**No `enum`.** If the existing code has one, convert it to an `as const` object plus a derived union type.

Run: `npm run typecheck:harness`
Expected: PASS (the helpers alone, with no rules yet migrated).

- [ ] **Step 6: Migrate one template rule and run its suite**

`git mv harness/gate/rules/no-raw-control.mjs harness/gate/rules/no-raw-control.ts`, then rewrite the export. The full target shape, preserving every comment and every literal from the original:

```ts
import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { createRule } from './create-rule.ts';

// Rule 1 of the sealing spec: no native control element where a primitive
// exists. See ../../rules/no-raw-control.md. messageId `rawControl` maps to
// the counter's `raw-control` kind.
// ... (keep the rest of the original header comment verbatim)

export type Options = [];
export type MessageIds = 'rawControl';
export const RULE_NAME = 'no-raw-control';

const CONTROL_PRIMITIVE_ATTRS: Record<string, readonly string[]> = {
  // ... copy the original object verbatim, byte for byte
};

const REPLACEMENT_ONLY: Record<string, string> = {
  select: 'hlm-select',
  dialog: 'hlm-dialog',
};

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow a native control element where a spartan primitive exists.',
    },
    schema: [],
    messages: {
      rawControl: 'Sealed vocabulary: <{{element}}> {{guidance}}',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node: TmplAstElement) {
        // ... copy the original create() body verbatim
      },
    };
  },
});
```

Three things that are easy to get wrong and will not be caught by a passing build:

1. **`defaultOptions: []` is mandatory** with `RuleCreator`; `withoutDocs` is not used here because the URL is the point.
2. **The message strings must be byte-identical** to the originals. The hook stderr text and the agent's behaviour are the measured surface of this repo.
3. **Import specifiers must carry the `.ts` extension** (`'./create-rule.ts'`). Node's resolver does not guess.

- [ ] **Step 7: Update `harness/gate/index.mjs` for this one rule and run the seal suite**

Change `from './rules/no-raw-control.mjs'` to `from './rules/no-raw-control.ts'`. Leave the other five imports alone for now.

```bash
npx vitest run --config harness/vitest.config.mjs harness/gate/gate.test.mjs
```

Expected: PASS, with the `countByMessageId` assertion `{ rawControl: 2, appearanceOnPrimitive: 2, styleAttribute: 1 }` unchanged on `dirty.html`. If `rawControl` moved by even one, stop and report.

- [ ] **Step 8: Migrate the remaining five `seal` rules the same way, then commit**

`no-appearance-on-primitive`, `no-style-attribute`, `no-raw-icon`, `no-unknown-primitive`, `no-missing-composition-part`. Same recipe: `git mv`, add `Options`/`MessageIds`/`RULE_NAME`, wrap in `createRule`, add `defaultOptions: []`, type the visitor parameter as `TmplAstElement`, update `index.mjs`.

```bash
npm run typecheck:harness && npx vitest run --config harness/vitest.config.mjs harness/gate/gate.test.mjs
git add -A && git commit -m "refactor(gate): migrate the seal rules to TypeScript and RuleCreator

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0162mqAx9gjJyZ6DEEFidnMw"
```

- [ ] **Step 9: Migrate the `layout` plugin (3 rules) and commit**

`no-raw-palette-color`, `no-space-utility`, `no-nested-flex-grid`; update `harness/gate/layout-index.mjs`.

```bash
npm run typecheck:harness && npx vitest run --config harness/vitest.config.mjs harness/gate/layout-gate.test.mjs
```

Expected: PASS. Commit as `refactor(gate): migrate the layout rules to TypeScript and RuleCreator`.

- [ ] **Step 10: Migrate the `freeloader` plugin (2 rules) and commit**

`no-legacy-control-flow`, `no-ng-class-style`; update `harness/gate/freeloader-index.mjs`.

```bash
npm run typecheck:harness && npx vitest run --config harness/vitest.config.mjs harness/gate/freeloader-gate.test.mjs
```

Expected: PASS, including the `agrees with the independent counter` assertion. Commit as `refactor(gate): migrate the freeloader rules to TypeScript and RuleCreator`.

- [ ] **Step 11: Migrate the `shape` plugin (15 rules) and commit**

This is the big one, and the only one with two visitor flavours in a single plugin:

- **13 TypeScript rules** visit `TSESTree` nodes. Type the visitor parameters with `TSESTree.ClassDeclaration`, `TSESTree.CallExpression`, `TSESTree.Property` etc., imported as `import type { TSESTree } from '@typescript-eslint/utils'`.
- **2 template rules** (`no-ng-model`, `no-orphan-ng-submit`) visit `TmplAstElement` / `TmplAstBoundEvent` and use `getTemplateParserServices`, exactly like the seal rules.

Update `harness/gate/component-shape-index.mjs`. Preserve the whole messageId→kind comment block in that file; it is the map the anti-circularity test depends on.

```bash
npm run typecheck:harness && npx vitest run --config harness/vitest.config.mjs harness/gate/component-shape-gate.test.mjs
```

Expected: PASS, including both `gate and counter agree (anti-circularity)` assertions. Commit as `refactor(gate): migrate the shape rules to TypeScript and RuleCreator`.

- [ ] **Step 12: Update the hooks' import paths**

`grep -rn "rules/.*\.mjs\|-index\.mjs" .claude/hooks/` and fix any specifier that names a moved file. The index files keep their `.mjs` extension — only the `./rules/*.ts` specifiers inside them changed — so most hooks need no edit. Verify:

```bash
grep -rn "gate/rules" .claude/hooks/
```

Expected: no hits, or only hits already updated.

- [ ] **Step 13: The full safety gate**

```bash
npm run typecheck:harness
npm run test:harness
npm run lint
npm run build
```

Expected: typecheck clean; `Tests  107 passed (107)` across 13 suites; `eslint src` silent; bundle generated. Save the test output — this is the "after" evidence.

- [ ] **Step 14: Prove the hook path still works end to end**

The unit tests exercise the rules through `Linter`. They do not exercise the `eslint.config.mjs` → `.ts` import chain that the real `seal-templates` hook uses. Test it directly:

```bash
echo '{"tool_input":{"file_path":"src/app/hero-detail/hero-detail.ts"}}' | node .claude/hooks/seal-templates.mjs; echo "exit=$?"
```

Expected: `exit=0` on a clean file (or `exit=2` with a violation list on a dirty one) and — critically — **no `MODULE_TYPELESS_PACKAGE_JSON` warning in the output**. If that warning appears, `"type": "module"` did not land in `package.json`.

- [ ] **Step 15: Commit the config changes**

```bash
git add package.json tsconfig.harness.json
git commit -m "build(harness): typecheck the gate rules, and silence the typeless-module warning

tsconfig.harness.json is what makes the RuleCreator typing load-bearing:
node strips types without checking them and so does vitest's esbuild
transform, so without an explicit tsc pass the MessageIds union is
decorative. \"type\": \"module\" stops Node printing MODULE_TYPELESS_PACKAGE_JSON
into hook stderr, which is the channel the agent's corrective message uses.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0162mqAx9gjJyZ6DEEFidnMw"
```

---

## Task 2: one doc per rule, plus per-plane indexes

**Files:**
- Create: `harness/rules/<rule-name>.md` × 26
- Modify: `harness/sealing-spec.md`, `harness/layout-grammar-spec.md`, `harness/component-shape-spec.md`, `harness/freeloader-spec.md` (thin to plane indexes)
- Leave alone: `harness/responsive-spec.md`, `harness/capstone-spec.md` (neither mechanizes an eslint rule)

**Interfaces:**
- Produces: `harness/rules/<rule-name>.md` for each of the 26 rule names in the table above, at exactly the path `createRule`'s URL function generates.
- Produces: an `## Agent guidance` section in each doc, which Task 3 reads at hook time.

**The specs stay where they are.** Their paths are cited in hook stderr text and in rule header comments; moving them would break references for no gain. They become indexes in place.

- [ ] **Step 1: Create the directory and one doc, as the template for the other 25**

Create `harness/rules/no-raw-control.md`:

```markdown
# no-raw-control

> Plane: sealing. Index: [../sealing-spec.md](../sealing-spec.md). messageId: `rawControl`. Counter kind: `raw-control`.

## What it forbids

A native control element used where a spartan primitive exists for it.

Two shapes of violation:

- Most native elements have a directive twin. Any **one** of the listed attributes on the element satisfies the rule, because several Helm directives style the same native element in different compositions — `<button hlmBtn>` and `<button hlmSidebarMenuButton>` are both acceptable buttons.
- Two elements, `<select>` and `<dialog>`, have no directive twin at all. No attribute makes them acceptable; the element itself must be replaced with `<hlm-select>` or `<hlm-dialog>`.

## Why

The primitive vocabulary is sealed. A raw `<button>` is not a styling variation on `<button hlmBtn>` — it is outside the vocabulary, so it inherits no variant system, no focus ring, and no accessible defaults. The sealing plane exists because "looks close enough" is not a property a reviewer can check but is a property a parser can.

## Accepted form

    <button hlmBtn variant="ghost">Save</button>
    <input hlmInput />
    <textarea hlmTextarea></textarea>
    <hlm-select> ... </hlm-select>

## Agent guidance

Compose from spartan primitives. Change a primitive's look with its `variant`/`size` inputs or its Helm file in `libs/ui`, never a class at the call site.

    Good: <button hlmBtn variant="ghost">Save</button>   <input hlmInput />   <select> -> <hlm-select>
    Bad:  <button>Save</button>   <select>

## Known blind spots

- A native element inside a `<ng-template>` that is never rendered still reports. That is deliberate: dead markup is still markup a later edit can wake up.
- The rule checks attribute *presence*, not that the attribute is bound correctly. `<button hlmBtn>` with a broken input binding passes this rule and is caught by `strictTemplates` instead.
- A hand-built tab strip made of `<button hlmBtn>` satisfies this rule and is still an accessibility failure — there is no `role="tablist"` check anywhere in this harness. See the capstone report's accessibility section.
```

- [ ] **Step 2: Write the other 25 docs**

For each rule, the source material is the header comment already in the rule file — those comments are long, specific, and cite their spec. Move that reasoning into the doc and leave a two-line pointer in the `.ts` file. Every doc gets the same five headings: the blockquote header line, `## What it forbids`, `## Why`, `## Accepted form`, `## Agent guidance`, `## Known blind spots`.

`## Agent guidance` is not decoration — Task 3 parses it. Keep it to the corrective text plus a Good/Bad pair, and where a rule already has a worked example in `.claude/hooks/shape-guidance.mjs`, **move that example here verbatim**. The four groups and their destinations:

| `shape-guidance.mjs` export | Moves into the `## Agent guidance` of |
|---|---|
| `SHAPE_FORMS_GUIDANCE` | `no-reactive-form.md`, `no-forms-module.md`, `no-restated-validator.md`, `no-ng-model.md` |
| `MVVM_GUIDANCE` | `no-root-provided-view-model.md`, `no-state-outside-view-model.md`, `no-feature-inject-data.md`, `no-unprovided-view-model.md` |
| `ICON_GUIDANCE` | `no-legacy-icon-module.md`, `no-unregistered-icon.md` |
| `SUBMIT_GUIDANCE` | `no-orphan-ng-submit.md` |

Yes, that duplicates one worked example across four docs. That is correct: a doc named for a rule must state that rule's fix without a hop. The index links; the rule doc states. The de-duplication that matters is between *surfaces* (doc vs. hook), and Task 3 handles that by generating one from the other.

- [ ] **Step 3: Thin the four specs into plane indexes**

Each spec keeps the plane-level reasoning that belongs to no single rule — for `sealing-spec.md`, why the vocabulary is sealed at all; for `layout-grammar-spec.md`, the grammar itself and the stylelint half that has no eslint rule; for `component-shape-spec.md`, the MVVM argument and the counter-only heuristics; for `freeloader-spec.md`, what a "freeloader" is and why `strictTemplates` is the first one. Replace each per-rule section with a link:

```markdown
## The rules

| Rule | What it forbids |
|---|---|
| [no-raw-control](rules/no-raw-control.md) | A native control element where a primitive exists |
| [no-appearance-on-primitive](rules/no-appearance-on-primitive.md) | A styling class at a primitive's call site |
```

**Do not duplicate text between an index and a rule doc.** If a sentence states what one rule forbids, it belongs in that rule's doc and the index gets a link. If it explains why the plane exists, it belongs in the index and the rule doc gets a link back.

- [ ] **Step 4: Verify every generated URL resolves to a real file**

The URL is inert metadata — ESLint never dereferences it, so a broken path fails silently forever. Add a test at `harness/gate/rule-docs.test.mjs`:

```js
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import seal from './index.mjs';
import layout from './layout-index.mjs';
import shape from './component-shape-index.mjs';
import freeloader from './freeloader-index.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const allRules = Object.entries({
  ...seal.rules, ...layout.rules, ...shape.rules, ...freeloader.rules,
});

describe('every rule points at a doc that exists', () => {
  it('registers 26 rules across the four plugins', () => {
    expect(allRules.length).toBe(26);
  });

  it.each(allRules)('%s has a docs url resolving to a real file', (name, rule) => {
    const url = rule.meta?.docs?.url;
    expect(url, `${name} has no docs url`).toBeTruthy();
    expect(url).toBe(`harness/rules/${name}.md`);
    expect(existsSync(join(repoRoot, url)), `${url} does not exist`).toBe(true);
  });
});
```

Run: `npx vitest run --config harness/vitest.config.mjs harness/gate/rule-docs.test.mjs`
Expected: PASS, 27 tests. Total suite count is now **134 passing across 14 suites**.

- [ ] **Step 5: Commit**

```bash
git add harness/rules harness/*-spec.md harness/gate/rule-docs.test.mjs
git commit -m "docs(harness): split the specs into one doc per rule

Each rule now has harness/rules/<name>.md, the exact path RuleCreator's URL
function generates, with what it forbids, why, the accepted form, the agent
guidance and its known blind spots. The four specs stay in place as plane
indexes holding the reasoning that belongs to no single rule. A new test
asserts every registered rule's generated URL resolves to a real file,
because ESLint never dereferences the URL and a broken one fails silently.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0162mqAx9gjJyZ6DEEFidnMw"
```

---

## Task 3: make the pointer actually reach the agent

**Files:**
- Create: `.claude/hooks/rule-docs.mjs`
- Modify: `.claude/hooks/seal-templates.mjs`, `check-layout.mjs`, `check-component-shape.mjs`, `check-freeloader.mjs`
- Modify: `.claude/hooks/shape-guidance.mjs` (becomes a thin re-export over the docs)

**Interfaces:**
- Consumes: `harness/rules/<name>.md` and its `## Agent guidance` section, created in Task 2.
- Produces: `.claude/hooks/rule-docs.mjs` exporting `docsPointersFor(eslint, results)` and `agentGuidanceFor(ruleIds)`.

A lint message carries no URL field. If the hooks are not changed, this whole exercise changes nothing about what the agent sees. That is the entire load-bearing step.

- [ ] **Step 1: Write the shared pointer module**

Create `.claude/hooks/rule-docs.mjs`:

```js
// A lint MESSAGE has no url field - only ruleId, severity, message, line,
// column, messageId, endLine, endColumn. The docs url lives on the rule's
// META, reachable only through eslint.getRulesMetaForResults(). So the hooks
// have to fetch it and splice it in by hand; nothing surfaces it for free.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Unique `ruleId -> docs path` pairs for the rules that actually fired. */
export function docsPointersFor(eslint, results) {
  const meta = eslint.getRulesMetaForResults(results);
  const fired = new Set(
    results.flatMap((r) => r.messages).filter((m) => m.severity === 2).map((m) => m.ruleId),
  );
  const out = [];
  for (const ruleId of fired) {
    const url = meta[ruleId]?.docs?.url;
    if (url) out.push({ ruleId, url });
  }
  return out;
}

/**
 * The `## Agent guidance` section of each fired rule's doc, deduplicated by
 * body so four rules sharing one worked example print it once. The MARKDOWN is
 * the single source of truth: the hook text is generated from the doc rather
 * than kept alongside it, so the two cannot drift and the doc cannot rot
 * unnoticed - if it rots, the agent's corrective message rots with it.
 */
export function agentGuidanceFor(pointers) {
  const seen = new Set();
  const blocks = [];
  for (const { url } of pointers) {
    const path = join(ROOT, url);
    if (!existsSync(path)) continue;
    const md = readFileSync(path, 'utf8');
    const m = md.match(/\n## Agent guidance\n([\s\S]*?)(?=\n## |\s*$)/);
    if (!m) continue;
    const body = m[1].trim();
    if (!body || seen.has(body)) continue;
    seen.add(body);
    blocks.push(body);
  }
  return blocks;
}
```

- [ ] **Step 2: Write the failing test first**

Create `.claude/hooks/rule-docs.test.mjs`... **no.** The vitest config globs `harness/**/*.test.mjs`, so a test under `.claude/` would never run. Put it at `harness/gate/rule-docs-hook.test.mjs`:

```js
import { describe, it, expect } from 'vitest';
import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import angular from 'angular-eslint';
import seal from './index.mjs';
import { docsPointersFor, agentGuidanceFor } from '../../.claude/hooks/rule-docs.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const config = [{
  files: ['**/*.html'],
  plugins: { seal },
  languageOptions: { parser: angular.templateParser },
  linterOptions: { noInlineConfig: true },
  rules: { 'seal/no-raw-control': 'error', 'seal/no-style-attribute': 'error' },
}];

describe('the hooks can reach a rule doc from a lint result', () => {
  it('recovers a docs pointer that no message field carries', async () => {
    const eslint = new ESLint({ cwd: repoRoot, overrideConfigFile: true, overrideConfig: config });
    const results = await eslint.lintFiles([
      join(repoRoot, 'harness', 'counter', 'fixtures', 'dirty.html'),
    ]);

    // The premise: the message itself has no url.
    expect(results[0].messages[0]).not.toHaveProperty('url');

    const pointers = docsPointersFor(eslint, results);
    expect(pointers.length).toBeGreaterThan(0);
    expect(pointers.map((p) => p.url)).toContain('harness/rules/no-raw-control.md');
  });

  it('reads the agent guidance out of the markdown, deduplicated', async () => {
    const eslint = new ESLint({ cwd: repoRoot, overrideConfigFile: true, overrideConfig: config });
    const results = await eslint.lintFiles([
      join(repoRoot, 'harness', 'counter', 'fixtures', 'dirty.html'),
    ]);
    const blocks = agentGuidanceFor(docsPointersFor(eslint, results));
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.join('\n')).toMatch(/hlmBtn/);
    expect(new Set(blocks).size).toBe(blocks.length);
  });
});
```

Run it: expect FAIL with `Cannot find module '../../.claude/hooks/rule-docs.mjs'` if Step 1 was skipped, PASS otherwise.

- [ ] **Step 3: Splice the pointer into `seal-templates.mjs`**

The hook already builds `lines` from `errors`. After `logFiring(...)` and before the existing prose block, add:

```js
import { docsPointersFor, agentGuidanceFor } from './rule-docs.mjs';
// ...
const pointers = docsPointersFor(eslint, results);
const docLines = pointers.map((p) => `  ${p.ruleId}  ->  ${p.url}`);
```

and insert into the stderr write, between the violation list and the closing `Fix the above` line:

```js
  `\nThe rule behind each violation, and the doc that argues it:\n` +
  `${docLines.join('\n')}\n` +
  `Open the doc for the full case, the accepted form, and the rule's known blind spots.\n\n` +
```

The `eslint` instance is currently `const eslint = new ESLint({ cwd })` inside a `try`. Hoist it so it is in scope at the stderr write.

- [ ] **Step 4: Do the same for the other three hooks**

`check-layout.mjs`, `check-component-shape.mjs`, `check-freeloader.mjs`. One wrinkle in `check-layout.mjs`: it also collects **stylelint** warnings, which have no rule metadata and no docs pointer. Only build pointers from the eslint half; leave the stylelint lines as they are.

- [ ] **Step 5: Repoint `shape-guidance.mjs` at the docs**

`SHAPE_FORMS_GUIDANCE`, `MVVM_GUIDANCE`, `ICON_GUIDANCE` and `SUBMIT_GUIDANCE` now exist verbatim in the rule docs. Replace each constant's inline array with a read through `agentGuidanceFor`, keeping the exported names and the `*_RULE_IDS` sets so `check-component-shape.mjs` and `check-component-shape-guided.mjs` need no change beyond the import.

**`check-component-shape-guided.mjs` is an experiment variant and must keep behaving identically to the arm it was measured against.** If routing it through the docs would change a single byte of what it prints, leave it importing the frozen constants instead and say so in a comment.

- [ ] **Step 6: Verify the whole hook output end to end**

```bash
echo '{"tool_input":{"file_path":"harness/counter/fixtures/dirty.html"}}' | node .claude/hooks/seal-templates.mjs 2>&1; echo "exit=$?"
```

Expected: `exit=0`, because the hook's own guard only gates files under `src/`. To exercise it properly, copy a dirty fixture into `src/` temporarily, run the hook, confirm `exit=2` and that the stderr contains `harness/rules/no-raw-control.md`, then delete it.

- [ ] **Step 7: Full gate and commit**

```bash
npm run typecheck:harness && npm run test:harness && npm run lint
```

Expected: 136 passing across 15 suites (134 from Task 2 plus the two new hook tests).

```bash
git add .claude/hooks harness/gate/rule-docs-hook.test.mjs
git commit -m "feat(hooks): hand the agent the rule's doc, not just the violation

A lint message carries no url field; the docs pointer lives on rule meta and
is reachable only via getRulesMetaForResults. Without this the per-rule docs
change nothing about what the agent sees. The hooks now also read each fired
rule's '## Agent guidance' section out of its markdown, so the worked example
has one source of truth instead of two copies that drift.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0162mqAx9gjJyZ6DEEFidnMw"
```

---

## Task 4: the decision record for message shape and guidance placement

**Files:**
- Create: `docs/decisions/2026-09-06-where-guidance-lives.md`

No code. This is deliverable 4 of the brief. The full argument is in the "Decisions" section below; this task writes it up with the evidence citations.

- [ ] **Step 1: Write the decision record**

It must state, with the repo's own measurements as evidence:

1. **The three surfaces and what each carries.** Rule message: the violation and the minimal fix, one sentence, offending name interpolated — it has to stand alone in an editor gutter. Hook stderr: the violation list, the docs pointer, and the full worked example inline. Rule doc: the complete argument, the accepted form, and the blind spots.
2. **Why the worked example stays inline in the hook rather than becoming a link.** This is the load-bearing call and it cuts against the brief's framing. Part 3 measured that swapping a prose reminder for a worked example moved house-pattern adoption from 0/3 to 3/3. The capstone measured that across 36 subagents and 1,752 tool calls the spartan MCP was invoked **zero times** and no skill was ever invoked; the agent grepped library source instead of opening the doc that stated the requirement. Availability is not consultation — this repo has proved it twice with numbers. A pointer is availability. Replacing measured inline guidance with a link would be trading a measured effect for an unmeasured one.
3. **How the duplication is resolved without losing that.** One source of truth (the markdown), two rendered surfaces (doc and hook), generated at hook time by `agentGuidanceFor`. The prohibition on duplication is satisfied at the level of *maintained text*, not at the level of *bytes on a screen* — the agent still gets the whole example without a hop.
4. **The verdict on Phoenix's four-part shape** (what / why / where / how, plus an example). The hooks already deliver all five parts; they are split across the rule message (what, where) and the hook epilogue (why, how, example), and that split is correct because the two surfaces have different readers and different width budgets. **Do not fold why/how/example into the rule message.** A four-line message in an editor gutter is a worse editor experience, and the developer already has the doc link. Adopt the completeness, reject the packaging.
5. **The kill switch.** If a future gate-on trial shows house-pattern adoption falling below the 3/3 that Part 3 established, the docs-generation indirection is the first thing to revert.

- [ ] **Step 2: Commit**

```bash
git add docs/decisions/2026-09-06-where-guidance-lives.md
git commit -m "docs(decisions): where corrective guidance lives, and why not in one place

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0162mqAx9gjJyZ6DEEFidnMw"
```

---

## Task 5: write up the batching finding

**Files:**
- Create: `docs/findings/2026-09-06-batching-theory.md`
- Create: `harness/driver/analyze-streaks.mjs`

The analysis is **already done** — the numbers are in the "Task 4 finding" section below. This task commits the script that produced them so the finding is reproducible, and writes the finding up.

- [ ] **Step 1: Commit the analysis script**

Port the working script to `harness/driver/analyze-streaks.mjs` with a `--json` flag, so the numbers can be regenerated rather than trusted.

- [ ] **Step 2: Write the finding**

It must state plainly that **the batching theory does not explain this repo's long correction episodes**, give the per-streak numbers, and describe the different defect the data actually shows. Both halves matter: the brief asked for whichever answer the data gave, and the data gave the negative one.

- [ ] **Step 3: Answer the two sub-questions**

Recommendations are in the "Task 4 finding" section below; write them up with reasoning.

- [ ] **Step 4: Commit**

```bash
git add docs/findings harness/driver/analyze-streaks.mjs
git commit -m "docs(findings): the batching theory does not explain our long episodes

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0162mqAx9gjJyZ6DEEFidnMw"
```

---

## Task 6: before/after evidence

**Files:**
- Create: `docs/findings/2026-09-06-safety-gate-evidence.md`

- [ ] **Step 1: Record the evidence**

Paste the Task 0 Step 1 output (red baseline, 103), the Task 0 Step 4 output (repaired baseline, 107), and the Task 1 Step 13 output (post-migration, 107). State explicitly that every `countByMessageId` assertion passed unchanged and that no expectation was edited. If any expectation *was* edited, this document is where that gets confessed, loudly, with the reason — and the migration should be stopped instead.

- [ ] **Step 2: Commit**

```bash
git add docs/findings/2026-09-06-safety-gate-evidence.md
git commit -m "docs(findings): safety-gate evidence for the rule migration

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0162mqAx9gjJyZ6DEEFidnMw"
```

---

## Task 7: what the brief got wrong

**Files:**
- Create: `docs/findings/2026-09-06-prompt-corrections.md`

- [ ] **Step 1: Record the corrections**

The list is in the "Corrections to the brief" section below. Deliverable 5 asks for exactly this.

- [ ] **Step 2: Commit**

```bash
git add docs/findings/2026-09-06-prompt-corrections.md
git commit -m "docs(findings): where the brief's assumptions did not survive the repo

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0162mqAx9gjJyZ6DEEFidnMw"
```

---

## Task 8: arm the guard permanently, and make the firing counter actually count

**This task must run last.** Its final commit registers `protect-enforcement` for every session in this repo, and that hook denies any tool call touching `harness/`, `.claude/hooks/`, `package.json` or `experiments/` — which is most of Tasks 0-3 and all of Task 5's inputs. Land it earlier and the rest of the plan cannot be executed by an agent.

**Files:**
- Modify: `.claude/hooks/_hook-log.mjs`
- Modify: `.claude/hooks/seal-templates.mjs`, `check-layout.mjs`, `check-component-shape.mjs`, `check-freeloader.mjs`, `protect-enforcement.mjs` (the `logFiring` call sites)
- Modify: `.claude/hooks/protect-enforcement.mjs` (`PROTECTED`), `harness/driver/run-capstone.mjs` (`ENFORCEMENT_PATHS`)
- Create: `.claude/settings.json`
- Create: `harness/gate/maintenance.settings.json`
- Create: `harness/driver/firing-rollup.mjs`
- Modify: `.gitignore`, `package.json`

**Interfaces:**
- Consumes: the `pointers` array (`{ruleId, url}[]`) built by `docsPointersFor` in Task 3 — that is where the ruleIds come from.
- Produces: `.claude/hook-firings.jsonl`, appended in *every* session, and `npm run firings` to read it.

### The bug this fixes

```js
export function logFiring(hook, file, messages) {
  const path = process.env.HOOK_LOG;
  if (!path) return;          // <-- HOOK_LOG is set only by the run driver
```

Only `harness/driver/run-trial.mjs` and `run-capstone.mjs` ever set `HOOK_LOG`. In an ordinary interactive session it is unset, so every hook fires, blocks correctly, and records **nothing** — no error, no empty file, no signal. Registering the hooks permanently without fixing this produces a drift counter that reports zero forever. That is the same silent-zero shape as the shebang in Task 0 and the never-dereferenced docs URL in Task 2.

- [ ] **Step 1: Write the failing test**

Create `harness/gate/hook-log.test.mjs`:

```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, rmSync, existsSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { logFiring, DEFAULT_LOG_PATH } from '../../.claude/hooks/_hook-log.mjs';

describe('logFiring', () => {
  let dir;
  beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'firing-')); });
  afterEach(() => { delete process.env.HOOK_LOG; rmSync(dir, { recursive: true, force: true }); });

  it('keeps the verbose per-run record when HOOK_LOG is set, for the driver', () => {
    const p = join(dir, 'run.jsonl');
    process.env.HOOK_LOG = p;
    logFiring('seal-templates', 'src/a.html', ['a.html:1:1  bad'], ['seal/no-raw-control']);
    const row = JSON.parse(readFileSync(p, 'utf8').trim());
    expect(row.count).toBe(1);
    expect(row.messages).toEqual(['a.html:1:1  bad']);
  });

  it('writes a LEAN record to the default path when HOOK_LOG is unset', () => {
    const p = join(dir, 'default.jsonl');
    logFiring('seal-templates', 'src/a.html', ['a.html:1:1  bad'], ['seal/no-raw-control'], p);
    const row = JSON.parse(readFileSync(p, 'utf8').trim());
    expect(row.count).toBe(1);
    expect(row.rules).toEqual(['seal/no-raw-control']);
    expect(row).not.toHaveProperty('messages');
  });

  it('never throws into the gate when the path is unwritable', () => {
    expect(() => logFiring('h', 'f', ['m'], ['r'], join(dir, 'no', 'such', 'x.jsonl'))).not.toThrow();
  });

  it('names a default path inside .claude', () => {
    expect(DEFAULT_LOG_PATH).toMatch(/\.claude[/\\]hook-firings\.jsonl$/);
  });
});
```

Run: `npx vitest run --config harness/vitest.config.mjs harness/gate/hook-log.test.mjs`
Expected: FAIL — `DEFAULT_LOG_PATH` is not exported and `logFiring` takes three parameters.

- [ ] **Step 2: Rewrite `_hook-log.mjs` with two modes**

```js
import { appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Where an ordinary session records firings. Git-ignored; telemetry, not evidence. */
export const DEFAULT_LOG_PATH = join(ROOT, '.claude', 'hook-firings.jsonl');

/**
 * Two records, deliberately, because the two readers want different things.
 *
 * HOOK_LOG set (the run driver, per trial): the VERBOSE record, with the full
 * message text. Every file under experiments/ is in this shape and
 * harness/driver/analyze-streaks.mjs parses it. Changing it would silently
 * invalidate the batching analysis and every future re-run of it, so it does
 * not change.
 *
 * HOOK_LOG unset (an ordinary interactive session): the LEAN record - which
 * hook, which file, how many, which rules. That answers "how often is the
 * machinery catching drift, and what drift" and nothing else, which is the
 * whole brief. The message text is deliberately absent: a permanent log
 * running on every session for months would otherwise accumulate source
 * fragments nobody reads.
 *
 * Logging never throws into the gate. A gate that dies because its telemetry
 * could not write is worse than a gate with no telemetry.
 */
export function logFiring(hook, file, messages, rules = [], pathOverride = null) {
  const runPath = process.env.HOOK_LOG;
  const ts = new Date().toISOString();
  const path = pathOverride ?? runPath ?? DEFAULT_LOG_PATH;
  const record =
    runPath && !pathOverride
      ? { hook, file, count: messages.length, messages, ts }
      : { hook, file, count: messages.length, rules: [...new Set(rules)], ts };
  try {
    appendFileSync(path, JSON.stringify(record) + '\n');
  } catch {
    // Never let logging break a gate.
  }
}
```

Note the `pathOverride ?? runPath` ordering: an explicit path wins, so the test can exercise the lean branch without unsetting an env var the driver may have set.

Run the test again: Expected PASS, 4/4.

- [ ] **Step 3: Pass ruleIds at every call site**

Task 3 already computes `pointers` (`{ruleId, url}[]`) in the four gate hooks. Add the fourth argument:

```js
logFiring('seal-templates', normalized, lines, pointers.map((p) => p.ruleId));
```

`check-layout.mjs` also collects **stylelint** warnings, which carry no eslint ruleId. Its stylelint text ends in `(scale-unlimited/declaration-strict-value)`; extract it, or label the firing `stylelint` — either is fine, but a stylelint firing must not vanish from the count:

```js
const stylelintRules = messages
  .map((m) => m.match(/\(([^()]+)\)\s*$/)?.[1])
  .filter(Boolean);
logFiring('check-layout', normalized, messages, [...pointers.map((p) => p.ruleId), ...stylelintRules]);
```

`protect-enforcement.mjs` already calls `logFiring` with the blocked paths. Pass `['protect-enforcement']` as its rules so a tamper attempt shows up in the rollup as its own category — that is the single most interesting number in the file.

There are **six** call sites, not five:

| File | Line (pre-edit) | Action |
|---|---|---|
| `seal-templates.mjs` | 68 | pass `pointers.map(p => p.ruleId)` |
| `check-layout.mjs` | 147 | pass eslint ruleIds **+** the extracted stylelint rule names |
| `check-component-shape.mjs` | 115 | pass `pointers.map(p => p.ruleId)` |
| `check-freeloader.mjs` | 76 | pass `pointers.map(p => p.ruleId)` |
| `protect-enforcement.mjs` | 149 | pass `['protect-enforcement']` |
| `check-component-shape-guided.mjs` | 86 | **leave unchanged** |

`check-component-shape-guided.mjs` is the frozen experiment variant from Part 3's A/B. The new `rules` parameter defaults to `[]`, so the old three-argument call keeps working untouched — which is the point. It only ever runs under `part3-gate-on-guided.settings.json`, where the driver sets `HOOK_LOG` and the verbose branch is taken anyway, so it never reaches the lean record and loses nothing by not passing ruleIds. Do not "tidy" it.

- [ ] **Step 4: Write the rollup**

Create `harness/driver/firing-rollup.mjs`. Counts only. No dashboard, no trend line — the brief is "how many times, no more no less", and a count with no rule attached is a number nobody can act on, so rule is the minimum useful grain.

```js
// npm run firings [-- --since 2026-09-01]
// Reads the ordinary-session firing log and prints counts by hook and by rule.
import { readFileSync, existsSync } from 'node:fs';
import { DEFAULT_LOG_PATH } from '../../.claude/hooks/_hook-log.mjs';

const args = process.argv.slice(2);
const since = args.includes('--since') ? args[args.indexOf('--since') + 1] : null;

if (!existsSync(DEFAULT_LOG_PATH)) {
  process.stdout.write(`No firings recorded yet (${DEFAULT_LOG_PATH} does not exist).\n`);
  process.exit(0);
}

const rows = readFileSync(DEFAULT_LOG_PATH, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => { try { return JSON.parse(l); } catch { return null; } })
  .filter(Boolean)
  .filter((r) => !since || r.ts >= since);

const byHook = {};
const byRule = {};
for (const r of rows) {
  byHook[r.hook] = (byHook[r.hook] ?? 0) + 1;
  for (const rule of r.rules ?? []) byRule[rule] = (byRule[rule] ?? 0) + 1;
}

const table = (title, obj) => {
  process.stdout.write(`\n${title}\n`);
  const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
  if (!entries.length) { process.stdout.write('  (none)\n'); return; }
  for (const [k, n] of entries) process.stdout.write(`  ${String(n).padStart(5)}  ${k}\n`);
};

process.stdout.write(`${rows.length} firing(s)${since ? ` since ${since}` : ''}, ${new Set(rows.map((r) => r.file)).size} distinct file(s).\n`);
table('By hook', byHook);
table('By rule', byRule);
process.stdout.write('\n');
```

Add to `package.json`: `"firings": "node harness/driver/firing-rollup.mjs"`.

- [ ] **Step 5: Git-ignore the log**

Append to `.gitignore`:

```
# Ordinary-session gate telemetry. The per-run logs under experiments/ are
# evidence and ARE committed; this one is a rolling local counter and is not.
.claude/hook-firings.jsonl
```

Verify: `git status --short` shows no `.claude/hook-firings.jsonl` after a hook has fired.

- [ ] **Step 6: Close the two gaps in the protected-path lists**

`tsconfig.harness.json` (created in Task 1) decides whether the rules type-check at all. Flip `"strict": false` in it and the safety net Task 1 exists to build goes slack, silently. It appears in neither list. Add it to **both**, because they are hand-maintained and independently enforced:

- `.claude/hooks/protect-enforcement.mjs` → `PROTECTED`, next to `tsconfig.app.json`
- `harness/driver/run-capstone.mjs` → `ENFORCEMENT_PATHS`, same position

Add a test at `harness/gate/protected-paths.test.mjs` so the two lists cannot drift apart again:

```js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const listFrom = (file, name) => {
  const src = readFileSync(join(root, file), 'utf8');
  const block = src.match(new RegExp(`${name} = \\[([\\s\\S]*?)\\];`))[1];
  return [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();
};

describe('the two enforcement-path lists stay in sync', () => {
  it('protect-enforcement PROTECTED equals run-capstone ENFORCEMENT_PATHS', () => {
    const guard = listFrom('.claude/hooks/protect-enforcement.mjs', 'PROTECTED');
    const driver = listFrom('harness/driver/run-capstone.mjs', 'ENFORCEMENT_PATHS');
    expect(guard).toEqual(driver);
  });

  it('both cover the harness typecheck config', () => {
    expect(listFrom('.claude/hooks/protect-enforcement.mjs', 'PROTECTED')).toContain('tsconfig.harness.json');
  });
});
```

Run it. If the two lists already differ on something other than the new entry, **stop and report** — that is a live gap in the tamper backstop, not a housekeeping detail.

- [ ] **Step 7: Create the maintenance profile**

`protect-enforcement` in a committed `settings.json` is self-sealing: it guards `.claude/settings.json`, so once registered no agent can unregister it. That is correct, and it means work shaped like *this plan* — migrating a rule, splitting a spec, adding a gate — is impossible for an agent until a different settings file is handed in. The repo already has this pattern (`gate-on.settings.json`, `gate-off.settings.json`); this is one more.

Create `harness/gate/maintenance.settings.json`:

```json
{
  "$comment": "Maintenance profile: for sessions whose JOB is to change the harness - migrating a rule, splitting a spec, adding a gate. The house-convention PostToolUse gates stay registered, because a maintenance session still edits src/ and should still obey the constitution. protect-enforcement is deliberately ABSENT, because the thing it forbids is the thing this session was invoked to do. Use: claude --settings harness/gate/maintenance.settings.json. This is not a dial on the gate: the gate rules are unchanged and un-suppressible in every arm. It is a different operator, not a weaker rule.",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          { "type": "command", "command": "node .claude/hooks/seal-templates.mjs" },
          { "type": "command", "command": "node .claude/hooks/check-layout.mjs" },
          { "type": "command", "command": "node .claude/hooks/check-component-shape.mjs" },
          { "type": "command", "command": "node .claude/hooks/check-freeloader.mjs" }
        ]
      }
    ]
  }
}
```

- [ ] **Step 8: Write the committed `settings.json` — the arming commit**

Create `.claude/settings.json`:

```json
{
  "$comment": "The constitution, always on. Every session in this repo now runs the full edit-time gate plus the enforcement guard; the experiment phase is over and these are house rules rather than an experimental arm. Firings are recorded to .claude/hook-firings.jsonl (git-ignored) on every session - read them with `npm run firings`. To do maintenance ON the harness itself, launch with --settings harness/gate/maintenance.settings.json, which drops protect-enforcement and keeps the gates.",
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
          { "type": "command", "command": "node .claude/hooks/check-freeloader.mjs" }
        ]
      }
    ]
  }
}
```

**Do not add `.claude/settings.local.json` to git.** It is already in `PROTECTED` and holds the operator's own output-style choice.

- [ ] **Step 9: Prove the counter counts before trusting it**

The whole point of this task is that a silent zero is indistinguishable from a clean repo. Verify by hand, once:

```bash
rm -f .claude/hook-firings.jsonl
cp harness/counter/fixtures/dirty.html src/__firing-probe.html
echo '{"tool_name":"Write","tool_input":{"file_path":"src/__firing-probe.html"}}' | node .claude/hooks/seal-templates.mjs; echo "exit=$?"
cat .claude/hook-firings.jsonl
echo '{"tool_name":"Edit","tool_input":{"file_path":"harness/gate/index.mjs"}}' | node .claude/hooks/protect-enforcement.mjs; echo "exit=$?"
npm run firings
rm -f src/__firing-probe.html
```

Expected: the seal hook exits 2 and appends one lean row carrying `"rules":["seal/no-raw-control", ...]` and **no** `messages` key; `protect-enforcement` exits 2 and appends its own row; `npm run firings` prints non-zero counts under both `By hook` and `By rule`. If the file is missing or empty, this task has failed at the one thing it exists to do.

- [ ] **Step 10: Full gate**

```bash
npm run typecheck:harness && npm run test:harness && npm run lint && npm run build
git status --short   # must NOT list .claude/hook-firings.jsonl
```

Expected: 142 passing across 17 suites (136 after Task 3, plus 4 hook-log tests and 2 protected-path tests).

- [ ] **Step 11: Commit**

```bash
git add .claude/settings.json .claude/hooks .gitignore package.json \
        harness/gate/maintenance.settings.json harness/gate/hook-log.test.mjs \
        harness/gate/protected-paths.test.mjs harness/driver
git commit -m "feat(gate): arm the constitution for every session, and make firings countable

The experiment phase is over: settings.json now registers the four gate hooks
and protect-enforcement in every session, not just a driver-launched trial.

logFiring was a no-op whenever HOOK_LOG was unset, which is every ordinary
session - so arming the hooks without this would have produced a drift counter
that reported zero forever, with no error to notice. It now writes a lean
record (hook, file, count, rules) to a git-ignored .claude/hook-firings.jsonl
by default, and keeps the verbose per-run record untouched when the driver sets
HOOK_LOG, because experiments/ and analyze-streaks.mjs parse that shape.

tsconfig.harness.json decides whether the rules type-check at all and was in
neither protected-path list; it is now in both, with a test that keeps the two
lists from drifting apart again.

maintenance.settings.json is how a session that is SUPPOSED to change the
harness gets to: the gates stay, protect-enforcement goes. Not a dial on the
rules - a different operator.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0162mqAx9gjJyZ6DEEFidnMw"
```

- [ ] **Step 12: Tell the operator what just changed about their sessions**

After this commit, an ordinary `claude` in this repo cannot edit `harness/`, `.claude/hooks/`, `package.json`, `tsconfig*.json`, `eslint.config.mjs`, `stylelint.config.mjs` or `experiments/` — and cannot read `experiments/` through Bash either, since the guard's Bash arm scans command text. That is the intent. The escape is `claude --settings harness/gate/maintenance.settings.json`, and it must be stated in the final report, not left to be discovered.

---

# The findings this plan is built on

## Task 4 finding: the batching theory is refuted, and something worse is going on

Method: every `hook-firings.jsonl` under `experiments/` (16 logs, 179 firings). An *episode* is a maximal run of consecutive firings, in timestamp order within one trial, on the same `(hook, file)` pair. Message identity strips the leading `path:line:col` so the same violation at a drifted line still compares equal.

**Episode depth, n = 141 episodes:**

| depth | episodes | share |
|---|---|---|
| 1 | 125 | 89% |
| 2 | 9 | 6% |
| 3 | 4 | 3% |
| 4 | 1 | 1% |
| 5 | 1 | 1% |
| **19** | 1 | 1% |

**The batching test, across all 38 within-episode transitions:**

| `count` movement | transitions | share |
|---|---|---|
| fell by exactly 1 — the queue-walk signature | 6 | 16% |
| fell by more than 1 — a batch fix | 4 | 11% |
| **flat or rose — no progress at all** | **28** | **74%** |

**Verdict: `count` does not step down one at a time. It mostly does not move.** Phoenix's architectural claim — that tool calls surface failures one at a time and so force a serial walk — does not describe this harness. Our hooks already return every violation in the edited file on every firing (mean 2.94, max 28), which is the batching he prescribes. We already have the property; it is not what is costing us.

**What the long episodes actually are.** The single 19-firing episode, `seal-templates` on `hero-detail.ts` in capstone gate-on t2:

```
 1 n=5  15:47:42  79,80,81,82 <button> | 270 <textarea>
 2 n=4  15:48:47  74,75,76,77 <button>
 3 n=4  15:49:15  72,73,74,75 <button>
 4 n=4  15:49:17  72,73,74,75 <button>
 5 n=4  15:49:19  72,73,74,75 <button>
 6 n=4  15:49:33  72,73,74,75 <button>
 7 n=4  15:49:35  72,73,74,75 <button>
 8 n=4  15:49:38  72,73,74,75 <button>
 9 n=4  15:49:40  72,73,74,75 <button>
10 n=4  15:49:42  72,73,74,75 <button>
11 n=4  15:49:44  72,73,74,75 <button>
12 n=4  15:49:46  72,73,74,75 <button>
13 n=4  15:50:16  71,72,73,74 <button>
14-18   ... identical, 71,72,73,74
19 n=4  15:51:21  66,67,68,69 <button>
```

Firings 3 through 12: **ten consecutive rejections, two seconds apart, naming the same four buttons at the same four line numbers.** The agent is editing the file — the hook only fires on a `PostToolUse` — and the reported lines do not move, which means those edits were *below* line 75 or line-count-neutral. Between firings 12 and 13 the file shortened by one line above the buttons; between 18 and 19 by five.

The agent was working somewhere else in the file and being blocked, every two seconds, by four violations its edit never touched.

That is not a queue our message design created. It is a different defect: **the hook gates the whole file on every edit, so pre-existing violations anywhere in the file block unrelated work indefinitely.** The batching fix Phoenix prescribes would make this *worse* — it is more violations per rejection, and the ones that block you are the ones you are not working on.

The four buttons, incidentally, were a hand-rolled tab strip, eventually resolved as `<button hlmBtn variant="ghost">` — which satisfies the rule and is the same hand-built tab strip with no `role="tablist"` that the capstone accessibility review lists as a failure class. The gate spent nineteen rejections steering the agent to a compliant version of the wrong thing.

**Recommendation (out of scope for this branch, offered as a follow-up):** report all violations, but block only on violations whose line range intersects the edit. Report the rest as context. That keeps the batching property, removes the wedge, and is a change to the instrument that needs its own A/B rather than a quiet commit.

### Sub-question 1: should the agent write its own Playwright script per feature?

**No.** `check-boot.mjs` already clicks every visible enabled button on every route and captures `pageerror` and `console.error`; `responsive-auditor.mjs` already sweeps breakpoints. What a per-feature script would add is *semantic* assertions — "after clicking Retire, the hero leaves the roster" — and that is a test, not a gate. The distinction this repo already draws holds: a gate encodes a property that is true of all correct programs, and an agent that writes its own gate grades its own homework. The measured evidence is on this side too: an agent that never opened the docs it was handed is not an agent whose self-authored acceptance criteria should be load-bearing.

The gap is real but it is not Playwright-shaped. It is accessibility — nine distinct failure classes across the gate-on builds, nothing checking any of them, and most of it decidable from the template AST that six of these rules already walk. That is the largest unbuilt thing in the repo and it is worth more than any loop.

### Sub-question 2: does his loop change "gates belong at the earliest point a property becomes decidable"?

**It relocates the same check; the conclusion stands.** A browser cannot run per-edit — `check-boot.mjs` shells out to `ng build` first — so a rendering property is not decidable at edit time no matter how the loop is packaged. The principle already predicts the split this repo has: AST properties gate the edit, rendering properties gate the build. The capstone's own finding sharpens rather than softens it — the three fatal defects were DI failures that *no* static rule could reach, which is the principle working, not failing. What the loop offers is a faster inner cycle for the build-time tier, and that is a scheduling improvement, not an architectural one.

## Decisions

**Extension and module type: `.ts`, with `"type": "module"` in `package.json`.** `.mts` also works and needs no `package.json` change, but `.ts` matches the angular-eslint guide the brief is following, and `"type": "module"` is independently worth having: without it every `.ts` import prints `MODULE_TYPELESS_PACKAGE_JSON` to stderr, which is the channel the corrective messages travel on. Verified safe — zero tracked `.js` files, and `ng build`, `eslint src` and `vitest` all pass with it set.

**A `tsconfig.harness.json` and a `typecheck:harness` script are not optional extras.** Node strips types without checking them. Vitest's esbuild transform strips without checking them. `tsconfig.app.json` includes only `src`. As the brief is written, the migration would land with *nothing at all* type-checking the rule files, and the `MessageIds` union — the entire justification for the exercise — would be decorative. This is the one place the brief's plan does not deliver the brief's stated goal, and Task 1 Step 3 proves the net works before relying on it.

**Guidance placement:** see Task 4. Short version — one source of truth in the markdown, rendered to two surfaces, worked example stays inline in hook stderr because this repo has measured twice that availability is not consultation.

## Corrections to the brief

1. **The baseline is red.** `harness/gate/check-boot.test.mjs` loads zero tests under vitest because of a shebang, so the "same test count before and after" gate would have been measured against 103 when the true figure is 107. Task 0.
2. **Nothing type-checks the rule files.** The brief specifies the typing but not the pass that enforces it, and node/vitest both strip without checking. Task 1 Steps 2–3.
3. **The Task 4 premise numbers are not in this repo.** "52% of correction episodes cleared on the first rejection" and "the worst took nine consecutive rejections" appear nowhere in `experiments/`, `harness/`, or any report; there is no episode-analysis code in the repo at all. The measured figures are **89% at depth 1** and a worst case of **19**.
4. **The batching theory is refuted**, and the actual defect is whole-file gating on every edit. See above.
5. **`npm run lint` exercises 6 of the 26 rules.** `eslint.config.mjs` registers only the `seal` plugin; the other twenty exist solely inside the hooks. This is deliberate — it is what preserves the gate-off baseline — but "run `npm run lint` to check the migration" would give false confidence over three quarters of the work. The per-plugin vitest suites are the real check.
6. **The `MODULE_TYPELESS_PACKAGE_JSON` warning contaminates hook stderr.** Not mentioned in the brief; addressed by `"type": "module"`.
7. **The helpers are gate-internal.** `component-util` and `primitive-vocabulary` are imported only by rules under `harness/gate/rules/`, never by the counter, so converting them cannot force a counter change. The brief's "do not touch `harness/counter/*`" constraint is safe as written — verified, not assumed.
