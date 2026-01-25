# Prompt for Website Development

Create a simple, visually appealing website for a Scouts fundraising project, with a clear focus on displaying collected funds in an engaging and user-friendly manner. The website must be in **French only** and optimized for both desktop and mobile devices. Below are the detailed technical and functional requirements, including additional considerations for site architecture, visuals, and functionality.

## Technical Requirements

### Backend

* Use **Python** with **Flask** for the backend to handle API endpoints and serve data to the frontend.
* Set up a **virtual environment** (using `venv`) and include a `requirements.txt` file listing all dependencies (e.g., Flask, Flask-CORS for cross-origin requests, etc.).
* Enable **auto-reload** for Flask to avoid restarting the server during development.
* Store data in a **JSON file** for simplicity, with a structure defined below. In the future, allow easy migration to a database (e.g., SQLite or PostgreSQL) by keeping data access modular.
* Implement basic  **API endpoints** :
  * `GET /api/records`: Retrieve all fundraising records.
  * `GET /api/summary`: Retrieve aggregated data for charts (e.g., total funds by date, person, or activity).
* Ensure the backend checks for **port availability** (default: 5000) and automatically switches to an alternative port if needed.
* Include error handling for API requests (e.g., return meaningful error messages for invalid requests).

### Frontend

* Use **React** with **Vite** and **TypeScript** for a fast, modern, and type-safe frontend.
* Enable **hot module replacement (HMR)** for automatic reloading during development.
* Use **Tailwind CSS** for responsive and modern styling, ensuring a clean and visually appealing design.
* Structure the frontend with reusable components (e.g., `Chart`, `Table`, `Podium`) and organize them in a modular folder structure (e.g., `src/components`, `src/pages`).
* Use **Axios** or **Fetch** to communicate with the backend API.
* Ensure the website is **responsive** and optimized for mobile and desktop displays.
* Use a French locale for all dates, numbers, and text formatting (e.g., `toLocaleDateString('fr-FR')`).

### Development Setup

* Create a `launch.sh` script (using WSL) to:
  * Set up and activate the virtual environment.
  * Install backend dependencies from `requirements.txt`.
  * Start the Flask backend server.
  * Start the Vite frontend development server.
  * Check for port availability (backend: 5000, frontend: 3000) and suggest alternatives if ports are in use.
  * Display clear console messages for success or failure (e.g., "Backend running on [http://localhost:5000](http://localhost:5000/)").
* Optionally, generate a **VS Code task** (in `.vscode/tasks.json`) via the `launch.cmd` script to allow launching both servers with a single command in VS Code. Include tasks for:
  * Starting the backend.
  * Starting the frontend.
  * Running both simultaneously.
* Provide a `README.md` with clear instructions for setting up and running the project, including prerequisites (e.g., Python, Node.js).

### Site Architecture

* Organize the project with a clear folder structure:
  ```
  project/
  ├── backend/
  │   ├── app.py              # Flask application
  │   ├── data.json           # Fundraising records
  │   ├── requirements.txt    # Python dependencies
  │   └── venv/               # Virtual environment
  ├── frontend/
  │   ├── src/
  │   │   ├── components/     # Reusable React components
  │   │   ├── pages/          # Page components
  │   │   ├── assets/         # Images, fonts, etc.
  │   │   └── App.tsx         # Main app component
  │   ├── package.json        # Node dependencies
  │   └── vite.config.ts      # Vite configuration
  ├── .vscode/
  │   └── tasks.json          # VS Code tasks
  ├── launch.cmd              # Script to launch both servers
  └── README.md               # Project setup instructions
  ```
* Ensure the backend and frontend are decoupled, communicating only via API calls for scalability.

## Functional Requirements

### Data Structure

* Store fundraising records in a **JSON file** (`data.json`) with the following fields (in French):
  * **Date** : Date of the activity (format: `YYYY-MM-DD`, e.g., "2025-09-01").
  * **Nom** : Name of the person who collected the funds (string, e.g., "Jean Dupont").
  * **Activité** : Type of fundraising activity (string, e.g., "Vente de gâteaux", "Lavage de voitures").
  * **Détails** : Additional details about the activity (string, e.g., "Vente lors du marché local").
  * **Montant** : Amount collected in EUR (number, e.g., 50.75).
  * **Qui** : Person responsible for the record (string, e.g., "Marie Martin").
* Populate the JSON file with **at least 20 random records** for testing, covering various dates (from September 1, 2025, to the current date), names, activities, and amounts.
* Ensure the JSON file is well-structured and validated before use.

### Pages and Features

#### 1. Main Page (Accueil)

* Display a **line chart** showing the cumulative total of funds collected from  **September 1, 2025** , to  **June 30, 2026** .
  * Only show data up to the **current date** (dynamic, based on system date) to avoid displaying a flat line for future dates.
  * Use a library like **Chart.js** or **Recharts** for smooth and interactive charts.
  * Style the chart with a Scouts-themed color palette (e.g., green and brown tones) and ensure it’s responsive.
  * Add a title: "Évolution des fonds collectés" and a subtitle: "Projet Scouts 2025-2026".
  * Include a brief welcome message in French (e.g., "Bienvenue sur le site de collecte de fonds pour notre projet Scouts ! Suivez notre progression ci-dessous.").
  * Add a **total funds raised** display (e.g., "Total collecté : 1 234,56 €") above or below the chart.

#### 2. Leaderboard Page (Classement)

* Display a **podium** for the top 3 individuals who collected the most money (sum of their `Montant` values).
  * Use a visually engaging design (e.g., gold, silver, bronze medals or icons) with names and total amounts.
  * Example: "1er : Jean Dupont - 250,00 €".
* Below the podium, show a **horizontal bar chart** (decreasing order) of all individuals’ total contributions.
  * X-axis: Total amount collected.
  * Y-axis: Names of individuals.
  * Display the exact amount next to each bar (e.g., "Jean Dupont : 250,00 €").
  * Use **Chart.js** or **Recharts** for the bar chart, styled consistently with the main page.
* Add a title: "Classement des contributeurs" and a subtitle: "Les meilleurs collecteurs pour le projet Scouts".
* Ensure the page is responsive, with the podium stacking vertically on mobile devices.

#### 3. Activities Page (Activités)

* Display a **pie chart** showing the total funds collected per activity type (sum of `Montant` grouped by `Activité`).
  * Use distinct colors for each activity type and include a legend.
  * Display percentages and amounts in the pie chart (e.g., "Vente de gâteaux : 45% (450,00 €)").
  * Use **Chart.js** or **Recharts** for the pie chart, styled consistently with the site theme.
* Add a title: "Répartition des fonds par activité" and a subtitle: "Découvrez quelles activités rapportent le plus !".
* Include a **table** below the pie chart listing all activities, their total amounts, and the number of records for each activity.
  * Example: Columns: "Activité", "Montant total", "Nombre d'activités".
* Ensure the page is responsive, with the pie chart and table adjusting for smaller screens.

#### 4. Additional Page: All Records (Toutes les collectes)

* Add a page to display all fundraising records in a  **sortable and filterable table** .
  * Columns: `Date`, `Nom`, `Activité`, `Détails`, `Montant`, `Qui`.
  * Allow sorting by any column (e.g., date ascending/descending, amount descending).
  * Add basic filters (e.g., by `Activité` or `Nom`) using dropdown menus.
  * Use a library like **react-table** or **MUI DataGrid** for table functionality.
  * Add a title: "Liste des collectes" and a subtitle: "Consultez toutes les contributions au projet Scouts".
* Ensure the table is responsive, with horizontal scrolling on mobile if needed.

### Visual Design

* Use a **clean and modern design** with a Scouts-themed aesthetic:
  * **Color palette** : Green (#2E7D32), brown (#5D4037), white (#FFFFFF), and accents of yellow (#FFCA28) or blue (#0288D1).
  * **Typography** : Use a readable, sans-serif font (e.g., Roboto or Open Sans) with proper French diacritics support.
  * **Logo** : Include a placeholder Scouts logo (or instructions to add one) in the header.
* Add a **navigation bar** (fixed or sticky) with links to all pages: "Accueil", "Classement", "Activités", "Toutes les collectes".
* Include a **footer** with basic information (e.g., "Projet Scouts 2025-2026 | Contact : [contact@scouts.fr](mailto:contact@scouts.fr)").
* Use subtle animations (e.g., fade-in for charts, hover effects on buttons) to enhance user experience without overwhelming the site.
* Ensure  **accessibility** :
  * Use ARIA labels for charts and interactive elements.
  * Ensure sufficient color contrast for text and charts.
  * Support keyboard navigation for all interactive elements.

### Additional Considerations

* **Data Validation** : Validate JSON data on the backend to ensure all fields are present and correctly formatted.
* **Error Handling** : Display user-friendly error messages on the frontend if API calls fail (e.g., "Impossible de charger les données, veuillez réessayer").
* **Performance** : Optimize chart rendering by limiting data points (e.g., aggregate daily totals for the line chart if there are many records).
* **Testing** : Include a small set of unit tests for the backend (e.g., using `pytest` to test API endpoints) and frontend (e.g., using `Vitest` for component tests).
* **Localization** : Ensure all dates and numbers use French formatting (e.g., "1 234,56 €" for amounts, "01/09/2025" for dates).
* **Future Scalability** :
* Allow easy addition of new pages (e.g., for project updates or photos).
* Support potential admin features (e.g., adding/editing records) by keeping the backend modular.
* **Deployment** : Include basic instructions in `README.md` for deploying to a platform like Vercel (frontend) and Render (backend).

### Task Breakdown

1. **Backend Setup** :

* Initialize Flask app and virtual environment.
* Create JSON data structure and populate with random records.
* Implement API endpoints and auto-reload.

1. **Frontend Setup** :

* Set up Vite with React and TypeScript.
* Configure Tailwind CSS and install chart libraries.
* Create reusable components and page structure.

1. **Page Development** :

* Main page: Line chart for funds evolution.
* Leaderboard page: Podium and bar chart.
* Activities page: Pie chart and summary table.
* All Records page: Sortable/filterable table.

1. **Script and Tasks** :

* Write `launch.cmd` for starting servers.
* Generate VS Code tasks for development.

1. **Styling and Accessibility** :

* Apply Scouts-themed styling and responsive design.
* Add navigation bar, footer, and accessibility features.

1. **Testing and Documentation** :

* Write basic unit tests.
* Create `README.md` with setup and deployment instructions.

### Deliverables

* Complete project structure with backend and frontend code.
* `launch.cmd` script for easy development.
* VS Code tasks for streamlined workflows.
* `README.md` with clear setup and running instructions.
* A visually appealing, French-only website with all specified pages and functionalities.
