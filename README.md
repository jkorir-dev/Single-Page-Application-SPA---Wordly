# Wordly

Wordly is a lightweight single-page dictionary app built with plain HTML, CSS, and JavaScript. It lets users search for a word, view its definition, pronunciation, example usage, synonyms, and source link in a clean, responsive layout.

## Features

- Word lookup using the free Dictionary API
- Search form with input validation
- Loading and error states
- Display of phonetic text and pronunciation audio when available
- Part-of-speech grouped definitions
- Synonym suggestions
- Dark mode toggle
- Responsive UI for desktop and mobile screens

## Project structure

- `index.html` — app structure and markup
- `style.css` — layout, theme, and responsive styling
- `app.js` — search logic, API requests, rendering, and interactions

## Run locally

Because this is a static frontend app, you can run it in two easy ways:

### Option 1: Open directly

Open `index.html` in a browser.

### Option 2: Serve it locally

From the project folder, run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Usage

1. Type a word in the search box.
2. Click the Search button.
3. Review the word’s definition, pronunciation, and synonyms.
4. Use the dark mode toggle to switch themes.

## Notes

- The app uses the Dictionary API for live word lookup.
- If the API is unavailable or blocked in your environment, the app will show an error message instead of a definition.
- No build tools or package installation are required.