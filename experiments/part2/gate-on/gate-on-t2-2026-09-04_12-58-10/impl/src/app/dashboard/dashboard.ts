import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrnInputImports } from '@spartan-ng/brain/input';
import { HeroService } from '../services/hero.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, FormsModule, BrnInputImports],
  template: `
    <div class="dashboard-container">
      <h1>Tour of Heroes Dashboard</h1>

      <div class="search-section">
        <h2>Hero Search</h2>
        <input
          hlmInput
          type="text"
          placeholder="Search heroes..."
          [(ngModel)]="searchTerm"
        />
        @if (searchTerm() && filteredHeroes().length > 0) {
          <ul class="search-results">
            @for (hero of filteredHeroes(); track hero.id) {
              <li>
                <a [routerLink]="['/detail', hero.id]">{{ hero.name }}</a>
              </li>
            }
          </ul>
        }
        @if (searchTerm() && filteredHeroes().length === 0) {
          <p class="no-results">No heroes found matching "{{ searchTerm() }}"</p>
        }
      </div>

      <div class="top-heroes-section">
        <h2>Top Heroes</h2>
        <div class="heroes-grid">
          @for (hero of topHeroes(); track hero.id) {
            <div class="hero-card">
              <a [routerLink]="['/detail', hero.id]" class="card-link">
                <div class="card-content">
                  <h3>{{ hero.name }}</h3>
                  <p>ID: {{ hero.id }}</p>
                </div>
              </a>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private heroService = inject(HeroService);
  searchTerm = signal('');

  private allHeroes = this.heroService.getHeroes();

  filteredHeroes = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return [];
    return this.allHeroes.filter((hero) => hero.name.toLowerCase().includes(term));
  });

  topHeroes = computed(() => {
    return this.allHeroes.slice(0, 4);
  });
}
