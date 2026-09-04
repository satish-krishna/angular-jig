import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <h1>Tour of Heroes Dashboard</h1>

    <div class="search-section">
      <h3>Hero Search</h3>
      <input
        type="text"
        placeholder="Search heroes..."
        [value]="searchQuery()"
        (input)="searchQuery.set($any($event.target).value)"
      />

      @if (searchQuery() && searchResults().length > 0) {
        <div class="search-results">
          @for (hero of searchResults(); track hero.id) {
            <a
              [routerLink]="['/detail', hero.id]"
              class="search-result"
            >
              {{ hero.name }}
            </a>
          }
        </div>
      }
      @if (searchQuery() && searchResults().length === 0) {
        <div class="no-results">
          No heroes found
        </div>
      }
    </div>

    <div class="top-heroes-section">
      <h3>Top Heroes</h3>
      <div class="heroes-grid">
        @for (hero of topHeroes(); track hero.id) {
          <div class="hero-card">
            <h4>{{ hero.name }}</h4>
            <a [routerLink]="['/detail', hero.id]" class="view-link">View Details</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 20px;
    }

    h1 {
      margin-bottom: 30px;
    }

    .search-section {
      margin-bottom: 40px;
    }

    .search-section h3 {
      margin-bottom: 10px;
    }

    input[type="text"] {
      width: 100%;
      max-width: 300px;
      padding: 8px 12px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .search-results {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .search-result {
      display: inline-block;
      padding: 8px 12px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      text-decoration: none;
      color: #0066cc;
      width: fit-content;
      transition: background-color 0.2s;
    }

    .search-result:hover {
      background-color: #e8e8e8;
    }

    .no-results {
      margin-top: 10px;
      color: #999;
      font-style: italic;
    }

    .top-heroes-section {
      margin-top: 40px;
    }

    .top-heroes-section h3 {
      margin-bottom: 20px;
    }

    .heroes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .hero-card {
      padding: 20px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .hero-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .hero-card h4 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .view-link {
      display: inline-block;
      padding: 8px 12px;
      background-color: #0066cc;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .view-link:hover {
      background-color: #0052a3;
    }
  `],
})
export class Dashboard {
  private heroService = inject(HeroService);

  searchQuery = signal('');
  searchResults = computed(() =>
    this.heroService.searchHeroes(this.searchQuery())
  );
  topHeroes = computed(() => this.heroService.getTopHeroes(4));
}
