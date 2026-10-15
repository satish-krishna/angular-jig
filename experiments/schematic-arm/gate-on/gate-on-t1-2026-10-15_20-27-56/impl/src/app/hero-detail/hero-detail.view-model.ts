import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { POWER_CLASSES, type Hero } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { formMeta } from '../forms/zod-meta';
import { HERO_STATUS_VARIANT, heroInitials, type HeroStatusVariant } from '../ui/hero-presentation';
import { heroDetailSchema, type HeroModel } from './hero-detail.schema';

/** The form model for a hero, or blank fields while the id resolves to no record. */
function toModel(hero: Hero | undefined): HeroModel {
  return {
    name: hero?.name ?? '',
    alias: hero?.alias ?? '',
    powerClass: hero?.powerClass ?? POWER_CLASSES[0],
    power: hero?.power ?? 0,
    dossier: hero?.dossier ?? '',
  };
}

function isPowerClass(value: unknown): value is HeroModel['powerClass'] {
  return (POWER_CLASSES as readonly unknown[]).includes(value);
}

// Component-scoped: provided by HeroDetail, so each visit reads its own record and form.
@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Field labels, help text, and placeholders come off the schema rather than being restated here. */
  readonly meta = formMeta(heroDetailSchema);
  readonly powerClasses = POWER_CLASSES;

  /** The roster id from `detail/:id`. Read through the route stream so a reused component follows the id. */
  private readonly heroId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });

  readonly hero = computed(() => this.heroService.byId(this.heroId()));
  readonly initials = computed(() => heroInitials(this.hero()?.name ?? ''));
  readonly statusVariant = computed<HeroStatusVariant>(() => {
    const hero = this.hero();
    return hero ? HERO_STATUS_VARIANT[hero.status] : 'outline';
  });
  readonly canDeploy = computed(() => this.hero()?.status === 'Active');

  /** Derived from the record's own counts; there is no per-mission log in the example data. */
  readonly successfulMissions = computed(() => {
    const hero = this.hero();
    return hero ? Math.round((hero.missions * hero.successRate) / 100) : 0;
  });
  readonly failedMissions = computed(() => (this.hero()?.missions ?? 0) - this.successfulMissions());

  /** Confirmation line shown after an action. Empty when there is nothing to report. */
  readonly notice = signal('');

  // Resets to the stored record whenever that record changes, so a save shows what was written.
  private readonly model = linkedSignal<HeroModel>(() => toModel(this.hero()));

  readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroDetailSchema));

  readonly save = () =>
    submit(this.heroForm, async () => {
      this.heroService.update(this.heroId(), this.model());
      this.notice.set('Dossier saved.');
    });

  /** The select emits untyped, so anything outside the known classes is ignored. */
  setPowerClass(value: unknown): void {
    if (isPowerClass(value)) this.model.update((model) => ({ ...model, powerClass: value }));
  }

  cancelEdit(): void {
    this.model.set(toModel(this.hero()));
    this.notice.set('Edits discarded.');
  }

  /** A deployment adds one mission to the record. Only active heroes can be sent. */
  deploy(): void {
    const hero = this.hero();
    if (!hero || hero.status !== 'Active') return;
    this.heroService.deploy(hero.id);
    this.notice.set(`${hero.name} deployed.`);
  }

  /** Retiring removes the record from the roster, so the screen leaves with it. */
  retire(): void {
    this.heroService.retire(this.heroId());
    void this.router.navigate(['/roster']);
  }
}
