# Hero Ops Console Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the Hero Ops Console — fix the theme defect, add a Mission and Threat domain with full CRUD, build the three empty screens, and add the missing `hlm-card`, `hlm-tabs` and `hlm-switch` vocabulary — with every line written by a Haiku subagent under the project's armed constitution.

**Architecture:** MVVM throughout. Each routed feature screen has a component-scoped ViewModel holding all state and logic as signals; the component class is thin and binds the template to `vm`. Presentational components live in `src/app/ui/`, take `input()`/`output()`, and inject nothing. Data services are `providedIn: 'root'` singletons holding `signal<T[]>` seeded from example data. Forms are Signal Forms driven by a zod schema as the single source of truth.

**Tech Stack:** Angular 22 (standalone by default, zoneless signals), `@angular/forms/signals` (Signal Forms), zod 4, spartan-ng Helm primitives from `libs/ui/`, `@ng-icons/lucide`, Tailwind 4, Vitest via `@angular/build:unit-test`, Playwright for the boot and responsive gates.

**Spec:** `docs/superpowers/specs/2026-09-07-hero-ops-console-completion-design.md`

## Global Constraints

Every task's requirements implicitly include this section. These are enforced by armed PostToolUse hooks that deny the edit and hand back a corrective message naming the rule; when a hook fires, read the doc it points to under `harness/rules/<rule>.md` and fix the code, never the rule.

- **Angular v22 defaults.** Never write `standalone: true`. Never write `changeDetection: ChangeDetectionStrategy.OnPush`. Both are defaults and both are gated.
- **Signals only.** Use `input()`, `output()`, `model()`, `computed()`, `linkedSignal()`. Never the `@Input`/`@Output`/`@HostBinding`/`@HostListener` decorators. Host bindings go in the `host` object.
- **No `.subscribe()`** inside an `@Component` class or any class whose name ends in `ViewModel`. Convert observables at the edge with `toSignal`.
- **Feature components hold no state.** Outside `src/app/ui/`, an `@Component` class must not have a property initialized with `signal(...)`, `computed(...)`, `linkedSignal(...)` or `form(...)`. State lives in the ViewModel. `src/app/ui/` is exempt from this rule.
- **ViewModel contract.** A ViewModel's class name ends in `ViewModel`. It is decorated `@Injectable()` with **no** `providedIn`. The component that injects it must list it in its own `providers: [XViewModel]`.
- **Data service contract.** A data service's class name ends in `Service` and it is `@Injectable({ providedIn: 'root' })`. A feature component must never inject one directly — its ViewModel does. A `src/app/ui/` component must never inject one at all. Note that `PreferencesService` counts as a data service for this rule, because the rule keys on the `Service` name suffix.
- **Forms are Signal Forms only.** A zod schema is the single source of truth. Use `form()`, `[formRoot]` on the `<form>` element, `[formField]` on each control, `validateStandardSchema` for every rule, and `submission.action` for submit. Never import `FormsModule` or `ReactiveFormsModule`. Never write `ngModel`, `formControlName`, or `(ngSubmit)`. Never restate a validator that the schema already expresses.
- **Native control flow.** Use `@if`, `@for`, `@switch`. Never `*ngIf`, `*ngFor`, `*ngSwitch`, `ngClass` or `ngStyle`. Use `class` and `style` bindings instead.
- **Icons.** Standalone `NgIcon` plus `provideIcons`. Never `NgIconsModule`. Never a raw inline `<svg>`. Every icon name rendered must be registered via `provideIcons` in a component that is an ancestor of, or is, the one rendering it.
- **Sealed primitive vocabulary.** Use the spartan primitive wherever one exists; never a raw `<button>`, `<input>`, `<select>` or `<textarea>` where a primitive covers it. Never an `hlm*` attribute that matches no real selector. Overlays need a title; controls need a field wrapper.
- **Colors are semantic tokens.** Never a raw Tailwind palette shade (`bg-blue-500`, `text-gray-700`), never a hex bracket (`bg-[#0af]`), never the literal `white`/`black` keyword, on any color-bearing prefix. Use `bg-card`, `text-muted-foreground`, `border-border` and friends. Responsive prefixes are stripped before classifying, so `dark:bg-blue-600` trips it too.
- **Spacing is `gap-*`.** Never `space-x-*` or `space-y-*` at any prefix. Put `gap-*` on the flex or grid container.
- **Layout grammar.** Grid for two-dimensional regions, flex for single-axis runs. Never a row of flex columns each itself a flex stack, arranged to line up as a grid.
- **Hand-written stylesheets use tokens.** No raw hex, rgb, or `px` literals in a component `.css` file; use `var(--...)`. Prefer having no component stylesheet at all.
- **Dates are ISO strings, never `Date` objects.** Do not call `new Date()` in a template or a model. Render with `DatePipe`.
- **Consult the docs before composing.** Before writing any `hlm-*` markup you have not written before in this task, call the spartan MCP server (`spartan_components_get`, `spartan_docs_get`) or read the matching `rules/*.md` in the `spartan` skill. Reading `libs/ui/` source gives you selectors and tells you nothing about required composition, and composition is where these primitives break.
- **Enforcement paths are not editable.** `stylelint.config.mjs`, `eslint.config.mjs`, `harness/`, `.claude/hooks/`, `.claude/skills/`, `.claude/settings.json`, `.agents/skills/`, `components.json`, `experiments/`, `package.json`, `tsconfig*.json` and `.mcp.json` are denied by a PreToolUse guard, for shell commands as well as file edits. If a rule blocks you, say so in your final response and explain why. Do not edit the rule.

## The verification bar

Every task runs all of these and does not report done until each passes:

```bash
npm run build
npm run lint
npm test
npm run test:harness
npx stylelint "src/**/*.css"
npm run check:boot -- --route <every route this task touches>
node harness/counter/counter.mjs --root . src && node harness/counter/layout-counter.mjs --root . src && node harness/counter/component-shape-counter.mjs --root . src && node harness/counter/freeloader-counter.mjs --root . src
```

All four counters must report `"all": 0`. `npm run build` emits a bundle-budget **warning** at over 500 kB and still exits 0; only 1 MB is an error, so the warning is expected and is not a failure. Note the `--` in the boot command: `node harness/gate/check-boot.mjs` is denied by the enforcement guard because the command text contains a protected path, while `npm run check:boot -- --route x` passes.

**Run the four counters as that one chained command, exactly as written, with no `cd` prefix, no loop, and nothing before the first `node`.** The enforcement guard's read-only allowlist is anchored to the *start* of the command text, so `node harness/counter/...` at position zero is permitted while `cd /some/path; node harness/counter/...` and `for c in ...; do node harness/counter/$c.mjs` are both denied for containing a protected path. Task 2's implementer hit this, could not run three of the four counters, and reported that their passing was "strongly indicated" — inferring a measurement instead of taking one, which is the single habit this project exists to prevent. If a counter will not run, that is a `BLOCKED` report, never an inference.

`npm run check:responsive` is run by the orchestrator at wave boundaries, not by each task.

**`counter = 0` is necessary and never sufficient.** It cannot distinguish "the model complied", "a hook corrected the model", and "the code was never written". Each task therefore carries a presence list, checked by the reviewer rather than self-reported.

## File Structure

| File | Responsibility | Task |
| --- | --- | --- |
| `src/app/preferences/preferences.service.ts` | Persisted user preferences; theme resolution including system preference | T1 |
| `src/app/preferences/preferences.service.spec.ts` | Unit tests for the above | T1 |
| `src/app/app-shell.view-model.ts` | Shell state; applies the `dark` class; delegates theme to preferences | T1 |
| `src/app/mission/mission.model.ts` | `Mission` interface and its enumerations | T2 |
| `src/app/mission/mission.schema.ts` | zod schema and `MissionFormModel`, with field metadata | T2 |
| `src/app/mission/mission-example-data.ts` | Seed missions | T2 |
| `src/app/mission/mission.service.ts` | Mission CRUD; prunes dangling hero and threat references | T2 |
| `src/app/mission/mission.service.spec.ts` | Unit tests for the above | T2 |
| `src/app/threat/threat.model.ts` | `Threat` interface and its enumerations | T2 |
| `src/app/threat/threat.schema.ts` | zod schema and `ThreatFormModel` | T2 |
| `src/app/threat/threat-example-data.ts` | Seed threats | T2 |
| `src/app/threat/threat.service.ts` | Threat CRUD | T2 |
| `src/app/threat/threat.service.spec.ts` | Unit tests for the above | T2 |
| `src/app/dashboard/dashboard.view-model.ts` | Dashboard stats, now from real services | T2 |
| `src/app/ui/stat-tile.ts` | Presentational stat tile, on `hlm-card` | T3a |
| `src/app/ui/hero-card.ts` | Presentational hero card, on `hlm-card` | T3a |
| `src/app/dashboard/dashboard.html` | Dashboard template, roster preview on `hlm-card` | T3a |
| `src/app/ui/power-meter.ts` | Presentational power meter bar | T3b |
| `src/app/hero-detail/hero-detail.html` | Detail template, restructured onto `hlm-tabs` | T3b |
| `src/app/hero-detail/hero-detail.view-model.ts` | Detail state, tab key replaces `isEditing` | T3b |
| `src/app/missions/missions.view-model.ts` | Missions screen state and CRUD orchestration | T4 |
| `src/app/missions/missions.ts` + `.html` | Missions screen | T4 |
| `src/app/ui/mission-form.ts` | Presentational mission form, carries the switch | T4 |
| `src/app/forms/form-field-meta.ts` | Adds `'switch'` to `ControlKind` | T4 |
| `src/app/threats/threats.view-model.ts` | Threats screen state and CRUD orchestration | T5 |
| `src/app/threats/threats.ts` + `.html` | Threats screen | T5 |
| `src/app/ui/threat-form.ts` | Presentational threat form | T5 |
| `src/app/settings/settings.view-model.ts` | Settings state over preferences | T6 |
| `src/app/settings/settings.ts` + `.html` | Settings screen | T6 |
| `src/app/roster/roster.view-model.ts` | Roster state, now seeded from preferences | T6 |
| `src/app/app.html`, `src/app/app.routes.ts` | Navigation and routing reconciliation | T7 |

---

### Task 1: PreferencesService and the theme defect

**Files:**
- Create: `src/app/preferences/preferences.service.ts`
- Create: `src/app/preferences/preferences.service.spec.ts`
- Modify: `src/app/app-shell.view-model.ts` (whole file replaced)

**Interfaces:**
- Consumes: `HeroStatus` from `src/app/hero/hero.model.ts`.
- Produces:
  - `type ThemeChoice = 'light' | 'dark' | 'system'`
  - `type RosterSort = 'power' | 'name' | 'status'`
  - `interface Preferences { theme: ThemeChoice; rosterSort: RosterSort; rosterStatus: HeroStatus | 'all'; compactTables: boolean }`
  - `class PreferencesService` with readonly signals `theme`, `rosterSort`, `rosterStatus`, `compactTables`, `isDark`, and methods `setTheme(v: ThemeChoice): void`, `setRosterSort(v: RosterSort): void`, `setRosterStatus(v: HeroStatus | 'all'): void`, `setCompactTables(v: boolean): void`.
  - `class AppShellViewModel` with readonly signals `isDark`, `theme`, and method `toggleTheme(): void`.

- [ ] **Step 1: Run the existing tests and observe the failure we are fixing**

Run: `npm test`

Expected: FAIL, 2 of 2, both with `TypeError: window.matchMedia is not a function`, originating at `src/app/app-shell.view-model.ts:7`. This is the regression test we already have; do not delete it.

- [ ] **Step 2: Write the failing test for the new service**

Create `src/app/preferences/preferences.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { PreferencesService } from './preferences.service';

describe('PreferencesService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('constructs in an environment with no matchMedia', () => {
    // jsdom does not implement matchMedia. Constructing must not throw:
    // this is the defect that broke both app tests.
    expect(() => TestBed.inject(PreferencesService)).not.toThrow();
  });

  it('defaults to following the system theme', () => {
    const service = TestBed.inject(PreferencesService);
    expect(service.theme()).toBe('system');
    expect(service.rosterSort()).toBe('power');
    expect(service.rosterStatus()).toBe('all');
    expect(service.compactTables()).toBe(false);
  });

  it('resolves isDark from an explicit choice', () => {
    const service = TestBed.inject(PreferencesService);
    service.setTheme('dark');
    expect(service.isDark()).toBe(true);
    service.setTheme('light');
    expect(service.isDark()).toBe(false);
  });

  it('persists a choice across instances', () => {
    TestBed.inject(PreferencesService).setTheme('dark');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(PreferencesService).theme()).toBe('dark');
  });

  it('falls back to defaults when stored data is corrupt', () => {
    localStorage.setItem('hero-ops-console.preferences', 'not json');
    expect(TestBed.inject(PreferencesService).theme()).toBe('system');
  });

  it('records the other preferences', () => {
    const service = TestBed.inject(PreferencesService);
    service.setRosterSort('name');
    service.setRosterStatus('Injured');
    service.setCompactTables(true);
    expect(service.rosterSort()).toBe('name');
    expect(service.rosterStatus()).toBe('Injured');
    expect(service.compactTables()).toBe(true);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test`

Expected: FAIL, cannot resolve `./preferences.service`.

- [ ] **Step 4: Write the service**

Create `src/app/preferences/preferences.service.ts`:

```ts
import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import type { HeroStatus } from '../hero/hero.model';

export type ThemeChoice = 'light' | 'dark' | 'system';
export type RosterSort = 'power' | 'name' | 'status';

export interface Preferences {
  theme: ThemeChoice;
  rosterSort: RosterSort;
  rosterStatus: HeroStatus | 'all';
  compactTables: boolean;
}

const STORAGE_KEY = 'hero-ops-console.preferences';

const DEFAULTS: Preferences = {
  theme: 'system',
  rosterSort: 'power',
  rosterStatus: 'all',
  compactTables: false,
};

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  // The browser is reached through the document, never as a bare global. It is
  // null under SSR and, under jsdom, is a window with no matchMedia at all.
  private readonly view = this.document.defaultView;

  private readonly stored = signal<Preferences>(this.read());
  private readonly systemPrefersDark = signal(this.matchDark()?.matches ?? false);

  readonly theme = computed(() => this.stored().theme);
  readonly rosterSort = computed(() => this.stored().rosterSort);
  readonly rosterStatus = computed(() => this.stored().rosterStatus);
  readonly compactTables = computed(() => this.stored().compactTables);

  // Three states, not a boolean: only a distinct 'system' can express "the user
  // has made no choice", which is what the spec asks us to respect.
  readonly isDark = computed(() => {
    const choice = this.theme();
    return choice === 'dark' || (choice === 'system' && this.systemPrefersDark());
  });

  constructor() {
    const query = this.matchDark();
    if (!query) return;
    const onChange = (event: MediaQueryListEvent) => this.systemPrefersDark.set(event.matches);
    query.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
  }

  setTheme(theme: ThemeChoice): void {
    this.patch({ theme });
  }

  setRosterSort(rosterSort: RosterSort): void {
    this.patch({ rosterSort });
  }

  setRosterStatus(rosterStatus: HeroStatus | 'all'): void {
    this.patch({ rosterStatus });
  }

  setCompactTables(compactTables: boolean): void {
    this.patch({ compactTables });
  }

  private patch(part: Partial<Preferences>): void {
    const next = { ...this.stored(), ...part };
    this.stored.set(next);
    this.write(next);
  }

  private matchDark(): MediaQueryList | null {
    const view = this.view;
    if (!view || typeof view.matchMedia !== 'function') return null;
    try {
      return view.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return null;
    }
  }

  // Reading storage can throw outright when site data is blocked, so the guard
  // is around the access itself, not only around the parse.
  private read(): Preferences {
    try {
      const raw = this.view?.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  private write(value: Preferences): void {
    try {
      this.view?.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Storage unavailable. Preferences still work for this session.
    }
  }
}
```

- [ ] **Step 5: Run the new tests to verify they pass**

Run: `npm test`

Expected: the six `PreferencesService` tests PASS. The two `App` tests still FAIL, because `app-shell.view-model.ts` has not been changed yet.

- [ ] **Step 6: Rewrite the shell ViewModel to delegate**

Replace the whole of `src/app/app-shell.view-model.ts`:

```ts
import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject } from '@angular/core';
import { PreferencesService } from './preferences/preferences.service';

@Injectable()
export class AppShellViewModel {
  private readonly document = inject(DOCUMENT);
  private readonly preferences = inject(PreferencesService);

  readonly isDark = computed(() => this.preferences.isDark());
  readonly theme = computed(() => this.preferences.theme());

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
    });
  }

  toggleTheme(): void {
    this.preferences.setTheme(this.preferences.isDark() ? 'light' : 'dark');
  }
}
```

- [ ] **Step 7: Run the full test suite**

Run: `npm test`

Expected: PASS, all 8 tests.

Corrected after execution: this step originally claimed the `matchMedia` fix alone turns both `App` tests green. It does not. `app.spec.ts` also asserts `compiled.querySelector('nav')`, and the promoted source had already replaced the old literal `<nav>` shell with `hlm-sidebar` without updating that test, so `should render the shell nav` was failing for two independent reasons. Satisfying it requires wrapping the sidebar in a `<nav>` landmark in `src/app/app.html` — a file outside this task's manifest. That was ruled acceptable at execution time; see the ledger. `hlm-sidebar` carries no landmark role of its own, so the wrapper creates no nested navigation landmark.

- [ ] **Step 8: Run the whole verification bar**

Run each command in the verification bar, with `npm run check:boot -- --route dashboard`.

Expected: every command passes; all four counters report `"all": 0`.

- [ ] **Step 9: Commit**

```bash
git add src/app/preferences src/app/app-shell.view-model.ts
git commit -m "fix(theme): resolve the browser through DOCUMENT and persist the choice"
```

**Presence list for the reviewer:**
- `src/app/preferences/preferences.service.ts` exists and contains no bare `window` reference
- `app-shell.view-model.ts` contains no `matchMedia` call at all
- `theme` is three-state, and `isDark` reads `systemPrefersDark` only when the choice is `'system'`
- both reads and writes of `localStorage` sit inside `try`/`catch`
- `npm test` reports 8 passing, 0 failing

---

### Task 2: The Mission and Threat domain

**Files:**
- Create: `src/app/mission/mission.model.ts`, `mission.schema.ts`, `mission-example-data.ts`, `mission.service.ts`, `mission.service.spec.ts`
- Create: `src/app/threat/threat.model.ts`, `threat.schema.ts`, `threat-example-data.ts`, `threat.service.ts`, `threat.service.spec.ts`
- Modify: `src/app/dashboard/dashboard.view-model.ts` (whole file replaced)

**Interfaces:**
- Consumes: `HeroService` and its `heroes` signal from `src/app/hero/hero.service.ts`; `FormFieldMeta` from `src/app/forms/form-field-meta.ts`.
- Produces:
  - `type MissionStatus = 'Planned' | 'Active' | 'Complete' | 'Failed' | 'Aborted'`
  - `interface Mission { readonly id: string; codename: string; objective: string; status: MissionStatus; priority: boolean; threatId: string | null; heroIds: readonly string[]; startedOn: string; debrief: string }`
  - `type ThreatLevel = 'Low' | 'Moderate' | 'Severe' | 'Critical'`; `type ThreatStatus = 'Active' | 'Contained' | 'Neutralized'`; `type ThreatCategory = 'Kaiju' | 'Rogue' | 'Anomaly' | 'Syndicate' | 'Cosmic'`
  - `interface Threat { readonly id: string; designation: string; category: ThreatCategory; level: ThreatLevel; status: ThreatStatus; location: string; firstSeenOn: string; notes: string }`
  - `class MissionService` with `readonly missions`, `byId(id: string): Mission | undefined`, `forHero(heroId: string): Mission[]`, `create(c: MissionFormModel): Mission`, `update(id: string, patch: Partial<MissionFormModel>): void`, `remove(id: string): void`
  - `class ThreatService` with `readonly threats`, `byId(id: string): Threat | undefined`, `create(c: ThreatFormModel): Threat`, `update(id: string, patch: Partial<ThreatFormModel>): void`, `remove(id: string): void`
  - `type MissionFormModel = z.infer<typeof missionSchema>`, `type ThreatFormModel = z.infer<typeof threatSchema>`
  - `class DashboardViewModel` gains `readonly activeMissions` and `readonly threats` backed by the real services

- [ ] **Step 1: Write the failing service tests**

Create `src/app/mission/mission.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { MissionService } from './mission.service';
import { HeroService } from '../hero/hero.service';
import { ThreatService } from '../threat/threat.service';

describe('MissionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('seeds from example data', () => {
    expect(TestBed.inject(MissionService).missions().length).toBeGreaterThan(0);
  });

  it('creates a mission with a fresh id and returns it', () => {
    const service = TestBed.inject(MissionService);
    const before = service.missions().length;
    const created = service.create({
      codename: 'Nightfall',
      objective: 'Contain the rift',
      status: 'Planned',
      priority: true,
      threatId: null,
      startedOn: '2026-09-07',
      debrief: '',
    });
    expect(service.missions().length).toBe(before + 1);
    expect(service.byId(created.id)?.codename).toBe('Nightfall');
    expect(created.priority).toBe(true);
  });

  it('updates only the fields it is given', () => {
    const service = TestBed.inject(MissionService);
    const target = service.missions()[0];
    service.update(target.id, { status: 'Complete' });
    expect(service.byId(target.id)?.status).toBe('Complete');
    expect(service.byId(target.id)?.codename).toBe(target.codename);
  });

  it('removes a mission', () => {
    const service = TestBed.inject(MissionService);
    const target = service.missions()[0];
    service.remove(target.id);
    expect(service.byId(target.id)).toBeUndefined();
  });

  it('detaches a hero id once that hero is retired', () => {
    const heroes = TestBed.inject(HeroService);
    const service = TestBed.inject(MissionService);
    const assigned = service.missions().find((m) => m.heroIds.length > 0);
    expect(assigned).toBeDefined();
    const heroId = assigned!.heroIds[0];
    heroes.retire(heroId);
    expect(service.byId(assigned!.id)?.heroIds).not.toContain(heroId);
  });

  it('nulls a threat reference once that threat is deleted', () => {
    const threats = TestBed.inject(ThreatService);
    const service = TestBed.inject(MissionService);
    const linked = service.missions().find((m) => m.threatId !== null);
    expect(linked).toBeDefined();
    threats.remove(linked!.threatId!);
    expect(service.byId(linked!.id)?.threatId).toBeNull();
  });

  it('lists the missions for one hero', () => {
    const service = TestBed.inject(MissionService);
    const assigned = service.missions().find((m) => m.heroIds.length > 0)!;
    expect(service.forHero(assigned.heroIds[0]).map((m) => m.id)).toContain(assigned.id);
  });
});
```

Create `src/app/threat/threat.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { ThreatService } from './threat.service';

describe('ThreatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('seeds from example data', () => {
    expect(TestBed.inject(ThreatService).threats().length).toBeGreaterThan(0);
  });

  it('creates a threat with a fresh id', () => {
    const service = TestBed.inject(ThreatService);
    const created = service.create({
      designation: 'Silent Tide',
      category: 'Anomaly',
      level: 'Severe',
      status: 'Active',
      location: 'Baltic Shelf',
      firstSeenOn: '2026-09-01',
      notes: '',
    });
    expect(service.byId(created.id)?.designation).toBe('Silent Tide');
  });

  it('updates only the fields it is given', () => {
    const service = TestBed.inject(ThreatService);
    const target = service.threats()[0];
    service.update(target.id, { status: 'Contained' });
    expect(service.byId(target.id)?.status).toBe('Contained');
    expect(service.byId(target.id)?.designation).toBe(target.designation);
  });

  it('removes a threat', () => {
    const service = TestBed.inject(ThreatService);
    const target = service.threats()[0];
    service.remove(target.id);
    expect(service.byId(target.id)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test`

Expected: FAIL, cannot resolve `./mission.service` or `./threat.service`.

- [ ] **Step 3: Write the models**

Create `src/app/threat/threat.model.ts`:

```ts
export type ThreatCategory = 'Kaiju' | 'Rogue' | 'Anomaly' | 'Syndicate' | 'Cosmic';
export type ThreatLevel = 'Low' | 'Moderate' | 'Severe' | 'Critical';
export type ThreatStatus = 'Active' | 'Contained' | 'Neutralized';

export interface Threat {
  readonly id: string;
  designation: string;
  category: ThreatCategory;
  level: ThreatLevel;
  status: ThreatStatus;
  location: string;
  /** ISO date, never a Date object: templates must not construct dates. */
  firstSeenOn: string;
  notes: string;
}
```

Create `src/app/mission/mission.model.ts`:

```ts
export type MissionStatus = 'Planned' | 'Active' | 'Complete' | 'Failed' | 'Aborted';

export interface Mission {
  readonly id: string;
  codename: string;
  objective: string;
  status: MissionStatus;
  /** Flagged for priority deployment. Drives the missions filter and the form switch. */
  priority: boolean;
  threatId: string | null;
  heroIds: readonly string[];
  /** ISO date, never a Date object. */
  startedOn: string;
  debrief: string;
}
```

- [ ] **Step 4: Write the schemas**

Create `src/app/threat/threat.schema.ts`:

```ts
import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

export const threatSchema = z.object({
  designation: z
    .string()
    .min(1, 'Designation is required')
    .meta({ label: 'Designation', control: 'text', placeholder: 'Threat designation' } satisfies FormFieldMeta),
  category: z
    .enum(['Kaiju', 'Rogue', 'Anomaly', 'Syndicate', 'Cosmic'])
    .meta({
      label: 'Category',
      control: 'select',
      placeholder: 'Select a category',
      options: [
        { value: 'Kaiju', label: 'Kaiju' },
        { value: 'Rogue', label: 'Rogue' },
        { value: 'Anomaly', label: 'Anomaly' },
        { value: 'Syndicate', label: 'Syndicate' },
        { value: 'Cosmic', label: 'Cosmic' },
      ],
    } satisfies FormFieldMeta),
  level: z
    .enum(['Low', 'Moderate', 'Severe', 'Critical'])
    .meta({
      label: 'Threat Level',
      control: 'select',
      placeholder: 'Select a level',
      options: [
        { value: 'Low', label: 'Low' },
        { value: 'Moderate', label: 'Moderate' },
        { value: 'Severe', label: 'Severe' },
        { value: 'Critical', label: 'Critical' },
      ],
    } satisfies FormFieldMeta),
  status: z
    .enum(['Active', 'Contained', 'Neutralized'])
    .meta({
      label: 'Status',
      control: 'select',
      placeholder: 'Select a status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Contained', label: 'Contained' },
        { value: 'Neutralized', label: 'Neutralized' },
      ],
    } satisfies FormFieldMeta),
  location: z
    .string()
    .min(1, 'Location is required')
    .meta({ label: 'Location', control: 'text', placeholder: 'Last known location' } satisfies FormFieldMeta),
  firstSeenOn: z
    .string()
    .min(1, 'First sighting is required')
    .meta({ label: 'First Seen', control: 'text', placeholder: 'YYYY-MM-DD' } satisfies FormFieldMeta),
  // Present but free to be empty: a textarea can only ever produce a string, so
  // `.optional()` would leak an `undefined` the control can never emit.
  notes: z
    .string()
    .meta({ label: 'Notes', control: 'textarea', placeholder: 'Assessment notes' } satisfies FormFieldMeta),
});

export type ThreatFormModel = z.infer<typeof threatSchema>;
```

Create `src/app/mission/mission.schema.ts`. The `priority` field uses `control: 'switch'`, which Task 4 adds to `ControlKind`; until then it will not type-check, so **this task writes `control: 'checkbox'` and Task 4 changes it**:

```ts
import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';

export const missionSchema = z.object({
  codename: z
    .string()
    .min(1, 'Codename is required')
    .meta({ label: 'Codename', control: 'text', placeholder: 'Mission codename' } satisfies FormFieldMeta),
  objective: z
    .string()
    .min(1, 'Objective is required')
    .meta({ label: 'Objective', control: 'text', placeholder: 'What this mission achieves' } satisfies FormFieldMeta),
  status: z
    .enum(['Planned', 'Active', 'Complete', 'Failed', 'Aborted'])
    .meta({
      label: 'Status',
      control: 'select',
      placeholder: 'Select a status',
      options: [
        { value: 'Planned', label: 'Planned' },
        { value: 'Active', label: 'Active' },
        { value: 'Complete', label: 'Complete' },
        { value: 'Failed', label: 'Failed' },
        { value: 'Aborted', label: 'Aborted' },
      ],
    } satisfies FormFieldMeta),
  priority: z
    .boolean()
    .meta({ label: 'Priority deployment', control: 'checkbox' } satisfies FormFieldMeta),
  threatId: z
    .string()
    .nullable()
    .meta({ label: 'Linked Threat', control: 'select', placeholder: 'No linked threat' } satisfies FormFieldMeta),
  startedOn: z
    .string()
    .min(1, 'Start date is required')
    .meta({ label: 'Started On', control: 'text', placeholder: 'YYYY-MM-DD' } satisfies FormFieldMeta),
  debrief: z
    .string()
    .meta({ label: 'Debrief', control: 'textarea', placeholder: 'After-action notes' } satisfies FormFieldMeta),
});

export type MissionFormModel = z.infer<typeof missionSchema>;
```

- [ ] **Step 5: Write the example data**

Create `src/app/threat/threat-example-data.ts`. Example data, plainly marked as such:

```ts
import type { Threat } from './threat.model';

/** Example data. Not a real threat register. */
export const EXAMPLE_THREATS: Threat[] = [
  { id: '1', designation: 'Leviathan Bloom', category: 'Kaiju', level: 'Critical', status: 'Active', location: 'Sea of Japan', firstSeenOn: '2026-03-14', notes: 'Biomass doubling every nine days.' },
  { id: '2', designation: 'The Gilded Hand', category: 'Syndicate', level: 'Severe', status: 'Active', location: 'Zurich', firstSeenOn: '2025-11-02', notes: 'Financing unlicensed augmentation.' },
  { id: '3', designation: 'Null Cascade', category: 'Anomaly', level: 'Severe', status: 'Contained', location: 'Atacama', firstSeenOn: '2026-01-27', notes: 'Localized causality inversion, contained by lattice.' },
  { id: '4', designation: 'Warden Prime', category: 'Rogue', level: 'Moderate', status: 'Active', location: 'Lagos', firstSeenOn: '2026-05-30', notes: 'Former asset, clearance revoked.' },
  { id: '5', designation: 'Hollow Star', category: 'Cosmic', level: 'Critical', status: 'Active', location: 'Lunar far side', firstSeenOn: '2026-07-11', notes: 'Signal source, intent unknown.' },
  { id: '6', designation: 'Ashfall Choir', category: 'Anomaly', level: 'Low', status: 'Neutralized', location: 'Reykjavik', firstSeenOn: '2025-09-08', notes: 'Resolved without deployment.' },
];
```

Create `src/app/mission/mission-example-data.ts`. Hero ids must match ids that exist in `src/app/hero/hero-example-data.ts` — read that file and use real ids rather than inventing them:

```ts
import type { Mission } from './mission.model';

/** Example data. Hero ids refer to EXAMPLE_HEROES; threat ids to EXAMPLE_THREATS. */
export const EXAMPLE_MISSIONS: Mission[] = [
  { id: '1', codename: 'Tidebreaker', objective: 'Halt the Leviathan Bloom at the shelf', status: 'Active', priority: true, threatId: '1', heroIds: ['1', '3'], startedOn: '2026-08-02', debrief: '' },
  { id: '2', codename: 'Cold Ledger', objective: 'Trace Gilded Hand financing', status: 'Active', priority: false, threatId: '2', heroIds: ['6'], startedOn: '2026-07-19', debrief: '' },
  { id: '3', codename: 'Quiet Lattice', objective: 'Maintain the Atacama containment', status: 'Complete', priority: false, threatId: '3', heroIds: ['2', '5'], startedOn: '2026-02-04', debrief: 'Containment held. No casualties.' },
  { id: '4', codename: 'Warden Recall', objective: 'Bring Warden Prime in without escalation', status: 'Planned', priority: true, threatId: '4', heroIds: [], startedOn: '2026-09-01', debrief: '' },
  { id: '5', codename: 'Long Listen', objective: 'Characterize the Hollow Star signal', status: 'Active', priority: true, threatId: '5', heroIds: ['4'], startedOn: '2026-07-22', debrief: '' },
  { id: '6', codename: 'Chorus End', objective: 'Stand down the Reykjavik response', status: 'Aborted', priority: false, threatId: null, heroIds: ['7'], startedOn: '2025-09-10', debrief: 'Stood down; threat self-resolved.' },
];
```

- [ ] **Step 6: Write ThreatService**

Create `src/app/threat/threat.service.ts`:

```ts
import { Injectable, signal } from '@angular/core';
import type { Threat } from './threat.model';
import type { ThreatFormModel } from './threat.schema';
import { EXAMPLE_THREATS } from './threat-example-data';

@Injectable({ providedIn: 'root' })
export class ThreatService {
  private readonly _threats = signal<Threat[]>(EXAMPLE_THREATS);
  private readonly _nextId = signal(Math.max(...EXAMPLE_THREATS.map((t) => parseInt(t.id, 10))) + 1);

  readonly threats = this._threats.asReadonly();

  byId(id: string): Threat | undefined {
    return this._threats().find((t) => t.id === id);
  }

  create(candidate: ThreatFormModel): Threat {
    const threat: Threat = { id: String(this._nextId()), ...candidate };
    this._threats.update((list) => [...list, threat]);
    this._nextId.update((n) => n + 1);
    return threat;
  }

  update(id: string, patch: Partial<ThreatFormModel>): void {
    this._threats.update((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  remove(id: string): void {
    this._threats.update((list) => list.filter((t) => t.id !== id));
  }
}
```

- [ ] **Step 7: Write MissionService, including the reference pruning**

Create `src/app/mission/mission.service.ts`:

```ts
import { Injectable, effect, inject, signal } from '@angular/core';
import { HeroService } from '../hero/hero.service';
import { ThreatService } from '../threat/threat.service';
import type { Mission } from './mission.model';
import type { MissionFormModel } from './mission.schema';
import { EXAMPLE_MISSIONS } from './mission-example-data';

@Injectable({ providedIn: 'root' })
export class MissionService {
  // Dependencies point one way only: missions know about heroes and threats,
  // never the reverse. A HeroService that imported this would be a cycle.
  private readonly heroService = inject(HeroService);
  private readonly threatService = inject(ThreatService);

  private readonly _missions = signal<Mission[]>(EXAMPLE_MISSIONS);
  private readonly _nextId = signal(Math.max(...EXAMPLE_MISSIONS.map((m) => parseInt(m.id, 10))) + 1);

  readonly missions = this._missions.asReadonly();

  constructor() {
    // Prune references to heroes and threats that no longer exist, so retiring a
    // hero detaches them everywhere. The `changed` guard matters: this effect
    // reads _missions and writes it, so setting an equal-but-newly-allocated
    // array would retrigger the effect forever.
    effect(() => {
      const liveHeroes = new Set(this.heroService.heroes().map((h) => h.id));
      const liveThreats = new Set(this.threatService.threats().map((t) => t.id));
      let changed = false;
      const pruned = this._missions().map((mission) => {
        const heroIds = mission.heroIds.filter((id) => liveHeroes.has(id));
        const threatId = mission.threatId && liveThreats.has(mission.threatId) ? mission.threatId : null;
        if (heroIds.length === mission.heroIds.length && threatId === mission.threatId) return mission;
        changed = true;
        return { ...mission, heroIds, threatId };
      });
      if (changed) this._missions.set(pruned);
    });
  }

  byId(id: string): Mission | undefined {
    return this._missions().find((m) => m.id === id);
  }

  forHero(heroId: string): Mission[] {
    return this._missions().filter((m) => m.heroIds.includes(heroId));
  }

  create(candidate: MissionFormModel): Mission {
    const mission: Mission = { id: String(this._nextId()), heroIds: [], ...candidate };
    this._missions.update((list) => [...list, mission]);
    this._nextId.update((n) => n + 1);
    return mission;
  }

  update(id: string, patch: Partial<MissionFormModel>): void {
    this._missions.update((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  remove(id: string): void {
    this._missions.update((list) => list.filter((m) => m.id !== id));
  }
}
```

- [ ] **Step 8: Run the service tests to verify they pass**

Run: `npm test`

Expected: PASS. If the detach test fails because the effect has not flushed, wrap the assertion in `TestBed.tick()` (Angular 22) rather than adding a timeout.

- [ ] **Step 9: Delete the two fabricated dashboard numbers**

Replace the whole of `src/app/dashboard/dashboard.view-model.ts`:

```ts
import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../hero/hero.service';
import { MissionService } from '../mission/mission.service';
import { ThreatService } from '../threat/threat.service';

@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);
  private readonly threatService = inject(ThreatService);

  readonly heroes = this.heroService.heroes;

  readonly totalHeroes = computed(() => this.heroes().length);

  readonly activeMissions = computed(
    () => this.missionService.missions().filter((m) => m.status === 'Active').length,
  );

  readonly threats = computed(
    () => this.threatService.threats().filter((t) => t.status === 'Active').length,
  );

  readonly averagePower = computed(() => {
    const heroes = this.heroes();
    return heroes.length ? Math.round(heroes.reduce((sum, h) => sum + h.power, 0) / heroes.length) : 0;
  });

  readonly topHeroes = computed(() =>
    this.heroes()
      .slice()
      .sort((a, b) => b.power - a.power)
      .slice(0, 4),
  );
}
```

- [ ] **Step 10: Run the whole verification bar**

Run each command in the verification bar, with `npm run check:boot -- --route dashboard --route roster --route detail/11`.

Expected: every command passes; all four counters report `"all": 0`.

- [ ] **Step 11: Commit**

```bash
git add src/app/mission src/app/threat src/app/dashboard/dashboard.view-model.ts
git commit -m "feat(domain): mission and threat entities, and a dashboard that stops lying"
```

**Presence list for the reviewer:**
- both folders contain all five files each, matching the `hero/` folder's shape
- `mission-example-data.ts` hero ids all resolve against `hero-example-data.ts`; at least one mission has a non-empty `heroIds` and at least one has a non-null `threatId`, or the detach tests are vacuous
- `MissionService` injects `HeroService` and `ThreatService`; neither of those imports `MissionService`
- the pruning effect has the `changed` guard
- the literals `12` and `5` are gone from `dashboard.view-model.ts`, and both stats derive from a service
- no model field is typed `Date`

---

### Task 3a: Card refactor (runs in parallel with 3b)

**Files:**
- Modify: `libs/ui/card/src/lib/hlm-card-title.ts` (add the `emphasis` variant input — the sanctioned customization path; the gate ignores `libs/**`)
- Modify: `src/app/ui/stat-tile.ts` (whole file replaced)
- Modify: `src/app/ui/hero-card.ts` (template only)
- Modify: `src/app/dashboard/dashboard.html` (the roster preview block only)

**Do not touch `src/app/hero-detail/*`. Task 3b owns that file and is running at the same time.**

**Interfaces:**
- Consumes: `HlmCardImports` from `@spartan-ng/helm/card`.
- Produces: no API changes. `StatTile` keeps `label`, `value`, `icon` inputs. `HeroCard` keeps its existing inputs and outputs.

- [ ] **Step 1: Read the card documentation**

Call the spartan MCP: `spartan_components_get` with name `card`. Confirm the composition before writing markup. The documented form is:

```html
<hlm-card>
  <hlm-card-header>
    <h3 hlmCardTitle>Card Title</h3>
    <p hlmCardDescription>Card Description</p>
    <div hlmCardAction>Card Action</div>
  </hlm-card-header>
  <div hlmCardContent>Card Content</div>
  <hlm-card-footer>Card Footer</hlm-card-footer>
</hlm-card>
```

`hlm-card`, `hlm-card-header` and `hlm-card-footer` are element selectors. `hlmCardTitle`, `hlmCardDescription`, `hlmCardContent` and `hlmCardAction` are attribute directives.

- [ ] **Step 2: Rewrite the stat tile onto the primitive**

Replace the whole of `src/app/ui/stat-tile.ts`:

```ts
import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmCardImports],
  template: `
    <hlm-card>
      <hlm-card-header>
        <p hlmCardDescription>{{ label() }}</p>
        <p hlmCardTitle emphasis="stat">{{ value() }}</p>
        <div hlmCardAction>
          <ng-icon [name]="icon()" class="size-8 text-muted-foreground" />
        </div>
      </hlm-card-header>
    </hlm-card>
  `,
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
}
```

Note that the hand-rolled `flex items-start justify-between` wrapper is gone entirely: `hlmCardAction` already places the icon at the end of the header grid, so faking that layout with flex would be the nested-flex anti-pattern the layout gate exists to catch.

Three things about this snippet are deliberate, and earlier drafts of this plan got all three wrong in two separate ways:

- **The value is not a heading.** The first draft made it `<h3 hlmCardTitle>{{ value() }}</h3>`, which produced two real accessibility defects: an `H1 → H3 → H2` heading-order skip on the dashboard, and a heading whose entire accessible name is a bare number, so a screen-reader heading list reads "42, 88, 1204" with no indication of what any of them measure. A stat tile is a label/value pair, not a document section. `hlmCardTitle` is an attribute directive and attaches to any element, so `<p hlmCardTitle>` gets the design-system typography with no heading semantics. Heading level is a document-outline decision; the spartan docs' `<h3>` is a generic placeholder in an example, not a requirement.
- **The emphasis comes from a variant on the primitive, never from a class at the call site.** The first draft wrote `class="text-3xl font-bold"` on the primitive, which `no-appearance-on-primitive` correctly rejected, leaving the headline number rendering at the default `text-base font-medium` — the whole point of a stat tile, lost, with every counter still reading zero. The second draft moved the number to a plain `<p>` in `hlmCardContent` and put the class there. That passed the gate and was still wrong: it is the rule's own failure mode, relocating code until the rule no longer applies rather than doing the work the rule points at. `sealing-spec.md:57-59` names the sanctioned path — edit the owned copy in `libs/ui` or use the component's `variant`/`size` inputs. `HlmCardTitle` had no variant input, so Task 3a adds one.
- **The icon keeps its class** because `<ng-icon>` is not a sealed primitive.

**Adding the variant** (`libs/ui/card/src/lib/hlm-card-title.ts`). The gate ignores `libs/**` entirely, so this path is open; what is NOT open is inventing a new part name, because `PRIMITIVE_ATTRS` in `harness/gate/rules/primitive-vocabulary.ts` is a frozen hardcoded list inside a protected directory. Extend the existing directive rather than adding a sibling:

```ts
import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

export type HlmCardTitleEmphasis = 'default' | 'stat';

@Directive({
  selector: '[hlmCardTitle]',
  host: { 'data-slot': 'card-title' },
})
export class HlmCardTitle {
  /** 'stat' renders the headline-number treatment dashboard stat tiles need. */
  readonly emphasis = input<HlmCardTitleEmphasis>('default');

  constructor() {
    classes(() =>
      this.emphasis() === 'stat'
        ? 'text-3xl leading-tight font-bold group-data-[size=sm]/card:text-2xl'
        : 'text-base leading-normal font-medium group-data-[size=sm]/card:text-sm',
    );
  }
}
```

The `default` branch is the existing string unchanged, so every other card title in the application renders exactly as before.

- [ ] **Step 3: Run the tests and the counters**

Run: `npm test` then `node harness/counter/layout-counter.mjs --root . src`

Expected: tests PASS, counter reports `"all": 0`.

- [ ] **Step 4: Rewrite the hero card onto the primitive**

Open `src/app/ui/hero-card.ts`. Replace its hand-rolled container with `hlm-card` and its parts, keeping every existing `input()` and `output()` signature unchanged and keeping the existing `hlm-avatar`, `hlmAvatarFallback`, `hlmBadge` and `hlmBtn` usages exactly as they are. Add `HlmCardImports` to the component's `imports` array. The hero name goes in `hlmCardTitle`, the alias in `hlmCardDescription`, the badges and stats in `hlmCardContent`, and any action button in `hlm-card-footer`.

- [ ] **Step 5: Rewrite the dashboard roster preview onto the primitive**

In `src/app/dashboard/dashboard.html`, replace this block:

```html
<div class="rounded-lg border border-border bg-card p-4">
  <p class="text-sm text-muted-foreground">{{ vm.totalHeroes() }} heroes</p>
  <a routerLink="/roster" hlmBtn variant="outline" size="sm" class="mt-4">
    <span>View full roster</span>
  </a>
</div>
```

with:

```html
<hlm-card>
  <hlm-card-header>
    <p hlmCardDescription>{{ vm.totalHeroes() }} heroes on file</p>
  </hlm-card-header>
  <hlm-card-footer>
    <a routerLink="/roster" hlmBtn variant="outline" size="sm">
      <span>View full roster</span>
    </a>
  </hlm-card-footer>
</hlm-card>
```

Add `HlmCardImports` to the `imports` array in `src/app/dashboard/dashboard.ts`.

**Keep the existing `<h2 class="text-xl font-semibold">Roster</h2>` above the block.** An earlier draft of this plan deleted it and moved "Roster" into the card as an `<h3 hlmCardTitle>`. That demoted a top-level page section below its own sibling — "Top Heroes This Cycle" is an `<h2>`, and the two are parallel regions under the same container, so giving one `h2` and the other `h3` is an inconsistent hierarchy with no structural justification.

- [ ] **Step 6: Run the whole verification bar**

Run each command in the verification bar, with `npm run check:boot -- --route dashboard --route roster`.

Expected: every command passes; all four counters report `"all": 0`.

- [ ] **Step 7: Commit**

```bash
git add src/app/ui/stat-tile.ts src/app/ui/hero-card.ts src/app/dashboard
git commit -m "refactor(ui): put the stat tile, hero card and roster preview on hlm-card"
```

**Presence list for the reviewer:**
- `hlm-card` appears in all three files
- no `rounded-lg border border-border bg-card` string survives in any of the three
- `StatTile`'s three input names and types are unchanged
- `HeroCard`'s input and output signatures are unchanged
- `src/app/hero-detail/` is untouched by this commit

---

### Task 3b: Hero detail on tabs (runs in parallel with 3a)

**Files:**
- Create: `src/app/ui/power-meter.ts`
- Modify: `src/app/hero-detail/hero-detail.view-model.ts`
- Modify: `src/app/hero-detail/hero-detail.ts`
- Modify: `src/app/hero-detail/hero-detail.html` (whole file replaced)

**Do not touch `src/app/ui/stat-tile.ts`, `src/app/ui/hero-card.ts` or `src/app/dashboard/*`. Task 3a owns those files and is running at the same time.**

**Interfaces:**
- Consumes: `MissionService.forHero(heroId: string): Mission[]` from Task 2; `HlmTabsImports` from `@spartan-ng/helm/tabs`; `HlmCardImports` from `@spartan-ng/helm/card`.
- Produces: `HeroDetailViewModel` gains `readonly tab` (a `linkedSignal<string>` defaulting to `'overview'`) and `readonly missions` (a `computed<Mission[]>`), and loses `isEditing`. A new presentational `PowerMeter` with `label: string`, `value: number` and `max: number` inputs.

- [ ] **Step 1: Read the tabs documentation**

Call the spartan MCP: `spartan_components_get` with name `tabs`. The documented composition is:

```html
<hlm-tabs tab="account" class="w-full">
  <hlm-tabs-list class="grid w-full grid-cols-2" aria-label="tabs example">
    <button hlmTabsTrigger="account">Account</button>
    <button hlmTabsTrigger="password">Password</button>
  </hlm-tabs-list>
  <div hlmTabsContent="account">Make your account here</div>
  <div hlmTabsContent="password">Change your password here</div>
</hlm-tabs>
```

The `aria-label` on `hlm-tabs-list` is not decoration; a tab strip with no accessible name is one of the failure classes already recorded against this codebase.

- [ ] **Step 2: Write the power meter**

Create `src/app/ui/power-meter.ts`:

```ts
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-power-meter',
  template: `
    <div class="grid gap-1">
      <div class="flex items-baseline justify-between">
        <span class="text-sm text-muted-foreground">{{ label() }}</span>
        <span class="text-sm font-medium text-foreground">{{ value() }} / {{ max() }}</span>
      </div>
      <div
        class="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="meter"
        [attr.aria-label]="label()"
        [attr.aria-valuenow]="value()"
        aria-valuemin="0"
        [attr.aria-valuemax]="max()"
      >
        <div class="h-full rounded-full bg-primary" [style.width.%]="percent()"></div>
      </div>
    </div>
  `,
})
export class PowerMeter {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly max = input(100);

  protected readonly percent = computed(() => {
    const max = this.max();
    return max > 0 ? Math.min(100, Math.max(0, (this.value() / max) * 100)) : 0;
  });
}
```

The width is a `style` binding, not `ngStyle`, and the colors are tokens. `role="meter"` with its three aria values gives the bar an accessible reading rather than leaving it a decorative div.

- [ ] **Step 3: Replace `isEditing` with a tab key in the ViewModel**

In `src/app/hero-detail/hero-detail.view-model.ts`, delete the `isEditing` member and add these, keeping every other member exactly as it is:

```ts
  // Reseeds whenever the hero changes, so navigating to another hero returns the
  // reader to Overview instead of stranding them in a stale editor. This is the
  // same reseeding behaviour isEditing had, moved onto the tab key.
  readonly tab = linkedSignal(() => {
    this.heroId();
    return 'overview';
  });

  readonly missions = computed(() => {
    const id = this.heroId();
    return id ? this.missionService.forHero(id) : [];
  });
```

Add `private readonly missionService = inject(MissionService);` alongside the other injections, and import `MissionService` from `'../mission/mission.service'`. In `saveHero`, replace `this.isEditing.set(false)` with `this.tab.set('overview')`. Replace the body of `cancelEdit()` with `this.tab.set('overview')`.

- [ ] **Step 4: Restructure the template onto tabs**

Replace the whole of `src/app/hero-detail/hero-detail.html`. The skeleton, which must keep every existing `hlm-dialog` retire flow and `app-hero-form` usage intact:

```html
<div class="flex flex-col gap-6 p-6">
  @if (vm.hero(); as hero) {
    <div class="flex flex-wrap items-center justify-between gap-4">
      <button hlmBtn variant="ghost" routerLink="/roster">
        <ng-icon name="lucideChevronLeft" />
        <span>Back to Roster</span>
      </button>
      <div class="flex flex-wrap items-center gap-2">
        <button hlmBtn variant="outline">
          <ng-icon name="lucideCrosshair" />
          <span>Deploy</span>
        </button>
        <hlm-dialog>
          <button hlmDialogTrigger hlmBtn variant="destructive">
            <ng-icon name="lucideTrash2" />
            <span>Retire</span>
          </button>
          <hlm-dialog-content *hlmDialogPortal class="sm:max-w-sm">
            <hlm-dialog-header>
              <h2 hlmDialogTitle>Retire {{ hero.name }}?</h2>
              <p hlmDialogDescription>
                {{ hero.alias }} comes off the active roster. This cannot be undone.
              </p>
            </hlm-dialog-header>
            <hlm-dialog-footer>
              <button hlmBtn variant="outline" hlmDialogClose>Cancel</button>
              <button hlmBtn variant="destructive" hlmDialogClose (click)="vm.retireHero()">
                Retire hero
              </button>
            </hlm-dialog-footer>
          </hlm-dialog-content>
        </hlm-dialog>
      </div>
    </div>

    <hlm-card>
      <hlm-card-header>
        <div hlmCardAction>
          <hlm-avatar size="lg">
            <span hlmAvatarFallback>{{ hero.name.substring(0, 2).toUpperCase() }}</span>
          </hlm-avatar>
        </div>
        <h1 hlmCardTitle class="text-2xl font-bold">{{ hero.name }}</h1>
        <p hlmCardDescription>{{ hero.alias }}</p>
      </hlm-card-header>
      <div hlmCardContent class="flex flex-wrap gap-2">
        <span hlmBadge variant="secondary">{{ hero.powerClass }}</span>
        <span hlmBadge [variant]="hero.status === 'Active' ? 'default' : hero.status === 'Injured' ? 'destructive' : 'secondary'">
          {{ hero.status }}
        </span>
        <span hlmBadge variant="outline">{{ hero.clearanceTier }}</span>
      </div>
    </hlm-card>

    <hlm-tabs [tab]="vm.tab()" (tabChange)="vm.tab.set($event)" class="w-full">
      <hlm-tabs-list class="grid w-full grid-cols-4" aria-label="Hero sections">
        <button hlmTabsTrigger="overview">Overview</button>
        <button hlmTabsTrigger="powers">Powers</button>
        <button hlmTabsTrigger="missions">Missions</button>
        <button hlmTabsTrigger="edit">Edit</button>
      </hlm-tabs-list>

      <div hlmTabsContent="overview">
        <div class="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <!-- dossier key/value pairs: Power Index, Clearance Tier, Missions, Success Rate -->
          <!-- and the bio, using the same markup as the current summary block -->
        </div>
      </div>

      <div hlmTabsContent="powers">
        <div class="grid gap-4">
          <app-power-meter label="Power Index" [value]="hero.power" [max]="100" />
          <app-power-meter label="Success Rate" [value]="hero.successRate * 100" [max]="100" />
          <app-power-meter label="Threats Faced" [value]="hero.threatsFaced" [max]="50" />
        </div>
      </div>

      <div hlmTabsContent="missions">
        @if (vm.missions().length) {
          <div class="grid gap-3">
            @for (mission of vm.missions(); track mission.id) {
              <hlm-card>
                <hlm-card-header>
                  <h3 hlmCardTitle>{{ mission.codename }}</h3>
                  <p hlmCardDescription>{{ mission.objective }}</p>
                  <div hlmCardAction>
                    <span hlmBadge [variant]="mission.status === 'Complete' ? 'default' : mission.status === 'Failed' ? 'destructive' : 'secondary'">
                      {{ mission.status }}
                    </span>
                  </div>
                </hlm-card-header>
                <div hlmCardContent class="text-sm text-muted-foreground">
                  Started {{ mission.startedOn | date: 'mediumDate' }}
                </div>
              </hlm-card>
            }
          </div>
        } @else {
          <p class="text-muted-foreground">No missions on record for this hero.</p>
        }
      </div>

      <div hlmTabsContent="edit">
        <app-hero-form [initialValue]="hero" (saveHero)="vm.saveHero($event)" (cancel)="vm.cancelEdit()" />
      </div>
    </hlm-tabs>
  } @else {
    <p class="text-center text-muted-foreground">Hero not found</p>
  }
</div>
```

Fill in the Overview grid with the four dossier pairs and the bio, using the markup already present in the current file. Verify the exact `hlm-tabs` two-way binding against the MCP output: if `hlm-tabs` exposes a `tab` model rather than an input plus a `tabChange` output, use `[(tab)]="vm.tab"` instead of the input and output pair shown above.

- [ ] **Step 5: Update the component's imports**

In `src/app/hero-detail/hero-detail.ts`, add `HlmTabsImports` from `@spartan-ng/helm/tabs`, `HlmCardImports` from `@spartan-ng/helm/card`, `PowerMeter` from `'../ui/power-meter'`, and `DatePipe` from `@angular/common` to the `imports` array. Keep `HeroDetailViewModel` in `providers`.

- [ ] **Step 6: Run the whole verification bar**

Run each command in the verification bar, with `npm run check:boot -- --route detail/11`.

Expected: every command passes; all four counters report `"all": 0`. If the boot check reports a runtime error, the tabs binding shape is wrong — go back to the MCP output rather than guessing.

- [ ] **Step 7: Commit**

```bash
git add src/app/hero-detail src/app/ui/power-meter.ts
git commit -m "feat(detail): restructure hero detail onto hlm-tabs with a real missions tab"
```

**Presence list for the reviewer:**
- `hlm-tabs`, `hlm-tabs-list`, four `hlmTabsTrigger` buttons and four `hlmTabsContent` panels are present
- `hlm-tabs-list` carries an `aria-label`
- the string `isEditing` appears nowhere in `src/app/`
- the Missions tab renders from `vm.missions()`, which comes from `MissionService.forHero`, not from a literal
- `app-power-meter` is rendered at least once and carries `role="meter"` with `aria-valuenow`
- `src/app/ui/stat-tile.ts`, `src/app/ui/hero-card.ts` and `src/app/dashboard/` are untouched by this commit

---

### Task 4: Missions screen, mission form, and the switch

**Files:**
- Modify: `src/app/forms/form-field-meta.ts`
- Modify: `src/app/mission/mission.schema.ts` (the `priority` field's `control` only)
- Create: `src/app/ui/mission-form.ts`
- Create: `src/app/missions/missions.view-model.ts`
- Modify: `src/app/missions/missions.ts` (whole file replaced)
- Create: `src/app/missions/missions.html`

**Interfaces:**
- Consumes: `MissionService`, `ThreatService`, `MissionFormModel`, `missionSchema` from Task 2; `formMeta` from `src/app/forms/zod-meta.ts`; `HlmSwitchImports` from `@spartan-ng/helm/switch`.
- Produces:
  - `ControlKind` gains `'switch'`.
  - `class MissionForm` (in `src/app/ui/`) with `initialValue: input<MissionFormModel>`, `threatOptions: input<ReadonlyArray<{ value: string; label: string }>>`, `submitLabel: input<string>`, `saveMission: output<MissionFormModel>`, `cancel: output<void>`.
  - `class MissionsViewModel` with `searchQuery`, `statusFilter`, `priorityOnly`, `filtered`, `threatOptions`, `editing`, `startCreate()`, `startEdit(id)`, `save(model)`, `remove(id)`.

- [ ] **Step 1: Add the switch control kind**

In `src/app/forms/form-field-meta.ts`, change the `ControlKind` union to include `'switch'`:

```ts
export type ControlKind = 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'switch' | 'textarea';
```

In `src/app/mission/mission.schema.ts`, change the `priority` field's meta from `control: 'checkbox'` to `control: 'switch'`.

- [ ] **Step 2: Write the failing ViewModel test**

Create `src/app/missions/missions.view-model.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { MissionsViewModel } from './missions.view-model';
import { MissionService } from '../mission/mission.service';

describe('MissionsViewModel', () => {
  let vm: MissionsViewModel;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MissionsViewModel] });
    vm = TestBed.inject(MissionsViewModel);
  });

  it('lists every mission by default', () => {
    expect(vm.filtered().length).toBe(TestBed.inject(MissionService).missions().length);
  });

  it('filters by codename', () => {
    const target = TestBed.inject(MissionService).missions()[0];
    vm.searchQuery.set(target.codename.toLowerCase());
    expect(vm.filtered().map((m) => m.id)).toContain(target.id);
  });

  it('filters by status', () => {
    vm.statusFilter.set('Active');
    expect(vm.filtered().every((m) => m.status === 'Active')).toBe(true);
  });

  it('filters to priority missions only', () => {
    vm.priorityOnly.set(true);
    expect(vm.filtered().every((m) => m.priority)).toBe(true);
  });

  it('creates a mission through save when nothing is being edited', () => {
    const before = TestBed.inject(MissionService).missions().length;
    vm.startCreate();
    vm.save({
      codename: 'Deep Quiet',
      objective: 'Survey the shelf',
      status: 'Planned',
      priority: false,
      threatId: null,
      startedOn: '2026-09-07',
      debrief: '',
    });
    expect(TestBed.inject(MissionService).missions().length).toBe(before + 1);
  });

  it('removes a mission', () => {
    const service = TestBed.inject(MissionService);
    const target = service.missions()[0];
    vm.remove(target.id);
    expect(service.byId(target.id)).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test`

Expected: FAIL, cannot resolve `./missions.view-model`.

- [ ] **Step 4: Write the ViewModel**

Create `src/app/missions/missions.view-model.ts`:

```ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { MissionService } from '../mission/mission.service';
import { ThreatService } from '../threat/threat.service';
import type { MissionStatus } from '../mission/mission.model';
import type { MissionFormModel } from '../mission/mission.schema';

@Injectable()
export class MissionsViewModel {
  private readonly missionService = inject(MissionService);
  private readonly threatService = inject(ThreatService);

  readonly missions = this.missionService.missions;

  readonly searchQuery = signal('');
  readonly statusFilter = signal<MissionStatus | 'all'>('all');
  readonly priorityOnly = signal(false);

  /** The id of the mission being edited, '' for a new one, or null when closed. */
  readonly editing = signal<string | null>(null);

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const status = this.statusFilter();
    const priorityOnly = this.priorityOnly();
    return this.missions()
      .filter((m) => status === 'all' || m.status === status)
      .filter((m) => !priorityOnly || m.priority)
      .filter((m) => !q || m.codename.toLowerCase().includes(q) || m.objective.toLowerCase().includes(q));
  });

  readonly threatOptions = computed(() =>
    this.threatService.threats().map((t) => ({ value: t.id, label: t.designation })),
  );

  readonly editingMission = computed(() => {
    const id = this.editing();
    return id ? this.missionService.byId(id) : undefined;
  });

  startCreate(): void {
    this.editing.set('');
  }

  startEdit(id: string): void {
    this.editing.set(id);
  }

  cancel(): void {
    this.editing.set(null);
  }

  save(model: MissionFormModel): void {
    const id = this.editing();
    if (id) {
      this.missionService.update(id, model);
    } else {
      this.missionService.create(model);
    }
    this.editing.set(null);
  }

  remove(id: string): void {
    this.missionService.remove(id);
    if (this.editing() === id) this.editing.set(null);
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`

Expected: PASS.

- [ ] **Step 6: Read the switch documentation**

Call the spartan MCP: `spartan_components_get` with name `switch`. Confirm how the label associates. The documented pattern wraps the switch in the label:

```html
<label class="flex items-center" hlmLabel>
  <hlm-switch class="mr-2" />
  Airplane mode
</label>
```

Do not write `<label for="x">` pointing at `<hlm-switch id="x">`: `hlm-switch` is a custom element and a plain `id` lands on the host, associating the label with nothing interactive. `HlmSwitch` exposes an `inputId` input if an explicit association is genuinely needed.

- [ ] **Step 7: Write the mission form**

Create `src/app/ui/mission-form.ts`, following `src/app/ui/hero-form.ts` exactly in shape: module-level `formMeta(missionSchema)`, a `project` narrowing function, a `sameValue` comparator, a `seed` computed with `{ equal: sameValue }`, a `model` built with `linkedSignal`, and `heroForm`-equivalent built with `form(this.model, (path) => validateStandardSchema(path, missionSchema), { submission: { action: async (field) => this.saveMission.emit(field().value()) } })`.

The template is a `<form [formRoot]="missionForm">` containing an `hlm-field-group`, one `hlm-field` per field with `hlmFieldLabel`, and `@for` over `errors()` rendering `hlm-field-error`. The controls are: `hlmInput` for `codename`, `objective` and `startedOn`; `hlm-select` with `hlm-select-trigger`, `hlm-select-value` and `hlm-select-content *hlmSelectPortal` for `status` and for `threatId` (whose options come from the `threatOptions` input); `hlmTextarea` for `debrief`; and for `priority`:

```html
<hlm-field>
  <label hlmFieldLabel class="flex items-center gap-2">
    <hlm-switch [formField]="missionForm.priority" />
    {{ meta['priority'].label }}
  </label>
  @for (error of missionForm.priority().errors(); track error) {
    <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
  }
</hlm-field>
```

The submit row is `<hlm-field orientation="horizontal">` holding `<button hlmBtn type="submit">` and `<button hlmBtn type="button" variant="outline" (click)="cancel.emit()">`. There is no `(ngSubmit)` anywhere.

- [ ] **Step 8: Verify the switch actually binds**

Run: `npm run build`, then `npm run check:boot -- --route missions` once Step 9 has created the screen.

If `[formField]` does not bind to `hlm-switch`, replace that one line with `[checked]="missionForm.priority().value()" (checkedChange)="missionForm.priority().value.set($event)"` and record in your final response that the fallback was needed. Do not reach for `ngModel` under any circumstances; it is gated.

- [ ] **Step 9: Write the screen**

Replace the whole of `src/app/missions/missions.ts`:

```ts
import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { MissionForm } from '../ui/mission-form';
import { MissionsViewModel } from './missions.view-model';

@Component({
  selector: 'app-missions',
  providers: [MissionsViewModel],
  imports: [
    DatePipe,
    NgIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmDialogImports,
    HlmInputImports,
    HlmTableImports,
    MissionForm,
  ],
  templateUrl: './missions.html',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
```

Create `src/app/missions/missions.html`, mirroring `src/app/roster/roster.html`: a header row with the screen title and a "New mission" button; a filter bar with an `hlmInput` search and a priority toggle; an `hlmTable` inside `<div class="hidden sm:block overflow-x-auto">` with columns Codename, Objective, Status, Priority, Started, Actions; a `<div class="grid gap-4 sm:hidden">` card list for narrow viewports; and a footer count. Create, edit and delete all happen inside `hlm-dialog` with `hlm-dialog-content *hlmDialogPortal`, exactly as `hero-detail.html` does, each with an `hlmDialogTitle`. The create and edit dialogs host `<app-mission-form>`; the delete dialog is a confirmation with `hlmDialogClose` buttons.

Icons used here must be registered. `provideIcons` is already called at root in `app.config.ts`; add any new lucide names you use (`lucideTarget`, `lucidePlus`, `lucidePencil`, `lucideTrash2`, `lucideFlag`) there if they are not already registered, and confirm the exact export names against the installed `@ng-icons/lucide`.

- [ ] **Step 10: Run the whole verification bar**

Run each command in the verification bar, with `npm run check:boot -- --route missions`.

Expected: every command passes; all four counters report `"all": 0`.

- [ ] **Step 11: Commit**

```bash
git add src/app/missions src/app/ui/mission-form.ts src/app/forms/form-field-meta.ts src/app/mission/mission.schema.ts
git commit -m "feat(missions): missions screen with dialog CRUD and a priority switch"
```

**Presence list for the reviewer:**
- `hlm-switch` appears in `mission-form.ts`, wrapped by its label rather than associated with `for`
- `ControlKind` includes `'switch'` and the schema's `priority` uses it
- `missions.html` contains `hlmTable`, `hlmBadge`, and an `@for` over `vm.filtered()`
- every `hlm-dialog-content` sits on `*hlmDialogPortal` and has an `hlmDialogTitle`
- `MissionService.create`, `update` and `remove` are each reachable from a template path
- the `/missions` route renders substantive content, not an `<h1>` alone
- the strings `ngModel`, `ngSubmit`, `FormsModule` and `ReactiveFormsModule` appear nowhere in `src/app/`

---

### Task 5: Threats screen (runs in parallel with Task 6)

**Files:**
- Create: `src/app/ui/threat-form.ts`
- Create: `src/app/threats/threats.view-model.ts`, `src/app/threats/threats.view-model.spec.ts`
- Modify: `src/app/threats/threats.ts` (whole file replaced)
- Create: `src/app/threats/threats.html`

**Do not touch `src/app/settings/*` or `src/app/roster/*`. Task 6 owns those files and is running at the same time.**

**Interfaces:**
- Consumes: `ThreatService`, `ThreatFormModel`, `threatSchema` from Task 2. `MissionService` for the "linked missions" count.
- Produces: `class ThreatForm` with `initialValue: input<ThreatFormModel>`, `submitLabel: input<string>`, `saveThreat: output<ThreatFormModel>`, `cancel: output<void>`. `class ThreatsViewModel` with `searchQuery`, `levelFilter`, `statusFilter`, `filtered`, `editing`, `startCreate()`, `startEdit(id)`, `cancel()`, `save(model)`, `remove(id)`, `missionCount(threatId)`.

- [ ] **Step 1: Write the failing ViewModel test**

Create `src/app/threats/threats.view-model.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { ThreatsViewModel } from './threats.view-model';
import { ThreatService } from '../threat/threat.service';

describe('ThreatsViewModel', () => {
  let vm: ThreatsViewModel;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ThreatsViewModel] });
    vm = TestBed.inject(ThreatsViewModel);
  });

  it('lists every threat by default', () => {
    expect(vm.filtered().length).toBe(TestBed.inject(ThreatService).threats().length);
  });

  it('filters by designation', () => {
    const target = TestBed.inject(ThreatService).threats()[0];
    vm.searchQuery.set(target.designation.toLowerCase());
    expect(vm.filtered().map((t) => t.id)).toContain(target.id);
  });

  it('filters by level', () => {
    vm.levelFilter.set('Critical');
    expect(vm.filtered().every((t) => t.level === 'Critical')).toBe(true);
  });

  it('filters by status', () => {
    vm.statusFilter.set('Active');
    expect(vm.filtered().every((t) => t.status === 'Active')).toBe(true);
  });

  it('creates a threat through save when nothing is being edited', () => {
    const service = TestBed.inject(ThreatService);
    const before = service.threats().length;
    vm.startCreate();
    vm.save({
      designation: 'Pale Circuit',
      category: 'Rogue',
      level: 'Moderate',
      status: 'Active',
      location: 'Osaka',
      firstSeenOn: '2026-09-05',
      notes: '',
    });
    expect(service.threats().length).toBe(before + 1);
  });

  it('removes a threat', () => {
    const service = TestBed.inject(ThreatService);
    const target = service.threats()[0];
    vm.remove(target.id);
    expect(service.byId(target.id)).toBeUndefined();
  });

  it('counts the missions linked to a threat', () => {
    const linked = TestBed.inject(ThreatService).threats()[0];
    expect(typeof vm.missionCount(linked.id)).toBe('number');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`

Expected: FAIL, cannot resolve `./threats.view-model`.

- [ ] **Step 3: Write the ViewModel**

Create `src/app/threats/threats.view-model.ts`:

```ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { MissionService } from '../mission/mission.service';
import { ThreatService } from '../threat/threat.service';
import type { ThreatLevel, ThreatStatus } from '../threat/threat.model';
import type { ThreatFormModel } from '../threat/threat.schema';

@Injectable()
export class ThreatsViewModel {
  private readonly threatService = inject(ThreatService);
  private readonly missionService = inject(MissionService);

  readonly threats = this.threatService.threats;

  readonly searchQuery = signal('');
  readonly levelFilter = signal<ThreatLevel | 'all'>('all');
  readonly statusFilter = signal<ThreatStatus | 'all'>('all');

  /** The id of the threat being edited, '' for a new one, or null when closed. */
  readonly editing = signal<string | null>(null);

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const level = this.levelFilter();
    const status = this.statusFilter();
    return this.threats()
      .filter((t) => level === 'all' || t.level === level)
      .filter((t) => status === 'all' || t.status === status)
      .filter((t) => !q || t.designation.toLowerCase().includes(q) || t.location.toLowerCase().includes(q));
  });

  readonly editingThreat = computed(() => {
    const id = this.editing();
    return id ? this.threatService.byId(id) : undefined;
  });

  missionCount(threatId: string): number {
    return this.missionService.missions().filter((m) => m.threatId === threatId).length;
  }

  startCreate(): void {
    this.editing.set('');
  }

  startEdit(id: string): void {
    this.editing.set(id);
  }

  cancel(): void {
    this.editing.set(null);
  }

  save(model: ThreatFormModel): void {
    const id = this.editing();
    if (id) {
      this.threatService.update(id, model);
    } else {
      this.threatService.create(model);
    }
    this.editing.set(null);
  }

  remove(id: string): void {
    this.threatService.remove(id);
    if (this.editing() === id) this.editing.set(null);
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`

Expected: PASS.

- [ ] **Step 5: Write the threat form**

Create `src/app/ui/threat-form.ts`, following `src/app/ui/hero-form.ts` exactly in shape: module-level `formMeta(threatSchema)`, a `project` narrowing function over the seven fields, a `sameValue` comparator, a `seed` computed with `{ equal: sameValue }`, a `model` built with `linkedSignal`, and `threatForm` built with `form(this.model, (path) => validateStandardSchema(path, threatSchema), { submission: { action: async (field) => this.saveThreat.emit(field().value()) } })`.

The template is `<form [formRoot]="threatForm">` containing an `hlm-field-group`, one `hlm-field` per field with `hlmFieldLabel`, and `@for` over `errors()` rendering `hlm-field-error`. Controls: `hlmInput` for `designation`, `location` and `firstSeenOn`; `hlm-select` with `hlm-select-trigger`, `hlm-select-value` and `hlm-select-content *hlmSelectPortal` for `category`, `level` and `status`; `hlmTextarea` for `notes`. The submit row is `<hlm-field orientation="horizontal">` with `<button hlmBtn type="submit">` and `<button hlmBtn type="button" variant="outline" (click)="cancel.emit()">`. There is no `(ngSubmit)`.

- [ ] **Step 6: Write the screen**

Replace the whole of `src/app/threats/threats.ts`:

```ts
import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ThreatForm } from '../ui/threat-form';
import { ThreatsViewModel } from './threats.view-model';

@Component({
  selector: 'app-threats',
  providers: [ThreatsViewModel],
  imports: [
    DatePipe,
    NgIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmDialogImports,
    HlmInputImports,
    HlmTableImports,
    ThreatForm,
  ],
  templateUrl: './threats.html',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
```

Create `src/app/threats/threats.html`, mirroring `src/app/roster/roster.html`: a header row with the screen title and a "Log threat" button; a filter bar with an `hlmInput` search; an `hlmTable` inside `<div class="hidden sm:block overflow-x-auto">` with columns Designation, Category, Level, Status, Location, Missions, Actions, where Level and Status render as `hlmBadge` with the variant chosen from the value; a `<div class="grid gap-4 sm:hidden">` card list for narrow viewports; and a footer count. Create, edit and delete all happen inside `hlm-dialog` with `hlm-dialog-content *hlmDialogPortal`, each with an `hlmDialogTitle`.

Register any new lucide icon names in `provideIcons` in `app.config.ts` and confirm the exact export names against the installed `@ng-icons/lucide`.

- [ ] **Step 7: Run the whole verification bar**

Run each command in the verification bar, with `npm run check:boot -- --route threats`.

Expected: every command passes; all four counters report `"all": 0`.

- [ ] **Step 8: Commit**

```bash
git add src/app/threats src/app/ui/threat-form.ts src/app/app.config.ts
git commit -m "feat(threats): threats screen with dialog CRUD"
```

**Presence list for the reviewer:**
- `threats.html` contains `hlmTable`, `hlmBadge`, and an `@for` over `vm.filtered()`
- every `hlm-dialog-content` sits on `*hlmDialogPortal` and has an `hlmDialogTitle`
- `ThreatService.create`, `update` and `remove` are each reachable from a template path
- the `/threats` route renders substantive content, not an `<h1>` alone
- `src/app/settings/` and `src/app/roster/` are untouched by this commit

---

### Task 6: Settings screen and roster preferences (runs in parallel with Task 5)

**Files:**
- Create: `src/app/settings/settings.view-model.ts`, `src/app/settings/settings.view-model.spec.ts`
- Modify: `src/app/settings/settings.ts` (whole file replaced)
- Create: `src/app/settings/settings.html`
- Modify: `src/app/roster/roster.view-model.ts`

**Do not touch `src/app/threats/*` or `src/app/ui/threat-form.ts`. Task 5 owns those files and is running at the same time.**

**Interfaces:**
- Consumes: `PreferencesService`, `ThemeChoice`, `RosterSort` from Task 1.
- Produces: `class SettingsViewModel` with `readonly theme`, `readonly rosterSort`, `readonly rosterStatus`, `readonly compactTables`, and `setTheme(v)`, `setRosterSort(v)`, `setRosterStatus(v)`, `setCompactTables(v)`.

- [ ] **Step 1: Write the failing ViewModel test**

Create `src/app/settings/settings.view-model.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { SettingsViewModel } from './settings.view-model';
import { PreferencesService } from '../preferences/preferences.service';

describe('SettingsViewModel', () => {
  let vm: SettingsViewModel;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [SettingsViewModel] });
    vm = TestBed.inject(SettingsViewModel);
  });

  it('reads the current preferences', () => {
    expect(vm.theme()).toBe('system');
    expect(vm.compactTables()).toBe(false);
  });

  it('writes the theme through to the service', () => {
    vm.setTheme('dark');
    expect(TestBed.inject(PreferencesService).theme()).toBe('dark');
    expect(vm.theme()).toBe('dark');
  });

  it('writes the roster sort through to the service', () => {
    vm.setRosterSort('name');
    expect(TestBed.inject(PreferencesService).rosterSort()).toBe('name');
  });

  it('writes compact tables through to the service', () => {
    vm.setCompactTables(true);
    expect(TestBed.inject(PreferencesService).compactTables()).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`

Expected: FAIL, cannot resolve `./settings.view-model`.

- [ ] **Step 3: Write the ViewModel**

Create `src/app/settings/settings.view-model.ts`:

```ts
import { Injectable, computed, inject } from '@angular/core';
import { PreferencesService, type RosterSort, type ThemeChoice } from '../preferences/preferences.service';
import type { HeroStatus } from '../hero/hero.model';

@Injectable()
export class SettingsViewModel {
  private readonly preferences = inject(PreferencesService);

  readonly theme = computed(() => this.preferences.theme());
  readonly rosterSort = computed(() => this.preferences.rosterSort());
  readonly rosterStatus = computed(() => this.preferences.rosterStatus());
  readonly compactTables = computed(() => this.preferences.compactTables());

  readonly themeOptions: ReadonlyArray<{ value: ThemeChoice; label: string }> = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'Follow system' },
  ];

  readonly sortOptions: ReadonlyArray<{ value: RosterSort; label: string }> = [
    { value: 'power', label: 'Power index' },
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
  ];

  setTheme(theme: ThemeChoice): void {
    this.preferences.setTheme(theme);
  }

  setRosterSort(sort: RosterSort): void {
    this.preferences.setRosterSort(sort);
  }

  setRosterStatus(status: HeroStatus | 'all'): void {
    this.preferences.setRosterStatus(status);
  }

  setCompactTables(compact: boolean): void {
    this.preferences.setCompactTables(compact);
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`

Expected: PASS.

- [ ] **Step 5: Write the screen**

Replace the whole of `src/app/settings/settings.ts`:

```ts
import { Component, inject } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { SettingsViewModel } from './settings.view-model';

@Component({
  selector: 'app-settings',
  providers: [SettingsViewModel],
  imports: [HlmButtonImports, HlmCardImports, HlmSelectImports, HlmSwitchImports],
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
```

Create `src/app/settings/settings.html` with two `hlm-card` sections. The first, "Appearance", holds a three-option theme control built from `vm.themeOptions` and a `hlm-switch` for compact tables. The second, "Roster defaults", holds an `hlm-select` bound to `vm.rosterSort()` writing through `vm.setRosterSort($event)` and an `hlm-select` for the default status filter. The compact-tables switch uses the wrapping-label form:

```html
<label hlmLabel class="flex items-center gap-2">
  <hlm-switch [checked]="vm.compactTables()" (checkedChange)="vm.setCompactTables($event)" />
  Compact tables
</label>
```

This screen is not a Signal Form: these controls write straight through to a service rather than validating a model, so they use `[checked]` and `(checkedChange)` directly. Add `HlmLabelImports` from `@spartan-ng/helm/label` to the component's imports for `hlmLabel`.

- [ ] **Step 6: Seed the roster from preferences**

In `src/app/roster/roster.view-model.ts`, inject `PreferencesService` and change the two state signals to seed from it, and add the sort:

```ts
  private readonly preferences = inject(PreferencesService);

  readonly searchQuery = signal('');
  // linkedSignal, not signal: the user's saved default is the starting value,
  // and changing it in Settings reseeds this screen rather than being ignored
  // until a reload.
  readonly statusFilter = linkedSignal(() => this.preferences.rosterStatus());
  readonly heroes = this.heroService.heroes;

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const status = this.statusFilter();
    const sort = this.preferences.rosterSort();
    return this.heroes()
      .filter((h) => status === 'all' || h.status === status)
      .filter((h) => !q || h.name.toLowerCase().includes(q) || h.alias.toLowerCase().includes(q))
      .sort((a, b) =>
        sort === 'name' ? a.name.localeCompare(b.name)
        : sort === 'status' ? a.status.localeCompare(b.status)
        : b.power - a.power,
      );
  });
```

Import `linkedSignal` from `@angular/core` and `PreferencesService` from `'../preferences/preferences.service'`. Leave `editHero` and `retireHero` exactly as they are.

- [ ] **Step 7: Run the whole verification bar**

Run each command in the verification bar, with `npm run check:boot -- --route settings --route roster`.

Expected: every command passes; all four counters report `"all": 0`.

- [ ] **Step 8: Commit**

```bash
git add src/app/settings src/app/roster/roster.view-model.ts
git commit -m "feat(settings): theme control and roster defaults that actually change the roster"
```

**Presence list for the reviewer:**
- `settings.html` contains `hlm-card`, `hlm-switch` and `hlm-select`, and the string "under construction" is gone
- every control on the screen writes through to `PreferencesService`; none is decorative
- the theme control offers all three states including "Follow system"
- `RosterViewModel.filtered` reads `preferences.rosterSort()`, so changing the setting visibly reorders the roster
- `src/app/threats/` is untouched by this commit

---

### Task 7: Integration pass

**Files:**
- Modify: `src/app/app.html`
- Modify: `src/app/app.routes.ts` (only if a route is missing)
- Modify: `src/app/app.config.ts` (icon registration only)
- Modify: `src/app/recruit/recruit.html` and `src/app/recruit/recruit.ts` (card refactor missed by the plan's original inventory — see Step 0)

**Interfaces:**
- Consumes: everything built in Tasks 1 through 6.
- Produces: no new API.

- [ ] **Step 0: Finish the card refactor the plan's inventory missed**

The plan originally listed five hand-rolled cards; there are six. `src/app/recruit/recruit.html:6` carries a `rounded-lg border border-border bg-card p-6` block that fell into no task's manifest, so Task 3a correctly refused to touch it. Replace it with `hlm-card` and its parts, and add `HlmCardImports` from `@spartan-ng/helm/card` to `src/app/recruit/recruit.ts`.

Confirm no hand-rolled card survives anywhere:

```bash
grep -rn "rounded-lg border border-border bg-card" src/app
```

Expected: no output.

- [ ] **Step 1: Reconcile the navigation**

Open `src/app/app.html`. Task 1 wrapped `<hlm-sidebar>` in a `<nav>` landmark and left the interior content indented one level shallower than its new nesting depth — reindent that block. Then confirm the sidebar has exactly six `hlmSidebarMenuItem` entries routing to `/dashboard`, `/roster`, `/missions`, `/threats`, `/recruit` and `/settings`, each with the icon named in the build spec: `lucideLayoutDashboard`, `lucideUsers`, `lucideTarget`, `lucideShieldAlert`, `lucideUserPlus`, `lucideSettings`. Add any that are missing. Confirm the theme toggle in the top bar calls `vm.toggleTheme()` and renders `lucideSun` or `lucideMoon` from `vm.isDark()`.

- [ ] **Step 2: Confirm every icon is registered**

Run: `grep -rho "name=\"lucide[A-Za-z]*\"" src/app | sort -u`

Cross-check every name against the `provideIcons` call in `src/app/app.config.ts`. Add any missing registration. An unregistered icon renders blank and no counter sees it.

- [ ] **Step 3: Remove dead code**

Search `src/app/` for anything no longer reachable: an unused import, a ViewModel member nothing binds to, a leftover helper. Delete it. Do not delete anything a template still references.

- [ ] **Step 4: Run the full bar including responsive**

Run every command in the verification bar with all seven routes:

```bash
npm run check:boot -- --route dashboard --route roster --route detail/11 --route missions --route threats --route recruit --route settings
npm run check:responsive
```

Expected: boot reports 7 routes rendered with no runtime errors; responsive passes at 375, 768 and 1280.

- [ ] **Step 5: Roll up the firing telemetry**

Run: `npm run firings`

Record the total, the per-hook breakdown, and which rules fired, in your final response. This is the measurement the whole exercise exists to produce; a run with zero firings across eight tasks is a result to report, not a success to claim.

- [ ] **Step 6: Commit**

```bash
git add src/app
git commit -m "chore(integrate): navigation, icon registration and dead code"
```

**Presence list for the reviewer:**
- all seven routes boot clean in one command
- every `lucide*` name used in a template appears in `provideIcons`
- the sidebar routes to all six screens
- `npm run check:responsive` passes at all three widths
- no route's template is an `<h1>` alone

---

## Self-Review

**Spec coverage.** Every section of the design maps to a task: the theme defect and persistence to T1; the Mission and Threat domain, referential integrity and the dashboard wiring to T2; the card refactor to T3a; the tabs restructure and power meter to T3b; the missions screen, switch and `ControlKind` change to T4; the threats screen to T5; the Settings screen and roster preferences wiring to T6; navigation and icon reconciliation to T7. The verification bar, presence lists and firing telemetry appear in every task and in T7 respectively.

**Known gap, deliberately left.** Editing a mission's `heroIds` is not in any task. The mission form covers every scalar field; hero assignment comes from example data only. A multi-select assignment control is not in the sealed vocabulary and would have been the single riskiest piece of markup in the plan. If assignment editing is wanted, it is a ninth task, not a widening of Task 4.

**Type consistency.** `MissionFormModel` omits `heroIds`, so `MissionService.create` supplies `heroIds: []` before spreading the candidate; `update` takes `Partial<MissionFormModel>` and therefore can never write `heroIds`, which is consistent with the gap above. `ThreatFormModel` covers every `Threat` field except `id`, so `create` spreads it whole. `MissionsViewModel.save` and `ThreatsViewModel.save` both use `editing() === ''` to mean "creating", and both tests exercise that path. `PreferencesService` exposes `theme`/`rosterSort`/`rosterStatus`/`compactTables` as computed reads plus four setters, and both `AppShellViewModel` and `SettingsViewModel` use exactly those names.

**Risks carried forward.** `[formField]` on `hlm-switch` is unproven and Task 4 Step 8 is the verification with a documented fallback. The `hlm-tabs` two-way binding shape is unconfirmed and Task 3b Step 4 says to check the MCP output rather than guess. The bundle-budget warning is expected and is not a build failure.
