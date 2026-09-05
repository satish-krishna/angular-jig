Implement the following now, by editing files in this repository. Do the work directly: create and edit the files, run the generators or commands you need, and make the application build. Do not reply with only a plan, a design, or a description of what you would do. The task is done when the code is written and the app builds.

Build the hero list screen in the Heroes component (src/app/heroes/heroes.ts).

Show the list of heroes. There is no backend: keep a small in-memory list of heroes (an id and a name each, a dozen or so) in a shared service, and read it there. Each hero in the list shows its id and its name, and links to that hero's detail screen at the detail/:id route. Give the screen a heading.

Lay the list out clearly using the project as it is set up. Wire the screen into the existing routes.

Before you finish, build the app with `ng build` and confirm it compiles. Do not start a dev server (`ng serve` or `npm start`); a one-off build is all that is needed, and a dev server would hang.
