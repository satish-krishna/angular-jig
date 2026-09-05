import { Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeroService } from '../hero/hero.service';

@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly route = inject(ActivatedRoute);

  readonly heroId = signal<string | null>(null);
  readonly hero = computed(() => {
    const id = this.heroId();
    return id ? this.heroService.byId(id) : null;
  });
  readonly isEditing = signal(false);

  saveHero(data: any) {
    const hero = this.hero();
    if (hero) {
      this.heroService.update(hero.id, data);
      this.isEditing.set(false);
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
  }
}
