// component-shape-spec rule 3. The claim: a control bound with [formField]
// round-trips. Typing reaches the model, and a model seeded from an input()
// reaches the control.
//
// The second half is the one that broke in practice: an edit form whose model
// was built with signal(this.initialValue()) renders blank forever, and every
// static check passes.

export async function check({ page, origin }) {
  await page.goto(`${origin}/detail/1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const heading = (await page.locator('h1').first().innerText()).trim();
  if (!heading) throw new Error('no hero rendered at /detail/1');

  await page.locator('button:has-text("Edit")').click();
  await page.waitForTimeout(400);

  const seeded = await page.locator('#name').inputValue();
  if (seeded !== heading) {
    throw new Error(
      `the edit form was not seeded from its input(): expected "${heading}", got "${seeded}". ` +
        'A model built with signal(input()) captures the input default and never updates.',
    );
  }

  // Typing must reach the model, which the schema then validates.
  await page.locator('#name').fill('');
  await page.locator('button[type=submit]').click();
  await page.waitForTimeout(400);
  const errors = await page.locator('hlm-field-error:not([hidden])').allInnerTexts();
  if (!errors.some((t) => t.includes('Name is required'))) {
    throw new Error('clearing the field did not reach the model; [formField] is not writing back');
  }
}
