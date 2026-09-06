// sealing-spec rule 6. The claim: an hlm-dialog-content carrying hlmDialogTitle
// exposes an accessible name to assistive technology.
//
// A bare <h2 class="font-semibold"> inside the content looks identical on screen
// and wires nothing: the dialog opens with no accessible name, and a screen
// reader announces "dialog" and stops. Neither the compiler nor the linter can
// tell the two apart, because both are just an h2 with text in it.
//
// This also exercises the composition itself. hlm-dialog-content must sit on an
// *hlmDialogPortal template, because that portal is how spartan supplies
// BrnDialogRef; render it inline and it compiles, renders, and throws NG0201 the
// moment the dialog opens.

export async function check({ page, origin, pageErrors }) {
  await page.goto(`${origin}/detail/1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.locator('button:has-text("Retire")').first().click();
  await page.waitForTimeout(400);

  const fatal = pageErrors.filter((e) => /NG0201|No provider for/.test(e));
  if (fatal.length) {
    throw new Error(`opening the dialog threw: ${fatal[0]} (is hlm-dialog-content on *hlmDialogPortal?)`);
  }

  const dialog = page.locator('[role=dialog], [role=alertdialog]').first();
  if ((await dialog.count()) === 0) throw new Error('no dialog opened');

  const name = await dialog.evaluate((el) => {
    const direct = el.getAttribute('aria-label');
    if (direct && direct.trim()) return direct.trim();
    const ids = (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean);
    return ids
      .map((id) => el.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ')
      .trim();
  });

  if (!name) {
    throw new Error(
      'the dialog has no accessible name: neither aria-label nor a resolvable ' +
        'aria-labelledby. An h2 without hlmDialogTitle looks the same and wires nothing.',
    );
  }

  if (!/Retire/.test(name)) {
    throw new Error(`the accessible name does not come from the title: "${name}"`);
  }
}
