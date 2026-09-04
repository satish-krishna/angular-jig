import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { HeroService } from '../services/hero.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, FormsModule, HlmInput, HlmButton, HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle],
  host: { class: 'block' },
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

      <div class="search-section">
        <label for="search">Hero Search:</label>
        <input
          hlmInput
          id="search"
          type="text"
          placeholder="Search heroes..."
          [(ngModel)]="searchTerm"
        />
        @if (searchResults().length > 0) {
          <ul class="search-results">
            @for (hero of searchResults(); track hero.id) {
              <li>
                <a [routerLink]="['/detail', hero.id]" (click)="clearSearch()">
                  {{ hero.name }}
                </a>
              </li>
            }
          </ul>
        }
      </div>

      <div class="heroes-section">
        <h2>Top Heroes</h2>
        <div class="heroes-grid">
          @for (hero of topHeroes; track hero.id) {
            <div hlmCard class="hero-card">
              <div hlmCardHeader>
                <h3 hlmCardTitle>{{ hero.name }}</h3>
              </div>
              <div hlmCardContent>
                <a [routerLink]="['/detail', hero.id]" hlmBtn>
                  View Details
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 1.5rem;
    }

    h2 {
      margin-bottom: 1rem;
    }

    .search-section {
      margin-bottom: 2.5rem;
      position: relative;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input[hlmInput] {
      width: 100%;
      max-width: 300px;
    }

    .search-results {
      list-style: none;
      padding: 1rem;
      margin: 0.5rem 0 0 0;
      border: 1px solid var(--border);
      border-top: none;
      border-radius: 0 0 var(--radius) var(--radius);
      max-width: 300px;
      background-color: var(--card);
    }

    .search-results li {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
    }

    .search-results li:last-child {
      border-bottom: none;
    }

    .search-results a {
      color: var(--primary);
      text-decoration: none;
      display: block;
      padding: 0.25rem 0;
    }

    .search-results a:hover {
      text-decoration: underline;
    }

    .heroes-section {
      margin-top: 2.5rem;
    }

    .heroes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .hero-card {
      transition: all 0.2s ease;
    }

    .hero-card:hover {
      transform: translateY(-2px);
    }
  `],
})
export class Dashboard {
  searchTerm = signal('');
  topHeroes: { id: number; name: string }[];
  searchResults = computed(() => {
    return this.heroService.searchHeroes(this.searchTerm());
  });

  constructor(private heroService: HeroService) {
    this.topHeroes = this.heroService.getTopFourHeroes();
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }
}
