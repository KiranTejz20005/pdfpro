# DocPrint Pro — React Frontend

Vite + React + TypeScript frontend for the DocPrint Pro PDF and image tools.

## Development

1. Start the FastAPI backend from the project root: `uvicorn main:app --reload`
2. From this folder run: `npm run dev`
3. Open http://localhost:5173 — the Vite dev server proxies `/api` to the backend.

## Build

- `npm run build` — outputs to `dist/`
- From the project root, after building, run the backend; it will serve the built app at http://localhost:8000 when `frontend/dist` exists.

## Environment

- Optional: create `.env` with `VITE_API_URL=http://your-api-origin` if the frontend is served from a different host than the API.

## Backend–frontend sync

- **Health:** Frontend calls `GET /api/health`; backend responds with `{ "status": "ok", "service": "pdf-converter" }`.
- **Dev:** Vite proxies `/api` to `http://localhost:8000`, so the app uses relative URLs and no CORS.
- **Prod:** If the app is served from FastAPI (`frontend/dist` mounted at `/`), `apiUrl()` uses an empty base, so `/api/*` requests go to the same origin.
- **Tools:** Each tool’s `apiEndpoint` in `src/config/toolsRegistry.ts` matches the backend route; `ToolPage`’s `buildFormData()` sends the file and form fields the backend expects (e.g. `file`/`files`, `file1`/`file2` for compare, `pdf_file`/`signature_file` for sign).
