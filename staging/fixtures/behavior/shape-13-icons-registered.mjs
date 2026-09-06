// component-shape-spec rule 13. The claim: registering every glyph once at
// application level, while the components that render them import no lucide
// symbol, is a working pattern.
//
// This is the rule that was drafted wrong the first time. The first draft keyed
// on "NgIcon in imports with no provideIcons in providers" and fired on the two
// capstone builds that got icons RIGHT. This check pins the pattern that draft
// would have blocked, so the mistake cannot be made twice.

export async function check({ page, origin }) {
  await page.goto(`${origin}/roster`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const icons = await page.locator('ng-icon').count();
  if (icons === 0) throw new Error('no <ng-icon> on the roster to verify');

  const blank = await page.evaluate(
    () => [...document.querySelectorAll('ng-icon')].filter((el) => !el.querySelector('svg')).length,
  );

  if (blank > 0) {
    throw new Error(
      `${blank} of ${icons} icons are empty even though registration is app-level. ` +
        'Either the glyph is not in provideIcons, or it was handed to something that is not provideIcons.',
    );
  }
}
