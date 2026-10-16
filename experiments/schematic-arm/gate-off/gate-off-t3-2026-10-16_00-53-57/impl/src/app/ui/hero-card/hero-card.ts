import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { initialsOf } from '../../domain/initials';
import type { Hero } from '../../domain/hero';
import { PowerMeter } from '../power-meter/power-meter';

/** A hero summary card. Presentational: takes a hero as input and injects nothing but the router link. */
@Component({
  selector: 'app-hero-card',
  imports: [HlmCardImports, HlmAvatarImports, HlmBadgeImports, PowerMeter, RouterLink],
  template: `
    <hlm-card>
      <hlm-card-header>
        <h3 hlmCardTitle>
          <a class="underline-offset-4 hover:underline" [routerLink]="['/detail', hero().id]">{{ hero().name }}</a>
        </h3>
        <p hlmCardDescription>{{ hero().alias }} · {{ hero().id }}</p>
      </hlm-card-header>

      <div hlmCardContent class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <hlm-avatar size="lg" aria-hidden="true">
            <span hlmAvatarFallback>{{ initials() }}</span>
          </hlm-avatar>
          <div class="flex flex-wrap gap-1">
            <span hlmBadge variant="secondary">{{ hero().powerClass }}</span>
            <span hlmBadge variant="outline">{{ hero().status }}</span>
          </div>
        </div>

        <app-power-meter [value]="hero().powerIndex" [label]="'Power index for ' + hero().name" />

        <p class="text-xs text-muted-foreground">
          {{ hero().clearance }} · {{ hero().missionCount }} missions · {{ hero().successRate }}% success
        </p>
      </div>
    </hlm-card>
  `,
})
export class HeroCard {
  readonly hero = input.required<Hero>();

  protected initials(): string {
    return initialsOf(this.hero().name);
  }
}
