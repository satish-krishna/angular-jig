'use strict';

/**
 * Format generated source with Prettier, pinned to the same options as the workspace
 * .prettierrc. The Angular CLI formats every file a schematic touches with the workspace
 * Prettier after the schematic finishes; emitting already-formatted text makes that step a
 * no-op, so what the schematic produces and what lands on disk are the same bytes.
 */

const prettier = require('prettier');

const OPTIONS = { singleQuote: true, printWidth: 100 };

/**
 * @param {string} path workspace-relative path; the extension picks the parser
 * @param {string} content
 * @returns {Promise<string>}
 */
async function formatSource(path, content) {
  const parser = path.endsWith('.html') ? 'angular' : path.endsWith('.css') ? 'css' : 'typescript';
  // Prettier is not idempotent on every construct (an object literal it breaks onto several
  // lines stays broken on the next pass, which changes how the surrounding call chain wraps).
  // Run it to a fixed point so the CLI's own pass finds nothing left to change.
  let current = content;
  for (let pass = 0; pass < 5; pass++) {
    const next = await prettier.format(current, { ...OPTIONS, parser });
    if (next === current) return current;
    current = next;
  }
  throw new Error(`Prettier did not reach a fixed point formatting ${path}`);
}

module.exports = { formatSource, OPTIONS };
