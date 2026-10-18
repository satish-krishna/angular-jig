---
name: house-style
description: The house frontend conventions for this repo, layered on top of the SpartanNG docs. Read before writing or editing any component. Covers BEM markup with Tailwind applied in the component stylesheet, the three-file component, the layout grammar (grid for regions, flex for inline runs, no nested flex faking a grid) and the no-raw-literals rule for hand-written CSS. Where these rules and the spartan docs' examples disagree about where utility classes go, these rules win.
---

# House frontend conventions

These are this repo's conventions, layered on top of the SpartanNG docs (the `spartan` skill). They extend the spartan docs where spartan is silent; they never contradict them. Where spartan already has a rule (semantic colors, `class` is for layout only, `gap-*` not `space-*`, `size-*` for equal dimensions), follow the spartan skill; this file adds only what spartan does not cover. One deliberate exception: spartan's examples put Tailwind utilities in the template's `class` attribute. In this repo they never go there; see "Markup is BEM, styling lives in the stylesheet" below. Every other spartan rule stands, including "class is for layout only" on a primitive, which now means the utilities a primitive's BEM class applies must be layout only.

## Markup is BEM, styling lives in the stylesheet

A template says what things are; the stylesheet says how they look. Utility classes in markup turn every template into a wall of `flex items-center gap-3 sm:w-48` that a reader has to decode to find the structure, and they let styling decisions spread across every file that renders the element. So:

1. **Template classes are BEM names only.** Every token in a `class` attribute, every `[class.x]` binding, and every string inside a `[class]` binding is `block`, `block__element`, `block--modifier` or `block__element--modifier`, lowercase kebab-case. No Tailwind utility appears in a template. That includes `sr-only`: write `class="roster__label"` and `@apply sr-only` it.
2. **One block per component, named after the component file.** `hero-card.ts` owns `.hero-card`, `.hero-card__name`, `.hero-card--retired`, and nothing else. A template must not use another component's block, and a stylesheet must not define one. `:host` is allowed.
3. **Every component is three files.** `hero-card.ts` with `templateUrl: './hero-card.html'` and `styleUrl: './hero-card.css'`. Never `template:` or `styles:`, however small the component. `ng g component` already produces this shape.
4. **Stylesheets are plain `.css` with every BEM class written out in full.** Not `.scss`: Tailwind v4 does not support running behind Sass. The first line is always `@reference "../../styles.css";` (adjust the `../` count to the file's depth under `src/app`), which lets `@apply` resolve the theme's tokens and variants. Write `.roster__row { ... }`, never `.roster { &__row { ... } }`: that is Sass syntax, and native CSS compiles it to a selector that matches nothing, with only a warning. Nesting is fine for states and breakpoints on the same element: `&:hover`, `&::before`, `&[aria-expanded="true"]`, `@media`.
5. **App stylesheets are layout only.** Every utility in `@apply` and every plain declaration in a stylesheet under `src/app`, and every class rule in `src/styles.css`, must be layout: display, flex and grid arrangement, gap, sizing, margin, position, overflow and text alignment (the full list is under "The layout list" below). Color, typography, border, radius, shadow, ring, opacity, transitions, cursor, custom properties and anything not on the list are appearance, and appearance lives in `libs/ui`. Padding is allowed in one place: the component's block root (`.roster`, `.roster--compact`, or `:host`), for the region's inset, and only when that element is not a primitive. Semantic tokens only, `gap-*` not `space-*`, grid for regions. Moving appearance onto a wrapper element, or removing a primitive's directive to keep its look, does not make it allowed.
6. **No utility classes in TypeScript.** No `cva` variant strings, no `host: { class: '...' }`, no computed class strings. A state that changes appearance is a BEM modifier bound with `[class.block--modifier]`. Never build a class name from data (`roster__row--{{ hero.status }}`): write one modifier per state and bind each with `[class.roster__row--active]`, so every class a template can carry is written out in full.

Helm directives and their inputs are not classes and stay in the template: `variant`, `size` and the directive itself are the primitive's API.

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

Note what the stylesheet does not say. No rule picks a color, a font size, a weight or a radius: the title is `hlmH3`, the caption `hlmMuted`, the icon's color its `tone`, the retired state a badge variant. `p-6` sits on `.roster`, the block root, as the region's inset. `roster__search` and `roster__recruit` sit on primitives and apply only width and margin.

When no existing variant gives the look you need (an input padded to make room for an icon, a quieter table cell, a rounded panel), add a variant to the primitive itself: edit the owned copy of its component in `libs/ui`, add the variant to its `cva` using semantic tokens only, and select it from the template with the input (`<input hlmInput variant="search" class="roster__search">`). `libs/ui` is the one place `cva` and utility strings in TypeScript belong; rule 6 applies to `src/app`. One variant serves every screen that needs the look, which is the point: a primitive's appearance is decided in one place, not re-decided at every call site.

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

## The sealed control vocabulary

Helm primitives are copied into `libs/ui`, so the set of primitives this repo owns is exactly what that directory ships. Where a primitive covers a native element, use the primitive. Reaching for the bare native element is the drift this rule exists to stop, and it is the one convention worth reading before writing any template.

Most primitives are directives you put on the native element, so the markup stays native and accessible and only picks up the Helm styling and behavior. A few have no directive twin and replace the native element outright.

Native elements that must carry their primitive directive (any one of the listed attributes satisfies the rule):

| native element | primitive attribute |
| --- | --- |
| `<button>` | `hlmBtn`, or a Helm button directive that already implies it (`hlmDialogTrigger`, `hlmDialogTriggerFor`, `hlmDialogClose`, `hlmSheetTrigger`, `hlmSheetClose`, `hlmSidebarTrigger`, `hlmSidebarRail`, `hlmSidebarMenuButton`, `hlmSidebarMenuSubButton`, `hlmSidebarMenuAction`, `hlmSidebarGroupAction`, `hlmSidebarGroupLabel`) |
| `<input>` | `hlmInput`, or `hlmSidebarInput` |
| `<textarea>` | `hlmTextarea` |
| `<label>` | `hlmLabel`, or `hlmFieldLabel` |
| `<fieldset>` | `hlmFieldSet` |
| `<legend>` | `hlmFieldLegend` |
| `<table>` | `hlmTable` |
| `<thead>` | `hlmTableHeader`, or `hlmTHead` |
| `<tbody>` | `hlmTableBody`, or `hlmTBody` |
| `<tfoot>` | `hlmTableFooter`, or `hlmTFoot` |
| `<tr>` | `hlmTableRow`, or `hlmTr` |
| `<th>` | `hlmTableHead`, or `hlmTh` |
| `<td>` | `hlmTableCell`, or `hlmTd` |
| `<caption>` | `hlmTableCaption`, or `hlmCaption` |

Native elements with no directive twin, which must be replaced by the primitive component instead:

| native element | replace with |
| --- | --- |
| `<select>` | `<hlm-select>` and its parts (`hlm-select-trigger`, `hlm-select-content`, `hlm-select-item`) |
| `<dialog>` | `<hlm-dialog>` and its parts (`hlm-dialog-content`, `hlmDialogTitle`, `hlm-dialog-footer`) |

A native `<select>` is banned outright rather than given a directive, because the sanctioned select in this repo is the composed `hlm-select`. The `native-select` primitive is not installed, so there is no supported way to style a bare `<select>` here.

An `<a>` is not in the table: a plain anchor is a real navigation element, and `hlmBtn` on an anchor is opt-in.

Good:

```html
<table hlmTable>
  <thead hlmTHead>
    <tr hlmTr><th hlmTh>Hero</th><th hlmTh>Power</th></tr>
  </thead>
  <tbody hlmTBody>
    <tr hlmTr><td hlmTd>Silverwing</td><td hlmTd>88</td></tr>
  </tbody>
</table>

<hlm-field>
  <label hlmFieldLabel for="alias">Alias</label>
  <input hlmInput id="alias" />
</hlm-field>
```

Bad:

```html
<!-- native elements where a primitive exists -->
<table>
  <tr><td>Silverwing</td></tr>
</table>
<label for="alias">Alias</label>
<select><option>Aerial</option></select>
```

## Icons are `<ng-icon>`, never inline SVG

Icons come from `@ng-icons` with the Lucide set, exactly as the spartan icons doc describes: import the icon symbol, register it on the component with `provideIcons`, and render it as `<ng-icon>`.

A raw inline `<svg>` in a template is the drift this rule stops. Pasted SVG markup bypasses the icon registry, cannot be swapped or themed, duplicates a glyph the set already ships, and is the single largest source of unreviewable markup in a hand-built screen. Put `hlmIcon` on every `<ng-icon>` (`<ng-icon hlmIcon name="lucideShield" />`), import `HlmIconImports` from `@spartan-ng/helm/icon` next to `NgIcon`, and color it with `tone`, never with a class.

Good:

```ts
// retire-button.ts
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';

@Component({
  selector: 'app-retire-button',
  imports: [NgIcon, HlmIconImports],
  providers: [provideIcons({ lucideTrash2 })],
  templateUrl: './retire-button.html',
  styleUrl: './retire-button.css',
})
export class RetireButton {}
```

```html
<!-- retire-button.html -->
<button hlmBtn size="icon" variant="ghost"><ng-icon hlmIcon name="lucideTrash2" /></button>
```

Bad:

```html
<button hlmBtn size="icon"><svg viewBox="0 0 24 24"><path d="M3 6h18" /></svg></button>
```

Registering the icon is not optional, but it is also not something a template check can see: `@ng-icons` logs a warning for an unregistered name rather than failing the build, so an unregistered icon renders as nothing at all. Register every name you use.

## The primitive must actually exist

Every Helm primitive is either an attribute directive or an element, never both, and which one it is is decided by its `selector:` in `libs/ui`. Writing an attribute that looks like a primitive but matches no selector produces markup that compiles, renders, and does nothing at all.

This is the failure mode that is hardest to see by reading, because the wrong version looks more right than the right one:

```html
<!-- Bad: hlm-select-trigger is an ELEMENT selector. As an attribute it binds
     nothing, so the select never opens. -->
<button hlmBtn hlmSelectTrigger>Class</button>

<!-- Bad: hlm-avatar is an ELEMENT selector too. This is a styled div. -->
<div hlmAvatar><span hlmAvatarFallback>SW</span></div>

<!-- Good -->
<hlm-select-trigger><hlm-select-value /></hlm-select-trigger>
<hlm-avatar><span hlmAvatarFallback>SW</span></hlm-avatar>
```

If you are unsure whether a primitive is an attribute or an element, read its `selector:` line in `libs/ui`. Do not infer it from the shape of a neighbouring primitive; the library mixes both freely, and `hlm-select-trigger` sits beside `hlmSelectValue` which really is an attribute.

## Compose the primitive fully, not just its outer shell

A primitive that is present but missing its required parts is a different defect from a primitive that is absent, and the docs call several of these out by name.

- **An overlay needs a title.** spartan's `composition.md`: "Dialog, Sheet, and Alert Dialog must have a title for accessibility. If the design hides it, keep it present." The way to hide it visually is a BEM class that applies `sr-only` in the stylesheet, never the utility in the template. A bare `<h2>` inside `hlm-dialog-content` is not a title; `hlmDialogTitle` is what wires the accessible name.
- **A form control belongs in a field.** spartan's `forms.md`: "Use `hlmField`, not raw `div`s. Wrap each control in `hlmField`." A hand-built `<div>` stacking a label and an input is the hand-rolled version of a primitive that already exists.

## Icons: register them, and use the standalone import

Two rules, both of which fail silently rather than loudly, which is why they are stated separately from the no-inline-SVG rule.

- **Import `NgIcon`, never `NgIconsModule`.** `NgIconsModule` is the legacy module API. Placing it in a standalone component's `imports` throws at bootstrap ("No icons have been provided...") and takes the whole application down with a blank page, while compiling perfectly.
- **Register with `provideIcons`, and only `provideIcons`.** Importing a `lucide*` symbol and then handing it to anything else, a custom injection token or a plain object, registers nothing. `@ng-icons` logs a warning and renders empty, so the screen simply has no icons and the build is green.

```ts
// Good
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUsers } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
@Component({ imports: [NgIcon, HlmIconImports], providers: [provideIcons({ lucideUsers })], templateUrl: './team.html', styleUrl: './team.css' })

// Bad: the legacy module (throws at bootstrap), and a hand-rolled registration
// (silently registers nothing)
@Component({
  imports: [NgIconsModule],
  providers: [{ provide: 'ICONS', useValue: { lucideUsers } }],
  templateUrl: './team.html',
  styleUrl: './team.css',
})
```

## Submitting a form

The house forms pattern has exactly one submit path: `submit(this.form, async () => { ... })` from `@angular/forms/signals`.

`(ngSubmit)` is not part of it. That output is supplied by `NgForm` and `FormGroupDirective`, which come from `FormsModule` and `ReactiveFormsModule`, and this repo uses neither. On a `<form>` with no forms module imported, `(ngSubmit)` is not an error and not a warning: Angular treats it as a DOM listener for an event named `ngSubmit`, which nothing ever fires. The button is dead and the page looks fine.

```html
<!-- Bad: nothing will ever call onSubmit() -->
<form (ngSubmit)="onSubmit()">

<!-- Good: the submit path is wired in the class, through the form -->
<button hlmBtn type="submit">Save</button>
```

```ts
protected readonly save = () => submit(this.form, async (f) => { /* ... */ });
```

## Do not set `standalone`

`CLAUDE.md` already says it: "Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+." It is repeated here because it is the single most frequently written violation in this repo's measured runs, and because a redundant `standalone: true` reads as diligence rather than as drift.

## Layout is a grammar

Layout is expressed with a small, fixed vocabulary, so that a screen's structure is decidable rather than a matter of taste. The grammar is about what a class applies: the utilities named below go in `@apply` inside a BEM class in the component's stylesheet, never in the template.

- **Grid for regions.** A two-dimensional arrangement (a dashboard of cards, a page split into named areas, anything laid out in both rows and columns) uses CSS grid: `grid`, `grid-cols-*`, `grid-rows-*`, `gap-*`. Reach for grid whenever you are placing blocks in two dimensions.
- **Flex for inline runs.** `flex` is for a single-axis run of items: a row of buttons, an icon next to a label, a toolbar. One direction, one line of thought.
- **Do not nest flex to fake a grid.** A row of flex columns, each itself a flex stack, arranged to line up into a grid, is the anti-pattern. If the result reads as a grid, use grid. Nesting flex containers to approximate two-dimensional layout is not allowed.

Good:

```html
<!-- dashboard.html -->
<!-- a two-dimensional card dashboard: grid -->
<div class="dashboard__tiles">
  <section hlmCard>...</section>
  <section hlmCard>...</section>
</div>

<!-- a single inline run: flex -->
<div class="dashboard__actions">
  <button hlmBtn variant="ghost">Cancel</button>
  <button hlmBtn>Save</button>
</div>
```

```css
/* dashboard.css */
@reference "../../styles.css";

.dashboard__tiles { @apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4; }
.dashboard__actions { @apply flex items-center gap-2; }
```

Bad:

```css
/* nested flex faking a grid: use grid instead */
.dashboard__tiles { @apply flex flex-wrap; }
.dashboard__tile { @apply flex flex-col; }
```

## No raw literals in hand-written CSS

Prefer Tailwind utilities and the spartan primitives over hand-written declarations. Every component has a stylesheet, and `@apply` is the default. Rule 5 still applies to anything you write by hand: in an app stylesheet a declaration is layout only, so the properties you may write are the layout properties listed under "The layout list". Those declarations use a design token for every length, never a raw literal, and the same goes for any color you write in `libs/ui`:

- In `libs/ui`, colors come from the semantic token variables (`var(--primary)`, `var(--border)`, `var(--card)`), never a raw hex, `rgb()`, or `hsl()`.
- Lengths come from a token or the spacing scale, never a raw `px` value.

Good:

```css
/* hero-panel.css */
@reference "../../styles.css";

.hero-panel {
  display: grid;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 4);
  max-width: calc(var(--spacing) * 160);
}
```

Bad:

```css
.hero-panel {
  gap: 16px;
  padding: 16px;
}
```

This rule is about hand-written CSS, where spartan is silent because it assumes you use Tailwind utilities. It does NOT restrict Tailwind arbitrary values inside `@apply` (for example a one-off `sm:max-w-[425px]` on a dialog's BEM class), which the spartan docs use and bless. Colors never appear in an app stylesheet, by `@apply` or by hand (rule 5); in `libs/ui`, follow the spartan color rule (semantic tokens, never a raw palette value like `bg-blue-500`). This section governs the declarations you write by hand.

## Component shape: containers and presentational components

Angular's `CLAUDE.md` says to keep components small and single-responsibility; it does not say how to split them. This repo does, so the split is decidable rather than a matter of taste.

- **Container (smart) components** are the routed feature components. They own the screen's state and pass it down to the presentational components they compose. They live in their feature folder (`src/app/heroes`, `src/app/dashboard`). They own that state through a ViewModel rather than holding it in the component class: the MVVM section below refines this rule and is the one that binds.
- **Presentational (dumb) components** live under `src/app/ui/`. They receive state through `input()`, emit through `output()`, and use `model()` for two-way binding. They inject no application data service: a presentational component that reaches for `HttpClient` or a feature `*Service` is doing a container's job and belongs in a feature folder instead. Injecting a pure framework or UI helper (`ElementRef`, `DestroyRef`, a spartan service) is fine; injecting data is not.

Good:

```ts
// src/app/ui/hero-card.ts: presentational, no data service
@Component({ selector: 'app-hero-card', /* ... */ })
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly selected = output<Hero>();
}
```

Bad:

```ts
// src/app/ui/hero-card.ts: a presentational component injecting a data service
@Component({ selector: 'app-hero-card', /* ... */ })
export class HeroCard {
  private readonly heroes = inject(HeroService); // belongs in a container
  readonly hero = input.required<Hero>();
}
```

Two shape rules follow from the Angular baseline and are stated here so they are one place to read:

- **Do not hand-set change detection.** `OnPush` is the Angular v22 default, and `CLAUDE.md` says not to set `changeDetection` explicitly. So writing `changeDetection: ChangeDetectionStrategy.OnPush` (or `.Default`) in a `@Component` is drift, not diligence. Leave it off.
- **No `.subscribe` in a component or its ViewModel.** `CLAUDE.md` says to handle observables with the async pipe. A component that calls `.subscribe(...)` on an observable is managing a subscription by hand where the template could do it. Convert at the edge and bind with the async pipe (or `toSignal`). This covers the ViewModel too: it is defined as a class that is unit-testable with zero DOM, which is exactly the argument against hand-managed subscriptions, so moving a `.subscribe` from the component into its ViewModel does not fix it.

## MVVM: the ViewModel owns the state

The container/presentational split above says which component holds the state. This section says where inside the container that state actually lives, and the answer is: not in the component. Every routed feature screen has a ViewModel, and the component is a thin shell over it.

This is a deliberate refinement of the rule above, not a contradiction of it. Read the two together as: a container owns the state, and it owns it *through its ViewModel*. Presentational components are unchanged.

- **The ViewModel is a service.** An `@Injectable` class named `<Feature>ViewModel`, holding all of the screen's logic and state as signals. It injects the data services. It has no `providedIn`, so it is not a singleton.
- **The ViewModel is component-scoped.** The component lists it in its own `providers: [HeroDetailViewModel]`. Component-scoped, so each instance of the screen gets its own state and it dies with the screen. A `providedIn: 'root'` ViewModel is a store wearing a ViewModel's name, and it is a defect here.
- **The component is a shell.** It injects the ViewModel and binds the template to its signals. It declares no `signal()`, `computed()`, `linkedSignal()`, or `form()` of its own, and it injects no data service: everything a container used to do directly, it now does through the ViewModel. A signal-form is state, and the largest piece of state on most screens, so it is built in the ViewModel like any other.
- **The ViewModel is unit-testable with zero DOM.** That is the point of the whole shape. If testing a screen's logic needs `TestBed` and a fixture, the logic is in the wrong class.

`input()`, `output()`, `model()`, `viewChild()`, and `contentChild()` are component API, not state, and stay on the component. Injecting `ActivatedRoute` or `Router` in the component is fine; injecting `HeroService` is not.

This applies to every component outside `src/app/ui/`, not only the routed screens. A shell, a layout, or a small non-presentational helper is judged the same way: if it is not a presentational component under `ui/`, its state belongs in a ViewModel. That is wider than "every routed feature screen has a ViewModel" on purpose. The narrower reading is not decidable, since nothing in a component file says whether it is routed, and a rule that cannot be decided cannot be enforced without guessing. It is also the right answer on the merits: the app shell holding the theme state in its own class is the same testability problem as a screen holding its filter state, and it has the same fix. If a component outside `ui/` has state worth holding, give it a ViewModel; if it has no state at all, nothing here applies to it.

Good:

```ts
// hero-detail.view-model.ts: all the state and logic, no DOM, no providedIn
@Injectable()
export class HeroDetailViewModel {
  private readonly heroes = inject(HeroService);
  readonly heroId = signal<number | null>(null);
  readonly hero = computed(() => this.heroes.byId(this.heroId()));
  readonly canDeploy = computed(() => this.hero()?.status === 'Active');
  rename(name: string) { /* ... */ }
}
```

```ts
// hero-detail.ts: a shell that provides, injects, and binds
// (hero-detail.html holds <h1 class="hero-detail__title">{{ vm.hero()?.name }}</h1>)
@Component({
  selector: 'app-hero-detail',
  providers: [HeroDetailViewModel],
  imports: [HlmCardImports],
  templateUrl: './hero-detail.html',
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
}
```

Bad:

```ts
// state in the component class, and the data service injected past the ViewModel
@Component({ selector: 'app-hero-detail', templateUrl: './hero-detail.html', styleUrl: './hero-detail.css' })
export class HeroDetail {
  private readonly heroes = inject(HeroService);   // belongs in the ViewModel
  readonly hero = signal<Hero | null>(null);       // belongs in the ViewModel
}
```

```ts
// a ViewModel that is really a singleton store
@Injectable({ providedIn: 'root' })                 // must be component-scoped
export class HeroDetailViewModel {}
```

```ts
// a ViewModel injected but never provided: this is a runtime NullInjectorError,
// and nothing in the build catches it for you
@Component({ selector: 'app-roster', templateUrl: './roster.html', styleUrl: './roster.css' })  // no providers: [RosterViewModel]
export class Roster {
  protected readonly vm = inject(RosterViewModel);
}
```

## Forms: schema-driven with zod

Forms in this repo are schema-driven. A zod schema is the single source of truth for a form's shape, its validation, and its field labels; the form component reads from the schema and never restates what the schema already says.

- **The model type is `z.infer<typeof schema>`.** Never hand-write a form-model interface; infer it from the schema so the shape lives in one place.
- **Validation flows through the schema.** Build the form with Angular signal-forms and validate the whole form through zod: `form(model, (path) => validateStandardSchema(path, schema))`. zod 4 is a Standard Schema, so Angular validates it natively. Do NOT restate a rule as a per-field signal-forms validator (`required`, `minLength`, `maxLength`, `min`, `max`, `email`, `pattern`): the schema already owns those. `validateStandardSchema` is the one blessed validator; `validateHttp` and `validateAsync` stay available for server-side checks a schema cannot express.
- **Labels ride on the schema** via each field's `.meta()`, read with `formMeta(schema)` from `src/app/forms/zod-meta.ts`. Do not hard-code a label the schema already carries.
- **Controls are spartan helm.** Wrap each control in `hlm-field`, bind with `[formField]="form.name"`, and show errors from `form.name().errors()`. Submit valid data with `submit(this.form, async () => { ... })`.
- **No template-driven forms, and no reactive forms.** Do not use `ngModel`, `FormsModule`, or the template-driven directives. Reactive forms (`FormGroup`, `FormControl`, `FormBuilder`, `ReactiveFormsModule`) are not used here either. Angular's own guidance offers reactive forms as the fallback when signal-forms do not fit; this repo overrides that fallback. A form's schema is always known here, so every form is authored with signal-forms and a zod schema, and reaching for reactive forms is a defect, not a permitted fallback.

The schema lives beside the form as `<feature>.schema.ts`, exporting the schema and `export type XModel = z.infer<typeof schema>`.

Good:

```ts
// hero.schema.ts
export const heroSchema = z.object({
  name: z.string().min(1).meta({ label: 'Name', control: 'text' } satisfies FormFieldMeta),
});
export type HeroModel = z.infer<typeof heroSchema>;
```

```ts
// hero-form.ts (no explicit changeDetection: OnPush is the v22 default)
protected readonly model = signal<HeroModel>({ name: '' });
protected readonly form = form(this.model, (path) => validateStandardSchema(path, heroSchema));
protected readonly meta = formMeta(heroSchema);
```

Bad:

```ts
// a hand-written model, and a rule the schema already states
interface HeroModel { name: string; }             // should be z.infer<typeof heroSchema>
readonly form = form(this.model, (path) => {
  required(path.name);                             // the schema already requires it
});
```

```html
<!-- template-driven: not used in this repo -->
<input [(ngModel)]="hero.name" name="name" />
```

## Responsive correctness

A screen must render without responsive failure at three viewport widths, height fixed at 900px: 375px (a small phone), 768px (a tablet), and 1280px (a laptop). Responsive failure is defined in rendered pixels, so it is decidable rather than a matter of taste. A screen fails when, at any of the three widths, any of these is true (all comparisons carry a 1px tolerance for sub-pixel rounding):

- **The page scrolls horizontally.** The document is wider than the viewport. Content must reflow to the width, never force a sideways scrollbar on the whole page.
- **An element escapes the viewport.** An element's right edge is past the viewport width, or its left edge is below zero, and nothing intentionally scrollable contains it. An element sitting inside a container you deliberately made scrollable (`overflow: auto` or `overflow: scroll`) is exempt; a wide element under an `overflow: hidden` ancestor is not, because its content is cut off with no way to reach it. An element that is not being shown to the user at all is also exempt: if it, or any ancestor, is `display: none`, `visibility: hidden`, or `aria-hidden="true"`, there is nothing on screen to escape. That exemption is what makes a closed off-canvas navigation drawer legal, and it is exactly why a closed drawer must really be hidden rather than merely parked off-screen with a transform. A drawer translated out of view is still rendered, still focusable, and still counts as an escape.
- **An element clips its own content.** An element with `overflow: hidden` or `overflow: clip` holds content larger than its box, so text or controls are truncated. Again, `overflow: auto`/`scroll` is exempt: a scroll container is a design choice, not a defect. The not-being-shown exemption applies here too, for the same reason: content clipped inside something the user cannot see is not a visible defect. An element whose rendered box is at most 1x1 CSS pixel in both dimensions is likewise exempt: that is the screen-reader-only pattern, which works precisely by collapsing a box and clipping its text, and a responsive rule must never push back against labeling an icon-only control for assistive technology.

Build the screen so a narrow width stacks rather than overflows: prefer the layout grammar's responsive grid (`@apply grid-cols-1 sm:grid-cols-2` on the region's BEM class), let button rows wrap (`@apply flex-wrap`), and avoid fixed pixel widths on inputs and cards that cannot shrink. The detail card, the form field, and the Save/Cancel button row must all fit and remain reachable at 375px.

## Why these are written down

The whole point of this repo is that a written convention is not a guardrail: the model reads good docs and drifts anyway. These conventions exist so the drift has something concrete to be measured and gated against. They are here to be mechanized, not merely remembered.
