// sealing-spec rule 4. The claim: an <ng-icon> whose glyph is registered paints.
//
// An unregistered name is not an error and not a warning that fails anything:
// @ng-icons logs to the console and renders an empty element. The markup is
// correct, the build is green, and the screen simply has no icons.

export async function check({ page, origin }) {
  await page.goto(`${origin}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const total = await page.locator('ng-icon').count();
  if (total === 0) throw new Error('no <ng-icon> on the dashboard to verify');

  const painted = await page.evaluate(() =>
    [...document.querySelectorAll('ng-icon')].filter((el) => {
      const svg = el.querySelector('svg');
      if (!svg) return false;
      const box = svg.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && svg.innerHTML.trim().length > 0;
    }).length,
  );

  if (painted !== total) {
    throw new Error(
      `${total - painted} of ${total} <ng-icon> elements rendered nothing. ` +
        'The name is not registered, so the glyph is empty and the build stayed green.',
    );
  }
}
