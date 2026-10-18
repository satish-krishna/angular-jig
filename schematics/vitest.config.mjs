import { defineConfig } from 'vitest/config';

// The schematic has its own test target, separate from the Angular app's
// `@angular/build:unit-test` (which only sees src/**/*.spec.ts).
export default defineConfig({
  test: {
    include: ['schematics/**/*.test.mjs'],
    environment: 'node',
    globals: false,
    testTimeout: 60000,
  },
});
