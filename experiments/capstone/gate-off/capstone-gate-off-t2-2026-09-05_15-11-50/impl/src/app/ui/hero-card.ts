import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { HlmCard, HlmCardContent, HlmCardHeader } from '@spartan-ng/helm/card';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmAvatar, HlmAvatarImage } from '@spartan-ng/helm/avatar';
import { PowerMeter } from './power-meter';
import type { Hero } from '../domain/hero.model';

@Component({
  selector: 'app-hero-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIconsModule,
    HlmCard,
    HlmCardHeader,
    HlmCardContent,
    HlmBadge,
    HlmAvatar,
    HlmAvatarImage,
    PowerMeter,
  ],
  template: `
    <a [routerLink]="['/detail', hero().id]" class="group">
      <div hlmCard class="h-full transition-all hover:shadow-lg">
        <div hlmCardHeader class="pb-3">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <p class="text-sm font-medium text-foreground">{{ hero().name }}</p>
              <p class="text-xs text-muted-foreground">{{ hero().alias }}</p>
            </div>
            <hlm-avatar class="h-10 w-10">
              <img
                hlmAvatarImage
                [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + hero().id"
                [alt]="hero().name"
              />
            </hlm-avatar>
          </div>
        </div>
        <div hlmCardContent class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">Power</span>
            <hlm-badge variant="secondary">{{ hero().powerClass }}</hlm-badge>
          </div>
          <app-power-meter [value]="hero().powerIndex" />
          <div class="flex items-center justify-between text-xs">
            <span class="text-muted-foreground">{{ hero().missionCount }} missions</span>
            <span [ngClass]="getStatusClass(hero().status)" class="font-medium">
              {{ hero().status }}
            </span>
          </div>
        </div>
      </div>
    </a>
  `,
})
export class HeroCard {
  hero = input.required<Hero>();

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      Active: 'text-success',
      Injured: 'text-warning',
      Reserve: 'text-foreground',
      MIA: 'text-destructive',
    };
    return statusMap[status] || 'text-foreground';
  }
}
