import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import type { HeroFormModel } from '../hero/hero.schema';
import { HeroService } from '../hero/hero.service';
import { initialsOf } from '../hero/hero-initials';
import { MissionService } from '../mission/mission.service';
import { heroStatusVariant, missionOutcomeVariant } from '../ops/badges';
import { ThreatService } from '../threat/threat.service';

export type HeroDetailTab = 'overview' | 'powers' | 'missions' | 'edit';

@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);
  private readonly threatService = inject(ThreatService);
  private readonly router = inject(Router);

  // toSignal, not route.snapshot: the router reuses this component when only the id changes.
  private readonly heroId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  readonly hero = computed(() => this.heroService.byId(this.heroId()));
  readonly initials = computed(() => initialsOf(this.hero()?.name ?? ''));
  readonly statusVariant = heroStatusVariant;
  readonly outcomeVariant = missionOutcomeVariant;

  readonly missions = computed(() => this.missionService.forHero(this.heroId()));

  // The highest-tier threat still unresolved is the one a deployment goes after.
  private readonly deployTarget = computed(() =>
    this.threatService
      .threats()
      .filter((threat) => threat.status !== 'Contained')
      .sort((a, b) => b.tier - a.tier)[0],
  );

  readonly canDeploy = computed(
    () => this.hero()?.status === 'Active' && this.deployTarget() !== undefined,
  );

  /** Why the Deploy button is unavailable, or '' when it is available. */
  readonly deployHint = computed(() => {
    const hero = this.hero();
    if (!hero) return '';
    if (hero.status !== 'Active') return `${hero.name} is ${hero.status} and cannot deploy.`;
    if (!this.deployTarget()) return 'No unresolved threats to deploy against.';
    return '';
  });

  readonly activeTab = signal<HeroDetailTab>('overview');
  readonly notice = signal('');

  selectTab(tab: string): void {
    this.activeTab.set(tab as HeroDetailTab);
    this.notice.set('');
  }

  deploy(): void {
    const hero = this.hero();
    const target = this.deployTarget();
    if (!hero || !target || !this.canDeploy()) return;
    this.missionService.deploy(hero.id, target.id);
    this.notice.set(`${hero.name} deployed against ${target.name}.`);
    this.activeTab.set('missions');
  }

  save(model: HeroFormModel): void {
    const id = this.heroId();
    if (!this.heroService.byId(id)) return;
    this.heroService.update(id, model);
    this.notice.set(`Saved changes to ${model.name}.`);
    this.activeTab.set('overview');
  }

  cancelEdit(): void {
    this.activeTab.set('overview');
  }

  retire(): void {
    const id = this.heroId();
    if (!this.heroService.byId(id)) return;
    this.heroService.remove(id);
    void this.router.navigate(['/roster']);
  }
}
