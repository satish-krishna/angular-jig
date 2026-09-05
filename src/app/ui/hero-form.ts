import { Component, input, output, signal } from '@angular/core';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { type HeroFormModel } from '../hero/hero.schema';

@Component({
  selector: 'app-hero-form',
  imports: [HlmInputImports, HlmButtonImports, HlmLabelImports, HlmSelectImports, HlmTextareaImports],
  template: `
    <form class="flex flex-col gap-4">
      <div>
        <label hlmLabel for="name">Name</label>
        <input hlmInput id="name" type="text" [value]="model().name" (change)="updateField('name', $event)" placeholder="Hero name" />
      </div>
      <div>
        <label hlmLabel for="alias">Alias</label>
        <input hlmInput id="alias" type="text" [value]="model().alias" (change)="updateField('alias', $event)" placeholder="Hero alias" />
      </div>
      <div>
        <label hlmLabel for="powerClass">Power Class</label>
        <hlm-select id="powerClass" [value]="model().powerClass" (change)="updateField('powerClass', $event)">
          <option value="">Select class</option>
          <option value="Aerial">Aerial</option>
          <option value="Energy">Energy</option>
          <option value="Psionic">Psionic</option>
          <option value="Tech">Tech</option>
          <option value="Mutant">Mutant</option>
          <option value="Cosmic">Cosmic</option>
          <option value="Enhanced">Enhanced</option>
        </hlm-select>
      </div>
      <div>
        <label hlmLabel for="power">Power Index (0-100)</label>
        <input hlmInput id="power" type="number" min="0" max="100" [value]="model().power" (change)="updateField('power', $event)" placeholder="0-100" />
      </div>
      <div>
        <label hlmLabel for="bio">Bio</label>
        <textarea hlmTextarea id="bio" [value]="model().bio" (change)="updateField('bio', $event)" placeholder="Hero origin story" rows="4"></textarea>
      </div>
      <div class="flex gap-2">
        <button hlmBtn type="button" (click)="onSubmit()">{{ submitLabel() }}</button>
        <button hlmBtn type="button" variant="outline" (click)="cancel.emit()">Cancel</button>
      </div>
    </form>
  `,
})
export class HeroForm {
  readonly initialValue = input<HeroFormModel>({
    name: '',
    alias: '',
    powerClass: 'Aerial',
    power: 50,
  });
  readonly submitLabel = input('Save');
  readonly saveHero = output<HeroFormModel>();
  readonly cancel = output<void>();

  protected readonly model = signal(this.initialValue());

  updateField(field: keyof HeroFormModel, event: Event) {
    const value = (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
    this.model.update((m) => ({
      ...m,
      [field]: field === 'power' ? Number(value) : value,
    }));
  }

  onSubmit() {
    this.saveHero.emit(this.model());
  }
}
