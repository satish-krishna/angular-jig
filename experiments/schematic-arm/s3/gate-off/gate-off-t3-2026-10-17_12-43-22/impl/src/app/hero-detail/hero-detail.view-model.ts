import { Injectable, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { POWER_CLASSES, type Hero, type HeroChanges, type HeroStatus, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { formMeta } from '../forms/zod-meta';
import { heroSchema, type HeroModel } from './hero-detail.schema';

// The draft shown in the edit form. A missing hero gets a blank draft; the screen shows not-found instead.
function toModel(hero: Hero | undefined): HeroModel {
  return hero
    ? {
        name: hero.name,
        alias: hero.alias,
        powerClass: hero.powerClass,
        powerIndex: hero.powerIndex,
        notes: hero.notes,
        active: hero.status === 'Active',
      }
    : { name: '', alias: '', powerClass: POWER_CLASSES[0], powerIndex: 0, notes: '', active: false };
}

// Only an active hero moves to reserve when switched off. An injured or MIA hero keeps that status.
function toChanges(model: HeroModel, hero: Hero): HeroChanges {
  const status: HeroStatus = model.active ? 'Active' : hero.status === 'Active' ? 'Reserve' : hero.status;
  return {
    name: model.name.trim(),
    alias: model.alias.trim(),
    powerClass: model.powerClass,
    powerIndex: model.powerIndex,
    notes: model.notes.trim(),
    status,
  };
}

// The select hands its value back as unknown, so narrow it before it reaches the form.
function isPowerClass(value: unknown): value is PowerClass {
  return POWER_CLASSES.some((powerClass) => powerClass === value);
}

// Component-scoped: the detail screen provides it, so each hero gets a fresh draft.
@Injectable()
export class HeroDetailViewModel {
  private readonly heroes = inject(HeroService);
  private readonly missionLog = inject(MissionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Read from the observable, not a snapshot, because the router reuses this screen when only the id changes.
  private readonly _heroId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  public readonly hero = computed(() => this.heroes.byId(this._heroId()));

  public readonly canDeploy = computed(() => this.hero()?.status === 'Active');

  public readonly missions = computed(() =>
    this.missionLog.missions().filter((mission) => mission.heroId === this._heroId()),
  );

  public readonly fields = formMeta(heroSchema);

  public readonly classOptions = POWER_CLASSES.map((powerClass) => ({ value: powerClass, label: powerClass }));

  // Rebuilt from the saved hero whenever the hero changes, so a save or a route change resets the draft.
  private readonly draft = linkedSignal<HeroModel>(() => toModel(this.hero()));

  public readonly form = form(this.draft, (path) => validateStandardSchema(path, heroSchema));

  public setPowerClass(value: unknown): void {
    if (isPowerClass(value)) {
      this.form.powerClass().value.set(value);
    }
  }

  public setActive(value: boolean): void {
    this.form.active().value.set(value);
  }

  public save(): void {
    const hero = this.hero();
    if (!hero) {
      return;
    }
    void submit(this.form, async () => {
      this.heroes.update(hero.id, toChanges(this.draft(), hero));
      return undefined;
    });
  }

  public discard(): void {
    this.draft.set(toModel(this.hero()));
  }

  public deploy(): void {
    const hero = this.hero();
    if (!hero || !this.canDeploy()) {
      return;
    }
    this.missionLog.deploy(hero);
    void this.router.navigate(['/missions']);
  }

  public retire(): void {
    this.heroes.retire(this._heroId());
    void this.router.navigate(['/roster']);
  }
}
