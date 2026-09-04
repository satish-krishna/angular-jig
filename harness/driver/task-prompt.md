Build the Tour of Heroes dashboard in the Dashboard component (src/app/dashboard/dashboard.ts).

Show the top four heroes as a row of cards. Each card shows the hero's name and links to that hero's detail route (detail/:id). Above the cards, add a search box that filters heroes by name as the user types, showing the matches as a short list of links to each hero's detail route.

There is no backend: define a small in-memory list of heroes (an id and a name each, a dozen or so) in the component or a simple service, and drive both the top-four row and the search from it.

Wire the screen into the existing routes and use the project as it is set up. Make it build and run.
