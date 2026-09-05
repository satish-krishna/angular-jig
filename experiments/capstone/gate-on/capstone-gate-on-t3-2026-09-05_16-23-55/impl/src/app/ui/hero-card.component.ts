import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCard } from '@spartan-ng/helm/card';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmAvatar, HlmAvatarImage, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { NgIconsModule } from '@ng-icons/core';
import { Hero } from '../domain/hero.model';

@Component({
  selector: 'app-hero-card',
  standalone: true,
  imports: [
    CommonModule,
    HlmCard,
    HlmBadge,
    HlmAvatar,
    HlmAvatarImage,
    HlmAvatarFallback,
    NgIconsModule,
  ],
  template: `
    <hlm-card class="h-full">
      <div class="p-4 flex flex-col gap-3">
        <!-- Avatar -->
        <div class="flex items-center gap-3">
          <hlm-avatar>
            <img hlmAvatarImage [src]="getAvatarUrl()" [alt]="hero().name" />
            <div hlmAvatarFallback>{{ getInitials() }}</div>
          </hlm-avatar>
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-foreground truncate">{{ hero().name }}</h4>
            <p class="text-xs text-muted-foreground truncate">{{ hero().alias }}</p>
          </div>
        </div>

        <!-- Class Badge -->
        <div class="flex items-center justify-between">
          <span hlmBadge variant="secondary">{{ hero().powerClass }}</span>
          <span class="text-xs font-medium text-muted-foreground">ID: {{ hero().id }}</span>
        </div>

        <!-- Power Index Bar -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-foreground">Power</span>
            <span class="text-sm font-bold text-primary">{{ hero().powerIndex }}</span>
          </div>
          <div class="h-2 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary transition-all"
              [style]="'width: ' + hero().powerIndex + '%'"
            ></div>
          </div>
        </div>

        <!-- Status -->
        <div class="flex items-center justify-center">
          <span
            hlmBadge
            [variant]="getStatusVariant()"
          >
            {{ hero().status }}
          </span>
        </div>
      </div>
    </hlm-card>
  `,
})
export class HeroCardComponent {
  readonly hero = input.required<Hero>();

  getInitials(): string {
    const parts = this.hero().name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarUrl(): string {
    const id = this.hero().id;
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${id}`;
  }

  getStatusVariant(): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (this.hero().status) {
      case 'Active':
        return 'default';
      case 'Injured':
        return 'secondary';
      case 'Reserve':
        return 'outline';
      case 'MIA':
        return 'destructive';
      default:
        return 'default';
    }
  }
}
