import { describe, it, expect } from 'vitest';
import { iconVariants } from '../../libs/ui/icon/src/lib/icon-variants.ts';

describe('hlmIcon tones', () => {
  it('default tone inherits the current color', () => {
    expect(iconVariants({ tone: 'default' })).not.toMatch(/\btext-/);
  });
  it.each([
    ['muted', 'text-muted-foreground'],
    ['primary', 'text-primary'],
    ['destructive', 'text-destructive'],
    ['success', 'text-success'],
    ['warning', 'text-warning'],
  ])('%s maps to %s', (tone, cls) => {
    expect(iconVariants({ tone }).split(/\s+/)).toContain(cls);
  });
});
