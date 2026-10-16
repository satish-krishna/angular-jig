import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { formMeta } from '../forms/zod-meta';
import { heroInitials } from '../domain/hero.initials';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { heroEditSchema, type HeroModel } from './hero-detail.schema';

const MISSION_NAMES = [
  'Harbor Sweep',
  'Sky Relay',
  'Vault Descent',
  'Ember Run',
  'Signal Lock',
  'Tidewall',
  'Night Ferry',
] as const;

const RECENT_MISSION_COUNT = 5;

export interface MissionEntry {
  readonly code: string;
  readonly name: string;
  readonly outcome: 'Success' | 'Failed';
}

// The edit form's model for a hero, read from the record. Built fresh each call so the
// form never shares an object with a stored record or another call.
function toEditModel(hero: Hero | undefined): HeroModel {
  if (!hero) {
    return { name: '', alias: '', powerClass: POWER_CLASSES[0], powerIndex: 0 };
  }
  return {
    name: hero.name,
    alias: hero.alias,
    powerClass: hero.powerClass,
    powerIndex: hero.powerIndex,
  };
}

// Component-scoped (the HeroDetail component provides it). Owns the route's hero id,
// the hero it resolves to, the edit form's draft, and every action on the record.
@Injectable()
export class HeroDetailViewModel {
  private readonly heroes = inject(HeroService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Reads the id from the route and re-emits when only the id changes, because the
  // router reuses this component for a new :id instead of creating a fresh one.
  readonly heroId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });

  readonly hero = computed(() => this.heroes.find(this.heroId()));

  readonly initials = computed(() => {
    const hero = this.hero();
    return hero ? heroInitials(hero.name) : '';
  });

  // Anything other than Active cannot be deployed, so Deploy is only offered to Active heroes.
  readonly deployable = computed(() => this.hero()?.status === 'Active');

  // Labels, help text and control kinds ride on the schema; the template reads them here.
  readonly meta = formMeta(heroEditSchema);

  readonly classOptions: readonly { readonly value: PowerClass; readonly label: string }[] =
    POWER_CLASSES.map((value) => ({ value, label: value }));

  // Most recent first. The log is example data derived from the record's count and success rate.
  readonly deployments = computed<readonly MissionEntry[]>(() => {
    const hero = this.hero();
    if (!hero) {
      return [];
    }
    const count = Math.min(hero.missionCount, RECENT_MISSION_COUNT);
    return Array.from({ length: count }, (_, index) => {
      const sequence = hero.missionCount - index;
      const roll = (sequence * 37) % 100;
      return {
        code: `OP-${String(sequence).padStart(3, '0')}`,
        name: MISSION_NAMES[sequence % MISSION_NAMES.length],
        outcome: roll < hero.successRate ? 'Success' : 'Failed',
      };
    });
  });

  // Status line for the last action (save, deploy). Empty when there is nothing to report.
  readonly notice = signal('');

  // The draft the form edits. linkedSignal resets it whenever the hero it was read from changes,
  // so a save (or a route change) shows the stored values again.
  private readonly draft = linkedSignal<HeroModel>(() => toEditModel(this.hero()));

  readonly form = form(this.draft, (path) => validateStandardSchema(path, heroEditSchema));

  setPowerClass(value: PowerClass | null | undefined): void {
    if (value) {
      this.form.powerClass().value.set(value);
    }
  }

  save(): void {
    void submit(this.form, async () => {
      const hero = this.hero();
      if (!hero) {
        return;
      }
      this.heroes.update(hero.id, this.draft());
      this.notice.set(`Saved ${this.draft().name}.`);
    });
  }

  // Cancel: throw away the draft and show the stored values again.
  revert(): void {
    this.draft.set(toEditModel(this.hero()));
    this.notice.set('');
  }

  deploy(): void {
    const hero = this.hero();
    if (!hero || hero.status !== 'Active') {
      return;
    }
    const missionCount = hero.missionCount + 1;
    this.heroes.update(hero.id, { missionCount });
    this.notice.set(`${hero.name} deployed. Missions logged: ${missionCount}.`);
  }

  // Retiring removes the record from the roster, so the screen leaves for the roster.
  // The template closes the confirmation dialog before calling this.
  retire(): void {
    const hero = this.hero();
    if (!hero) {
      return;
    }
    this.heroes.retire(hero.id);
    void this.router.navigate(['/roster']);
  }
}
