import { z } from 'zod';

export const searchSchema = z.object({
  searchTerm: z.string().meta({
    label: 'Search',
    control: 'text',
    placeholder: 'Search heroes...',
  }),
});

export type SearchModel = z.infer<typeof searchSchema>;
