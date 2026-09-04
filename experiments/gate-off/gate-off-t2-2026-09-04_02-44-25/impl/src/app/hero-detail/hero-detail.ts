import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-detail',
  imports: [RouterLink],
  template: `
    @if (hero(); as heroData) {
      <div class="detail-container">
        <h1>{{ heroData.name }}</h1>
        <div class="detail-info">
          <p><strong>ID:</strong> {{ heroData.id }}</p>
        </div>
        <a routerLink="/dashboard" class="back-link">Back to Dashboard</a>
      </div>
    } @else {
      <div class="not-found">
        <p>Hero not found</p>
        <a routerLink="/dashboard" class="back-link">Back to Dashboard</a>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      padding: 20px;
    }

    .detail-container {
      max-width: 600px;
    }

    h1 {
      margin-bottom: 20px;
    }

    .detail-info {
      margin: 20px 0;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .detail-info p {
      margin: 10px 0;
    }

    .back-link {
      display: inline-block;
      margin-top: 20px;
      padding: 8px 12px;
      background-color: #0066cc;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .back-link:hover {
      background-color: #0052a3;
    }

    .not-found {
      padding: 20px;
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
    }

    .not-found p {
      margin: 0 0 15px 0;
    }
  `],
})
export class HeroDetail {
  private heroService = inject(HeroService);
  private route = inject(ActivatedRoute);

  hero = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.heroService.getHero(Number(id)) : undefined;
  });
}
