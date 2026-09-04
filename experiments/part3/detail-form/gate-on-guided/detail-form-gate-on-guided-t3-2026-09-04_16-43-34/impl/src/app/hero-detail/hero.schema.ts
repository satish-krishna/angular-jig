import { z } from 'zod';

export const heroSchema = z.object({
  name: z
    .string()
    .min(1, 'Hero name is required')
    .meta({ label: 'Hero Name', control: 'text' as const }),
});

export type HeroModel = z.infer<typeof heroSchema>;
