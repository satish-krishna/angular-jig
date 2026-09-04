import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HeroesService } from './heroes.service';

@Component({
  selector: 'app-heroes',
  imports: [RouterLink, HlmButtonImports, HlmCardImports],
  template: `
    <div class="heroes-container">
      <h1>Heroes</h1>

      <div class="heroes-list">
        @for (hero of heroesService.getHeroes(); track hero.id) {
          <section hlmCard class="hero-card">
            <div class="hero-card-content">
              <h2>{{ hero.name }}</h2>
              <p class="hero-id">ID: {{ hero.id }}</p>
            </div>
            <button hlmBtn [routerLink]="['/detail', hero.id]">View</button>
          </section>
        }
      </div>
    </div>
  `,
  styleUrl: './heroes.css',
})
export class Heroes {
  heroesService = inject(HeroesService);
}
