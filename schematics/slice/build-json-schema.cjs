'use strict';

/**
 * Generates spec.schema.json from the zod spec schema. Run via `npm run build:spec-schema`.
 * The schematics test suite fails when the committed file differs from `render()`.
 */

const { writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { z } = require('zod');
const { spec } = require('./spec-schema.cjs');

function render() {
  const json = z.toJSONSchema(spec, { io: 'input', target: 'draft-2020-12', unrepresentable: 'any' });
  json.title = 'Slice spec';
  json.description =
    'One slice spec (specs/<entity>.json). Generated from schematics/slice/spec-schema.cjs. ' +
    'Cross-field rules (field references, example rows, kinds) are enforced by the schematic and are not expressible here.';
  return JSON.stringify(json, null, 2) + '\n';
}

if (require.main === module) {
  writeFileSync(join(__dirname, 'spec.schema.json'), render());
}

module.exports = { render };
