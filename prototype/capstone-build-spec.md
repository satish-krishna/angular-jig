# Capstone build spec: the kitchen-sink Tour of Heroes

This is the conformance target for the capstone build. It is intent plus decisions, not pixels: a low-fidelity layout, build guidelines, a theme palette, and an icon scheme. Build to this with the real sealed spartan primitives and the MVVM pattern, under all gates. Do NOT chase a pixel-perfect mock.

`prototype/tour-of-heroes.html` is a colour-and-mood reference ONLY. It is known to be non-responsive (measured: 19 responsive-gate violations) and its CSS and layout mechanics must not be copied. Take the look and feel from it; take the structure, palette, icons, and responsive rules from this document.

## How to use this

- The app is "Hero Ops Console": Tour of Heroes reimagined as a superhero agency's mission control. That framing is what makes the kitchen sink coherent (a roster, missions, threats, recruiting) rather than a component zoo.
- Build every screen responsive-correct at 375px, 768px, and 1280px. The Part 5 responsive gate is on: no horizontal page scroll, no element escaping the viewport, no clipped content at any of the three widths. This is the bar the mock failed and the build must clear.
- Use spartan primitives for everything that has one. Compose, do not hand-roll. The sealing gate enforces this once the vocabulary is expanded.

## Theme palette

A cool indigo-biased neutral set with an amber-gold action colour and a permanently-dark navigation rail. Apply these to the existing spartan CSS tokens in `src/styles.css` (the `:root` and `:root.dark` blocks). Names below are roles; map each to spartan's own token (for example the action colour is spartan's `--primary`, the subtle hover background is spartan's `--accent`, which is a different thing; do not confuse the two).

```
role                     light        dark
----                     -----        ----
action / primary         #d8891a      #f5b843
on-primary               #ffffff      #241a05
page background          #f6f7fa      #0e1018
foreground (text)        #1b1e2b      #eceef6
card / popover           #ffffff      #171a26
muted surface            #eef0f6      #1e2231
muted foreground         #5b6072      #9aa0b4
border / input           #e4e7ef      #272b3b
focus ring               amber @ 35%  amber @ 40%
--- navigation rail (dark in both themes) ---
sidebar background       #1e2233      #10121c
sidebar foreground       #eceef6      #eceef6
sidebar muted            #9aa0b4      #8b90a6
sidebar active bg        #2a2f45      #20263c
--- semantic (separate from the accent; these carry meaning) ---
success (Active)         #2fb574      #3ecb84
warning (Injured)        #e4802b      #f0983f
destructive (MIA/retire) #e5484d      #f2585d
info                     #4f7cf0      #6f97f6
```

Radius: cards and controls around 9-10px, dialogs a touch larger. Elevation is restrained: one soft shadow on cards, a stronger one only on popovers and dialogs. Do not stamp the same shadow and radius on every block.

Theme switch is a `.dark` class toggled on `<html>` (the substrate already defines `:root` and `:root.dark`). Persist the choice; respect `prefers-color-scheme` when the user has made no choice.

## Icon scheme

Icons are `@ng-icons/core` with the lucide set (`@ng-icons/lucide`), registered per component with `provideIcons({ ... })` and rendered as `<ng-icon name="lucideX" />`. There is no `hlm-icon` wrapper. Raw inline `<svg>` is banned by the new icon gate rule. Confirm the exact lucide export names against the installed `@ng-icons/lucide` (some differ, e.g. a pencil may be `lucidePencil` or `lucideSquarePen`).

```
usage                 lucide icon
-----                 -----------
nav: Dashboard        lucideLayoutDashboard
nav: Roster           lucideUsers
nav: Missions         lucideTarget   (or lucideRadar)
nav: Threats          lucideShieldAlert
nav: Recruit          lucideUserPlus
nav: Settings         lucideSettings
theme light / dark    lucideSun / lucideMoon
search                lucideSearch
notifications         lucideBell
edit                  lucidePencil
retire / delete       lucideTrash2
deploy                lucideCrosshair
back                  lucideChevronLeft
select chevron        lucideChevronDown
stat: heroes          lucideUserCheck
stat: missions live   lucideActivity
stat: avg power       lucideZap
stat: threats         lucideShieldAlert
success / warning     lucideCheck / lucideTriangleAlert
```

## Low-fidelity layout

Structure and regions, not styling. Each note says what happens at 375px.

App shell (all screens):

```
+--------+-------------------------------------------------+
| RAIL   |  TOPBAR: [menu] crumbs .... [search][bell][thm][av] |
| (dark) +-------------------------------------------------+
| brand  |                                                 |
| ------ |   ROUTED SCREEN CONTENT (scrolls)               |
| nav x6 |                                                 |
| ------ |                                                 |
| user   |                                                 |
+--------+-------------------------------------------------+
375px: rail becomes an off-canvas drawer (hlm-sidebar handles this).
       CLOSED drawer must be display:none or aria-hidden, NOT just
       translated off-screen, or the responsive gate flags it as an
       element escaping the viewport. Topbar search collapses to an
       icon that expands, or drops below the crumbs.
```

Dashboard:

```
[ Operations Dashboard ]                        [ + Recruit ]
[ stat ][ stat ][ stat ][ stat ]      <- grid, auto-fit min ~210px
[ Top heroes this cycle ]             [ View all roster ]
[ hero ][ hero ][ hero ][ hero ]      <- grid, auto-fill min ~230px
[ Roster ]                            [ 42 heroes ]
[ ============ ROSTER TABLE ============ ]
375px: stat tiles -> 1 per row; hero cards -> 1-2 per row; table below.
```

Roster table:

```
+--------------------------------------------------------------+
| [search........]  [class v]                    [ + Recruit ] |
+--------------------------------------------------------------+
| HERO            | CLASS  | POWER | STATUS   | CLEAR | ACTIONS |
| (av) Name/ID    | badge  |  88   | pill     | Tier4 | edit del|
| ...                                                          |
+--------------------------------------------------------------+
| 42 of 42 heroes                          sorted by power     |
+--------------------------------------------------------------+
375px: a plain table WILL overflow. Two allowed answers, pick one and
       make the gate pass: (a) wrap the table in an overflow-x:auto
       container so the CONTAINER scrolls and the page does not (the
       gate exempts intentional scroll containers); or (b) switch to a
       stacked card list below ~640px (each hero a card). (b) is the
       nicer result; (a) is the cheaper one. Do NOT let the page itself
       scroll sideways.
```

Hero detail:

```
[< Back to roster]
[ (AV lg) ID / Name / Alias / badges ]            [Deploy][Retire]
[ Overview | Powers | Missions | Edit ]           <- tabs
Overview:  [ Field summary + 3 mini-stats ]  [ Dossier k/v ]
Powers:    [ power meters ]                   [ ability badges ]
Missions:  [ list of deployments + result badges ]
Edit:      [ schema form: name, alias, class(select), power(number),
             notes(textarea), active(switch) ; Cancel / Save ]
           Retire -> confirmation dialog.
375px: two-column areas stack to one column; form grid -> 1 column;
       tab strip scrolls horizontally if needed; detail header wraps.
```

## Build guidelines

Component map (region -> spartan primitive):

- Navigation rail: `hlm-sidebar` and its parts (`HlmSidebarMenu*`, `HlmSidebarGroup*`, trigger, rail). Let it own its mobile off-canvas behaviour.
- Top bar controls: `hlmBtn` (icon buttons), `hlmInput` (search), `hlm-tooltip` on icon-only buttons, `hlm-avatar` for the account chip.
- Stat tiles and hero cards: `hlm-card` and its parts; `hlm-badge` for trends and classes; `hlm-avatar` for hero portraits.
- Roster: `hlm-table` (with its header/row/cell parts), `hlm-select` for the class filter, `hlmInput` for search, `hlm-badge` for class and status, `hlmBtn` for actions.
- Detail: `hlm-tabs`, `hlm-avatar`, `hlm-badge`; the edit form uses `hlm-field` + `hlm-label` + `hlmInput` + `hlm-select` + `hlm-switch` + a textarea; retire uses `hlm-dialog`. Toast/feedback via whatever spartan provides (sonner/toast) or a small local one.
- Icons everywhere via `<ng-icon>` per the scheme above.

MVVM (the house pattern, enforced):

- Each routed feature screen (Dashboard, Roster, HeroDetail, Recruit) gets a ViewModel: an `@Injectable` service holding all logic and state as signals, unit-testable with no DOM.
- The component lists its VM in its own `providers: [XViewModel]` (component-scoped, NOT `providedIn: 'root'`), injects it, and binds the template to `vm` signals. The component class stays thin: no business logic, no `.subscribe`, state lives in the VM.
- Presentational pieces (hero card, stat tile, power meter) live under `src/app/ui/`, take `input()`/`output()`, inject no data service.
- Forms are schema-driven with zod (the existing house pattern): a zod schema is the single source of truth, the model is `z.infer<typeof schema>`, validation flows through `validateStandardSchema`, no per-field validators, no reactive or template-driven forms.

Responsive rules (the build MUST satisfy the Part 5 gate at 375 / 768 / 1280):

- No horizontal page scroll at any breakpoint. Reach for the layout grammar: `grid` for regions with responsive column counts (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`), `flex` with `flex-wrap` for button rows, never fixed pixel widths that cannot shrink.
- Any wide block (the table) either scrolls inside its own `overflow-x:auto` container or restructures (cards) below a breakpoint. The page body never scrolls sideways.
- The off-canvas drawer must be `display:none` or `aria-hidden` when closed, not parked off-screen, so the gate does not read it as an escaping element.
- Watch the small ones: the mock leaked 4px at desktop widths. A stray `100vw`, a negative margin, or a `min-w` that will not shrink is usually the cause. The gate catches these; do not ship them.

Layout grammar (enforced by the Part 2 gate): grid for two-dimensional regions, flex for single-axis runs, no nested flex faking a grid, tokens instead of literal colours or pixel values in any hand-written CSS.

## The off-canvas gate refinement (constitution to-do)

Running the responsive auditor on this rich layout surfaced that off-canvas navigation (the standard mobile drawer) reads as `element-escape` because a translated-off-screen element has a negative x. The simple Part 5 slices had no sidebar, so this never appeared. Before the capstone run, the Part 5 spec and auditor/gate need an exemption: an element that is `display:none`, `visibility:hidden`, or `aria-hidden="true"` (a deliberately-hidden drawer) is not an escape. Decide the rule, write it into `harness/responsive-spec.md`, and update the auditor and the gate together (they stay two independent encodings of one spec). This is part of the capstone's constitution work, not a bug to hide.

## Content (example data, hero-agency specific)

Reuse the roster from the mock (Silverwing, Dr. Ion, Vantablack, Aurora Vale, Magnetar, The Tinkerer, Halcyon, Rift, Ember Cho, Null, Grond, Ms. Meridian) with their power classes (Aerial, Energy, Psionic, Tech, Mutant, Cosmic, Enhanced), power index (0-100), status (Active/Injured/Reserve/MIA), clearance tier, mission counts, and success rates. Mark it plainly as example data. The specifics (threat tiers, power classes, clearance) are the detail that makes this a real console rather than a generic CRUD table.
