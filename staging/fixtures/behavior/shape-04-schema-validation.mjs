// component-shape-spec rule 4. The claim: validateStandardSchema alone enforces
// the zod rules. No per-field signal-forms validator is needed for the schema's
// own constraints to fire, and the schema's message text is what reaches the user.

export async function check({ page, origin }) {
  await page.goto(`${origin}/recruit`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);

  await page.locator('button[type=submit]').click();
  await page.waitForTimeout(400);

  const shown = await page.locator('hlm-field-error:not([hidden])').allInnerTexts();
  if (shown.length === 0) {
    throw new Error('submitting an empty form produced no visible error; the schema never ran');
  }

  // The messages must be the schema's own, not a restated validator's default.
  if (!shown.some((t) => t.includes('Name is required'))) {
    throw new Error(`zod's message did not reach the field. Saw: ${JSON.stringify(shown)}`);
  }

  // A numeric bound the schema states, which no per-field validator restates.
  await page.locator('#name').fill('Overclock');
  await page.locator('#alias').fill('Too Much');
  await page.locator('#power').fill('999');
  await page.locator('button[type=submit]').click();
  await page.waitForTimeout(400);

  const bounded = await page.locator('hlm-field-error:not([hidden])').allInnerTexts();
  if (!bounded.some((t) => t.includes('exceed 100'))) {
    throw new Error(`the schema's max() did not fire. Saw: ${JSON.stringify(bounded)}`);
  }
}
