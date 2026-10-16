# Series 2, phase 3: layout-only app stylesheets

Status: design, 2026-10-16. Builds on `harness/bem-phase-2-gate-spec.md` and its result, `experiments/schematic-arm/s2/gate-arm-readout.md`.

## Why

Phase 2's gate asked one question: does an appearance utility reach a primitive through an app stylesheet? Gate-on scored 0 on it in three runs, against a gate-off mean of 4.33. The readout traced all 15 firings to their final state, and none was resolved with the remedy the skill names (a variant on the primitive). Seven removed the styling, six moved the class onto a new wrapper inside the primitive, and two deleted the primitive directive and kept its look on a plain element. The last two kinds pass the gate and leave the code further from the house rules than the violation did: the appearance still lives in the app, one element away from where the question looks.

Patching each escape (a check for a removed directive, a check for a styled child of a primitive) closes the door the last runs found and leaves the next one open. This phase moves the line instead: **an app stylesheet carries layout only, and appearance lives in `libs/ui`.** A wrapper styled with `py-8`, a plain `<p>` styled with `text-sm`, and the original violation then all fail the same rule, and the routes left open are the ones the house style wants: a variant on a primitive, a typography directive, an icon tone.

## How the experiment runs from here

The runs exist to find the gates' blind spots, and the gates change when a run finds one. To keep that loop from fitting the gates to the runs that tuned them:

- Every fix is a rule stated in terms of what is allowed, never a match for an observed trick.
- Each round is a discovery round: 3 gate-off and 3 gate-on trials, interleaved, a readout that classifies how every gate firing was resolved, and a list of escapes found. A round that finds an escape produces a rule change and another round.
- When a discovery round finds no new escape, the gates freeze and one confirmatory round runs with no edits after its results are seen. The article's claim rests on that round; the discovery rounds are its method.

## The rule

### R7. App stylesheets are layout only

In every stylesheet under `src/app` and in `src/styles.css`, every utility applied through `@apply` and every plain declaration must be layout. Anything that is not on the layout list is appearance, so an unknown utility fails closed.

Layout, after stripping variant prefixes (`sm:`, `hover:`, `dark:` and the rest) and the `!` important marker:

- display and box: `block`, `inline`, `inline-block`, `flex`, `inline-flex`, `grid`, `inline-grid`, `contents`, `hidden`, `sr-only`, `not-sr-only`, `box-border`, `box-content`;
- flex and grid: `flex-*` (direction, wrap, `flex-1` and the rest), `grow*`, `shrink*`, `basis-*`, `order-*`, `grid-cols-*`, `grid-rows-*`, `col-*`, `row-*`, `auto-cols-*`, `auto-rows-*`, `grid-flow-*`, `items-*`, `justify-*`, `content-*`, `self-*`, `place-*`, `gap-*`;
- sizing: `w-*`, `h-*`, `size-*`, `min-w-*`, `min-h-*`, `max-w-*`, `max-h-*`, `aspect-*`;
- margin: `m-*`, `mx-*`, `my-*`, `mt-*`, `mr-*`, `mb-*`, `ml-*`, `ms-*`, `me-*` and their negatives;
- position: `static`, `relative`, `absolute`, `fixed`, `sticky`, `inset-*`, `top-*`, `right-*`, `bottom-*`, `left-*`, `start-*`, `end-*`, `z-*`;
- overflow and flow: `overflow-*`, `overscroll-*`, `truncate`, `text-ellipsis`, `text-clip`, `whitespace-*`, `break-*`, `text-left`, `text-center`, `text-right`, `text-start`, `text-end`, `text-justify`, `object-*`, `isolate`, `container`;
- padding (`p-*`, `px-*`, `py-*`, `pt-*`, `pr-*`, `pb-*`, `pl-*`, `ps-*`, `pe-*`) only in a rule whose selector is the component's block root, see R7a.

Plain declarations are judged by property: the properties those utilities set (`display`, `flex*`, `grid*`, `gap`, `width`, `height`, `min-*`, `max-*`, `aspect-ratio`, `margin*`, `position`, `inset*`, `top`, `right`, `bottom`, `left`, `z-index`, `overflow*`, `text-overflow`, `white-space`, `word-break`, `overflow-wrap`, `text-align`, `object-fit`, `object-position`, `isolation`, `order`, `align-*`, `justify-*`, `place-*`) are layout; every other property is appearance. `color: var(--sidebar-primary)` is appearance, as gate-off t2 wrote it.

`src/styles.css` may additionally hold the theme: custom property declarations inside `:root` and `:root.dark`, `@import`, `@theme`, `@custom-variant`, `@source`, and `@layer base` rules on element selectors (no class selectors). A class rule in the global stylesheet is judged like any app rule, so appearance cannot move there.

### R7a. Padding on the block root only

A rule whose every selector is the component's block root (`.<file-stem>`, `.<file-stem>--<modifier>`, or `:host`) may apply padding. Padding anywhere else in an app stylesheet is appearance. The block root's element must not be a primitive: `<div hlmCard class="stat-tile">` with `.stat-tile { @apply p-4; }` still fails, under the existing primitive rule, which stays in force.

### Where appearance comes from instead

- A primitive's look: a variant on the primitive in `libs/ui`, selected with its input (unchanged from phase 2).
- Text: the typography directives, copied from spartan into `libs/ui/typography` (`hlmH1` to `hlmH4`, `hlmP`, `hlmLead`, `hlmLarge`, `hlmSmall`, `hlmMuted`, `hlmCode`, `hlmBlockquote`, `hlmUl`), each a primitive like any other. When none fits (a stat value, a table emphasis), add a variant to the closest one.
- Icon color and size: a new owned primitive, `hlmIcon` (`ng-icon[hlmIcon]`), with a `size` input and a `tone` input (`default` inherits `currentColor`; `muted`, `primary`, `destructive`, `success`, `warning` map to semantic tokens). spartan's CLI has no icon helper, so this one is written in the house style, not copied.
- A region's inset: padding on the block root (R7a).

## Substrate

A new branch, `substrate/schematic-arm-3`, from `substrate/schematic-arm-2`:

1. `libs/ui/typography` generated with the spartan CLI (`ng g @spartan-ng/cli:ui typography`), registered in `tsconfig.json` paths like the other primitives.
2. `libs/ui/icon` with `HlmIcon`, its `cva`, and a unit test for each tone.
3. The primitive list the rules use (`isPrimitive` in the existing rule and the counter's own list) gains the typography directives and `hlmIcon`.
4. The house-style skill, both copies byte-identical: rule 5 rewritten to R7 and R7a with the layout list, a "where appearance comes from" section with one example each, and the worked example updated so no app rule applies appearance. The rule doc for the new gate carries the same remedy, so the arms differ in enforcement only.
5. The placeholders and existing examples conform to R7 (the substrate must pass its own rule before a run starts).

## The gate

### What it enforces

R7 and R7a on stylesheets, judged per rule without the template: the block root is known from the file stem, so no template expansion is needed. The phase 2 rule (`no-applied-appearance-on-primitive`) stays registered, because it is the one that catches layout-legal utilities with no business on a primitive, such as block-root padding on a primitive element. It also adds the existing BEM rule 1 check, no utility class in a template's `class` attribute, because gate-off t1 put 62 there.

### Independent of the counter

As in phase 2: the gate's classifier is written from this spec under `harness/gate/`, and shares no code with the counter's.

### When it fires

- PostToolUse on `Write|Edit|MultiEdit` for any `*.css` or `*.html` under `src/app`, and for `src/styles.css`.
- PostToolUse on `Bash`, which ignores the command, asks git which files under `src/` are modified or untracked, and runs the same checks on those. Gate-on t1 rewrote `app.html` with a Python heredoc that no file-tool hook saw; this closes that route the way the blog repo's `check-after-bash.ts` does.

On a violation it exits 2 naming the file, line, selector, utility or property, and the remedy that fits the kind (typography directive for text utilities, `tone` for icon color, a variant for anything on a primitive, block-root padding for an inset), followed by the rule doc's agent guidance. It fails closed on an unparseable payload or stylesheet. Gate-on only, in its own config built by its own hook, as in phase 2.

## The counter

One new kind in the `bem` family, measured in both arms: `appearance-in-app-css`, one per (rule, utility or property) that R7 or R7a forbids, in `src/app` stylesheets and class rules in `src/styles.css`.

There is no counter kind for a dropped primitive. The final tree cannot show that an element used to carry a directive, and a kind that guessed from tag and position would be a match for the trick phase 2 saw. Under R7 a dropped primitive that keeps its look fails anyway; the readout traces each gate firing from its message to its final state, as phase 2's did, and that trace is where a dropped primitive shows up.

All phase 2 kinds stay, so phase 3 numbers can be read against phase 2's. The six phase 2 trials and both pilots are rescored with the new kinds and reported as a reference, labeled as runs that had neither the rule nor the typography and icon primitives.

The counter also reports, per run, how many variants each `libs/ui` primitive gained and how many typography and icon directives the app uses. That makes "the agent used the primitive's API" a number in the readout, not something found by reading diffs.

## Testing

- Classifier unit tests for both engines: every layout family above passes; `py-8` on an element rule, `text-sm`, `font-medium`, `text-muted-foreground`, `rounded-md`, `shadow-sm`, `bg-muted/50`, `color: var(--x)`, and an unknown utility each fail; `p-6` on `.dashboard` passes and on `.dashboard__panel` fails; `p-4` on a block root whose element is a primitive fails through the primitive rule.
- The phase 2 runs as end-to-end fixtures: every one of the 15 gate-on firings, in its final resolved form, is checked. The 6 wrappers with appearance and the 2 dropped primitives must fail R7; the 7 removals must pass unless the remaining rule still applies appearance.
- Gate and counter agreement on all eight phase 2 and pilot trees, kind for kind.
- A hook test for each trigger: Write, Edit, and a Bash command that writes a violating stylesheet, each exit 2; the same with layout-only content exits 0.
- The substrate passes its own gate and counter with zero violations before any run.

## Out of scope

- BEM block naming (`foreign-block`): found in all six phase 2 runs, ungated in this phase, and the first target of the schematic arm, which writes the block name from the file.
- Measuring or policing `libs/ui` (owner ruling, 2026-10-16). The agent adds variants there freely.
- The schematic arm (own spec, after the gates freeze).
