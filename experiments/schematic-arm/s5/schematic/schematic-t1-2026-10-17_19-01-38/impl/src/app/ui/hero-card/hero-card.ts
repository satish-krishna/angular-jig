import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleAlert, lucideCircleCheck, lucideCircleHelp, lucidePause } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIcon, type IconVariants } from '@spartan-ng/helm/icon';
import { HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import type { Hero, HeroStatus } from '../../hero/hero.model';
import { initialsOf } from '../../hero/hero-initials';
import { PowerMeter } from '../power-meter/power-meter';

type StatusDisplay = {
  readonly label: string;
  readonly icon: 'lucideCircleCheck' | 'lucideCircleAlert' | 'lucidePause' | 'lucideCircleHelp';
  readonly tone: NonNullable<IconVariants['tone']>;
};

// Each status gets its own icon and semantic tone, so the state reads without colour alone.
const STATUS_DISPLAY: Record<HeroStatus, StatusDisplay> = {
  Active: { label: 'Active', icon: 'lucideCircleCheck', tone: 'success' },
  Injured: { label: 'Injured', icon: 'lucideCircleAlert', tone: 'warning' },
  Reserve: { label: 'Reserve', icon: 'lucidePause', tone: 'muted' },
  MIA: { label: 'MIA', icon: 'lucideCircleHelp', tone: 'destructive' },
};

// Presentational: one hero as a card. The parent decides what "open" does; this component only reports it.
@Component({
  selector: 'app-hero-card',
  imports: [NgIcon, HlmIcon, HlmAvatarImports, HlmBadgeImports, HlmButtonImports, HlmCardImports, HlmMuted, HlmSmall, PowerMeter],
  providers: [provideIcons({ lucideCircleAlert, lucideCircleCheck, lucideCircleHelp, lucidePause })],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly open = output<Hero>();

  protected readonly initials = computed(() => initialsOf(this.hero().name));
  protected readonly status = computed(() => STATUS_DISPLAY[this.hero().status]);
}
