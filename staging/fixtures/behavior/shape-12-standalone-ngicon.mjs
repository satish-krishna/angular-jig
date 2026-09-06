// component-shape-spec rule 12. The claim: a component importing the standalone
// NgIcon boots.
//
// NgIconsModule compiles identically, passes strictTemplates, passes every AST
// gate, and throws at bootstrap ("No icons have been provided..."), taking the
// application to a blank page. Three of the capstone's six builds died exactly
// this way with a green build. The only check that separates them is: does the
// application come up at all.

export async function check({ page, origin, pageErrors }) {
  await page.goto(`${origin}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const fatal = pageErrors.filter((e) => /No icons have been provided|NG0/.test(e));
  if (fatal.length) throw new Error(`bootstrap threw: ${fatal[0]}`);

  const alive = await page.evaluate(
    () => document.body.innerText.trim().length > 0 && document.querySelectorAll('*').length > 20,
  );
  if (!alive) throw new Error('the application rendered a blank page');
}
