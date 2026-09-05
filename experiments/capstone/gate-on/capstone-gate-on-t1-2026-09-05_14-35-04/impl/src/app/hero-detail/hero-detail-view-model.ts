import {
  Injectable,
  computed,
  inject,
  signal,
  effect,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import type { HeroModel } from '../domain/hero.schema';

@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly heroIdStr = signal<string | null>(null);
  private readonly currentTab = signal<'overview' | 'powers' | 'missions' | 'edit'>('overview');
  readonly showRetireDialog = signal(false);

  readonly hero = computed(() => {
    const id = this.heroIdStr();
    return id ? this.heroService.getHeroById(id) : undefined;
  });

  readonly activeTab = this.currentTab;
  readonly isLoading = computed(() => this.heroIdStr() !== null && this.hero() === undefined);

  readonly model = signal<HeroModel>({
    name: '',
    alias: '',
    powerClass: 'Aerial',
    powerIndex: 0,
    status: 'Active',
    notes: '',
    active: true,
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.heroIdStr.set(params.get('id'));
    });

    effect(() => {
      const hero = this.hero();
      if (hero) {
        this.model.set({
          name: hero.name,
          alias: hero.alias,
          powerClass: hero.powerClass,
          powerIndex: hero.powerIndex,
          status: hero.status,
          notes: '',
          active: true,
        });
      }
    });
  }

  setActiveTab(tab: 'overview' | 'powers' | 'missions' | 'edit'): void {
    this.currentTab.set(tab);
  }

  saveHero(formValue: HeroModel): void {
    if (!this.heroIdStr()) return;

    this.heroService.updateHero(this.heroIdStr()!, {
      name: formValue.name,
      alias: formValue.alias,
      powerClass: formValue.powerClass,
      powerIndex: formValue.powerIndex,
      status: formValue.status,
    });

    this.currentTab.set('overview');
  }

  confirmRetire(): void {
    if (!this.heroIdStr()) return;
    this.showRetireDialog.set(false);
    this.heroService.removeHero(this.heroIdStr()!);
    this.router.navigate(['/roster']);
  }

  goBack(): void {
    this.router.navigate(['/roster']);
  }
}
