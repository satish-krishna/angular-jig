import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { POWER_CLASSES, type Hero } from '../domain/hero.model';
import { heroSchema, type HeroModel } from '../forms/hero.schema';
import { formMeta } from '../forms/zod-meta';
import { initialsOf, OUTCOME_BADGE, STATUS_BADGE, type BadgeVariant } from '../ui/hero-badges';

/** The edit form's model for a hero, or blank values while no hero matches the id. */
function modelOf(hero: Hero | undefined): HeroModel {
  return {
    name: hero?.name ?? '',
    alias: hero?.alias ?? '',
    powerClass: hero?.powerClass ?? POWER_CLASSES[0],
    powerIndex: hero?.powerIndex ?? 0,
    status: hero?.status ?? 'Active',
  };
}

/**
 * The hero detail screen's state: the hero named by the `detail/:id` route, the
 * edit form built from the zod schema, the hero's deployments, and the deploy
 * and retire actions.
 */
@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);
  private readonly router = inject(Router);

  /** The route's `:id`. Reading paramMap (not the snapshot) keeps it current when only the id changes. */
  private readonly heroId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  /** The hero the route names, or undefined when no hero on the roster has that id. */
  readonly hero = computed<Hero | undefined>(() => this.heroService.find(this.heroId()));

  /** Two-letter monogram for the header avatar. */
  readonly initials = computed(() => initialsOf(this.hero()?.alias ?? ''));

  readonly statusVariant = computed<BadgeVariant>(() => {
    const status = this.hero()?.status;
    return status ? STATUS_BADGE[status] : 'secondary';
  });

  /** Missions read as a rate: strong, shaky or failing. */
  readonly resultVariant = computed<BadgeVariant>(() => {
    const rate = this.hero()?.successRate ?? 0;
    if (rate >= 0.8) return 'success';
    return rate >= 0.5 ? 'warning' : 'destructive';
  });

  readonly successLabel = computed(() => `${Math.round((this.hero()?.successRate ?? 0) * 100)}%`);

  /** Only an Active hero can be deployed. */
  readonly canDeploy = computed(() => this.hero()?.status === 'Active');

  /** This hero's deployments from the shared mission record, newest first. */
  readonly missions = computed(() => {
    const hero = this.hero();
    if (!hero) return [];
    return this.missionService.forHero(hero.id).map((mission) => ({ mission, variant: OUTCOME_BADGE[mission.outcome] }));
  });

  /** The label and the options come off the schema, so the template restates neither. */
  readonly fields = formMeta(heroSchema);
  readonly powerClassOptions = this.fields.powerClass.options ?? [];
  readonly statusOptions = this.fields.status.options ?? [];

  /** The form's model. Follows the hero: a new route or a saved edit resets it to the stored values. */
  private readonly model = linkedSignal<HeroModel>(() => modelOf(this.hero()));

  /** The edit form. Validation runs through the schema; submit runs `commit`. */
  readonly heroForm = form(
    this.model,
    (path) => validateStandardSchema(path, heroSchema),
    { submission: { action: () => this.commit() } },
  );

  /** A one-line status for the screen: save, deploy and reset feedback. */
  readonly notice = signal('');

  /** Write the edited values back to the roster. */
  private async commit(): Promise<void> {
    const hero = this.hero();
    if (!hero) return;
    const saved = this.heroService.update(hero.id, this.model());
    this.notice.set(saved ? `Saved ${saved.name}.` : '');
  }

  /** Discard unsaved edits and show the stored values again. */
  reset(): void {
    this.model.set(modelOf(this.hero()));
    this.notice.set('');
  }

  /** Set one of the two select-driven fields. The selects are not signal-forms controls, so they bind through here. */
  setField<K extends 'powerClass' | 'status'>(key: K, value: HeroModel[K] | null | undefined): void {
    if (value == null) return;
    this.model.update((current) => ({ ...current, [key]: value }));
  }

  /** File a deployment order. It appears in the mission record and on the Missions screen, in progress. */
  deploy(): void {
    const hero = this.hero();
    if (!hero || !this.canDeploy()) return;
    const mission = this.missionService.file(hero.id);
    this.notice.set(`Deployment order ${mission.id} filed for ${hero.name}.`);
  }

  /** Remove the hero from the roster and return to it. The dialog closes the confirm step. */
  retire(): void {
    const hero = this.hero();
    if (!hero) return;
    this.heroService.retire(hero.id);
    void this.router.navigateByUrl('/roster');
  }
}
