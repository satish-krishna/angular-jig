import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeroService } from '../heroes/hero.service';

@Component({
  selector: 'app-hero-detail',
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      @if (hero(); as hero) {
        <h1 class="text-3xl font-bold mb-4">{{ hero.name }}</h1>
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-lg">
            <span class="font-semibold">ID:</span> {{ hero.id }}
          </p>
          <p class="text-lg mt-2">
            <span class="font-semibold">Name:</span> {{ hero.name }}
          </p>
        </div>
      } @else {
        <h1 class="text-3xl font-bold mb-4">Hero Not Found</h1>
        <p class="text-muted-foreground">The hero you're looking for could not be found.</p>
      }
    </div>
  `,
})
export class HeroDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly heroService = inject(HeroService);

  protected hero = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return undefined;
    return this.heroService.getHero(parseInt(id, 10));
  });
}
