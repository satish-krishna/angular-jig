import { Injectable, computed, inject, linkedSignal, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { isPowerClass, missionRecord, type Hero } from '../domain/hero';
import { heroSchema, type HeroModel } from '../domain/hero.schema';
import { HeroService } from '../domain/hero.service';
import { formMeta } from '../forms/zod-meta';
import { STATUS_VARIANT, heroInitials } from '../ui/hero-presentation';

const EMPTY_MODEL: HeroModel = { name: '', alias: '', powerClass: 'Aerial', powerIndex: 0 };

function toModel(hero: Hero): HeroModel {
  return { name: hero.name, alias: hero.alias, powerClass: hero.powerClass, powerIndex: hero.powerIndex };
}

/**
 * State for the hero detail screen: the hero named by the route, the edit form built from the
 * zod schema, and the deploy and retire actions. Component-scoped, so each hero gets its own
 * instance. The route id is read as a stream, so a change of hero updates the screen in place.
 */
@Injectable()
export class HeroDetailViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  /** Field labels, control kinds, and select options, read off the schema. */
  public readonly labels = formMeta(heroSchema);
  public readonly powerClassOptions = this.labels['powerClass'].options ?? [];

  public readonly heroId = toSignal(
    this._route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  public readonly hero = computed(() => this._heroes.byId(this.heroId()));

  public readonly statusVariant = computed(() => {
    const hero = this.hero();
    return hero ? STATUS_VARIANT[hero.status] : 'secondary';
  });

  public readonly initials = computed(() => {
    const hero = this.hero();
    return hero ? heroInitials(hero.name) : '';
  });

  public readonly record = computed(() => {
    const hero = this.hero();
    return hero ? missionRecord(hero) : { won: 0, lost: 0 };
  });

  /** Only a reserve hero can be sent to active duty. */
  public readonly canDeploy = computed(() => this.hero()?.status === 'Reserve');

  /** Feedback line for the last action taken. */
  public readonly notice = signal<string | null>(null);

  /**
   * The edit model. Re-seeded from the stored hero only when the route id changes. The stored
   * hero is read untracked, so a roster change (a deploy, say) does not wipe unsaved edits; a
   * save or cancel writes the model back.
   */
  private readonly model = linkedSignal<string, HeroModel>({
    source: this.heroId,
    computation: (id) => {
      const hero = untracked(() => this._heroes.byId(id));
      return hero ? toModel(hero) : EMPTY_MODEL;
    },
  });

  public readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroSchema));

  /** Writes the edited fields to the hero. Invalid input never reaches this action. */
  public readonly save = () =>
    submit(this.heroForm, async () => {
      const updated = this._heroes.update(this.heroId(), this.model());
      this.notice.set(updated ? `Saved ${updated.name}.` : 'That hero is no longer on the roster.');
      return undefined;
    });

  /**
   * Sets the power class from the select. The select is not a native control, so its value is
   * bound by hand; anything that is not a power class leaves the model unchanged.
   */
  public setPowerClass(value: unknown): void {
    if (isPowerClass(value)) {
      this.model.update((model) => ({ ...model, powerClass: value }));
    }
  }

  /** Discards unsaved edits and returns the form to the stored values. */
  public cancel(): void {
    const hero = this.hero();
    if (hero) {
      this.model.set(toModel(hero));
    }
    this.notice.set(null);
  }

  public deploy(): void {
    const hero = this.hero();
    if (!hero || !this.canDeploy()) {
      return;
    }
    this._heroes.update(hero.id, { status: 'Active' });
    this.notice.set(`${hero.name} is deployed to active duty.`);
  }

  /** Removes the hero from the roster and returns to the roster. Called after the dialog confirms. */
  public retire(): void {
    const hero = this.hero();
    if (!hero) {
      return;
    }
    this._heroes.retire(hero.id);
    void this._router.navigateByUrl('/roster');
  }
}
