// component-shape-spec rule 6. The claim: a signal-form covers everything a
// FormGroup would have. The house doc overrides Angular's own offer of reactive
// forms as a fallback, so the fallback's job has to be demonstrably done: bound
// controls, validation that blocks an invalid submit, and a submit that commits.

export async function check({ page, origin }) {
  await page.goto(`${origin}/recruit`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);

  // Invalid must not commit.
  const start = page.url();
  await page.locator('button[type=submit]').click();
  await page.waitForTimeout(400);
  if (page.url() !== start) {
    throw new Error('an invalid form submitted anyway; validation is not gating the submit');
  }

  // Valid must commit, and the value must survive the round trip.
  await page.locator('#name').fill('Signal Form');
  await page.locator('#alias').fill('No FormGroup Required');
  await page.locator('#power').fill('63');
  await page.locator('button[type=submit]').click();
  await page.waitForTimeout(700);

  if (!/\/detail\//.test(page.url())) {
    throw new Error(`a valid form did not commit: still at ${page.url()}`);
  }

  const heading = (await page.locator('h1').first().innerText()).trim();
  if (heading !== 'Signal Form') {
    throw new Error(`the submitted value did not reach the store: heading reads "${heading}"`);
  }
}
