# CLAUDE.md — Fitness Tracker (Workout Progress App)

## Project Overview

A personal web application for tracking gym workout progress. The user logs weights for each exercise during every training session. On opening the app, they immediately see the weights from their last session so they know what to aim for.

**Core use case:** User arrives at the gym, opens the app, sees previous weights at a glance, logs today's weights, tracks progress over time via charts.

---

## Training Structure

The user trains 3 days per week with a fixed split:

| Day | Focus |
|-----|-------|
| Monday | Legs |
| Wednesday | Chest & Shoulders |
| Friday | Back, Biceps & Triceps |

**Important:** The user manages their own exercise list. The app must support:
- Adding new exercises to any training day
- Hiding/showing exercises without deleting them (e.g. temporarily skipping an exercise)
- No hardcoded exercise list — exercises are user-defined and stored in the data layer

---

## Key Features

1. **Session logging** — For each training day, log weight (and optionally reps/sets) per exercise
2. **Previous session reference** — When opening a training day, always show the last logged weights prominently
3. **Progress charts** — Per-exercise line chart showing weight over time (motivational, key feature)
4. **Exercise management** — Add, rename, hide/show exercises per training day
5. **Training history** — Browse past sessions

---

## Tech Decisions

- **Frontend:** Standard web app (HTML/CSS/JS or React — Claude Code decides what fits best)
- **Data storage:** Claude Code decides the most appropriate solution (local file, SQLite, IndexedDB, etc.) — optimize for simplicity and zero-config for a solo personal user
- **No auth required** — Single-user personal app
- **No external APIs needed** — All data is local

---

## UX Priorities

- Fast to open and log — minimal friction when arriving at the gym
- Mobile-friendly (used on phone at the gym)
- "Last session" weights must be visible immediately without scrolling or extra taps
- Charts are secondary — accessible but not in the way

---

## Global Claude Code Instructions

### Security Baseline

These rules apply to all projects. Document exceptions in PR under **Security Exception**.

- **No secrets in code or git. Ever.** No API keys, tokens, passwords, or credentials in source code, config files, or git history. Use environment variables and `.env` files exclusively. Always verify `.env` is in `.gitignore` before committing. This includes frontend code — never put keys in Vite's `VITE_` or Next.js `NEXT_PUBLIC_` env vars unless they are truly public.
- **RLS by default:** Enable Row-Level Security. Define only minimal, necessary policies (no blanket "ALL" access).
- **Least privilege:** Roles and keys must have only required permissions. Never expose service roles to the client.
- **Input validation:** Always server-side (schema-based). Never trust client-side validation alone. Parameterized queries only. Output escaping for XSS.
- **CORS:** Never use wildcard `*` in production. Explicitly whitelist allowed origins.
- **App-level protections:** Rate limiting on write endpoints. Safe file uploads (size, type, storage outside public root).
- Proactively suggest `/security-review` when working on authentication, payments, user data handling, API endpoints, or any security-sensitive features.

### Code Standards

- Never use `type: any` in TypeScript. Use strict typing, generics, or `unknown`.
- Use latest stable versions of dependencies. No beta/alpha/RC unless explicitly required.
- Use `context7` MCP to retrieve current documentation before implementing.
- When editing existing apps or websites, maintain consistency with the established visual style, copywriting tone, and code patterns. Match what's already there before introducing anything new.

### Version Control & Deploy

- Git author email: `ondradobes93@gmail.com` (required — Vercel rejects commits without it)
- **Never commit or push automatically.** Only on explicit request, or ask first.
- Use feature branches and open Pull Requests before merging into `main`.
- Commit messages: concise, imperative mood.
- Deploy strategy: Git → GitHub → Vercel (auto-deploy). Use `vercel` CLI for logs, deployment info, and debugging (`vercel logs`, `vercel inspect`, `vercel env`).
