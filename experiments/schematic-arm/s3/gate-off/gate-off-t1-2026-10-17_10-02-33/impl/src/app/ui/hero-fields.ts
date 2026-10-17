import { Component, input } from '@angular/core';
import { FormField, type FieldTree } from '@angular/forms/signals';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { heroSchema, type HeroModel } from '../domain/hero.schema';
import { formMeta } from '../forms/zod-meta';

// Presentational: the hero form's fields, shared by the edit tab and the recruit screen. The host owns the form
// and its submit and cancel actions; this component renders the fields and writes the select choices back.
@Component({
  selector: 'app-hero-fields',
  imports: [FormField, HlmFieldImports, HlmInputImports, HlmSelectImports],
  templateUrl: './hero-fields.html',
  styleUrl: './hero-fields.css',
})
export class HeroFields {
  readonly form = input.required<FieldTree<HeroModel>>();

  protected readonly meta = formMeta(heroSchema);

  protected setPowerClass(value: HeroModel['powerClass'] | null | undefined): void {
    if (value) {
      this.form().powerClass().value.set(value);
    }
  }

  protected setClearance(value: HeroModel['clearance'] | null | undefined): void {
    if (value) {
      this.form().clearance().value.set(value);
    }
  }
}
