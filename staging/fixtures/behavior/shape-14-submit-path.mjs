// component-shape-spec rule 14. The claim: a type="submit" button inside a
// [formRoot] form runs the action registered in form()'s submission options, and
// so does Enter in a text field.
//
// This is the check that would have caught the spec's own wrong Good example.
// The dead version - submit(this.form, ...) declared in the class and never
// called - compiles, lints clean under all 26 rules, and renders identically.
// Only clicking the button tells the two apart.

export async function check({ page, origin }) {
  await page.goto(`${origin}/recruit`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);

  await page.locator('#name').fill('Fixture Hero');
  await page.locator('#alias').fill('The Executable Claim');

  const before = page.url();
  await page.locator('button[type=submit]').click();
  await page.waitForTimeout(600);

  if (page.url() === before) {
    throw new Error(
      'the submit button ran no action: still on ' + before + '. ' +
        "form() was given no submission.action, so FormRoot's native submit handler " +
        'called preventDefault() and returned.',
    );
  }

  // The keyboard path is the half a (click) handler silently breaks.
  await page.goto(`${origin}/recruit`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  await page.locator('#name').fill('Keyboard Hero');
  await page.locator('#alias').fill('Enter Key');
  const beforeEnter = page.url();
  await page.locator('#alias').press('Enter');
  await page.waitForTimeout(600);

  if (page.url() === beforeEnter) {
    throw new Error(
      'Enter in a text field ran no action. The submit path is wired to a click ' +
        'handler rather than to the form, so only the mouse works.',
    );
  }
}
