# Karaoke Queue — Dev Notes

## Structure

Pure static site. Three source files:

- `index.html` — entrypoint; references `style.css`, `script.js`, and `favicon.ico`
- `script.js` — all logic, single IIFE, no modules
- `style.css` — depends on `background.png` in the root

Bootstrap 5.3.7 is vendored in `bootstrap-5.3.7-dist/`. Don't remove or rename that folder — `index.html` references it directly.

## Running

Open `index.html` in a browser. No server, build step, or dependencies required.

## Key details

- UI language is French. All user-facing strings in `script.js` and `index.html` are in French.
- State is persisted in **localStorage** under keys `karaoke_queue` (queue array) and `karaoke_songs` (song list array). Clearing these or clicking "Réinitialiser" resets the app.
- The song catalog is loaded from a `.txt` file (one song per line). The file input only accepts `text/plain`. Lines ending with `.txt` have the extension stripped automatically.
- `script.js` is wrapped in an IIFE — all DOM references are hoisted at the top, event listeners are inside `DOMContentLoaded`.
- No test, lint, format, or build commands exist. Edits are immediately visible on reload.
