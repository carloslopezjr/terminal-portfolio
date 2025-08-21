# Terminal Portfolio

This is a frontend-only single-page portfolio that simulates an interactive terminal interface (retro green-on-black look).

Build and run with Docker:

```bash
# build the image
docker build -t terminal-portfolio .

# run the container and view at http://localhost:8080
docker run -p 8080:80 terminal-portfolio
```

Files:

- `index.html` — page markup
- `styles.css` — styling and theme variables
- `script.js` — terminal logic, command parsing, and project data
- `Dockerfile` — builds a minimal nginx image to serve the site

Customization:

- Edit `PROJECTS` in `script.js` to add or update projects.
- Theme colors are in `styles.css` using CSS variables `--bg-color`, `--text-color`, and `--accent-color`.

Commands supported (type these in the terminal):

- `help` — list commands
- `ls` — list projects
- `about` — short about section
- `open <project-id>` — open a project (shows repo and demo link)
- `clear` — clear the terminal

Notes:

- The site is intentionally frontend-only. No backend required.
- The project data is stored in `script.js` as an array for easy editing.
