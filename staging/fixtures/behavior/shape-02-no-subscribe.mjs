// component-shape-spec rule 2. The claim: an observable converted with toSignal
// delivers its value, and keeps delivering, without a hand-managed subscription.
//
// The check navigates within the running application rather than reloading, so
// the value has to arrive through the router's own stream each time. A
// route.snapshot read in ngOnInit passes a single hard load and fails here the
// moment the router reuses the component.
//
// What this does NOT prove: that a param change with the component instance
// retained updates the view. The app has no detail-to-detail link to drive that
// from, so the reuse path is exercised only as far as client-side navigation
// reaches. Stated rather than glossed.

export async function check({ page, origin, pageErrors }) {
  await page.goto(`${origin}/roster`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // The roster navigates from a click handler rather than an anchor, so the
  // fixture drives what the screen actually offers.
  const rows = page.locator('table tbody tr');
  if ((await rows.count()) < 2) throw new Error('the roster has too few rows to drive this');

  const names = [];
  const urls = [];

  for (const index of [0, 1]) {
    await page.locator('table tbody tr').nth(index).locator('button').first().click();
    await page.waitForTimeout(400);

    if (!/\/detail\//.test(page.url())) {
      throw new Error(`row ${index} did not navigate to a detail route; landed on ${page.url()}`);
    }
    urls.push(page.url());

    const heading = (await page.locator('h1').first().innerText()).trim();
    if (!heading) {
      throw new Error(`no hero rendered at ${page.url()}: the route param never reached the view`);
    }
    names.push(heading);

    await page.locator('button:has-text("Back to Roster")').first().click();
    await page.waitForTimeout(400);
  }

  if (urls[0] === urls[1]) {
    throw new Error('both rows navigated to the same hero; the fixture proves nothing');
  }

  if (names[0] === names[1]) {
    throw new Error(
      `both visits rendered "${names[0]}". The id is being read once and cached, ` +
        'which is what route.snapshot does and what toSignal(paramMap) exists to avoid.',
    );
  }

  const leaked = pageErrors.filter((e) => /subscribe|unsubscribe|destroyed/i.test(e));
  if (leaked.length) throw new Error(`navigation logged a lifecycle error: ${leaked[0]}`);
}
