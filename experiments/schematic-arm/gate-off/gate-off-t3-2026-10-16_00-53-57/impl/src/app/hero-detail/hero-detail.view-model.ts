import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import type { Hero } from '../domain/hero';
import { heroSchema, type HeroModel } from './hero-detail.schema';

/** The form's starting values for a hero. With no hero loaded, the form is blank. */
function toModel(hero: Hero | undefined): HeroModel {
  return {
    name: hero?.name ?? '',
    alias: hero?.alias ?? '',
    powerClass: hero?.powerClass ?? 'Aerial',
    powerIndex: hero?.powerIndex ?? 0,
    notes: hero?.notes ?? '',
    active: hero?.status === 'Active',
  };
}

// Owns the hero detail screen: the hero named by the route, the edit form, and the
// deploy, save, cancel and retire actions. Component-scoped, no DOM.
@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly route = inject(ActivatedRoute);

  // The router reuses this component when only :id changes, so the id is a stream, not a snapshot.
  private readonly heroId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  readonly hero = computed(() => this.heroService.byId(this.heroId()));

  readonly canDeploy = computed(() => this.hero()?.status === 'Active');

  /** The hero's saved values. The form restarts from these whenever the hero changes. */
  private readonly savedModel = computed(() => toModel(this.hero()));

  // A linked signal: it follows the saved hero, but keeps edits made in the form until the next save or cancel.
  private readonly model = linkedSignal<HeroModel>(() => this.savedModel());

  readonly form = form(this.model, (path) => validateStandardSchema(path, heroSchema));

  /** Status line for the screen, announced politely. Empty when there is nothing to report. */
  readonly notice = signal('');

  // Form submit path: the schema gates it, so the action only runs on valid values.
  save(event: Event): void {
    event.preventDefault();
    void submit(this.form, async () => {
      const current = this.hero();
      if (!current) {
        return;
      }
      const values = this.model();
      // The switch moves a hero between Active and Reserve. A status the switch did not change is kept as it was.
      const wasActive = current.status === 'Active';
      const status = values.active === wasActive ? current.status : values.active ? 'Active' : 'Reserve';
      this.heroService.update(current.id, {
        name: values.name,
        alias: values.alias,
        powerClass: values.powerClass,
        powerIndex: values.powerIndex,
        notes: values.notes,
        status,
      });
      this.notice.set(`${values.name} saved.`);
    });
  }

  cancel(): void {
    this.model.set(this.savedModel());
    this.notice.set('');
  }

  /** Logs one mission against an active hero. The roster record keeps only totals, so this adds one to the count. */
  deploy(): void {
    const current = this.hero();
    if (!current || current.status !== 'Active') {
      return;
    }
    const missionCount = current.missionCount + 1;
    this.heroService.update(current.id, { missionCount });
    this.notice.set(`${current.name} deployed. Missions on record: ${missionCount}.`);
  }

  /** Removes the hero from the roster. Returns true if it was removed, so the caller knows to leave the screen. */
  retire(): boolean {
    const current = this.hero();
    return current !== undefined && this.heroService.remove(current.id);
  }
}
