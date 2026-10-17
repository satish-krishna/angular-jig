# Slice schematic, series 3 port: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A slice schematic on `substrate/schematic-arm-4` whose every emitted file passes the series 3 house style (BEM triads, layout-only stylesheets, typography and icon primitives), with the manage kind grown to filters, sort and a summary footer, and the mod configured to run the schematic arm.

**Architecture:** Branch `substrate/schematic-arm-4` from `substrate/schematic-arm-3` and merge `substrate/schematic-gen` into it, which brings the existing generator (`schematics/`), its skill and its guard entry. Then change the spec schema (B2), the form emitter and the manage emitter to emit triads, regenerate the golden exemplars, and add a house-style conformance test that runs the series 3 gate's own modules over every generated file. `verify-arrives-green.mjs` gains the `bem` counter. The mod gets a series 4 config.

**Tech Stack:** Angular 22 CLI schematics in plain CommonJS (`schematics/slice/*.cjs`), zod 4 for the spec schema, vitest (`schematics/vitest.config.mjs`), Prettier for output formatting, spartan helm primitives in `libs/ui`, Tailwind v4 `@apply`.

**Spec:** `harness/schematic-spec-s3-addendum.md` (amends `harness/schematic-spec.md`). House style: `.claude/skills/house-style/SKILL.md` on `substrate/schematic-arm-3`. Gate: `harness/bem-phase-3-layout-only-spec.md`.

## Global Constraints

- Worktree: `D:/Repos/aj-s4` on branch `substrate/schematic-arm-4`. Never commit to `main`. Never push. Never use `--no-verify`.
- Every commit ends with the two-line footer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_014EzSJGU5jRgKLqcS4g2Mgr`.
- Every component the schematic emits is a triad: `<name>.ts` with `templateUrl: './<name>.html'` and `styleUrl: './<name>.css'`, in a folder named `<name>`. No `template:`, no `styles:`.
- Every class token in an emitted template is `<stem>`, `<stem>__<element>`, `<stem>--<modifier>` or `<stem>__<element>--<modifier>`, lowercase kebab-case, where `<stem>` is the file name without `.html`. No Tailwind utility in a template.
- Every emitted stylesheet starts with `@reference "<../ x depth>styles.css";` (`src/app/heroes/heroes.css` uses `../../styles.css`; `src/app/ui/hero-form/hero-form.css` uses `../../../styles.css`), writes every BEM class in full, applies only layout utilities, and puts padding on the block root (`.<stem>`) only.
- Appearance only through primitives: headings and text use `hlmH1`-`hlmH4`, `hlmP`, `hlmMuted`, `hlmSmall` and the rest from `@spartan-ng/helm/typography` (`HlmTypographyImports`); every `<ng-icon>` carries `hlmIcon` (`HlmIconImports` from `@spartan-ng/helm/icon`), colored only with `tone`. The schematic never writes to `libs/ui`.
- The spec stays pure data: no field accepts markup, code, a CSS value or a template string. Unknown keys fail.
- Spec text never appears in a template; templates bind to `vm.text` constants or schema meta (the existing test enforces this).
- Deterministic output: the same spec yields byte-identical files, and Prettier leaves every emitted file unchanged.
- `schematics/` stays protected by `.claude/hooks/protect-enforcement.mjs`.
- The schematic arm's spec path is `specs/hero.json` (Ruling: the generator and its skill already use `specs/<entity>.json`, and `checkRefTargets` reads that path; the addendum's `specs/hero.slice.json` is amended to match).

## Review Focus

1. A spec whose select filter names an enum field with `inForm: false` (hero `status`) must work: the filter reads the model, not the form. Pinned in Task 2 (schema accepts it; `gadget.json` carries such a filter) and Task 5 (the gadget output type-checks, builds and passes its generated ViewModel test).
2. A manage spec with no `filters`, no `sort` and no `summary` must still emit a valid, gate-clean screen with no empty toolbar element and no footer. Pinned in Task 4 (threat fixture after migration has a toggle only; a novel fixture has none).
3. Text containing quotes, ampersands and percent signs in labels must not break the new `vm.text.filters`, `vm.text.all` and `vm.text.sortedBy` constants. Pinned in Task 4 by extending the existing awkward-text test.
4. A stylesheet whose only rule would be empty (a form with no boolean and no select field) must not emit an empty or unused rule. Pinned in Task 3.
5. Sorting by a `date` or `enum` field must be stable and string-ordered, and by `number` numeric (100 after 9). Pinned in Task 4.

---

### Task 1: Substrate branch with the generator merged in

**Files:**
- Create: worktree `D:/Repos/aj-s4`, branch `substrate/schematic-arm-4` from `substrate/schematic-arm-3` (`abb95f9`).
- Merge: `substrate/schematic-gen` (`22eb347`, 8 commits on `91c34ba`, which is an ancestor of `abb95f9`).
- Create: `.agents/skills/slice-generator/SKILL.md` (byte-identical copy of `.claude/skills/slice-generator/SKILL.md`).

**Interfaces:**
- Produces: `npm run test:schematics`, `npm run golden:update`, `npm run build:spec-schema`, `npm run verify:arrives-green` scripts; `schematics/` protected by the guard; `angular.json` `cli.schematicCollections` begins with `./schematics/collection.json`.

- [ ] **Step 1:** `git -C D:/Repos/angular-jig worktree add D:/Repos/aj-s4 -b substrate/schematic-arm-4 substrate/schematic-arm-3`, then in `D:/Repos/aj-s4` run `npm ci`.
- [ ] **Step 2:** `git merge --no-ff substrate/schematic-gen -m "merge(substrate): bring the slice schematic onto series 3"` (with the footer). Expected conflicts: `.claude/hooks/protect-enforcement.mjs` (keep every series 3 entry and add `'schematics/'` after `'harness/'`, and keep `schematics/` in `DENY_MESSAGE`), `package.json` (keep every series 3 script and add the four schematic scripts), `angular.json` (keep series 3 and add `"schematicCollections": ["./schematics/collection.json", "@schematics/angular"]` under `cli`), `.gitattributes` (union). Resolve by union; never drop a series 3 line.
- [ ] **Step 3:** Copy the skill: `mkdir -p .agents/skills/slice-generator && cp .claude/skills/slice-generator/SKILL.md .agents/skills/slice-generator/SKILL.md`; `cmp` both.
- [ ] **Step 4:** Run `npm run test:schematics`. Expected: PASS (the old goldens still match the old emitters). Run `npx vitest run --config harness/vitest.config.mjs harness/gate/protect-enforcement.test.mjs harness/gate/app-css-gate.test.mjs harness/gate/app-css-hook.test.mjs`. Expected: PASS. Run `npm run build`. Expected: bundle generated.
- [ ] **Step 5:** Commit the skill copy: `chore(skill): mirror the slice-generator skill for agents`. Report the merge sha and every conflict resolution.

### Task 2: Spec schema: filters, sort and summary (B2)

**Files:**
- Modify: `schematics/slice/spec-schema.cjs` (the `manage` object and its cross-field checks).
- Regenerate: `schematics/slice/spec.schema.json` (`npm run build:spec-schema`).
- Modify: `schematics/slice/fixtures/mission.json`, `threat.json`, `novel/*.json` (migrate `filter` to `filters`), `schematics/slice/fixtures/hero.json` (add `manage`).
- Test: `schematics/slice/tests/spec-schema.test.mjs`.

**Interfaces:**
- Produces, on a parsed spec's `manage`: `filters?: Array<{ field: string, control: 'select' } | { field: string, control: 'toggle', value?: string, label: string, icon: string }>` (1 to 3 entries, distinct fields); `sort?: { field: string, direction: 'asc' | 'desc' }`; `summary?: boolean`. `manage.filter` no longer exists.

- [ ] **Step 1: Write the failing tests** in `spec-schema.test.mjs`, using the file's existing helpers (`readFixture`, `parseSpec`):

```js
describe('manage filters, sort and summary', () => {
  const hero = () => JSON.parse(readFixture('hero'));
  it('accepts a select filter on an enum field, even one with inForm false', () => {
    const d = hero();
    d.manage.filters = [{ field: 'powerClass', control: 'select' }, { field: 'status', control: 'select' }];
    expect(parseSpec(d).ok).toBe(true);
  });
  it('rejects a select filter on a non-enum field', () => {
    const d = hero();
    d.manage.filters = [{ field: 'name', control: 'select' }];
    const r = parseSpec(d);
    expect(r.ok).toBe(false);
    expect(r.errors.join('\n')).toMatch(/manage\.filters\.0\.field/);
  });
  it('keeps the toggle rules: enum needs a value that is an option, boolean takes none', () => {
    const d = hero();
    d.manage.filters = [{ field: 'powerClass', control: 'toggle', label: 'Tech only', icon: 'lucideCpu' }];
    expect(parseSpec(d).errors.join('\n')).toMatch(/manage\.filters\.0\.value/);
    d.manage.filters[0].value = 'Nope';
    expect(parseSpec(d).errors.join('\n')).toMatch(/not an option/);
  });
  it('rejects more than three filters and two filters on one field', () => {
    const d = hero();
    d.manage.filters = [{ field: 'powerClass', control: 'select' }, { field: 'powerClass', control: 'select' }];
    expect(parseSpec(d).errors.join('\n')).toMatch(/manage\.filters\.1\.field/);
    d.manage.filters = ['powerClass', 'status', 'clearanceTier', 'powerClass'].map((field) => ({ field, control: 'select' }));
    expect(parseSpec(d).ok).toBe(false);
  });
  it('rejects the retired single filter key', () => {
    const d = hero();
    d.manage.filter = { field: 'powerClass', value: 'Tech', label: 'Tech only', icon: 'lucideCpu' };
    expect(parseSpec(d).ok).toBe(false);
  });
  it('accepts sort on a field and rejects sort on a boolean or an unknown field', () => {
    const d = hero();
    d.manage.sort = { field: 'power', direction: 'desc' };
    expect(parseSpec(d).ok).toBe(true);
    d.manage.sort = { field: 'nope', direction: 'asc' };
    expect(parseSpec(d).errors.join('\n')).toMatch(/manage\.sort\.field/);
  });
  it('accepts summary true or false and nothing else', () => {
    const d = hero();
    d.manage.summary = 'yes';
    expect(parseSpec(d).ok).toBe(false);
  });
});
```

- [ ] **Step 2:** Run `npx vitest run --config schematics/vitest.config.mjs schematics/slice/tests/spec-schema.test.mjs`. Expected: FAIL (the hero fixture has no `manage`, and `filters` is an unknown key).
- [ ] **Step 3: Change the schema.** In `spec-schema.cjs`, replace the `filter` key of the `manage` strict object with:

```js
  filters: z
    .array(
      z.discriminatedUnion('control', [
        z.strictObject({ field: fieldName, control: z.literal('select') }),
        z.strictObject({ field: fieldName, control: z.literal('toggle'), value: optionText.optional(), label: labelText, icon: iconName }),
      ]),
    )
    .min(1)
    .max(3)
    .optional(),
  sort: z.strictObject({ field: fieldName, direction: z.enum(['asc', 'desc']) }).optional(),
  summary: z.boolean().optional(),
```

Replace the `if (m.filter) { ... }` cross-field block with a loop over `m.filters ?? []` at index `i`, reporting paths `['manage', 'filters', i, ...]`: a `select` filter's field must be an `enum` field (any `inForm`); a `toggle` filter keeps today's rules exactly (enum or boolean, `inForm` true, enum needs `value` that is an option, boolean takes no `value`); a field already used by an earlier filter adds `must not repeat a filtered field` at `['manage', 'filters', i, 'field']`. Add a `sort` check: the field must exist and be `string`, `text`, `number`, `date` or `enum` (`['manage', 'sort', 'field']`).
- [ ] **Step 4: Migrate the fixtures.** In every fixture with `manage.filter`, replace it with `"filters": [{ "control": "toggle", ...the old object }]`. Add to `fixtures/hero.json`: `"manage"` to `kinds` (so `["entity", "form", "manage"]`) and:

```json
"manage": {
  "icon": "lucideShield",
  "createLabel": "Recruit hero",
  "columns": [
    { "field": "name" },
    { "field": "alias" },
    { "field": "powerClass" },
    { "field": "power" },
    { "field": "status", "badge": { "variants": { "Active": "default", "Injured": "destructive", "MIA": "destructive" }, "fallback": "secondary" } },
    { "field": "clearanceTier" }
  ],
  "search": ["name", "alias"],
  "filters": [{ "field": "powerClass", "control": "select" }],
  "sort": { "field": "power", "direction": "desc" },
  "summary": true
}
```

Give one novel fixture (`gadget.json`) a select filter on an enum field with `"inForm": false` (add such a field, with a `default`, if it has none) plus a toggle, and leave another (`ticket.json`) with no `filters`, `sort` or `summary` (remove them if present).
- [ ] **Step 5:** `npm run build:spec-schema`, then run the spec-schema tests. Expected: PASS. Run the whole schematics suite; the golden and generate tests are expected to FAIL now (the emitters still read `manage.filter`) and are fixed in Tasks 3 and 4. Record which fail.
- [ ] **Step 6:** Commit: `feat(schematic): filters, sort and summary in the manage spec`.

### Task 3: Form emitter writes a triad

**Files:**
- Modify: `schematics/slice/lib/emit-form.cjs`, `schematics/slice/lib/naming.cjs` (the `paths` in `buildContext`), `schematics/slice/index.cjs` (`generateFiles` adds the form's `.html` and `.css`), `schematics/slice/lib/format.cjs` (format `.css` with Prettier's `css` parser if it is not already handled).
- Test: `schematics/slice/tests/generate.test.mjs`, new `schematics/slice/tests/house-style.test.mjs`.

**Interfaces:**
- Produces: `ctx.paths.form` = `src/app/ui/<entity-kebab>-form/<entity-kebab>-form.ts`, `ctx.paths.formTemplate` = same with `.html`, `ctx.paths.formStyles` = same with `.css`. `form(ctx)` returns the `.ts`; new `formTemplate(ctx)` and `formStyles(ctx)` return the other two. Exported from `emit-form.cjs` as `{ form, formTemplate, formStyles }`. The component class, selector (`app-<entity>-form`), inputs and outputs are unchanged.

- [ ] **Step 1: Write the failing house-style test**, `schematics/slice/tests/house-style.test.mjs`. It applies the series 3 gate's own modules to every generated `.html` and `.css`, for every fixture and novel spec:

```js
import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { FIXTURES, SLICE_DIR, generateFixture } from './run.mjs';
import { checkStylesheet, loadUtilityOracle, templateUtilities, stemOf } from '../../../harness/gate/app-css/index.mjs';

const require = createRequire(import.meta.url);
const { parseSpec } = require('../spec-schema.cjs');
const { generateFiles } = require('../index.cjs');
const ROOT = join(SLICE_DIR, '..', '..');
const NOVEL = ['gadget', 'ticket', 'shipment', 'status-note'];
const novelFiles = (name) => generateFiles(parseSpec(JSON.parse(readFileSync(join(SLICE_DIR, 'fixtures', 'novel', `${name}.json`), 'utf8'))).spec);

let isUtility;
beforeAll(async () => { isUtility = await loadUtilityOracle(join(ROOT, 'src', 'styles.css')); });

const BEM = (stem) => new RegExp(`^${stem}(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$`);
const classTokens = (html) => [...html.matchAll(/\sclass="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean));

async function allOutputs() {
  const sets = [];
  for (const name of FIXTURES) sets.push([name, await generateFixture(name)]);
  for (const name of NOVEL) sets.push([`novel/${name}`, novelFiles(name)]);
  return sets;
}

describe('every emitted component follows the series 3 house style', () => {
  it('is a triad: each component .ts names its own .html and .css, and both are emitted', async () => {
    for (const [name, files] of await allOutputs()) {
      for (const [path, content] of files) {
        if (!/@Component\(/.test(content)) continue;
        const base = path.replace(/\.ts$/, '');
        const stem = base.split('/').pop();
        expect(content, `${name} ${path}`).not.toMatch(/\btemplate:\s*`|\bstyles:\s*[[`]/);
        expect(content, `${name} ${path}`).toContain(`templateUrl: './${stem}.html'`);
        expect(content, `${name} ${path}`).toContain(`styleUrl: './${stem}.css'`);
        expect(files.has(`${base}.html`) && files.has(`${base}.css`), `${name} ${base}`).toBe(true);
        expect(base.split('/').at(-2), `${name} ${base}: folder named for the component`).toBe(stem);
      }
    }
  });

  it('templates carry BEM classes of their own block only, and no utility', async () => {
    for (const [name, files] of await allOutputs()) {
      for (const [path, content] of files) {
        if (!path.endsWith('.html')) continue;
        const stem = stemOf(path);
        for (const token of classTokens(content)) expect(token, `${name} ${path}`).toMatch(BEM(stem));
        expect(templateUtilities(content, path, isUtility), `${name} ${path}`).toEqual([]);
      }
    }
  });

  it('stylesheets are layout only, padding on the block root only, and start with the right @reference', async () => {
    for (const [name, files] of await allOutputs()) {
      for (const [path, content] of files) {
        if (!path.endsWith('.css')) continue;
        const depth = path.split('/').length - 2; // src/app/x/x.css -> 2
        expect(content.split('\n')[0], `${name} ${path}`).toBe(`@reference "${'../'.repeat(depth)}styles.css";`);
        expect(checkStylesheet(content, { stem: stemOf(path), global: false }), `${name} ${path}`).toEqual([]);
      }
    }
  });

  it('every class a stylesheet defines is used by its template, and every template class is defined', async () => {
    for (const [name, files] of await allOutputs()) {
      for (const [path, css] of files) {
        if (!path.endsWith('.css')) continue;
        const html = files.get(path.replace(/\.css$/, '.html')) ?? '';
        const defined = new Set([...css.matchAll(/^\.([a-z0-9_-]+)\s*\{/gm)].map((m) => m[1]));
        const used = new Set(classTokens(html));
        for (const c of defined) expect(used.has(c), `${name} ${path} defines unused .${c}`).toBe(true);
        for (const c of used) expect(defined.has(c), `${name} ${path} template uses undefined .${c}`).toBe(true);
      }
    }
  });

  it('every ng-icon carries hlmIcon', async () => {
    for (const [name, files] of await allOutputs()) {
      for (const [path, content] of files) {
        if (!path.endsWith('.html')) continue;
        for (const tag of content.match(/<ng-icon\b[^>]*>/g) ?? []) expect(tag, `${name} ${path}`).toMatch(/\bhlmIcon\b/);
      }
    }
  });
});
```

If `stemOf` or the gate index exports differ from these names in `harness/gate/app-css/index.mjs`, use the exported names (`checkStylesheet`, `stemOf`, `loadUtilityOracle`, `templateUtilities` are expected there) and say so in the report. If the gate's `.ts` modules do not load under `schematics/vitest.config.mjs`, add the minimum config (for example `resolve` or an `esbuild` include) so they do, and report it.
- [ ] **Step 2:** Run the house-style test. Expected: FAIL on the form (`template:` inline, no `.html` or `.css`).
- [ ] **Step 3: Implement.** The form's `.ts` keeps every line it has today except: `template: ...` becomes `templateUrl: './<entity>-form.html'` and `styleUrl: './<entity>-form.css'`, and the relative imports gain one `../` (`../../forms/form-field-meta`, `../../forms/zod-meta`, `../../<entity>/<entity>.schema`). The template is today's inline template, de-indented, with these changes: the `<form>` element gains `class="<entity>-form"`; the boolean field's `<label hlmFieldLabel class="flex items-center gap-2">` becomes `class="<entity>-form__switch"`; the select trigger's `class="w-full"` becomes `class="<entity>-form__select"`. The stylesheet, for the hero fixture:

```css
@reference "../../../styles.css";

.hero-form {
  @apply grid gap-6;
}

.hero-form__select {
  @apply w-full;
}
```

`.<entity>-form__switch { @apply flex items-center gap-2; }` is emitted only when a boolean field is in the form, `.<entity>-form__select` only when an enum or ref field is, in that order after the block root. Format the `.css` with Prettier (`parser: 'css'`) the same way `.ts` and `.html` are formatted, and extend the existing Prettier test in `generate.test.mjs` to use the `css` parser for `.css` paths.
- [ ] **Step 4:** Update `generate.test.mjs` for the new paths: `src/app/ui/hero-form.ts` becomes `src/app/ui/hero-form/hero-form.ts` in the "generates into an empty workspace" test, and the "refuses a second run" conflict count becomes the new number of files the hero spec emits (it now has `manage` too; count `generateFiles` output plus the routes file and assert that number, not a literal). `templatesOf` already reads `.html` files.
- [ ] **Step 5:** Run the house-style test filtered to form files and the generate tests. Expected: form-related assertions PASS; manage assertions still FAIL (Task 4). Do not regenerate goldens yet.
- [ ] **Step 6:** Commit: `feat(schematic): emit the form as a BEM triad`.

### Task 4: Manage emitter writes a triad, with filters, sort and summary

**Files:**
- Modify: `schematics/slice/lib/emit-manage.cjs`, `schematics/slice/lib/naming.cjs` (`ctx.paths.styles` = `src/app/<plural>/<plural>.css`), `schematics/slice/index.cjs` (emit the `.css`).
- Regenerate: `schematics/slice/golden/{hero,mission,threat}/` (`npm run golden:update`), deleting the old `src/app/ui/<entity>-form.ts` goldens.
- Test: `schematics/slice/tests/generate.test.mjs`, `house-style.test.mjs` (from Task 3), the generated ViewModel specs.

**Interfaces:**
- Consumes: `manage.filters`, `manage.sort`, `manage.summary` from Task 2; `ctx.paths.form` and the form selector from Task 3.
- Produces in the ViewModel: per select filter `<field>Filter = signal('')` (empty string means all) and `<field>FilterOptions` (a readonly array of `{ value: string, label: string }`, first `{ value: '', label: TEXT.all }`, then each option as value and label); per toggle filter `<field>FilterOn = signal(false)` and `toggle<Field>Filter()`; `filtered` applies filters, then search, then sort; `text.all = 'All'`, `text.filters.<field>` = the field's label, `text.sortedBy` = `sorted by <field label in lower case>` when `sort` is set. The old `filterOn`, `toggleFilter` and `text.filterLabel` names are replaced by the per-field ones.

- [ ] **Step 1: Write the failing tests.** In `generate.test.mjs`, add:

```js
describe('manage screen: filters, sort and summary', () => {
  it('hero: select filter, sort by power descending, summary footer', async () => {
    const files = await generateFixture('hero');
    const vm = files.get('src/app/heroes/heroes.view-model.ts');
    const html = files.get('src/app/heroes/heroes.html');
    expect(vm).toContain("readonly powerClassFilter = signal('');");
    expect(vm).toMatch(/sortedBy: 'sorted by power index'/);
    expect(html).toContain('vm.powerClassFilter()');
    expect(html).toMatch(/class="heroes__footer"/);
    expect(html).not.toMatch(/sm:hidden|hlm-card/);
  });
  it('a manage spec without filters, sort or summary emits no filter control and no footer', () => {
    const files = generateFiles(parseSpec(JSON.parse(readFileSync(join(SLICE_DIR, 'fixtures', 'novel', 'ticket.json'), 'utf8'))).spec);
    const html = [...files].find(([p]) => p.endsWith('.html') && !p.includes('/ui/'))?.[1] ?? '';
    expect(html).not.toMatch(/__footer|hlm-select|Filter\(\)/);
  });
});
```

Extend the awkward-text test: give the mission fixture's select-filtered field a label with `Dr. Ion's "Code" & 100%` and set `sort` on it; assert the ViewModel still transpiles and no template contains `quoted` or the label text.
- [ ] **Step 2:** Run the schematics suite. Expected: FAIL on the new tests and on house-style for manage files.
- [ ] **Step 3: Implement the ViewModel.** Keep everything today's `viewModel(ctx)` emits except the filter parts, which follow the Interfaces block above. Sorting, after filters and search: copy then sort, `[...rows].sort((a, b) => ...)`. For `number`: `a.<f> - b.<f>`; for `string`, `text`, `date` and `enum`: `a.<f>.localeCompare(b.<f>)`; multiply by `-1` for `desc`. Extend `viewModelSpec(ctx)`: one test per select filter (set the signal to the first option, every row matches; set it to `''`, all rows return), today's toggle test per toggle filter, and, when `sort` is set, a test that `filtered()` is ordered (for hero: two created rows with power 9 and 100, with `desc` the 100 row comes first).
- [ ] **Step 4: Implement the component and template.** The component's imports gain `HlmIconImports` (`@spartan-ng/helm/icon`), `HlmTypographyImports` (`@spartan-ng/helm/typography`), `HlmSelectImports` only when a select filter exists, and drop `HlmCardImports`; `styleUrl: './<plural>.css'`; the form import path becomes `../ui/<entity>-form/<entity>-form`. The template for the hero fixture must come out as below (Prettier formatting may re-wrap attributes; the structure, classes and bindings may not differ). `hlm-select` bound to a plain signal follows the hand-written roster in `run/schematic-arm-gate-on-t1-2026-10-17_10-41-47:src/app/heroes/heroes.html`, which compiles and passes every gate.

```html
<section class="heroes">
  <header class="heroes__header">
    <div class="heroes__title">
      <ng-icon hlmIcon name="lucideShield" tone="primary" />
      <h1 hlmH3>{{ vm.text.title }}</h1>
    </div>
    <hlm-dialog #createDialog="hlmDialog">
      <button hlmBtn hlmDialogTrigger (click)="vm.startCreate()" data-testid="create-hero">
        <ng-icon hlmIcon name="lucidePlus" />
        <span>{{ vm.text.createLabel }}</span>
      </button>
      <hlm-dialog-content *hlmDialogPortal class="heroes__dialog">
        <hlm-dialog-header>
          <h2 hlmDialogTitle>{{ vm.text.createTitle }}</h2>
          <p hlmDialogDescription>{{ vm.text.createDescription }}</p>
        </hlm-dialog-header>
        <app-hero-form submitLabel="Create" (saveHero)="vm.save($event); createDialog.close()" (cancel)="createDialog.close()" />
      </hlm-dialog-content>
    </hlm-dialog>
  </header>

  <div class="heroes__filters">
    <label hlmLabel for="heroes-search" class="heroes__label">{{ vm.text.searchLabel }}</label>
    <input hlmInput id="heroes-search" type="search" class="heroes__search" [placeholder]="vm.text.searchPlaceholder" [value]="vm.searchQuery()" (input)="vm.searchQuery.set($any($event.target).value)" />
    <label hlmLabel for="heroes-filter-power-class" class="heroes__label">{{ vm.text.filters.powerClass }}</label>
    <hlm-select class="heroes__filter" [value]="vm.powerClassFilter()" (valueChange)="vm.powerClassFilter.set($event ?? '')" [itemToString]="vm.powerClassFilterLabel">
      <hlm-select-trigger buttonId="heroes-filter-power-class">
        <hlm-select-value />
      </hlm-select-trigger>
      <hlm-select-content *hlmSelectPortal>
        @for (option of vm.powerClassFilterOptions; track option.value) {
          <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
        }
      </hlm-select-content>
    </hlm-select>
  </div>

  <div class="heroes__table">
    <table hlmTable>
      <thead hlmTHead>
        <tr hlmTr>
          <th hlmTh>{{ vm.text.columns.name }}</th>
          <!-- one th per column, then -->
          <th hlmTh>{{ vm.text.actions }}</th>
        </tr>
      </thead>
      <tbody hlmTBody>
        @for (hero of vm.filtered(); track hero.id) {
          <tr hlmTr>
            <td hlmTd>{{ hero.name }}</td>
            <!-- one td per column; a badge column renders <span hlmBadge [variant]="vm.statusVariant(hero.status)">{{ hero.status }}</span> -->
            <td hlmTd>
              <div class="heroes__actions">
                <!-- today's icon-only edit dialog and delete dialog, with hlmIcon on each ng-icon,
                     class="heroes__dialog" on the edit dialog content and class="heroes__dialog heroes__dialog--narrow" on the delete dialog content -->
              </div>
            </td>
          </tr>
        } @empty {
          <tr hlmTr>
            <td hlmTd colspan="7"><p hlmMuted>{{ vm.text.empty }}</p></td>
          </tr>
        }
      </tbody>
    </table>
  </div>

  <footer class="heroes__footer">
    <p hlmMuted>{{ vm.filtered().length }} of {{ vm.heroes().length }} {{ vm.text.plural }}</p>
    <p hlmMuted>{{ vm.text.sortedBy }}</p>
  </footer>
</section>
```

Notes: the HTML comments above stand for repeated structure and are not emitted. `vm.text.actions` is new (`'Actions'`), replacing the literal `Actions` header. `<field>FilterLabel` is a ViewModel arrow `(value: string) => <field>FilterOptions.find((o) => o.value === value)?.label ?? ''`. A toggle filter renders today's toggle button inside `.heroes__filters` with `hlmIcon` on its icon. Omit `.heroes__filters`' select parts when there is no select filter, the whole filter row's toggle part when there is no toggle, the second footer `<p>` when there is no `sort`, and the whole `<footer>` when `summary` is not true. The stacked-card view below `sm` and the `hidden sm:block` wrapper are removed: the table always sits in `.heroes__table`, the build spec's answer (a).

The stylesheet for the hero fixture:

```css
@reference "../../styles.css";

.heroes {
  @apply grid min-w-0 gap-6 p-6;
}

.heroes__header {
  @apply flex flex-wrap items-center justify-between gap-4;
}

.heroes__title {
  @apply flex items-center gap-2;
}

.heroes__dialog {
  @apply sm:max-w-2xl;
}

.heroes__dialog--narrow {
  @apply sm:max-w-sm;
}

.heroes__filters {
  @apply flex flex-wrap items-end gap-3;
}

.heroes__label {
  @apply sr-only;
}

.heroes__search {
  @apply w-full sm:w-64;
}

.heroes__filter {
  @apply w-full sm:w-48;
}

.heroes__table {
  @apply min-w-0 overflow-x-auto;
}

.heroes__actions {
  @apply flex gap-2;
}

.heroes__footer {
  @apply flex flex-wrap items-center justify-between gap-2;
}
```

Emit `.heroes__filter` only with a select filter and `.heroes__footer` only with a footer, so the "every class defined is used" test holds for every fixture.
- [ ] **Step 5:** Run `npm run golden:update`, delete the stale `golden/*/src/app/ui/<entity>-form.ts` files if the updater left them, then run the full schematics suite. Expected: PASS, including `house-style.test.mjs` for every fixture and novel spec. Read the regenerated `golden/hero/src/app/heroes/heroes.html` and `.css` against the targets above and fix the emitter, not the golden, for any difference beyond Prettier wrapping.
- [ ] **Step 6:** Commit: `feat(schematic): emit the manage screen as a BEM triad with filters, sort and summary` (goldens in the same commit).

### Task 5: Arrives green under series 3

**Files:**
- Modify: `schematics/verify-arrives-green.mjs`.

**Interfaces:**
- Consumes: the counters on `research/schematic-arm` (`harness/counter/counter.mjs`, `bem-counter.mjs`, `component-shape-counter.mjs`, `freeloader-counter.mjs`, `layout-counter.mjs`) and the substrate gate hook `.claude/hooks/check-app-css.mjs`.

- [ ] **Step 1:** Change the default `--counters-ref` from `main` to `research/schematic-arm`, and add `['bem', 'bem-counter.mjs']` to `COUNTERS`. Read `harness/counter/bem-counter.mjs` on that ref to confirm its CLI matches the others (`--root <root> <src>` printing JSON with `totals.all`); if it differs, call it the way it expects and say so.
- [ ] **Step 2:** The substrate already has `src/app/heroes/` placeholders, so generating the hero fixture collides. Generate every FIXTURE and NOVEL spec with `--force` (the script restores `src/app` afterwards, so nothing hand-written is lost); keep the separate "rerun without --force refuses" and "rerun with --force overwrites" checks on the hero fixture.
- [ ] **Step 3:** After the counters, add a gate check: for every `.css` and `.html` file under `src/app` that the generation created or updated, pipe a PostToolUse `Write` payload (`{"tool_name":"Write","tool_input":{"file_path":"<absolute path>"}}`) to `node .claude/hooks/check-app-css.mjs` and record PASS when it exits 0. Report the count of files checked.
- [ ] **Step 4:** Commit `src/app` clean, then run `npm run verify:arrives-green`. Expected: `ARRIVES GREEN`, with counter `bem` `all = 0` and every gate check PASS. A FAIL is a schematic bug: fix the emitter (Task 3 or 4 files), regenerate goldens, rerun. Paste the full output into the report.
- [ ] **Step 5:** Commit: `test(schematic): arrive green under the series 3 gates and the bem counter`.

### Task 6: The slice-generator skill describes what the schematic now emits

**Files:**
- Modify: `.claude/skills/slice-generator/SKILL.md`, then copy byte-identical to `.agents/skills/slice-generator/SKILL.md`.

- [ ] **Step 1:** Update these sections and nothing else. "What each kind emits": the form is `src/app/ui/<entity>-form/<entity>-form.{ts,html,css}`; the manage screen is `<plural>.ts`, `<plural>.html`, `<plural>.css`, `<plural>.view-model.ts` and its spec; the manage template is a table in a scroll container (no stacked cards), with the select and toggle filters, sort and summary footer the spec asks for, BEM classes on the `<plural>` block and a layout-only stylesheet. "What is not generated": replace "More than one filter on a manage screen" with "More than three filters, clickable column sorting, avatar or custom cells". The `manage` section's example and bullets: replace `filter` with `filters` (select and toggle, with one example of each), add `sort` and `summary`. Add one paragraph to "The workflow": the starting app may already hold placeholder files for a screen the spec generates (`src/app/heroes/heroes.*`); generating over a placeholder needs `--force`, and that is the one case besides regenerating a generated slice where `--force` is right. Keep the voice and length of the existing file; the file has no hard-wrapped paragraphs.
- [ ] **Step 2:** `cp .claude/skills/slice-generator/SKILL.md .agents/skills/slice-generator/SKILL.md`; `cmp` both; `grep -n '"filter"' .claude/skills/slice-generator/SKILL.md` returns nothing.
- [ ] **Step 3:** Commit: `docs(skill): describe the series 3 slice output`.

### Task 7: Mod configuration and the addendum's spec path

**Files:**
- Modify: `C:/Users/psati/.claude/dev-mods/bbe683f7-6112-404d-accc-35881737d0b7/schematic-arm/arm.config.json` (not in git).
- Modify: `harness/schematic-spec-s3-addendum.md` on `research/schematic-arm` (`specs/hero.slice.json` becomes `specs/hero.json` in Decision C).

- [ ] **Step 1:** Confirm no `/arm` run is active (`git -C D:/Repos/angular-jig branch --show-current` is `research/schematic-arm` and `git status --short` is clean). Then set in `arm.config.json`: `"series": 4`; `"substrate": "substrate/schematic-arm-4"`; keep `gateSettings` `harness/gate/s3-gate-on.settings.json` and `gateOffSettings` `harness/gate/s3-gate-off.settings.json`; `schematic.specPath` `"specs/hero.json"`; `schematic.specSchemaPath` `"schematics/slice/spec.schema.json"`; `schematic.commandPattern` `"\\bng\\s+(g|generate)\\s+(\\S+:)?slice\\b"`; `schematic.protectedPaths` `["schematics/"]`; `schematic.requiredOnSubstrate` `["schematics/collection.json", "schematics/slice/index.cjs", "schematics/slice/spec.schema.json", ".claude/skills/slice-generator/SKILL.md", ".agents/skills/slice-generator/SKILL.md", "schematics/verify-arrives-green.mjs"]`. Append to the `$comment`: "Series 4 (2026-10-17) is the schematic arm on substrate/schematic-arm-4 (harness/schematic-spec-s3-addendum.md); gates frozen as in series 3 round 1."
- [ ] **Step 2:** Test the pattern: it must match `ng generate slice --spec specs/hero.json`, `npx ng g slice --spec specs/hero.json --force`, and `ng g ./schematics/collection.json:slice --spec x`, and must not match `ng g @spartan-ng/cli:ui progress` or `ng generate component foo`. Run it in node and paste the five results.
- [ ] **Step 3:** From `D:/Repos/angular-jig`: `node C:/Users/psati/.claude/dev-mods/bbe683f7-6112-404d-accc-35881737d0b7/schematic-arm/bin/arm.mjs check --condition schematic --trial 1`. Expected: `{"ok":true,"problems":[]}`.
- [ ] **Step 4:** Edit the addendum's Decision C spec path and commit on `research/schematic-arm`: `docs(harness): the schematic arm's spec path is specs/hero.json`.
