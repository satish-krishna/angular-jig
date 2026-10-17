import { z } from 'zod';
import type { FormFieldMeta } from '../forms/form-field-meta';
import { POWER_CLASSES, type Hero, type HeroStatus } from '../domain/hero.model';

/**
 * The hero edit form. The schema is the single source of truth for shape, rules and
 * field labels; the form reads its labels off `.meta()`.
 */
export const heroSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .meta({ label: 'Hero name', control: 'text', order: 1 } satisfies FormFieldMeta),
  alias: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .meta({ label: 'Alias', control: 'text', placeholder: 'Civilian name or Unknown', order: 2 } satisfies FormFieldMeta),
  powerClass: z.enum(POWER_CLASSES).meta({
    label: 'Power class',
    control: 'select',
    options: POWER_CLASSES.map((value) => ({ value, label: value })),
    order: 3,
  } satisfies FormFieldMeta),
  powerIndex: z
    .number()
    .int()
    .min(0)
    .max(100)
    .meta({ label: 'Power index', control: 'number', help: '0 to 100', order: 4 } satisfies FormFieldMeta),
  notes: z
    .string()
    .max(500)
    .meta({ label: 'Dossier notes', control: 'textarea', order: 5 } satisfies FormFieldMeta),
  active: z
    .boolean()
    .meta({ label: 'Active on roster', control: 'switch', help: 'Off moves an active hero to Reserve', order: 6 } satisfies FormFieldMeta),
});

export type HeroModel = z.infer<typeof heroSchema>;

/** Projects a hero onto the form model. `active` is true when the hero's status is Active. */
export function toHeroModel(hero: Hero): HeroModel {
  return {
    name: hero.name,
    alias: hero.alias,
    powerClass: hero.powerClass,
    powerIndex: hero.powerIndex,
    notes: hero.notes,
    active: hero.status === 'Active',
  };
}

/**
 * Builds the update patch for a saved form. Status only changes when the switch moved,
 * so saving an untouched Injured or MIA hero leaves its status alone.
 */
export function heroEditPatch(hero: Hero, model: HeroModel): Partial<Omit<Hero, 'id'>> {
  const wasActive = hero.status === 'Active';
  const status: HeroStatus = model.active === wasActive ? hero.status : model.active ? 'Active' : 'Reserve';
  return {
    name: model.name,
    alias: model.alias,
    powerClass: model.powerClass,
    powerIndex: model.powerIndex,
    notes: model.notes,
    status,
  };
}
