import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import type { BadgeVariants } from '@spartan-ng/helm/badge';
import { map } from 'rxjs';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero';
import { heroFormSchema, type HeroModel } from '../domain/hero-form.schema';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { formMeta } from '../forms/zod-meta';
import { initialsOf, missionVariantOf, statusVariantOf } from '../ui/hero-display';

// Detail state: the hero named by the route, its edit form, the active tab, and the hero's actions.
// Component-scoped, provided by HeroDetail.
@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);
  private readonly router = inject(Router);

  // The id comes from the route as a stream, so a reused component follows the URL rather than the first record.
  private readonly heroId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  readonly hero = computed<Hero | undefined>(() => this.heroService.findById(this.heroId()));
  readonly initials = computed(() => initialsOf(this.hero()?.name ?? ''));
  readonly statusVariant = computed<BadgeVariants['variant']>(() => {
    const hero = this.hero();
    return hero ? statusVariantOf(hero.status) : 'outline';
  });

  // Deploy sends a reserve hero to the field. Active heroes are already out, and injured or MIA heroes cannot go.
  readonly canDeploy = computed(() => this.hero()?.status === 'Reserve');

  // Mission outcomes are derived from the mission count and success rate: the career totals on the roster.
  readonly record = computed(() => {
    const hero = this.hero();
    const successes = hero ? Math.round((hero.missionCount * hero.successRate) / 100) : 0;
    return { successes, failures: (hero?.missionCount ?? 0) - successes };
  });

  // The mission log entries for this hero, in log order, with the badge variant each outcome carries.
  readonly missions = computed(() =>
    this.missionService
      .missions()
      .filter((mission) => mission.heroId === this.heroId())
      .map((mission) => ({ ...mission, variant: missionVariantOf(mission.status) })),
  );

  // The tab strip. Overview is the landing tab, and the form returns there after a save or cancel.
  readonly tab = signal('overview');

  // The edit form's model follows the route id. The form is built from the schema, so validation and labels stay on the schema.
  private readonly model = linkedSignal<string, HeroModel>({
    source: this.heroId,
    computation: (id) => this.modelFor(this.heroService.findById(id)),
  });

  readonly form = form(this.model, (path) => validateStandardSchema(path, heroFormSchema));
  readonly meta = formMeta(heroFormSchema);
  readonly powerClassOptions = this.meta['powerClass']?.options ?? [];

  selectTab(value: string): void {
    this.tab.set(value);
  }

  setPowerClass(value: PowerClass | null | undefined): void {
    if (value) {
      this.form.powerClass().value.set(value);
    }
  }

  save(): void {
    void submit(this.form, async (field) => {
      this.heroService.update(this.heroId(), field().value());
      this.tab.set('overview');
    });
  }

  cancel(): void {
    this.model.set(this.modelFor(this.hero()));
    this.tab.set('overview');
  }

  // Deploy brings the hero out of reserve and logs a live mission for them.
  deploy(): void {
    const hero = this.hero();
    if (hero && this.canDeploy()) {
      this.heroService.update(hero.id, { status: 'Active' });
      this.missionService.launch(hero.id);
    }
  }

  retire(): void {
    this.heroService.remove(this.heroId());
    void this.router.navigate(['/roster']);
  }

  private modelFor(hero: Hero | undefined): HeroModel {
    return {
      name: hero?.name ?? '',
      alias: hero?.alias ?? '',
      powerClass: hero?.powerClass ?? POWER_CLASSES[0],
      powerIndex: hero?.powerIndex ?? 0,
      notes: hero?.notes ?? '',
    };
  }
}
