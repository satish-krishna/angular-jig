import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import { heroSchema, type HeroModel } from '../domain/hero.schema';
import {
  BLANK_HERO,
  STATUS_VARIANT,
  heroCode,
  initialsOf,
  missionRecord,
  toHeroModel,
  withChoice,
  type ChoiceField,
} from '../domain/hero-display';

export const DETAIL_TABS = ['overview', 'powers', 'missions', 'edit'] as const;
export type DetailTab = (typeof DETAIL_TABS)[number];

// One hero's detail screen: route lookup, the edit form, and the header actions. Component-scoped, no DOM.
@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  // The router reuses this screen when only the id changes, so the id is a signal, not a snapshot read.
  private readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')),
    { requireSync: true },
  );

  private readonly hero = computed(() => this.heroService.byId(this.id()));
  readonly tab = signal<DetailTab>('overview');
  readonly notice = signal('');

  // Reset to the stored record whenever the hero changes, so a reused screen never shows the last hero's edits.
  private readonly model = linkedSignal<HeroModel>(() => {
    const hero = this.hero();
    return hero ? toHeroModel(hero) : BLANK_HERO;
  });
  readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroSchema));

  readonly profile = computed(() => {
    const hero = this.hero();
    if (!hero) {
      return null;
    }
    const { wins, losses } = missionRecord(hero);
    return {
      name: hero.name,
      alias: hero.alias,
      code: heroCode(hero.id),
      initials: initialsOf(hero.name),
      powerClass: hero.powerClass,
      power: hero.power,
      status: hero.status,
      statusVariant: STATUS_VARIANT[hero.status],
      clearance: hero.clearance,
      joined: hero.joined,
      notes: hero.notes,
      missions: hero.missions,
      successRate: hero.successRate,
      wins,
      losses,
    };
  });

  readonly canDeploy = computed(() => this.hero()?.status === 'Active');
  readonly isActive = computed(() => this.model().status === 'Active');

  setTab(value: string): void {
    const tab = DETAIL_TABS.find((item) => item === value);
    if (tab) {
      this.tab.set(tab);
    }
  }

  setChoice(field: ChoiceField, value: unknown): void {
    this.model.update((model) => withChoice(model, field, value));
  }

  // The switch reads as "on active duty": on maps to Active, off to Reserve.
  setActive(active: boolean): void {
    this.model.update((model) => ({ ...model, status: active ? 'Active' : 'Reserve' }));
  }

  save(): Promise<boolean> {
    const id = this.id();
    return submit(this.heroForm, async () => {
      this.heroService.update(id, this.model());
      this.notice.set(`Saved changes to ${this.model().name}.`);
    });
  }

  cancel(): void {
    const hero = this.hero();
    this.model.set(hero ? toHeroModel(hero) : BLANK_HERO);
    this.notice.set('Edits discarded.');
  }

  deploy(): void {
    const hero = this.hero();
    if (hero && this.canDeploy()) {
      this.notice.set(`Deployment order filed for ${hero.name}.`);
    }
  }

  retire(): void {
    const hero = this.hero();
    if (!hero) {
      return;
    }
    this.heroService.remove(hero.id);
    void this.router.navigateByUrl('/roster');
  }
}
