// sealing-spec rule 5. The claim: hlm-select-trigger written as an ELEMENT
// produces a select that opens and commits a choice.
//
// Written as an attribute (<button hlmBtn hlmSelectTrigger>) it matches no
// selector, so it compiles, renders a plausible-looking button, and never opens.
// Feeding <hlm-select> raw <option> children fails the same way: the directive
// has no template and projects nothing, so the options render as inert DOM.

export async function check({ page, origin }) {
  await page.goto(`${origin}/recruit`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);

  const trigger = page.locator('hlm-select-trigger button');
  if ((await trigger.count()) !== 1) {
    throw new Error('no hlm-select-trigger button in the DOM; the trigger matched no selector');
  }

  const closed = (await trigger.innerText()).trim();
  await trigger.click();
  await page.waitForTimeout(300);

  const items = page.locator('hlm-select-item');
  const count = await items.count();
  if (count === 0) {
    throw new Error('the select did not open: no hlm-select-item rendered after clicking the trigger');
  }

  const pick = items.filter({ hasText: 'Cosmic' }).first();
  await pick.click();
  await page.waitForTimeout(300);

  const after = (await trigger.innerText()).trim();
  if (after === closed || !after.includes('Cosmic')) {
    throw new Error(`choosing an item did not commit a value: trigger still reads "${after}"`);
  }
}
