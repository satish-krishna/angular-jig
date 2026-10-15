import { z } from 'zod';
import { POWER_CLASSES } from '../domain/hero.model';

/**
 * Hero fields shared by every form that writes a hero record. Each field is defined once,
 * here, and both the edit and the recruit schema compose them.
 */
export const heroName = z.string().trim().min(1).meta({ label: 'Hero name', control: 'text' });

export const heroAlias = z.string().trim().min(1).meta({ label: 'Alias', control: 'text' });

export const heroPowerClass = z.enum(POWER_CLASSES).meta({
  label: 'Power class',
  control: 'select',
  options: POWER_CLASSES.map((value) => ({ value, label: value })),
});

export const heroPowerIndex = z.number().int().min(0).max(100).meta({ label: 'Power index', control: 'number' });

export const heroNotes = z.string().max(1000).meta({ label: 'Notes', control: 'textarea' });
