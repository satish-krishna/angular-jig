import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { type BadgeVariant, OUTCOME_VARIANT } from '../domain/mission.presentation';
import type { Mission } from '../domain/mission.model';
import { MissionService } from '../domain/mission.service';
import { type DeployModel, deploySchema } from '../domain/mission.schema';
import { HeroService } from '../domain/hero.service';
import { ThreatService } from '../domain/threat.service';
import { formMeta } from '../forms/zod-meta';

export interface MissionRow {
  readonly mission: Mission;
  readonly heroName: string;
  readonly threatName: string;
  readonly variant: BadgeVariant;
}

// Missions state and logic. Component-scoped: the component provides it, so each visit starts with a fresh deploy form.
@Injectable()
export class MissionsViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _threats = inject(ThreatService);
  private readonly _missions = inject(MissionService);
  private readonly _route = inject(ActivatedRoute);

  // The Deploy button on a hero's detail screen links here with ?hero=<id>, which preselects that hero.
  private readonly _presetHero = toSignal(this._route.queryParamMap.pipe(map((params) => params.get('hero') ?? '')), {
    initialValue: '',
  });

  public readonly meta = formMeta(deploySchema);
  public readonly heroOptions = computed(() =>
    this._heroes.heroes().map((hero) => ({ value: hero.id, label: hero.name })),
  );
  public readonly threatOptions = this._threats.threats.map((threat) => ({ value: threat.id, label: threat.name }));

  // Resets to the preselected hero (or the first on the roster) whenever the link changes.
  private readonly _model = linkedSignal<string, DeployModel>({
    source: this._presetHero,
    computation: (heroId) => ({
      heroId: heroId || this._heroes.heroes()[0]?.id || '',
      threatId: this._threats.threats[0]?.id ?? '',
    }),
  });

  public readonly form = form(this._model, (path) => validateStandardSchema(path, deploySchema), {
    submission: {
      action: async () => {
        this.deploy();
        return undefined;
      },
    },
  });

  // Confirmation after a deployment is logged. Cleared when the link changes to another hero.
  public readonly deployStatus = linkedSignal({ source: this._presetHero, computation: () => '' });

  // Newest launch first, so a fresh deployment sits at the top of the log.
  public readonly rows = computed<readonly MissionRow[]>(() =>
    [...this._missions.missions()]
      .sort((a, b) => b.launched.localeCompare(a.launched) || b.id.localeCompare(a.id))
      .map((mission) => ({
        mission,
        heroName: this._heroes.byId(mission.heroId)?.name ?? 'Off roster',
        threatName: this._threats.byId(mission.threatId)?.name ?? 'Unknown threat',
        variant: OUTCOME_VARIANT[mission.outcome],
      })),
  );

  // A select reports null when it is cleared. Keep the current choice in that case.
  public choose<K extends keyof DeployModel>(field: K, value: DeployModel[K] | null | undefined): void {
    if (!value) return;

    this._model.update((model) => ({ ...model, [field]: value }));
  }

  private deploy(): void {
    const { heroId, threatId } = deploySchema.parse(this._model());
    const hero = this._heroes.byId(heroId);
    const threat = this._threats.byId(threatId);
    if (!hero || !threat) return;

    this._missions.deploy(hero.id, threat.id);
    this.deployStatus.set(`${hero.name} deployed to ${threat.name}.`);
  }
}
