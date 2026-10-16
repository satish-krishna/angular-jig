import { toSignal } from '@angular/core/rxjs-interop';
import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { formMeta } from '../forms/zod-meta';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero.model';
import { initialsOf, statusTone, type StatusTone } from '../domain/hero.presentation';
import { heroSchema, type HeroModel } from '../domain/hero.schema';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';

/** The edit form's value for a hero, or an empty one while no hero matches the route. */
function toHeroModel(hero: Hero | undefined): HeroModel {
  return {
    name: hero?.name ?? '',
    alias: hero?.alias ?? '',
    powerClass: hero?.powerClass ?? POWER_CLASSES[0],
    powerIndex: hero?.powerIndex ?? 0,
  };
}

/** One deployment this hero has been sent on, for the Missions tab. */
export interface HeroDeployment {
  readonly id: string;
  readonly title: string;
}

/**
 * The hero detail screen's state: the hero named by the `detail/:id` route, its
 * derived presentation, the schema-driven edit form, and the retire and deploy actions.
 * Component-scoped.
 */
@Injectable()
export class HeroDetailViewModel {
  private readonly heroes = inject(HeroService);
  private readonly missions = inject(MissionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** The id from the route. Read through the param stream, so a reused component follows the id. */
  private readonly heroId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  /** The hero this screen shows, or `undefined` when no hero has the route's id. */
  readonly hero = computed(() => this.heroes.byId(this.heroId()));

  readonly initials = computed(() => initialsOf(this.hero()?.name ?? ''));
  readonly statusTone = computed<StatusTone>(() => {
    const hero = this.hero();
    return hero ? statusTone(hero.status) : 'secondary';
  });

  /** Success-rate badge tone: strong, middling, or weak record. A hero with no missions has no record to judge. */
  readonly successTone = computed<StatusTone>(() => {
    const hero = this.hero();
    if (!hero || hero.missions === 0) {
      return 'secondary';
    }
    if (hero.successRate >= 80) {
      return 'success';
    }
    return hero.successRate >= 50 ? 'warning' : 'destructive';
  });

  /** Only an Active hero can be deployed. */
  readonly canDeploy = computed(() => this.hero()?.status === 'Active');

  /** The deployments this hero has been sent on this session, newest first. */
  readonly deployments = computed<readonly HeroDeployment[]>(() => {
    const id = this.hero()?.id;
    return this.missions
      .deployments()
      .filter((deployment) => deployment.heroId === id)
      .map((deployment) => ({
        id: deployment.id,
        title: this.missions.missionById(deployment.missionId)?.title ?? deployment.missionId,
      }))
      .reverse();
  });

  /** Field labels and control kinds ride on the schema. */
  readonly labels = formMeta(heroSchema);
  readonly powerClasses: readonly PowerClass[] = POWER_CLASSES;

  /** The edit form's value. It follows the loaded hero, and resets when a different hero loads. */
  private readonly model = linkedSignal<HeroModel>(() => toHeroModel(this.hero()));
  readonly form = form(this.model, (path) => validateStandardSchema(path, heroSchema));

  /** Feedback line for the last save or cancel. */
  readonly notice = signal('');

  readonly save = () =>
    submit(this.form, async () => {
      const current = this.hero();
      if (current) {
        this.heroes.update(current.id, this.model());
        this.notice.set('Changes saved.');
      }
      return undefined;
    });

  /** Discard unsaved edits and return the form to the hero's stored values. */
  cancel(): void {
    this.model.set(toHeroModel(this.hero()));
    this.notice.set('');
  }

  /** The select reports a cleared value as null; a cleared class leaves the current one in place. */
  setPowerClass(value: PowerClass | null | undefined): void {
    if (value) {
      this.model.update((current) => ({ ...current, powerClass: value }));
    }
  }

  /** Take the hero off the roster and return to the roster. Confirmed through the retire dialog. */
  retire(): void {
    const current = this.hero();
    if (!current) {
      return;
    }
    this.heroes.retire(current.id);
    void this.router.navigate(['/roster']);
  }

  /** Hand the hero to the missions screen, which does the deploying. Only an Active hero can be deployed. */
  deploy(): void {
    const current = this.hero();
    if (!current || !this.canDeploy()) {
      return;
    }
    void this.router.navigate(['/missions'], { queryParams: { hero: current.id } });
  }
}
