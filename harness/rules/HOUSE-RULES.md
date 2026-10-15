# House rules

Generated from `harness/rules/*.md` by `harness/driver/build-house-digest.mjs`. Do not edit; edit the rule document and regenerate.

Each section is the enforced rule's own guidance. The gate quotes the same text when it rejects a write, so this is what you will be told afterwards if you get it wrong now.

### no-appearance-on-primitive

Do not fight a primitive's look with a class at the call site. Use its `variant`/`size` input, or edit the owned copy of the component in `libs/ui`.

    Good: <button hlmBtn class="w-full">Save</button>
    Bad:  <button hlmBtn class="bg-blue-600 rounded-none">Save</button>

### no-component-subscribe

Convert an observable at the edge, with `toSignal` or the async pipe, never by calling `.subscribe` inside a component or ViewModel.

    Good: protected readonly heroes = toSignal(this.heroService.list(), { initialValue: [] });
    Bad:  ngOnInit() { this.heroService.list().subscribe(h => this.heroes = h); }

### no-explicit-standalone

Do not set `standalone` in `@Component` at all. Standalone is the Angular v20+ default.

    Good: @Component({ selector: 'app-hero-detail', template: `...` })
    Bad:  @Component({ selector: 'app-hero-detail', standalone: true, template: `...` })

### no-feature-inject-data

Use the house MVVM pattern: a container owns its state through a component-scoped
ViewModel it provides and injects; it holds no signal()/computed() and injects no
data service itself. Copy this exact shape:

  // hero-detail.view-model.ts
  import { Injectable, inject, signal, computed } from '@angular/core';
  import { HeroService } from './hero.service';

  @Injectable() // no providedIn: this ViewModel is scoped to the component that provides it
  export class HeroDetailViewModel {
    private readonly heroes = inject(HeroService);
    readonly query = signal('');
    readonly filtered = computed(() => this.heroes.list().filter((h) => h.name.includes(this.query())));
  }

  // hero-detail.ts
  @Component({
    selector: 'app-hero-detail',
    providers: [HeroDetailViewModel], // provided at component scope, where it is injected
    template: `<p>{{ vm.filtered().length }}</p>`,
  })
  export class HeroDetail {
    protected readonly vm = inject(HeroDetailViewModel); // inject the ViewModel, not the service
    protected readonly route = inject(ActivatedRoute); // routing is still fine directly in the component
    // no signal()/computed() and no inject(HeroService) here: the ViewModel owns both
  }

Read the house-style skill's MVVM section for the full example.

### no-forms-module

Use the house forms pattern: Angular signal-forms driven by a zod schema.
Do NOT hand-roll a form with a plain signal, a manual (change) handler, and a
safeParse on submit; that passes the rules but is not the pattern. Copy this exact shape:

  // hero.schema.ts
  import { z } from 'zod';
  export const heroSchema = z.object({ name: z.string().min(1) });
  export type HeroModel = z.infer<typeof heroSchema>;

  // hero-detail.ts
  import { form, submit, validateStandardSchema } from '@angular/forms/signals';
  protected readonly model = signal<HeroModel>({ name: loadedHero.name });
  protected readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroSchema));

  <!-- template -->
  <input hlmInput [formField]="heroForm.name" />
  @for (e of heroForm.name().errors(); track e.kind) { <hlm-field-error>{{ e.message }}</hlm-field-error> }

Read the house-style skill's Forms section for the full example.

### no-hand-set-change-detection

Do not set `changeDetection` in `@Component` at all. `OnPush` is the Angular v22 default; a component that needs it gets it for free.

    Good: @Component({ selector: 'app-hero-detail', template: `...` })
    Bad:  @Component({ selector: 'app-hero-detail', changeDetection: ChangeDetectionStrategy.OnPush, template: `...` })

### no-legacy-control-flow

Replace the structural directive with its native block equivalent.

    Good: @if (x) { ... }   @for (h of heroes(); track h.id) { ... }
    Bad:  <div *ngIf="x">   <li *ngFor="let h of heroes">

### no-legacy-icon-module

Icons: import the standalone NgIcon, never NgIconsModule, and register every
icon the component renders with provideIcons. Copy this exact shape:

  import { NgIcon, provideIcons } from '@ng-icons/core';
  import { lucideUsers } from '@ng-icons/lucide';

  @Component({
    imports: [NgIcon],
    providers: [provideIcons({ lucideUsers })],
    template: `<ng-icon name="lucideUsers" />`,
  })

Do NOT import NgIconsModule (throws at bootstrap), and do NOT register an icon
through a custom token or a plain object (registers nothing): only provideIcons
registers an icon.

Read the house-style skill's icons section for the full example.

### no-missing-composition-part

Every `hlm-dialog-content` or `hlm-sheet-content` needs a title element inside it. If the design hides the title, keep it present with `class="sr-only"` rather than removing it.

    Good: <hlm-dialog-content><h2 hlmDialogTitle>Retire hero?</h2>...</hlm-dialog-content>
    Bad:  <hlm-dialog-content><h2 class="font-semibold">Retire hero?</h2>...</hlm-dialog-content>

### no-nested-flex-grid

Use `grid grid-cols-* gap-*` for a genuinely two-dimensional region. Keep `flex` for single-axis runs — a flex column of flex rows, or a flex row of flex rows, is fine.

    Good: <div class="flex flex-col"><div class="flex justify-between">Header</div><div class="flex flex-col">Content</div></div>
    Bad:  <div class="flex justify-between"><div class="flex flex-col">Power</div><div class="flex flex-col">Missions</div></div>

### no-ng-class-style

Replace `ngClass`/`ngStyle` with a `class`/`style` binding.

    Good: <div [class.active]="isActive()">
    Bad:  <div [ngClass]="{ active: isActive() }">

### no-ng-model

Use the house forms pattern: Angular signal-forms driven by a zod schema.
Do NOT hand-roll a form with a plain signal, a manual (change) handler, and a
safeParse on submit; that passes the rules but is not the pattern. Copy this exact shape:

  // hero.schema.ts
  import { z } from 'zod';
  export const heroSchema = z.object({ name: z.string().min(1) });
  export type HeroModel = z.infer<typeof heroSchema>;

  // hero-detail.ts
  import { form, submit, validateStandardSchema } from '@angular/forms/signals';
  protected readonly model = signal<HeroModel>({ name: loadedHero.name });
  protected readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroSchema));

  <!-- template -->
  <input hlmInput [formField]="heroForm.name" />
  @for (e of heroForm.name().errors(); track e.kind) { <hlm-field-error>{{ e.message }}</hlm-field-error> }

Read the house-style skill's Forms section for the full example.

### no-orphan-ng-submit

There is exactly one submit path in this repo: submit(this.form, ...) from
@angular/forms/signals. (ngSubmit) is not part of it; NgForm and
FormGroupDirective, the only directives that fire it, ship with FormsModule and
ReactiveFormsModule, and this repo uses neither, so the binding is dead.
Copy this exact shape:

  <!-- template: no (ngSubmit) on the <form> -->
  <form>
    <hlm-field> ... </hlm-field>
    <button hlmBtn type="submit">Save</button>
  </form>

  // class: wire the submit through the form itself
  import { submit } from '@angular/forms/signals';
  protected readonly save = () => submit(this.form, async (f) => { /* ... */ });

Read the house-style skill's "Submitting a form" section for the full example.

### no-presentational-inject

A `ui/` component takes `input()`/`output()` and injects nothing beyond framework or spartan helpers. Push data access up to a container in a feature folder.

    Good: readonly hero = input.required<Hero>();  // src/app/ui/hero-card.ts, no inject()
    Bad:  private readonly heroes = inject(HeroService);  // in a src/app/ui/ component

### no-raw-control

Compose from spartan primitives. Change a primitive's look with its `variant`/`size` inputs or its Helm file in `libs/ui`, never a class at the call site.

    Good: <button hlmBtn variant="ghost">Save</button>   <input hlmInput />   <select> -> <hlm-select>
    Bad:  <button>Save</button>   <select>

### no-raw-icon

Never paste SVG markup into a template. Use `<ng-icon>` with a registered Lucide name.

    Good: <ng-icon name="lucideTrash2" />
    Bad:  <svg viewBox="0 0 24 24"><path d="M3 6h18" /></svg>

### no-raw-palette-color

Reach for a semantic token, never a raw palette shade or hex value.

    Good: <div class="bg-card text-card-foreground border-border border">
    Bad:  <div class="bg-blue-600 text-white">

### no-reactive-form

Use the house forms pattern: Angular signal-forms driven by a zod schema.
Do NOT hand-roll a form with a plain signal, a manual (change) handler, and a
safeParse on submit; that passes the rules but is not the pattern. Copy this exact shape:

  // hero.schema.ts
  import { z } from 'zod';
  export const heroSchema = z.object({ name: z.string().min(1) });
  export type HeroModel = z.infer<typeof heroSchema>;

  // hero-detail.ts
  import { form, submit, validateStandardSchema } from '@angular/forms/signals';
  protected readonly model = signal<HeroModel>({ name: loadedHero.name });
  protected readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroSchema));

  <!-- template -->
  <input hlmInput [formField]="heroForm.name" />
  @for (e of heroForm.name().errors(); track e.kind) { <hlm-field-error>{{ e.message }}</hlm-field-error> }

Read the house-style skill's Forms section for the full example.

### no-restated-validator

Use the house forms pattern: Angular signal-forms driven by a zod schema.
Do NOT hand-roll a form with a plain signal, a manual (change) handler, and a
safeParse on submit; that passes the rules but is not the pattern. Copy this exact shape:

  // hero.schema.ts
  import { z } from 'zod';
  export const heroSchema = z.object({ name: z.string().min(1) });
  export type HeroModel = z.infer<typeof heroSchema>;

  // hero-detail.ts
  import { form, submit, validateStandardSchema } from '@angular/forms/signals';
  protected readonly model = signal<HeroModel>({ name: loadedHero.name });
  protected readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroSchema));

  <!-- template -->
  <input hlmInput [formField]="heroForm.name" />
  @for (e of heroForm.name().errors(); track e.kind) { <hlm-field-error>{{ e.message }}</hlm-field-error> }

Read the house-style skill's Forms section for the full example.

### no-root-provided-view-model

Use the house MVVM pattern: a container owns its state through a component-scoped
ViewModel it provides and injects; it holds no signal()/computed() and injects no
data service itself. Copy this exact shape:

  // hero-detail.view-model.ts
  import { Injectable, inject, signal, computed } from '@angular/core';
  import { HeroService } from './hero.service';

  @Injectable() // no providedIn: this ViewModel is scoped to the component that provides it
  export class HeroDetailViewModel {
    private readonly heroes = inject(HeroService);
    readonly query = signal('');
    readonly filtered = computed(() => this.heroes.list().filter((h) => h.name.includes(this.query())));
  }

  // hero-detail.ts
  @Component({
    selector: 'app-hero-detail',
    providers: [HeroDetailViewModel], // provided at component scope, where it is injected
    template: `<p>{{ vm.filtered().length }}</p>`,
  })
  export class HeroDetail {
    protected readonly vm = inject(HeroDetailViewModel); // inject the ViewModel, not the service
    protected readonly route = inject(ActivatedRoute); // routing is still fine directly in the component
    // no signal()/computed() and no inject(HeroService) here: the ViewModel owns both
  }

Read the house-style skill's MVVM section for the full example.

### no-space-utility

Use `gap-*` on the flex or grid container instead of a `space-*` utility on the children.

    Good: <div class="flex flex-col gap-4">
    Bad:  <div class="space-y-4">

### no-state-outside-view-model

Use the house MVVM pattern: a container owns its state through a component-scoped
ViewModel it provides and injects; it holds no signal()/computed() and injects no
data service itself. Copy this exact shape:

  // hero-detail.view-model.ts
  import { Injectable, inject, signal, computed } from '@angular/core';
  import { HeroService } from './hero.service';

  @Injectable() // no providedIn: this ViewModel is scoped to the component that provides it
  export class HeroDetailViewModel {
    private readonly heroes = inject(HeroService);
    readonly query = signal('');
    readonly filtered = computed(() => this.heroes.list().filter((h) => h.name.includes(this.query())));
  }

  // hero-detail.ts
  @Component({
    selector: 'app-hero-detail',
    providers: [HeroDetailViewModel], // provided at component scope, where it is injected
    template: `<p>{{ vm.filtered().length }}</p>`,
  })
  export class HeroDetail {
    protected readonly vm = inject(HeroDetailViewModel); // inject the ViewModel, not the service
    protected readonly route = inject(ActivatedRoute); // routing is still fine directly in the component
    // no signal()/computed() and no inject(HeroService) here: the ViewModel owns both
  }

Read the house-style skill's MVVM section for the full example.

### no-style-attribute

Never write a literal `style="..."` attribute. If the value is genuinely static, it belongs in the stylesheet as a token; if it varies, use a `[style]` or `[style.x]` binding.

    Good: <div [style.width.%]="pct()">
    Bad:  <div style="color: red; padding: 8px">

### no-unknown-primitive

Check the installed vocabulary from source (the house-style skill, and "The vocabulary, as installed" in the sealing spec) before writing an `hlm*` name, and write it in the form its `selector:` actually declares — attribute or element, never guessed.

    Good: <hlm-select-trigger>...</hlm-select-trigger>
    Bad:  <button hlmBtn hlmSelectTrigger>...</button>

### no-unportalled-overlay

The content element of an overlay always carries the portal. If you are writing `hlm-select-content`, `hlm-dialog-content` or `hlm-sheet-content`, it takes `*hlmSelectPortal`, `*hlmDialogPortal` or `*hlmSheetPortal` respectively — with the asterisk.

    Good: <hlm-dialog-content *hlmDialogPortal>
    Bad:  <hlm-dialog-content>

### no-unprovided-view-model

Use the house MVVM pattern: a container owns its state through a component-scoped
ViewModel it provides and injects; it holds no signal()/computed() and injects no
data service itself. Copy this exact shape:

  // hero-detail.view-model.ts
  import { Injectable, inject, signal, computed } from '@angular/core';
  import { HeroService } from './hero.service';

  @Injectable() // no providedIn: this ViewModel is scoped to the component that provides it
  export class HeroDetailViewModel {
    private readonly heroes = inject(HeroService);
    readonly query = signal('');
    readonly filtered = computed(() => this.heroes.list().filter((h) => h.name.includes(this.query())));
  }

  // hero-detail.ts
  @Component({
    selector: 'app-hero-detail',
    providers: [HeroDetailViewModel], // provided at component scope, where it is injected
    template: `<p>{{ vm.filtered().length }}</p>`,
  })
  export class HeroDetail {
    protected readonly vm = inject(HeroDetailViewModel); // inject the ViewModel, not the service
    protected readonly route = inject(ActivatedRoute); // routing is still fine directly in the component
    // no signal()/computed() and no inject(HeroService) here: the ViewModel owns both
  }

Read the house-style skill's MVVM section for the full example.

### no-unregistered-icon

Icons: import the standalone NgIcon, never NgIconsModule, and register every
icon the component renders with provideIcons. Copy this exact shape:

  import { NgIcon, provideIcons } from '@ng-icons/core';
  import { lucideUsers } from '@ng-icons/lucide';

  @Component({
    imports: [NgIcon],
    providers: [provideIcons({ lucideUsers })],
    template: `<ng-icon name="lucideUsers" />`,
  })

Do NOT import NgIconsModule (throws at bootstrap), and do NOT register an icon
through a custom token or a plain object (registers nothing): only provideIcons
registers an icon.

Read the house-style skill's icons section for the full example.
