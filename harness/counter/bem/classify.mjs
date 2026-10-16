// Is a class token a Tailwind utility? Asked of Tailwind itself, through the
// design system its editor tooling uses, so the answer tracks the installed
// version and the project's own theme instead of a hand-kept list. A token is
// a utility when Tailwind would generate CSS for it.
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { __unstable__loadDesignSystem } from '@tailwindcss/node';

export const BEM_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$/;

export const blockOf = (token) => token.split('__')[0].split('--')[0];

export async function loadClassifier(stylesPath) {
  const ds = await __unstable__loadDesignSystem(readFileSync(stylesPath, 'utf8'), { base: dirname(stylesPath) });
  const cache = new Map();
  const isUtility = (raw) => {
    const token = raw.replace(/^!|!$/g, '');
    if (!cache.has(token)) cache.set(token, ds.candidatesToCss([token])[0] != null);
    return cache.get(token);
  };
  return { isUtility };
}
