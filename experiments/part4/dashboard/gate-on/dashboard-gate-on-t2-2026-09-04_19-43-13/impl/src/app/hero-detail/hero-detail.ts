import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeroesService, Hero } from '../heroes.service';

@Component({
  selector: 'app-hero-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-8">
      @if (hero) {
        <div class="max-w-2xl">
          <a [routerLink]="['/dashboard']" class="text-primary hover:underline mb-6 inline-block">&larr; Back to Dashboard</a>
          <h1 class="text-4xl font-bold mb-6">{{ hero.name }}</h1>
          <div class="border border-border rounded-lg p-6">
            <p class="text-lg mb-4">
              <span class="font-semibold">ID:</span> {{ hero.id }}
            </p>
            <p class="text-lg">
              <span class="font-semibold">Name:</span> {{ hero.name }}
            </p>
          </div>
        </div>
      } @else {
        <div class="p-8">
          <p class="text-lg">Hero not found</p>
          <a [routerLink]="['/dashboard']" class="text-primary hover:underline">Back to Dashboard</a>
        </div>
      }
    </div>
  `,
})
export class HeroDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private heroesService = inject(HeroesService);

  hero: Hero | undefined;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.hero = this.heroesService.getHero(parseInt(id, 10));
    }
  }
}
