Implement the following now, by editing files in this repository. Do the work directly: create and edit the files, run the generators or commands you need, and make the application build. Do not reply with only a plan, a design, or a description of what you would do. The task is done when the code is written and the app builds.

Build the hero detail and edit screen in the HeroDetail component (src/app/hero-detail/hero-detail.ts).

Read the hero id from the detail/:id route parameter and load that hero. There is no backend: keep a small in-memory list of heroes (an id and a name each, a dozen or so) in a shared service, and read and update it there.

The screen shows the hero's details in a titled card, and below it an edit form with a labeled text field for the hero's name, a Save button, and a Cancel button that returns to the previous screen. Saving updates the hero's name in the service and reflects the change. Lay the detail card and the form out clearly, with the label, the field, and the two buttons arranged sensibly, and give the screen a heading.

Wire the screen into the existing routes and use the project as it is set up.

Before you finish, build the app with `ng build` and confirm it compiles. Do not start a dev server (`ng serve` or `npm start`); a one-off build is all that is needed, and a dev server would hang.

After the app builds, run `npm run check:responsive`. It renders the detail screen at 375px, 768px, and 1280px and fails if the page scrolls sideways, an element escapes the viewport, or an element clips its own content. If it fails, fix the layout so the screen reflows at narrow widths and run it again. The task is done only when both `ng build` and `npm run check:responsive` pass.
