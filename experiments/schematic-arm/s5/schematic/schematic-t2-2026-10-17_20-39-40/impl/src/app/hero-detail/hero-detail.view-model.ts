import { Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { HeroService } from '../hero/hero.service';
import type { HeroFormModel } from '../hero/hero.schema';
import {
  HERO_STATUS_VARIANT,
  heroInitials,
  isDeployable,
  type HeroBadgeVariant,
} from '../hero/hero-display';

export const HERO_DETAIL_TABS = ['overview', 'powers', 'missions', 'edit'] as const;
export type HeroDetailTab = (typeof HERO_DETAIL_TABS)[number];

const isDetailTab = (value: string): value is HeroDetailTab =>
  (HERO_DETAIL_TABS as readonly string[]).includes(value);

// Component-scoped (no providedIn): the HeroDetail component provides it.
@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  // The router reuses this component when only :id changes, so the id is a stream, not a snapshot.
  private readonly heroId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  readonly hero = computed(() => this.heroService.byId(this.heroId()));
  readonly activeTab = signal<HeroDetailTab>('overview');

  readonly initials = computed(() => heroInitials(this.hero()?.name ?? ''));

  readonly statusVariant = computed<HeroBadgeVariant>(() => {
    const hero = this.hero();
    return hero ? HERO_STATUS_VARIANT[hero.status] : 'secondary';
  });

  readonly canDeploy = computed(() => {
    const hero = this.hero();
    return !!hero && isDeployable(hero);
  });

  // The example data carries totals, not a per-deployment log, so the result split is derived from them.
  readonly missionResults = computed(() => {
    const hero = this.hero();
    const successful = hero ? Math.round((hero.missions * hero.successRate) / 100) : 0;
    const unsuccessful = (hero?.missions ?? 0) - successful;
    return [
      { key: 'successful', label: 'Successful', count: successful, variant: 'success' as HeroBadgeVariant },
      { key: 'unsuccessful', label: 'Unsuccessful', count: unsuccessful, variant: 'destructive' as HeroBadgeVariant },
    ];
  });

  setTab(tab: string): void {
    if (isDetailTab(tab)) this.activeTab.set(tab);
  }

  save(model: HeroFormModel): void {
    const hero = this.hero();
    if (!hero) return;
    this.heroService.update(hero.id, model);
    this.activeTab.set('overview');
  }

  deploy(): void {
    if (!this.canDeploy()) return;
    void this.router.navigate(['/missions']);
  }

  retire(): void {
    const hero = this.hero();
    if (!hero) return;
    this.heroService.remove(hero.id);
    void this.router.navigate(['/roster']);
  }
}
