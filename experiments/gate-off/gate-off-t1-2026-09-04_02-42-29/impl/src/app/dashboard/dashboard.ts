import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      <h1>Tour of Heroes</h1>

      <div class="search-section">
        <h2>Hero Search</h2>
        <div class="search-box">
          <input
            type="text"
            placeholder="Search heroes..."
            (input)="searchQuery.set($any($event.target).value)"
            [value]="searchQuery()"
            class="search-input"
          />
        </div>
        @if (searchResults().length > 0) {
          <ul class="search-results">
            @for (hero of searchResults(); track hero.id) {
              <li>
                <a [routerLink]="['/detail', hero.id]">{{ hero.name }}</a>
              </li>
            }
          </ul>
        }
      </div>

      <div class="top-heroes-section">
        <h2>Top Heroes</h2>
        <div class="heroes-grid">
          @for (hero of topHeroes(); track hero.id) {
            <div class="hero-card">
              <div class="hero-card-content">
                <a [routerLink]="['/detail', hero.id]" class="hero-name">
                  {{ hero.name }}
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
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 40px;
      font-size: 2rem;
    }

    h2 {
      color: #555;
      margin-bottom: 20px;
      font-size: 1.5rem;
    }

    .search-section {
      margin-bottom: 40px;
    }

    .search-box {
      margin-bottom: 20px;
    }

    .search-input {
      width: 100%;
      max-width: 500px;
      padding: 12px 16px;
      font-size: 1rem;
      border: 2px solid #ddd;
      border-radius: 4px;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }

    .search-results {
      list-style: none;
      padding: 0;
      margin: 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
      max-width: 500px;
    }

    .search-results li {
      border-bottom: 1px solid #eee;
    }

    .search-results li:last-child {
      border-bottom: none;
    }

    .search-results a {
      display: block;
      padding: 12px 16px;
      color: #0066cc;
      text-decoration: none;
      transition: background-color 0.2s;
    }

    .search-results a:hover {
      background-color: #f5f5f5;
    }

    .top-heroes-section {
      margin-top: 40px;
    }

    .heroes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .hero-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .hero-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .hero-card-content {
      padding: 24px;
      text-align: center;
    }

    .hero-name {
      color: #0066cc;
      text-decoration: none;
      font-size: 1.1rem;
      font-weight: 500;
      display: block;
      transition: color 0.2s;
    }

    .hero-name:hover {
      color: #0052a3;
      text-decoration: underline;
    }
  `],
})
export class Dashboard {
  private heroService = inject(HeroService);

  searchQuery = signal('');
  topHeroes = computed(() => this.heroService.getTopHeroes(4));
  searchResults = computed(() => this.heroService.searchHeroes(this.searchQuery()));
}
