import { z } from 'zod';
import { heroProfileShape } from '../forms/hero-profile.schema';

// The recruit form's single source of truth: the shared profile and nothing more.
// Status, clearance and mission record are set by the roster, not typed in.
export const recruitSchema = z.object(heroProfileShape);

export type RecruitModel = z.infer<typeof recruitSchema>;
