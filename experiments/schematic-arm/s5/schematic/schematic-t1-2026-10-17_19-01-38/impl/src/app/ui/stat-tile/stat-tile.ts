import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideShieldAlert, lucideUserCheck, lucideZap } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIcon, type IconVariants } from '@spartan-ng/helm/icon';
import { HlmLarge, HlmMuted } from '@spartan-ng/helm/typography';

// Presentational: one headline figure with a caption and an icon. Takes its figures as inputs and injects nothing.
@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmIcon, HlmCardImports, HlmLarge, HlmMuted],
  providers: [provideIcons({ lucideActivity, lucideShieldAlert, lucideUserCheck, lucideZap })],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<'lucideActivity' | 'lucideShieldAlert' | 'lucideUserCheck' | 'lucideZap'>();
  readonly tone = input<NonNullable<IconVariants['tone']>>('muted');
}
