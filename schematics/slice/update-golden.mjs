// Regenerates schematics/slice/golden/<fixture>/ from the fixtures. Run via `npm run golden:update`
// after an intentional change to an emitter, then review the diff: the golden files are the
// contract for what the schematic emits.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { FIXTURES, SLICE_DIR, generateFixture } from './tests/run.mjs';

for (const name of FIXTURES) {
  const root = join(SLICE_DIR, 'golden', name);
  rmSync(root, { recursive: true, force: true });
  const files = await generateFixture(name);
  for (const [path, content] of files) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  console.log(`${name}: ${files.size} files`);
}
