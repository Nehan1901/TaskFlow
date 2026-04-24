# TaskFlow

> A full-stack task manager built with React + TypeScript and Node.js/Express — clean code, optimistic UI, and persistent storage.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

---

## Overview

TaskFlow is a take-home engineering challenge submission demonstrating full-stack proficiency across a React/TypeScript frontend and a Node.js/Express REST API backend. Tasks persist across both page refreshes and server restarts via JSON-file storage.

**Live demo:** *(run locally — setup takes under 2 minutes)*

---

## Features

- **Add tasks** — press Enter or click Add
- **Toggle completion** — with optimistic UI (instant feedback, silent rollback on failure)
- **Delete tasks** — per-task with animated removal
- **Filter view** — All / Active / Done tabs
- **Clear completed** — bulk action in footer
- **Persistent storage** — survives server restarts via `tasks.json`
- **Relative timestamps** — "3m ago", "2h ago"
- **Fully accessible** — `aria-label`, `aria-live`, `aria-pressed`, `role="tablist"`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript (strict mode), Vite |
| Backend | Node.js, Express 4, UUID |
| Storage | JSON file (`tasks.json`, auto-created) |
| Styling | Vanilla CSS with design tokens |

---

## Getting Started

**Prerequisites:** Node.js ≥ 18

### 1. Clone the repo

```bash
git clone https://github.com/nehanteja/taskflow.git
cd taskflow
```

### 2. Start the API server

```bash
cd server
npm install
npm run dev     # nodemon — auto-restarts on file changes
```

Server runs at `http://localhost:3001`

### 3. Start the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev     # Vite dev server with HMR
```

Frontend runs at `http://localhost:5173`

---

## Project Structure

```
taskflow/
├── README.md
├── server/
│   ├── index.js          # Express API — all CRUD routes
│   ├── tasks.json        # Auto-created on first POST
│   └── package.json
└── client/
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── package.json
    └── src/
        ├── api.ts        # Typed fetch wrapper — all HTTP logic isolated here
        ├── App.tsx       # Root component — state, handlers, render
        ├── index.css     # Design tokens + component styles
        └── main.tsx      # React entry point
```

---

## API Reference

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `GET` | `/tasks` | — | Fetch all tasks |
| `POST` | `/tasks` | `{ title: string }` | Create a task |
| `PATCH` | `/tasks/:id` | `{ completed?: boolean, title?: string }` | Update a task |
| `DELETE` | `/tasks/:id` | — | Delete a task |

All endpoints return JSON. `DELETE` returns `204 No Content`.

---

## Key Design Decisions

**`api.ts` is fully isolated from the component.**
All `fetch` calls live in a dedicated typed module. `App.tsx` calls `api.createTask()` — it never touches a URL string directly. This makes the HTTP contract explicit and the component testable without mocking `fetch`.

**Optimistic UI for toggles and deletes.**
State updates happen immediately on interaction. If the API call fails, the UI rolls back silently and shows an error banner. This is the pattern used in Linear, Notion, and most production task managers — and the reason the app feels instant.

**JSON file over in-memory storage.**
The spec allowed either. JSON persistence means tasks survive `Ctrl+C && npm start` — a meaningfully better experience for anyone evaluating the project, and closer to real-world behaviour.

**TypeScript strict mode throughout.**
`"strict": true` in `tsconfig.json`. Zero `any` types. Every API response shape is explicitly typed in `api.ts`.

---

## What I'd Add Next

- **Tests** — Vitest + React Testing Library for the component; Supertest for Express routes
- **Optimistic IDs** — generate a temp UUID client-side so the new task renders before the POST returns
- **Drag-to-reorder** — persistent priority order synced to the API
- **SQLite** — swap `tasks.json` for `better-sqlite3` to handle concurrent writes safely
- **Auth** — JWT-based multi-user support with per-user task isolation

---

## Author

**Nehan Anagam** — M.S. Computer Science, University of South Florida  
[LinkedIn](https://linkedin.com/in/nehanteja) · [GitHub](https://github.com/nehanteja) · av37@usf.edu