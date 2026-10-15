import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { formMeta } from '../forms/zod-meta';
import { POWER_CLASSES, type Hero, type HeroStatus, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { HERO_STATUS_BADGE, initialsOf, type StatusBadge } from '../ui/hero-format';
import { heroEditSchema, type HeroModel } from './hero-detail.schema';

/** The four panels of the detail screen. */
export type DetailTab = 'overview' | 'powers' | 'missions' | 'edit';

const DETAIL_TABS: readonly DetailTab[] = ['overview', 'powers', 'missions', 'edit'];

/** The edit form's value when there is no hero to edit. Never shown: the form only renders for a loaded hero. */
const EMPTY_EDIT: HeroModel = {
  name: '',
  alias: '',
  powerClass: POWER_CLASSES[0],
  powerIndex: 0,
  notes: '',
  active: false,
};

function isDetailTab(value: string): value is DetailTab {
  return (DETAIL_TABS as readonly string[]).includes(value);
}

function isPowerClass(value: string | null | undefined): value is PowerClass {
  return (POWER_CLASSES as readonly string[]).includes(value ?? '');
}

function toEditModel(hero: Hero): HeroModel {
  return {
    name: hero.name,
    alias: hero.alias,
    powerClass: hero.powerClass,
    powerIndex: hero.powerIndex,
    notes: hero.notes,
    active: hero.status === 'Active',
  };
}

/**
 * The edit form's `active` switch maps onto the hero's status. Switching on lands on Active;
 * switching off from Active stands the hero down to Reserve. Any other status is kept as it is.
 */
function statusFor(current: HeroStatus, active: boolean): HeroStatus {
  if (active) {
    return 'Active';
  }
  return current === 'Active' ? 'Reserve' : current;
}

// Owns the detail screen's state: the hero from the route id, the active panel, the edit form,
// and the retire and deploy actions. Component-scoped (provided by HeroDetail), so no providedIn.
@Injectable()
export class HeroDetailViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** The `:id` route parameter. Read as a stream so the screen follows the id when the router reuses it. */
  private readonly heroId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  /** The hero this screen shows, or `undefined` when no hero has the id in the route. */
  readonly hero = computed(() => this.heroes.byId(this.heroId()));
  readonly initials = computed(() => initialsOf(this.hero()?.name ?? ''));
  readonly statusVariant = computed<StatusBadge>(() => {
    const hero = this.hero();
    return hero ? HERO_STATUS_BADGE[hero.status] : 'secondary';
  });

  /** Missions the hero is credited with as successes, derived from the mission count and success rate. */
  readonly successfulMissions = computed(() => {
    const hero = this.hero();
    return hero ? Math.round((hero.missions * hero.successRate) / 100) : 0;
  });

  /** Clearance tier as a share of the top tier, for the powers meter. */
  readonly clearanceShare = computed(() => {
    const hero = this.hero();
    return hero ? (hero.clearance / 5) * 100 : 0;
  });

  readonly tab = signal<DetailTab>('overview');

  /** Feedback line after an action. Read by a polite live region. */
  readonly notice = signal('');

  readonly labels = formMeta(heroEditSchema);
  readonly powerClasses = POWER_CLASSES;

  // Re-seeded from the hero whenever the hero changes, so the form always opens on the stored record.
  private readonly model = linkedSignal<HeroModel>(() => {
    const hero = this.hero();
    return hero ? toEditModel(hero) : EMPTY_EDIT;
  });

  readonly editForm = form(this.model, (path) => validateStandardSchema(path, heroEditSchema));

  setTab(value: string): void {
    if (isDetailTab(value)) {
      this.tab.set(value);
    }
  }

  setActive(value: boolean): void {
    this.editForm.active().value.set(value);
  }

  setPowerClass(value: string | null | undefined): void {
    if (isPowerClass(value)) {
      this.editForm.powerClass().value.set(value);
    }
  }

  /** Submit handler for the edit form. Prevents the native submit, then saves through the schema-validated form. */
  save(event: Event): void {
    event.preventDefault();
    void submit(this.editForm, async () => {
      const hero = this.hero();
      if (!hero) {
        return;
      }
      const model = this.model();
      const name = model.name.trim();
      this.heroes.update(hero.id, {
        name,
        alias: model.alias.trim(),
        powerClass: model.powerClass,
        powerIndex: model.powerIndex,
        notes: model.notes,
        status: statusFor(hero.status, model.active),
      });
      this.notice.set(`Saved changes to ${name}.`);
    });
  }

  /** Discards unsaved edits and returns to the Overview panel. */
  cancelEdit(): void {
    const hero = this.hero();
    if (hero) {
      this.model.set(toEditModel(hero));
    }
    this.tab.set('overview');
  }

  /** Records a deployment: the mission count goes up by one. Only an Active hero can deploy. */
  deploy(): void {
    const hero = this.hero();
    if (!hero) {
      return;
    }
    const updated = this.heroes.deploy(hero.id);
    if (updated) {
      this.notice.set(`${updated.alias} deployed. Mission count updated.`);
    }
  }

  /** Removes the hero from the roster and returns to the roster. */
  retire(): void {
    const hero = this.hero();
    if (!hero) {
      return;
    }
    this.heroes.retire(hero.id);
    void this.router.navigate(['/roster']);
  }
}
