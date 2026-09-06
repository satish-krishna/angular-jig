// component-shape-spec rule 10. The claim: a ViewModel listed in the component's
// own providers resolves at runtime.
//
// Omit the providers entry and ng build still passes. Angular defers the check to
// injection time, so the failure is a NullInjectorError thrown while the screen
// renders - a plane a type checker never reaches.

export async function check({ page, origin, pageErrors }) {
  await page.goto(`${origin}/detail/1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const injector = pageErrors.filter((e) => /NullInjectorError|No provider for/i.test(e));
  if (injector.length) {
    throw new Error(`the ViewModel did not resolve: ${injector[0]}`);
  }

  const rendered = await page.evaluate(
    () => document.body.innerText.trim().length > 0 && !!document.querySelector('app-hero-detail'),
  );
  if (!rendered) {
    throw new Error('the screen produced no content; its ViewModel was injected but never provided');
  }
}
