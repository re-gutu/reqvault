SRS – ReqVault
Version: 1.0 (MVP)
Date: March 2026
Purpose: This document defines the scope, features, and success criteria for ReqVault — a lightweight, local-first API request manager and history tracker. It will serve as the single source of truth during development. At the end of the project, we will review every built feature against this SRS to ensure it meets the expected requirements.

1. Project Overview
ReqVault is a personal, self-hosted developer tool that allows users to create, save, organize, execute, and track HTTP requests with full response history.
It acts as a minimal, fast, and private alternative to tools like Postman or Insomnia, with zero cloud dependency. All data is stored locally in a single SQLite database file. The app emphasizes speed, simplicity, and daily usability for frontend/backend developers during API development, debugging, and testing.
Tagline: "Your personal vault for HTTP requests and their history."
2. Objectives & Goals

Build a genuinely usable daily driver tool that solves real developer pain (losing request details, no easy history, CORS issues when testing from browser).
Practice and showcase modern full-stack development with Next.js 15 (App Router), Bun as runtime, and SQLite.
Demonstrate clear separation between frontend UI and backend logic via Route Handlers.
Complete a polished, shippable MVP in 3–4 focused days.
Produce something portfolio-worthy: clean architecture, performant search, real server-side HTTP execution, and a smooth user experience.

3. Target Users

Frontend and full-stack developers who frequently test and iterate on APIs.
Backend developers who need to replay requests quickly during debugging.
Solo developers or small teams who prefer lightweight, offline-first tools over heavy desktop apps or cloud services.
Anyone tired of scattered browser tabs, lost Postman collections, or CORS headaches.

4. Core Features (MVP – Must Be Implemented)
These features define the minimum viable product. Everything else is out of scope for the initial build.
Request Management

Create, read, update, delete (CRUD) HTTP requests.
Fields per request: name/title, method (GET, POST, PUT, PATCH, DELETE + custom), URL, query parameters (key-value editor), headers (key-value), body (JSON or raw text with syntax highlighting), auth presets (None, Bearer, Basic, API Key).
Support for collections/folders to organize requests.
Optional tags for quick filtering.

Execution

One-click “Send” button that executes the request on the backend (server-side fetch via Bun).
Display real-time response: status code, response time, size, headers, and body (with JSON syntax highlighting).
Handle common errors gracefully (timeouts, network issues, JSON parse errors).

History & Persistence

Automatically save every execution as a response history entry linked to the request (timestamp, full response details, duration).
View past runs for any request and reload a previous request + response pair for comparison.
Full-text search across request URLs, names, bodies, and response bodies (powered by SQLite FTS5).

UI / UX

Modern, responsive interface with dark mode (using Tailwind + shadcn/ui or similar).
Split-pane editor: left side for building the request, right side for response + history.
Global search bar.
Keyboard shortcut support (e.g., Cmd/Ctrl + Enter to send).
One-click copy options (cURL command, JSON, etc.).

Data & Export

All data stored in a single local SQLite database (reqvault.db).
Export all requests + history as a single JSON file.
Import from exported JSON (bonus for completeness, but optional if time is tight).

Backend Architecture

Explicit Route Handlers for:
CRUD operations on requests (/api/requests/...)
Execution endpoint (/api/execute)

All database operations and HTTP execution happen in the backend (Route Handlers), not client-side.

5. Non-Functional Requirements

Tech Stack:
Frontend & Backend: Next.js 15 (App Router) with React Server Components where appropriate.
Runtime: Bun (preferred) – bun run dev, bun run build.
Database: SQLite using Bun’s built-in bun:sqlite (or Drizzle ORM if you prefer type safety).
Styling: Tailwind CSS + shadcn/ui (or Radix + Tailwind).
Validation: Zod for forms and API payloads.
Syntax highlighting: Shiki or a lightweight alternative for JSON/code.

Performance: Sub-second search and execution. SQLite + Bun should make most operations feel instant.
Security / Scope: No authentication (single-user, local-only). No external API keys stored except user-provided ones for requests. Limit response body size to prevent abuse.
Deployability: Easy deployment to Vercel (Bun support) or self-hosting.
Accessibility & Polish: Responsive design, dark mode by default, clean and professional UI.
Code Quality: Clean folder structure, typed where possible, minimal dependencies.

6. High-Level User Flows

First-time use: Open app → see empty dashboard → click “New Request” → fill details → Send → see response → save automatically.
Daily iteration: Open saved request → modify → Send → compare new response with history.
Debugging: Search for a past request → load a historical run → tweak and re-execute.
Organization: Drag requests into collections or add tags → use global search to find anything quickly.
Backup: Export JSON at end of session or project.

7. Out of Scope (to prevent feature creep)

User authentication / multi-user support.
Environments / variables (e.g., dev/prod URLs).
Request chaining or scripting.
WebSocket / streaming responses.
Binary file upload/download in bodies (text/JSON only for MVP).
Advanced auth flows (OAuth).
Cloud sync or collaboration.
Automated tests (unit/integration) — manual testing is fine for this scope.
Mobile app (PWA support is nice-to-have but not required).

8. Success Criteria

The app runs smoothly with bun run dev.
A developer can create, save, execute, and review history of at least 10 requests without issues.
Full-text search returns relevant results instantly.
All data persists across browser refreshes and app restarts (via SQLite file).
Export/import works for backup/restore.
The UI feels fast, modern, and intuitive (no major usability friction).
Backend clearly separates concerns (execution and DB logic in Route Handlers).
At project end, every implemented feature maps back to a section in this SRS.

---

reqvault/
├── app/                          # Next.js App Router (all routes & layouts live here)
│   ├── (main)/                   # Route group (no URL segment) – contains the main app UI
│   │   ├── layout.tsx            # Main app layout (sidebar + navbar)
│   │   ├── page.tsx              # Dashboard / Home page
│   │   └── requests/             # Main feature route
│   │       ├── [id]/             # Dynamic route for editing a specific request
│   │       │   └── page.tsx
│   │       └── page.tsx          # Requests list + editor view
│   ├── api/                      # All backend Route Handlers (this is your "backend")
│   │   ├── requests/             # CRUD for requests
│   │   │   ├── route.ts          # GET all, POST new
│   │   │   └── [id]/route.ts     # GET one, PUT, DELETE
│   │   └── execute/              # Core execution endpoint
│   │       └── route.ts          # POST – runs the HTTP request server-side
│   ├── globals.css               # Global styles (Tailwind)
│   ├── layout.tsx                # Root layout (html, body, providers)
│   └── loading.tsx               # Optional global loading UI
│
├── components/                   # Reusable React components (UI only)
│   ├── ui/                       # shadcn/ui components (Button, Input, Table, etc.)
│   ├── layout/                   # Navbar, Sidebar, SplitPane, etc.
│   ├── requests/                 # Request-specific components
│   │   ├── RequestEditor.tsx
│   │   ├── ResponseViewer.tsx
│   │   ├── HistoryList.tsx
│   │   └── RequestCard.tsx
│   └── common/                   # Small shared pieces (CopyButton, etc.)
│
├── lib/                          # Server-side utilities & config
│   ├── db.ts                     # SQLite database connection & client
│   ├── queries.ts                # Reusable database query functions (getRequest, saveResponse, etc.)
│   └── utils.ts                  # Pure helpers (formatDuration, generateCurl, etc.)
│
├── types/                        # TypeScript type definitions
│   ├── index.ts                  # Main types (Request, ResponseHistory, etc.)
│   └── api.ts                    # API request/response types
│
├── public/                       # Static assets (favicon, icons, etc.)
│
├── .env                          # Environment variables (optional for now)
├── next.config.js                # Next.js config (if needed)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── bun.lockb                     # Bun's lockfile
└── README.md

