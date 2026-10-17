import { computed, inject, Injectable, linkedSignal, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { formMeta } from '../forms/zod-meta';
import { heroInitials, STATUS_VARIANT } from '../domain/hero-presentation';
import type { Hero } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { heroEditSchema, type HeroModel } from './hero-edit.schema';

/** Form model for a hero that is not on the roster. The screen shows a not-found message instead of the form. */
const BLANK_MODEL: HeroModel = { name: '', alias: '', powerClass: 'Aerial', powerIndex: 0, notes: '' };

function toFormModel(hero: Hero | undefined): HeroModel {
  if (!hero) return BLANK_MODEL;
  return { name: hero.name, alias: hero.alias, powerClass: hero.powerClass, powerIndex: hero.powerIndex, notes: hero.notes };
}

/** Component-scoped ViewModel for the Hero Detail screen: the loaded hero, its edit form, and the header actions. */
@Injectable()
export class HeroDetailViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _missions = inject(MissionService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  /** Field labels, placeholders and select options, read off the zod schema. */
  readonly fields = formMeta(heroEditSchema) as Record<keyof HeroModel, FormFieldMeta>;

  /** Status to badge variant, read by the header. */
  readonly statusVariant = STATUS_VARIANT;

  /** The hero id from the detail/:id route. Read as a stream so a reused component follows the id. */
  private readonly _id = toSignal(this._route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: this._route.snapshot.paramMap.get('id') ?? '',
  });

  /** The hero with the route id, or undefined if there is none. Reads the roster, so edits show up here. */
  readonly hero = computed<Hero | undefined>(() => {
    const id = this._id();
    return this._heroes.roster().find((hero) => hero.id === id);
  });

  /** Portrait initials for the header avatar. */
  readonly initials = computed(() => {
    const hero = this.hero();
    return hero ? heroInitials(hero.name) : '';
  });

  /** The missions this hero was deployed on, newest first. Follows the roster, so the list stays current. */
  readonly deployments = computed(() => {
    const id = this._id();
    return this._missions.board().filter((entry) => entry.heroIds.includes(id));
  });

  /**
   * The edit form's model. Reloads only when the route id changes, so an unsaved edit survives a
   * header action such as Deploy, and a reused component shows the new hero's values.
   */
  readonly model = linkedSignal<string, HeroModel>({
    source: this._id,
    computation: (id) => toFormModel(untracked(() => this._heroes.findById(id))),
  });

  /** The edit form. Rules come from the zod schema; submission runs the save action when the model is valid. */
  readonly editForm = form(this.model, (path) => validateStandardSchema(path, heroEditSchema), {
    submission: {
      action: async () => {
        this.saveEdit();
      },
    },
  });

  /** Confirmation line shown under the form after a save. Cleared when the route id changes. */
  readonly notice = linkedSignal<string>(() => {
    this._id();
    return '';
  });

  /** Writes the edited model back to the roster, trimmed as the schema defines it. */
  private saveEdit(): void {
    const hero = this.hero();
    if (!hero) return;
    const edit = heroEditSchema.parse(this.model());
    const updated = this._heroes.update(hero.id, edit);
    if (updated) this.model.set(toFormModel(updated));
    this.notice.set('Dossier saved.');
  }

  /** Discards unsaved edits and returns the form to the hero's stored values. */
  cancelEdit(): void {
    this.model.set(toFormModel(this.hero()));
    this.notice.set('');
  }

  /** The select can emit null or an unknown value; only a value the schema accepts reaches the model. */
  setPowerClass(value: unknown): void {
    const parsed = heroEditSchema.shape.powerClass.safeParse(value);
    if (parsed.success) this.model.update((model) => ({ ...model, powerClass: parsed.data }));
  }

  /** Puts the hero on Active duty. Disabled in the template when the hero is already Active. */
  deploy(): void {
    const hero = this.hero();
    if (hero && hero.status !== 'Active') this._heroes.setStatus(hero.id, 'Active');
  }

  /** Removes the hero from the roster and returns to the roster. The confirmation dialog closes first. */
  retire(): void {
    const hero = this.hero();
    if (!hero) return;
    this._heroes.retire(hero.id);
    void this._router.navigate(['/roster']);
  }
}
