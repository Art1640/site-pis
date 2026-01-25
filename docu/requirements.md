Create a simple website, with all the requirements.

Here is what I want:

Technical:

- create a virtual environment, with a requirements.txt file
- use python for the backend
- use react/vite/tpescript for the frontent
- use flask or something else for the server ? Use reload, so that I don't need to restart the terminal when making changes to the backend. Same principle for the front end
- create a launch.cmd script, that launches both the backend and frontend, with checks like port available, other port if needed etc.
- maybe configure launching with a vs code task, in the script ? so when running the script, it creates the task ? if makes sense

Functional:

- website must be in french ONLY
- website will be mostly displaying the results of a table, in a nice way. For the context, we are collecting money for a scouts project, we will be working the whole year for that.
- table can be for now a json, with the following fields per record (in french of course)
  - Date
  - Nom
  - Activité
  - Détails
  - Montant
  - Qui
    - already populate the json with random records
- Main page of the site will be a nice graph, ranging from 1 sept 2025, to 30 jun 2026, with the evolution of total money collected. Only show the evolution line until today (dynamic) date. So no flat line in the future, or somehting
- Create a page, Leaderbord ( but in french), with above a podium of the top 3 people, who collected the most money (sum of their activities) , and bellow, a bar plot (decreasing) of all the individual sums, with names on the left, sum on the right.
- create a page, with a pie chart, that show the sums on the different activities (types)

Work with activities / breakdown of the tasks. Make some nice visually, but not too complex
