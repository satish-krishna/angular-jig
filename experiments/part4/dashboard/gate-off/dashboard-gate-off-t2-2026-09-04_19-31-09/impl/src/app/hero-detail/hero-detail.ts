import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-container">
      @if (hero(); as hero) {
        <h1>{{ hero.name }}</h1>
        <div class="detail-content">
          <p>ID: {{ hero.id }}</p>
          <a routerLink="/dashboard" class="back-link">Back to Dashboard</a>
        </div>
      } @else {
        <p>Hero not found</p>
      }
    </div>
  `,
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  private heroService = inject(HeroService);
  private route = inject(ActivatedRoute);
  private heroId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? parseInt(id, 10) : null;
  });
  protected readonly hero = computed(() => {
    const id = this.heroId();
    if (!id) return null;
    return this.heroService.getHeroes().find((h) => h.id === id);
  });
}
