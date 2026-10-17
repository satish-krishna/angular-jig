# Schematic spec, series 3 addendum

Status: design, 2026-10-17. Amends `harness/schematic-spec.md` for the series 3 house style (`harness/bem-phase-3-layout-only-spec.md`). Where the two disagree, this file wins; everything it does not mention stands as written there.

## Why an addendum

The slice schematic on `substrate/schematic-gen` (8 commits on `91c34ba`, head `22eb347`) was built for the series 1 house style. Its form component has an inline template, its manage screen has utility classes in the template (`flex flex-col gap-6 p-6`, `text-3xl font-bold`), and nothing it emits has a stylesheet. Under the series 3 gates every screen it generates would fire on arrival, so the arm would measure the generator's age, not generation. The generator is ported before any schematic trial runs.

## Decision A: the substrate

A new branch, `substrate/schematic-arm-4`, from `substrate/schematic-arm-3` at `abb95f9`. The schematic collection (`schematics/`), its tests, `verify-arrives-green.mjs`, the `slice-generator` skill (both copies), and the guard's protection of `schematics/` are brought over from `substrate/schematic-gen`, then changed as below. Nothing else on `substrate/schematic-gen` comes across. Gate-off and gate-on keep running on `substrate/schematic-arm-3`; the schematic arm runs on `substrate/schematic-arm-4`, so the only difference between gate-on and schematic is what this addendum adds.

## Decision B: what the schematic emits

The kinds and the spec schema are unchanged: `entity`, `form`, `manage`, and the strict, pure-data spec. The emitted files change to the series 3 house style.

- **Every component is a triad.** `<name>.ts`, `<name>.html` and `<name>.css` in a folder named for the component (`src/app/ui/hero-form/hero-form.*`, `src/app/heroes/heroes.*`). No inline template, no inline styles.
- **The block is the file stem.** The template's root element carries `class="<stem>"`, every other class is `<stem>__<element>` or a modifier of one, and no class in the template is a Tailwind utility.
- **The stylesheet is layout only, per R7 and R7a.** It starts with `@reference` to `src/styles.css`, applies only layout utilities, and puts the region's padding on the block root alone.
- **Appearance comes from primitives.** Headings and text use the typography directives, icons use `<ng-icon hlmIcon>` with a `tone` where the old output set a color, badges use the badge variants the spec names. Where the old output styled something no primitive covers, the emitted code drops it; the generator does not invent variants in `libs/ui`.
- **Arrives green under series 3.** `verify-arrives-green.mjs` adds `check-app-css` and the `appearance-in-app-css` and `foreign-block` counters to what it runs. Every golden exemplar scores 0 on every counter family, and each emitted stylesheet and template passes the gate's hook entry point.

## Decision B2: the manage kind grows to the list screen the house has written by hand

Today's `manage` kind is search, a single on/off filter (`"Critical only"`), a table with badge columns, row edit and delete, and a create dialog. The list screens the house actually writes need more, and the evidence for what they need is already in hand: all twelve counted trees of series 2 and series 3 round 1 hand-wrote the roster under the same build spec, each with a search box, a select filter on an enum field, a table, and a summary footer. That meets the original spec's admission rule 1 (a shape hand-written at least twice, under gates, in the same shape) for these additions. Each addition is pure data in the spec, validated by the strict schema, with no field that accepts markup, code, a CSS value or a template string.

- **Filters.** `manage.filters`, a list of at most three. Each names a field and a control: `select` on an enum field (an "All" option plus the field's options, labeled from the field), or `toggle` on a boolean field or one enum value (today's filter, kept). The existing single `manage.filter` is replaced by this list; the three fixtures move over.
- **Sort.** `manage.sort`, a field and a direction, applied in the ViewModel. No clickable column headers.
- **Summary footer.** `manage.summary: true` emits "N of M <plural label>", plus "sorted by <field label>" when `sort` is set. The wording is fixed by the schematic, not the spec.
- **Narrow screens.** The table always sits in a scroll container whose own overflow scrolls, the build spec's answer (a). This is not configurable: the house picked it once, and the generator emits it every time.

What stays out: per-column custom cells beyond the existing badge mapping, an avatar column, and stacked cards below 640px. The agent hand-writes any of those it wants, under gates, and that is measured like any other hand-written code.

The golden exemplars (`hero`, `mission`, `threat`) are regenerated from their fixtures under the new emitters and committed. The golden test stays: any byte difference between generated and committed output fails `verify`.

## Decision C: the mod configuration

Series 4, in `arm.config.json`:

- `substrate`: `substrate/schematic-arm-4`; `gateSettings`: `harness/gate/s3-gate-on.settings.json` (the schematic arm runs gated, as the original spec says); `gateOffSettings` unchanged.
- `schematic.commandPattern`: a regex that matches an `ng generate` or `ng g` call on the local slice schematic and nothing else, so a spartan `ng g @spartan-ng/cli:ui` install is not counted.
- `schematic.specPath`: `specs/hero.json`; `schematic.specSchemaPath`: the emitted JSON schema under `schematics/slice/`.
- `schematic.protectedPaths`: `schematics/`. `schematic.requiredOnSubstrate`: the collection, the spec schema, the skill, and `verify-arrives-green.mjs`.

The stage prompts stay at `e617dca`, unchanged. The stage 0 prompt is the mod's `prompts/stage-0-spec.md`. As the original spec says, no stage prompt tells the agent to run the schematic; the skill has to route it there.

## Decision D: the comparison and the bar, fixed before any trial

Three schematic trials, compared against the three gate-on trials of series 3 round 1, which ran on the same substrate minus this addendum's additions, with the same stages, hooks, counters and model. No new gate-on runs.

The owner decided before any schematic result exists (2026-10-17): the schematic is the article's headline only if the gap is large; otherwise it is a footnote to a gates article. "Large" is fixed here:

1. **Cost.** The schematic arm's mean total cost, stage 0 included, is at most 80 percent of round 1 gate-on's $1.24, so $0.99 or less.
2. **No worse on drift.** Its mean `appearance-in-app-css` is at most round 1 gate-on's (0), and its mean `foreign-block` is at most round 1 gate-on's (8).
3. **Reached.** The agent invokes the schematic for the hero screens in at least 2 of 3 trials.

All three hold: headline. Any one fails: footnote, and the readout says which one. Turns, wall time, gate firings per screen, the spec review record and the coverage line are reported either way; they inform the writing, not the bar.

## Decision E: building it

The original spec's model policy stands: the schematic, its tests, the goldens and the skill are the instrument and are built on a capable model, not by the model under test. TDD on the emitters: a failing golden or counter test first, then the emitter change. Each emitter is reviewed against this addendum and the house-style skill before the golden is regenerated.

## Decision F: rulings from the final review (2026-10-17)

Specs written besides the approved one, and changes to the approved spec after approval, are recorded, not void. The mod writes them to `schematic.specDrift` in each trial's `meta.json` (with a diff file in the evidence folder) and the readout reports them per trial. Records are a superset of voids, so a trial can still be excluded later under a stated rule.

The `spec` and `approve` commands validate the spec with the generator's own parser (`parseSpec` from `schematics/slice/spec-schema.cjs`) and refuse an invalid spec with its errors. The reviewer fixes it during review, and the fix shows up in the spec diff.

Bar 3 ("reached") is `generatedFromApprovedSpec` in at least 2 of 3 trials: a slice run whose `--spec` is the approved spec path created the manage screen and the form component for the approved entity. A bare command match is kept as `invoked` but does not count.

The golden fixtures moved to a library domain (book, member, loan), so no fixture is the stage-0 answer and the spec review stays a measurement of the model turning prose into a spec, not a copy check.

## Out of scope

- New kinds. Roster and detail map onto `manage` (as extended in B2) and `form`; whatever the stage prompts ask for beyond them (the detail screen's back link, header, tabs and retire dialog, the roster's avatar column) the agent writes by hand, under gates, and that is part of what the arm measures.
- The two gate defects from round 1 (empty `content`, the text-utility remedy message). The gates are frozen as they ran in round 1, so all three arms meet the same gates.

## Decision G: the generator is prescribed, not discovered (2026-10-17)

Schematic trial 1 (`schematic-t1-2026-10-17_15-39-25`, evidence at `e02dbde`) is refiled as discovery trial t0. It found the routing gap the way gate round 1 looked for gate escapes: the agent ran the generator only in stage 2, where the prompt's words matched the skill description, and even there it generated from an entity-only copy of the spec, moved the output to `src/app/domain/` and renamed the type, because the stage prompt pinned a path and a type name the generator cannot emit. Stage 4 hand-wrote the roster over the placeholder, and stage 6 hand-wrote `src/app/ui/hero-form/`, the path the skill body names as generator-owned. Cost was $1.96, against a bar of $0.99.

The owner ruled that the framework prescribes the generator. Discovery through the skill description is not what the system is for; the stage prompts tell the agent to run it, the same way the gates leave no option. The disagreement is recorded: the instrument's maintainer argued for routing by skill and gate with the prompts untouched, because a person using the framework writes their own prompts. The owner's position is that the prompts are part of the framework, as a runbook is part of operations. This series follows the owner.

What changes, each traced to a t0 finding:

- **G1, schematic-arm stage prompts.** The mod gains `schematic.stagePrompts`, a map from stage number to a prompt file in the mod, used in the schematic condition only; gate-off and gate-on keep reading the capstone prompts at `stagesRef`. Each replacement is the capstone prompt with its own stage section rewritten, and its sha256 is recorded in `meta.json` like every other prompt. Stage 2 runs `ng g slice --spec specs/hero.json --kinds entity` and describes the generator's layout (`src/app/hero/`, `heroSchema`, `HeroFormModel`) instead of `src/app/domain/` and `HeroModel`. Stage 4 runs `--kinds form,manage` and builds on the generated screen. Stage 5 runs `--kinds form` and hosts the generated form in the Edit tab. Stage 6 says generated files are edited in place, never rewritten, moved or duplicated, and a shape change goes through the spec and `--force`.
- **G2, the generator meets the prompts.** A `--kinds` option generates a subset of the spec's kinds; a kind whose dependencies are missing on disk is refused with a readable error. A file whose current content is byte-identical to what the generator would emit is skipped instead of failing the run. A file carrying the placeholder marker `slice:placeholder` is replaced without `--force`. The route emitter adds nothing when a route already loads the same component import, so a shell that routes `roster` to `./heroes/heroes` keeps its path. `manage.createRoute` (optional, a path such as `/recruit`) makes the create action a link to that route instead of a dialog, for a list whose creation happens elsewhere.
- **G3, the placeholder is marked.** The substrate's `src/app/heroes/heroes.*` stub carries the `slice:placeholder` marker, so the generator owns it and the agent knows it.
- **G4, the routing gate.** A new PreToolUse hook, `route-to-generator`, denies a Write that creates a generator-owned file (under `src/app/`: `*.model.ts`, `*.schema.ts`, `*.service.ts`, `*.service.spec.ts`, `*-example-data.ts`, and anything under `ui/*-form/`) and denies a Write over a file carrying the placeholder marker. Its message names the spec and the command. Edit stays allowed: the fill is policed by the existing gates. A Bash-side check reports generator-owned files that appear without the generator's header line, which every emitted TypeScript file now starts with. The hook runs in the schematic condition only, through `schematic.gateSettings` (`harness/gate/s4-schematic.settings.json`, the round 1 gate-on settings plus this hook). The other gates stay frozen. Ownership applies only to an entity that has a spec at `specs/<entity>.json` (ruling R4 of the final review), so hand-written models and schemas for features without an entity spec, such as a wizard's `<feature>.schema.ts`, stay allowed.
- **G5, the measurement.** Reached is recorded per kind: entity, form and manage each count when a slice run whose `--spec` is the approved spec path created that kind's files. Bar 3 now reads: all three kinds reached in at least 2 of 3 trials. Because the prompts prescribe the command, bar 3 measures compliance, not discovery, and the readout says so. What judges the schematic is bars 1 and 2 plus whether the generated files keep their generated shape through stage 6, reported as the share of generated lines still byte-identical to the generator's output at the end of the run.

The loop follows the gate rounds. Discovery trials run until one full trial is clean: all three kinds generated from the approved spec, no spec copy, no moved or renamed generated file, no generator-owned file written by hand. Each discovery trial's findings are fixed before the next. After a clean trial the prompts, skill, generator and hook are frozen, and three measured trials run against Decision D's bar, unchanged except for the per-kind reading of bar 3 above.

## Decision H: uniformity, the hypothesis after series 5 (2026-10-17)

Series 5 failed Decision D's bar 1 by $0.02 (mean $1.01 against $0.99; `experiments/schematic-arm/s5/readout.md`). The verdict stands as pre-registered: footnote, with bar 1 named.

The owner's response: token cost no longer separates the arms. The first capstone runs, on Haiku 4.5, cost $2.38 a run in gate-off and $3.40 in gate-on in round 1, and $2.52 in gate-on in round 2 (`experiments/capstone-summary.md`, `50352ff`); on Haiku 5.5, gate-on and the schematic arm now cost about $1 to $1.25 a run (the model changed between the two, so this is not a controlled comparison), so a $0.23 gap per run is small next to an engineer's hour. What enterprise teams pay for is non-uniformity: screens that differ in structure and look from entity to entity and from pattern to pattern, and the review, onboarding and maintenance hours spent bringing them into line. CRUD is one pattern; as patterns multiply, the combinations an agent can improvise multiply with them. The owner's thesis is that schematics and gates bring uniformity. Decision D made cost the headline test before any result; the owner now judges that test to have measured the wrong thing, and this decision records that the change came after the result.

The maintainer's assessment, recorded with the decision: the thesis is a better one than cost, and it has not been measured. Series 5 never compared the structure of one run's code with another's; preserved shape measures whether generated code survived one run, not whether two runs agree. One entity cannot show cross-entity uniformity. And the claim joins two properties that the evidence keeps apart: gates enforce conformance (what may not appear), and schematics enforce structure (what the code is). Two components can pass every gate and still differ in file layout, view-model shape and template tree. The multi-pattern argument is reasoning, not data, until a second kind exists and runs. The owner agreed to test the thesis before claiming it.

- **H1, the series 5 verdict.** Unchanged. Decision D is not rewritten, and the readout reports the footnote.
- **H2, two properties, two claims.** Conformance is the gates' claim and is already measured by the counters (gate-on round 1 scored 0 on every family except `foreign-block`, which was 0 in two runs and 24 in one; the schematic scored 0 on all of them in all three). Structure is the schematic's claim and is what this decision measures.
- **H3, the metric, fixed before any uniformity number is computed.**
  - **The roster slice.** The route is the `path: 'roster'` entry in `app.routes.ts`, following `redirectTo`, resolved to its `loadComponent` or `component` target. The slice is that component's files plus the transitive closure of its relative imports under `src/app`, excluding files that belong to a domain unit and files reachable from more than one routed component (a shared form such as `ui/hero-form/` is excluded; a table only the roster uses, such as gate-on's `ui/roster-table/`, is included). A `*.spec.ts` file whose stem matches a slice file is in the slice. A file in the folder that holds the entity's model type, holding no domain role (a presentation helper such as `hero-presentation.ts` or `hero-display.ts`), is in neither the slice nor the unit. The readout lists each run's slice files, so the boundary is visible.
  - **The domain unit**, for each of hero, mission and threat. Four roles: model, schema, service, example data. A file holds a role when it has a top-level `export interface`, `type`, `class` or `const` whose name matches the role for that entity (imports do not count). Every matching file is included. A missing role contributes an empty set. A run with no model type for the entity has no unit for it, and that is reported as absent. Presentation helpers (`hero-presentation.ts`, `hero-display.ts`) hold no role and are excluded.
  - **Dimensions.** Four multisets: D1 layout (normalized file paths, relative to `src/app`), D2 code (role, member kind and normalized name of every member and export, plus imported specifiers), D3 template (normalized element paths to depth 4, with BEM element suffixes, `hlm*` directives and control-flow blocks) and D4 style (normalized selector with its sorted `@apply` utilities). The distance between two multisets is 1 minus the sum of the smaller counts over the sum of the larger counts. Two empty multisets have distance 0, and the dimension still counts in the mean. A roster slice's distance is the mean of D1 to D4; a domain unit's is the mean of D1 and D2.
  - **Normalization, and every rule above that two implementers could read differently**, is settled in `harness/uniformity-metric-spec.md` before any code reads evidence: tokenization (camelCase, kebab-case and SCREAMING_CASE splitting), the entity tokens for each entity (`roster` is a hero token), rule order (comments, then `BLOCK`, then `ENTITY`, then `FIELD`, then `STR` and `NUM`), the file-role table, the member-kind list (including getters, `model()`, `effect`, `viewChild`, and type, const and function exports), template roots with several top-level nodes, `@else`, `@empty`, `ng-container` and `ng-template`, and CSS with several `@apply` lines, plain properties, `@media` and nesting. Each rule there is pinned by a fixture.
  - **Statistics.** U1, cross-run roster: per arm, the mean distance over the three pairs of its runs' roster slices. U2, cross-run hero domain: the same for the hero domain unit. U3, within-app entity uniformity: per run, the mean distance over the pairs among the hero, mission and threat units, computed only for runs where all three units exist, averaged over those runs, with the count of runs reported. In series 5 the schematic arm has one such run (measured 3; measured 1 and 2 have no Mission or Threat entity), so its U3 is a single value, compared against gate-on's with that caveat stated.
  - **The spec-variance floor.** Each schematic run's `spec.approved.json` is regenerated with the generator at `a745bb3`, `--kinds entity,form,manage`, into a clean checkout of `substrate/schematic-arm-4`; the regenerated roster slice is `src/app/heroes/` and the hero unit is `src/app/hero/` without `*.spec.ts`. U1 and U2 over the three regenerated outputs are the distance the spec alone explains. Gate-on works from one prose build spec in every run, so its floor is 0 by definition. The floor is descriptive; the bar does not use it.
- **H4, the bar, exploratory.** The evidence is series 3 round 1 gate-on (3 runs) against series 5 schematic measured (3 runs), the same six trials the cost bar judged. No uniformity number has been computed, but the trees, preserved shape and spec diffs have been read, so the authors are not blind to the data, and some outcomes are predictable.
  - U2 is close to 0 for the schematic by construction, because the generated hero domain is a deterministic function of the spec and normalization removes most spec variance. It is reported, not barred.
  - U1 leans the same way. A bar on U1 alone would mostly confirm that a generator is deterministic.
  - The open question is whether gate-on is non-uniform enough to matter. The bar therefore has two parts, and both must hold: gate-on's U1 is at least 0.20 (one normalized structural element in five differs between a typical pair of gate-on runs), and the schematic's U1 is at most half of gate-on's. A gate-on U1 of 0 fails the bar. The 0.20 threshold is the maintainer's proposal, and the owner confirms or changes it before the metric runs.
  - The bar holds: the confirmatory series in H5 runs. It fails: the schematic stays a footnote, the article's thesis is the gates', and no confirmatory series runs.
  - The first computed numbers decide. A defect found afterwards is fixed and the corrected numbers are reported next to the first, but they do not change the outcome.
  - U3 is reported, not barred, with its prediction written here and scored on the one schematic run against gate-on's three: the schematic will not be more uniform within the app than gate-on, and may be less, because only hero is generated. The per-dimension profile of gate-on's distances is reported whatever the bar says; it is what tells the article where uniformity is lost.
- **H5, the confirmatory series, outlined.** Several entities through the generator (hero, mission and threat, each with a spec) and a second kind in the catalog (master-detail or a wizard), against gate-on, with its own bar written in its own decision before any trial. Not designed here.
- **H6, the catalog is a product.** The owner's answer to who maintains the generators as patterns multiply: a platform team owns the catalog, with versioned generators and a migration path for apps already generated. The cost of the schematic side moves from tokens to catalog maintenance, and the article says so. For H5, the generator header line carries the generator version, so an app knows which version wrote each generated TypeScript file, and each generated html and css file by its component.
- **H7, building the metric.** Under Decision E's policy: `harness/uniformity-metric-spec.md` first, then the metric, built on a capable model with TDD against the spec's fixtures, and reviewed before it reads any trial evidence. It then runs on the evidence once, and the numbers are recorded whatever they are.

The post-series list in the series 5 readout stays recorded, not applied, until H4 decides whether H5 runs.
