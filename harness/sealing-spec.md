# The sealing spec (Part 1)

The single written contract that both the gate and the structural counter encode, independently and in different engines. The gate parses templates with angular-eslint; the counter parses them with Angular's own compiler (`@angular/compiler`). Neither shares code with the other. This document is the only place the rules are stated in prose; if the two encodings ever disagree on a fixture, this file is the arbiter, and one of the encodings is wrong.

## The rules are the docs, mechanized

Every rule here comes from a doc in the agent's baseline: SpartanNG's own documentation (the spartan skill, `rules/styling.md` and `rules/composition.md`), Angular's generated `CLAUDE.md`, and this repo's house-style skill (`.claude/skills/house-style`, the grid/flex grammar and no-raw-literals rule that extend spartan where it is silent). The gate enforces exactly what those docs say and permits everything they permit; where two baseline docs pull differently (Angular endorses style bindings, spartan wants appearance in tokens), the rule is drawn so it fights neither. This is not our stricter opinion bolted on top: the whole thesis is that the model drifts even with those docs in its context, so the gate is only an honest test if it blocks what the docs block and nothing more. Each rule below cites the docs line it mechanizes and lists the docs' own good and bad examples, which are the test cases the counter and gate must satisfy.

## The vocabulary, as installed

Read from source, not from memory. This list is derived from the `selector:` declarations in `libs/ui` at this substrate commit, which is the only honest definition of what the repo owns. The capstone widened `libs/ui` from three primitives to nineteen, and this section is the record of that widening; the rules below are exactly as wide as it and no wider.

Primitive attribute directives:

`hlmBtn`, `hlmInput`, `hlmTextarea`, `hlmLabel`, `hlmSeparator`, `hlmSkeleton`, `hlmBadge`, `hlmTooltip`,
`hlmCard`, `hlmCardHeader`, `hlmCardFooter`, `hlmCardTitle`, `hlmCardDescription`, `hlmCardContent`, `hlmCardAction`,
`hlmTable`, `hlmTableContainer`, `hlmTHead`, `hlmTBody`, `hlmTFoot`, `hlmTr`, `hlmTh`, `hlmTd`, `hlmCaption`, `hlmTableHeader`, `hlmTableBody`, `hlmTableFooter`, `hlmTableRow`, `hlmTableHead`, `hlmTableCell`, `hlmTableCaption`,
`hlmField`, `hlmFieldContent`, `hlmFieldDescription`, `hlmFieldGroup`, `hlmFieldLabel`, `hlmFieldTitle`, `hlmFieldSet`, `hlmFieldLegend`,
`hlmSelect`, `hlmSelectGroup`, `hlmSelectLabel`, `hlmSelectMultiple`, `hlmSelectPlaceholder`, `hlmSelectPortal`, `hlmSelectSeparator`, `hlmSelectValue`, `hlmSelectValues`, `hlmSelectValuesContent`, `hlmSelectValueTemplate`,
`hlmDialogClose`, `hlmDialogDescription`, `hlmDialogFooter`, `hlmDialogHeader`, `hlmDialogOverlay`, `hlmDialogPortal`, `hlmDialogTitle`, `hlmDialogTrigger`, `hlmDialogTriggerFor`,
`hlmSheetClose`, `hlmSheetDescription`, `hlmSheetFooter`, `hlmSheetHeader`, `hlmSheetOverlay`, `hlmSheetPortal`, `hlmSheetTitle`, `hlmSheetTrigger`,
`hlmTabs`, `hlmTabsContent`, `hlmTabsContentLazy`, `hlmTabsList`, `hlmTabsTrigger`,
`hlmAvatarBadge`, `hlmAvatarFallback`, `hlmAvatarGroup`, `hlmAvatarGroupCount`, `hlmAvatarImage`,
`hlmSwitchThumb`,
`hlmSidebarContent`, `hlmSidebarFooter`, `hlmSidebarGroup`, `hlmSidebarGroupAction`, `hlmSidebarGroupContent`, `hlmSidebarGroupLabel`, `hlmSidebarHeader`, `hlmSidebarInput`, `hlmSidebarInset`, `hlmSidebarMenu`, `hlmSidebarMenuAction`, `hlmSidebarMenuBadge`, `hlmSidebarMenuButton`, `hlmSidebarMenuItem`, `hlmSidebarMenuSkeleton`, `hlmSidebarMenuSub`, `hlmSidebarMenuSubButton`, `hlmSidebarMenuSubItem`, `hlmSidebarRail`, `hlmSidebarSeparator`, `hlmSidebarTrigger`, `hlmSidebarWrapper`.

Primitive element names:

`hlm-card`, `hlm-card-header`, `hlm-card-footer`,
`hlm-badge`, `hlm-separator`, `hlm-skeleton`,
`hlm-avatar`, `hlm-avatar-badge`, `hlm-avatar-group`, `hlm-avatar-group-count`,
`hlm-field`, `hlm-field-content`, `hlm-field-description`, `hlm-field-error`, `hlm-field-group`, `hlm-field-label`, `hlm-field-separator`, `hlm-field-title`,
`hlm-select`, `hlm-select-content`, `hlm-select-group`, `hlm-select-item`, `hlm-select-label`, `hlm-select-multiple`, `hlm-select-placeholder`, `hlm-select-scroll-down`, `hlm-select-scroll-up`, `hlm-select-separator`, `hlm-select-trigger`, `hlm-select-value`, `hlm-select-values-content`,
`hlm-dialog`, `hlm-dialog-content`, `hlm-dialog-footer`, `hlm-dialog-header`, `hlm-dialog-overlay`,
`hlm-sheet`, `hlm-sheet-content`, `hlm-sheet-footer`, `hlm-sheet-header`, `hlm-sheet-overlay`,
`hlm-tabs`, `hlm-tabs-list`, `hlm-paginated-tabs-list`,
`hlm-switch`,
`hlm-sidebar`, `hlm-sidebar-content`, `hlm-sidebar-footer`, `hlm-sidebar-group`, `hlm-sidebar-header`, `hlm-sidebar-menu-badge`, `hlm-sidebar-menu-skeleton`, `hlm-sidebar-separator`, `hlm-sidebar-wrapper`.

The set of primitive attribute names and element names is used by rules 1 and 2 to decide whether an element is a primitive.

`<ng-icon>` is deliberately NOT in this set. It is an `@ng-icons` element, not a Helm primitive, and spartan's own `rules/icons.md` explicitly blesses appearance classes on it (`class="text-muted-foreground"` for a decorative icon, `class="text-[length:--spacing(4)]"` for sizing). Treating it as a primitive would make rule 2 fight a baseline doc, which the whole design forbids. Icons get their own rule instead, rule 4, and that rule bans only the thing no doc endorses.

## The six rules

Every Part 1 violation is one of exactly six kinds. Rules 5 and 6 were added after the capstone run, in response to drift it measured getting past rules 1 through 4; they were not tested by that run, and the report says so. The gate reports them by `messageId`; the counter tallies them by `kind`. The kind strings are the shared vocabulary and must match on both sides.

### 1. `raw-control`: a native element where a primitive exists

Docs: composition.md, "use components, not custom markup"; the house-style skill's sealed control vocabulary, which states the table below in the agent's own baseline. A native element that a primitive already covers, used bare, is a violation.

Most primitives are directives on the native element, so the fix is to add the attribute. Any one of the listed attributes satisfies the rule, because several Helm directives style the same native element in different compositions and banning the composition-specific ones would fight spartan's own docs.

| native element | acceptable primitive attributes |
| --- | --- |
| `button` | `hlmBtn`, `hlmDialogTrigger`, `hlmDialogTriggerFor`, `hlmDialogClose`, `hlmSheetTrigger`, `hlmSheetClose`, `hlmSidebarTrigger`, `hlmSidebarRail`, `hlmSidebarMenuButton`, `hlmSidebarMenuSubButton`, `hlmSidebarMenuAction`, `hlmSidebarGroupAction`, `hlmSidebarGroupLabel` |
| `input` | `hlmInput`, `hlmSidebarInput` |
| `textarea` | `hlmTextarea` |
| `label` | `hlmLabel`, `hlmFieldLabel` |
| `fieldset` | `hlmFieldSet` |
| `legend` | `hlmFieldLegend` |
| `table` | `hlmTable` |
| `thead` | `hlmTableHeader`, `hlmTHead` |
| `tbody` | `hlmTableBody`, `hlmTBody` |
| `tfoot` | `hlmTableFooter`, `hlmTFoot` |
| `tr` | `hlmTableRow`, `hlmTr` |
| `th` | `hlmTableHead`, `hlmTh` |
| `td` | `hlmTableCell`, `hlmTd` |
| `caption` | `hlmTableCaption`, `hlmCaption` |

Two native elements have no directive twin and must be replaced by a composed primitive instead. For these there is no attribute that makes the native element acceptable; the element itself is the violation.

| native element | required replacement |
| --- | --- |
| `select` | `hlm-select` |
| `dialog` | `hlm-dialog` |

`select` is banned outright rather than given a directive because spartan's `native-select` primitive is not installed here, so there is no supported way to style a bare `<select>` in this repo. The sanctioned select is the composed `hlm-select`. The same reasoning covers `dialog`.

Good (passes): `<button hlmBtn>Save</button>`, `<button hlmSidebarMenuButton>Roster</button>`, `<input hlmInput />`, `<tr hlmTr><td hlmTd>88</td></tr>`, `<label hlmFieldLabel>Alias</label>`. Bad (fails): `<button>Save</button>`, `<input />`, `<table><tr><td>88</td></tr></table>`, `<select>`, `<label>Alias</label>`.

A bare `<a>` is fine; the anchor is a real navigation element, and `hlmBtn` on an anchor is opt-in. Composed components you would otherwise hand-roll from a `<div>` (a card, a badge, an alert, a separator) remain Part 3's territory (component shape, "use the component"), not Part 1's. The line rule 1 draws is that the violation must be visible in the element NAME: a native element with a primitive twin, used bare. A `<div>` that should have been a card is not decidable from its name, and is not this rule's business. `<select>` and `<dialog>` sit on the correct side of that line: they are named native controls with a named primitive replacement, and the substitution is mechanical.

### 2. `appearance-on-primitive`: an appearance-override class on a primitive

Docs: styling.md, "`class` is for layout only. Use the `class` attribute to position and space components (flex, grid, gap, margins, widths). Do not use it to override a component's own colors, typography, or internal padding, change the copied Helm file or a CSS variable instead." So a class on a primitive is a violation only when it overrides appearance. Layout and spacing classes on a primitive are allowed and idiomatic.

- Banned on a primitive (appearance override): background (`bg-*`), text color and typography (`text-*`, `font-*`, `leading-*`, `tracking-*`, `italic`, `underline`, `uppercase`, ...), border and decoration (`border`, `border-*`, `rounded*`, `shadow*`, `ring*`), and internal padding (`p-*`, `px-*`, `py-*`, `pt-*`, ...).
- Allowed on a primitive (layout, position, spacing): display (`flex`, `grid`, `inline*`, `block`, `hidden`), flex and grid arrangement (`gap-*`, `justify-*`, `items-*`, `self-*`, `col-*`, `row-*`, `order-*`, `basis-*`, `grow`, `shrink`), dimensions (`w-*`, `min-w-*`, `max-w-*`, `h-*`, `size-*`), margins (`m-*`, `mx-*`, `mt-*`, ...), and position (`absolute`, `relative`, `top-*`, `inset-*`, ...). Responsive and state prefixes (`sm:`, `md:`, `hover:`, `dark:`, ...) are stripped before classifying the base utility.

Good (passes, straight from the docs): `<div hlmCardFooter class="justify-between">`, `<hlm-dialog-content class="sm:max-w-[425px]">`, `<button hlmBtn class="w-full">`. Bad (fails): `<button hlmBtn class="bg-blue-600 rounded-none">`, `<input hlmInput class="p-4 text-lg">`. The escape route the seal closes is appearance reaching past the primitive; the way to change a primitive's look is its `variant`/`size` inputs or the owned Helm file in `libs/ui`, which the gate leaves untouched.

### 3. `style-attribute`: a static inline style attribute

Careful here, because the baseline holds a rule that pulls the other way. Angular's own `CLAUDE.md` in the baseline says to use `[style]` bindings over `[ngStyle]`, so the gate must NOT ban style bindings; that would fight a doc the agent is reading. What no baseline doc endorses is a STATIC `style="..."` attribute: a raw inline literal that bypasses the token system, against spartan's "semantic tokens only" and the house "no raw literals" rule. So this rule is narrow.

- Violation: a static `style="..."` attribute (a raw inline literal). Good (passes): `[style.width.%]="pct()"`, a computed style binding, which Angular's baseline doc endorses. Bad (fails): `<div style="color: red; padding: 8px">`.

`[ngStyle]` and `[ngClass]` are also discouraged by the Angular baseline doc, but banning them is a component-shape lint rule for a later Part, not part of the Part 1 seal, so they are out of scope here.

### 4. `raw-icon`: a raw inline `<svg>` in an application template

Docs: the house-style skill, "Icons are `<ng-icon>`, never inline SVG," which layers on spartan's `rules/icons.md` ("icons are `<ng-icon name="lucide...">`; register with `provideIcons`"). Pasted SVG markup bypasses the icon registry, cannot be themed or swapped, duplicates a glyph the Lucide set already ships, and is the single largest source of unreviewable markup in a hand-built screen. There is no `hlm-icon` wrapper; the retired one is why `migrate-icon` exists.

- Violation: an `<svg>` element in a template under `src/`.
- Good (passes): `<ng-icon name="lucideTrash2" />` with `provideIcons({ lucideTrash2 })` on the component. Bad (fails): `<svg viewBox="0 0 24 24"><path d="M3 6h18" /></svg>`.

The rule is narrow on purpose, and the narrowness is the point twice over.

It does not gate the `provideIcons` registration, even though the doc requires it. Registration is a fact about the component class, and the name is a fact about the template; the template engines cannot see the class, and making the counter alone check it would break the two-engine symmetry that makes a disagreement meaningful. Neither does the framework catch it: `@ng-icons` logs "No icon named X was found" and renders nothing, so an unregistered icon is a silent blank rather than a failed build. This is the honest inverse of Part 4's freeloader finding. Part 4 found a graph the compiler had already built and rode it for free; here there is a rule the framework declines to enforce, so the gate covers the decidable half and this spec states plainly that the other half is doc-only. Do not report an unregistered-icon count as gated drift.

It also does not touch `libs/**` (the gate ignores it wholesale) or `src/index.html`. Helm components legitimately inline SVG internals, and that is customization territory, exactly where rule 2 already points appearance changes.

### 5. `unknown-primitive`: an `hlm*` attribute or element that matches no installed selector

Docs: the house-style skill, "The primitive must actually exist," and this spec's own instruction to read the vocabulary from source rather than from memory.

Every Helm primitive is either an attribute directive or an element, never both, and which one it is is fixed by its `selector:` in `libs/ui`. An attribute that looks like a primitive but matches no selector is not a compile error and not a runtime error. Angular treats an unmatched attribute on a native element as a plain HTML attribute, so the markup compiles, renders, and does nothing.

- Violation: an attribute whose name matches `/^hlm[A-Z]/` or `/^hlm-/` (both casings, because a writer who reaches for the wrong form usually reaches for the element name as an attribute), or an element whose name matches `/^hlm-/`, that is not in the installed inventory in "The vocabulary, as installed" **in that form**. The attribute-versus-element distinction is the whole point: `hlmSelectTrigger` as an attribute is a violation because the installed selector is the element `hlm-select-trigger`.
- Good (passes): `<hlm-select-trigger>`, `<hlm-avatar>`, `<span hlmAvatarFallback>`. Bad (fails): `<button hlmBtn hlmSelectTrigger>`, `<div hlmAvatar>`, `<aside hlm-sidebar>` where the element is right but written as an attribute, or vice versa.

This is a **closed-world check**, which is what makes it unusually safe for a gate. It does not guess at intent; it asserts membership in an inventory this spec already maintains and that is mechanically derivable from `libs/ui`. A name outside the `hlm` namespace is never considered, so ordinary attributes and third-party components are untouched.

The capstone is why this rule exists. Across three gate-on trials, 17 sites wrote a primitive that binds nothing: every `hlm-select` in two trials had a non-functional trigger, so the class filter and both form selects could not open, and one trial had no sidebar component at all despite appearing to use one, and hand-wrote CSS to re-implement the rail it thought it had. Every AST gate reported clean, because rule 1 only asks whether a native element carries a primitive and rule 2 only classifies classes on elements it already believes are primitives. Markup that merely *looks* like the vocabulary was invisible to the entire seal.

### 6. `missing-composition-part`: a primitive present but not composed

Docs: spartan's `composition.md`, verbatim: "Overlays need a title. Dialog, Sheet, and Alert Dialog must have a title for accessibility. If the design hides it, keep it present and apply `class="sr-only"`." Restated in the house-style skill.

Rules 1 and 5 ask whether a primitive is present and whether it is real. Neither asks whether it was assembled correctly, and a half-composed primitive is a distinct defect: the outer shell renders, so the screen looks finished, while the part carrying the accessibility contract is missing. Both capstone builds that shipped a retire dialog used a bare `<h2 class="font-semibold">` inside `hlm-dialog-content`, so neither dialog had an accessible name.

The required-parts table, which is to this rule what the native-element table is to rule 1:

| container | required descendant |
| --- | --- |
| `hlm-dialog-content` | an element carrying `hlmDialogTitle` |
| `hlm-sheet-content` | an element carrying `hlmSheetTitle` |

- Good (passes): `<hlm-dialog-content><h2 hlmDialogTitle>Retire hero?</h2>...`. Bad (fails): `<hlm-dialog-content><h2 class="font-semibold">Retire hero?</h2>`.

This is a pure parent/child property of a single template AST: no cross-file join, no type information, no heuristic. Containment is scoped within one template, so a title supplied by a wrapper component in another file would be a false positive; in this repo overlays are composed inline at the call site, which is what makes the check sound here. That scope limit is stated rather than discovered.

**What this rule deliberately does NOT check, and why.** spartan's `forms.md` also says "Use `hlmField`, not raw `div`s. Wrap each control in `hlmField`," and an earlier draft of this rule gated that as a required-ancestor check on every `hlmInput`, `hlmTextarea` and `hlm-select`. That was over-broad and would have been a bad gate. The capstone build spec itself calls for a search input and a class-filter select in a toolbar, and neither is a form field: wrapping them in `hlm-field` would add label, error and description slots they do not want. The spartan line is about composing a FORM, and "is this control part of a form" is not decidable from the template, since signal-forms need no `<form>` element at all.

So the field-wrapping convention stays doc-only, in the house-style skill, and is not gated. This is the same call Part 2 made for `nested-flex-grid`: a rule that hard-blocks legitimate usage is worse than a rule that is not written, and the repo's own conformance target contains the legitimate usage.

## Where customization goes (why the seal is with the grain, not against it)

Because Helm code is copied into the project, the documented way to customize a component is to edit its file in `libs/ui` (adjust the `cva` variants, change classes, add inputs) or to use its `variant`/`size` inputs, never to reach past it at the call site. The gate ignores `libs/**` entirely, so that customization path is fully open. Rule 2 does not fight the framework; it enforces the framework's own "class is for layout only," and it points appearance changes at the place the docs point them.

## The tally shape (the counter's output contract)

```json
{
  "totals": { "raw-control": 0, "appearance-on-primitive": 0, "style-attribute": 0, "raw-icon": 0, "unknown-primitive": 0, "missing-composition-part": 0, "all": 0 },
  "violations": [
    { "kind": "raw-control", "file": "src/app/dashboard/dashboard.ts", "line": 12, "detail": "button without hlmBtn" }
  ]
}
```

`totals.all` is the sum of the six kinds. `violations` is ordered by file, then line, then kind, so the same input always serializes byte-identically. That ordering is what makes the determinism self-test (same committed diff in, identical tally out) meaningful.

## What each engine parses

- The gate loads angular-eslint's template parser and runs six custom rules over the template AST, on `.html` templates and inline `template:` strings.
- The counter loads `@angular/compiler`'s `parseTemplate` and walks the AST, reading `.html` files and extracting inline `template:` strings from `.ts` with the TypeScript compiler API. It shares no rule code, no parser, and no AST types with the gate.

One parser fact both engines need, stated here rather than discovered twice: both the angular-eslint template parser and `@angular/compiler` namespace SVG element nodes, so an inline `<svg>` arrives with the node name `:svg:svg`, not `svg`. This is a fact about the parsers, identical on both sides, not a shared implementation.

Two engines, one spec, and the spec is the docs. If they ever disagree, that disagreement is the finding.
