import { Component, computed, input, output } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import type { Hero } from '../domain/hero.model';
import { HERO_STATUS_BADGE, initialsOf } from './hero-format';
import { PowerMeter } from './power-meter';

/** One hero as a dashboard card. Presentational: emits `opened`, and the caller decides what that does. */
@Component({
  selector: 'app-hero-card',
  imports: [HlmAvatarImports, HlmBadgeImports, HlmButtonImports, HlmCardImports, PowerMeter],
  template: `
    <article hlmCard class="h-full">
      <div hlmCardHeader class="flex items-center gap-3">
        <hlm-avatar aria-hidden="true">
          <span hlmAvatarFallback>{{ initials() }}</span>
        </hlm-avatar>
        <div class="flex min-w-0 flex-col">
          <h3 hlmCardTitle class="truncate">{{ hero().name }}</h3>
          <p hlmCardDescription class="truncate">{{ hero().alias }}</p>
        </div>
      </div>

      <div hlmCardContent class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-2">
          <span hlmBadge variant="outline">{{ hero().powerClass }}</span>
          <span hlmBadge [variant]="statusVariant()">{{ hero().status }}</span>
          <span hlmBadge variant="secondary">Tier {{ hero().clearance }}</span>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Power index</span>
            <span class="font-medium tabular-nums">{{ hero().powerIndex }}</span>
          </div>
          <app-power-meter [value]="hero().powerIndex" [label]="'Power index for ' + hero().name" />
        </div>
      </div>

      <div hlmCardFooter class="flex flex-wrap items-center justify-between gap-3">
        <dl class="flex gap-4 text-sm">
          <div>
            <dt class="text-xs text-muted-foreground">Missions</dt>
            <dd class="font-medium tabular-nums">{{ hero().missions }}</dd>
          </div>
          <div>
            <dt class="text-xs text-muted-foreground">Success</dt>
            <dd class="font-medium tabular-nums">{{ hero().successRate }}%</dd>
          </div>
        </dl>
        <button
          hlmBtn
          variant="outline"
          size="sm"
          [attr.aria-label]="'Open dossier for ' + hero().name"
          (click)="opened.emit(hero())"
        >
          Open dossier
        </button>
      </div>
    </article>
  `,
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly opened = output<Hero>();

  protected readonly initials = computed(() => initialsOf(this.hero().name));
  protected readonly statusVariant = computed(() => HERO_STATUS_BADGE[this.hero().status]);
}
