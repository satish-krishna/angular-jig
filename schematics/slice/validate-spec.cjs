#!/usr/bin/env node
// Checks a slice spec against the same parser the generator uses, without generating anything:
//   npm run validate:spec -- specs/<entity>.json
// Exits 0 and says so for a valid spec; exits 1 and prints every problem by path otherwise.
// The agent runs this before asking for the spec to be approved. Running the parser inline
// (`node -e "require('./schematics/...')"`) is refused by the enforcement guard, because it names
// schematics/ and is not a read; .claude/hooks/protect-enforcement.mjs allows this script instead.
'use strict';

const { existsSync, readFileSync } = require('node:fs');
const { parseSpec } = require('./spec-schema.cjs');

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

const file = process.argv[2];
if (!file) fail('Usage: npm run validate:spec -- specs/<entity>.json');
if (!existsSync(file)) fail(`Spec file not found: ${file}`);

let data;
try {
  data = JSON.parse(readFileSync(file, 'utf8'));
} catch (err) {
  fail(`${file} is not valid JSON: ${err.message}`);
}

const result = parseSpec(data);
if (!result.ok) fail(`${file} is not valid:\n${result.errors.map((e) => `  - ${e}`).join('\n')}`);
process.stdout.write(`${file} is valid.\n`);
