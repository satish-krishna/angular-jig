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
- `schematic.specPath`: `specs/hero.slice.json`; `schematic.specSchemaPath`: the emitted JSON schema under `schematics/slice/`.
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

## Out of scope

- New kinds. Roster and detail map onto `manage` (as extended in B2) and `form`; whatever the stage prompts ask for beyond them (the detail screen's back link, header, tabs and retire dialog, the roster's avatar column) the agent writes by hand, under gates, and that is part of what the arm measures.
- The two gate defects from round 1 (empty `content`, the text-utility remedy message). The gates are frozen as they ran in round 1, so all three arms meet the same gates.
