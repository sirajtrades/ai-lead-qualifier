# AI Lead Qualifier — Master Configuration

This file is read by Claude Code at the start of every session. It defines the project, the WAT operating model, folder conventions, architecture, and behavioral rules.

---

## Project Overview

**AI Lead Qualifier** is a full-stack application that qualifies sales leads using AI.

**Flow:**
1. User fills out a lead form on the frontend
2. Clicking "Analyze" calls a Next.js API route
3. The API route triggers a Trigger.dev task
4. The Trigger.dev task runs an AI qualification pipeline
5. The result is returned and displayed in the frontend

---

## The WAT Framework

**WAT** is the three-layer operating model for this project:

```
W  Workflows  —  step-by-step procedures that define what to build and in what order
A  Agent      —  Claude Code: reads workflows, plans, and executes the steps
T  Tools      —  scripts the agent invokes to scaffold, test, and deploy
```

### W — Workflows (`workflows/`)
Markdown files that describe exactly what to build, in what order, using which tools. These are the source of truth for intent. Claude must follow them and not deviate without permission.

### A — Agent (Claude Code)
The bridge between intent and action. Reads workflow files, executes each step, invokes tools, and writes outputs to `temp/outputs/`. The workflow decides what to do — the agent decides how.

### T — Tools (`tools/`)
Scripts (`.sh`, `.ts`, `.js`) that perform one discrete action each: scaffold a project, run a build, deploy, test an API endpoint. Invoked by the agent as directed by a workflow step.

The layers work in one direction:

> **Workflows** define the work → **Agent** reads and executes them → using **Tools** to interact with files, APIs, and services.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (Vercel)                                  │
│  Next.js app — GitHub → Vercel auto-deploy          │
│                                                     │
│  /src/app/page.tsx      ← Lead form + results UI    │
│  /src/app/api/qualify/  ← API route (server-side)   │
│  /src/lib/trigger.ts    ← Trigger.dev SDK client    │
└───────────────────┬─────────────────────────────────┘
                    │ POST /api/qualify (server-side)
                    │ Trigger.dev secret key stays server-side
                    ▼
┌─────────────────────────────────────────────────────┐
│  BACKEND (Trigger.dev cloud)                        │
│  TypeScript tasks — deployed via trigger.dev CLI    │
│                                                     │
│  src/trigger/qualify-lead.ts  ← AI qualification    │
│  trigger.config.ts            ← project config      │
└─────────────────────────────────────────────────────┘
```

**Communication pattern:**
- The browser never touches Trigger.dev directly — the Trigger.dev secret key lives only in the Next.js server environment
- The Next.js API route at `/api/qualify` receives the lead data, calls `trigger.dev/sdk` to enqueue the task, polls or streams until done, then returns the result
- The frontend displays the qualification result in real-time

---

## Folder Structure

```
Full Stack App Project ( Lead Qulifer )/
├── CLAUDE.md                        ← this file
├── .env                             ← secrets (never commit)
├── .gitignore
│
├── workflows/                       ← W layer: procedures
│   └── instructions.md              ← how to write workflow files
│
├── tools/                           ← T layer: scripts
│   └── README.md                    ← how to write tool scripts
│
├── backend/                         ← Trigger.dev project
│   ├── trigger.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── trigger/
│           └── qualify-lead.ts      ← lead qualification task
│
├── frontend/                        ← Next.js app (→ Vercel)
│   ├── package.json
│   ├── next.config.ts
│   └── src/
│       ├── app/
│       │   ├── page.tsx             ← lead form + results
│       │   └── api/
│       │       └── qualify/
│       │           └── route.ts     ← server-side API route
│       └── lib/
│           └── trigger.ts           ← Trigger.dev client helper
│
└── temp/
    ├── outputs/                     ← generated artifacts (timestamped)
    └── resources/                   ← input files for current work
```

---

## Tech Stack

| Layer | Technology | Deploy Target |
|-------|-----------|---------------|
| Frontend | Next.js 15 (App Router, TypeScript) | Vercel (via GitHub) |
| Backend | Trigger.dev v3 (TypeScript tasks) | Trigger.dev cloud |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) | Called from Trigger.dev task |
| Styling | Tailwind CSS | — |

**Key packages:**
- `backend/`: `@trigger.dev/sdk`, `@anthropic-ai/sdk`
- `frontend/`: `next`, `react`, `@trigger.dev/sdk` (for API route), `tailwindcss`

---

## Environment Variables

```
# .env — project root (shared reference; real values go in backend/.env and frontend/.env.local)

# Trigger.dev
TRIGGER_SECRET_KEY=            ← backend task auth + Next.js API route (server only)
TRIGGER_PROJECT_ID=            ← from Trigger.dev dashboard

# Anthropic
ANTHROPIC_API_KEY=             ← used inside the Trigger.dev task

# Frontend (Vercel env vars — public prefix for client, no prefix for server)
NEXT_PUBLIC_APP_URL=           ← full URL of the deployed frontend (used for CORS/redirects)
```

**Rules:**
- `.env` at project root is a reference template only — never populated with real values
- Real secrets go in `backend/.env` (for local Trigger.dev dev) and `frontend/.env.local` (for Next.js local dev)
- Vercel and Trigger.dev each get their secrets added via their respective dashboards
- `TRIGGER_SECRET_KEY` must never appear in client-side code or be prefixed with `NEXT_PUBLIC_`

---

## Session Start Protocol

At the start of every session, before doing any work:

1. Read this file (`CLAUDE.md`) fully.
2. Check `workflows/` — understand what procedures exist.
3. Check `tools/` — understand what scripts are available.
4. Check `temp/outputs/` for unreviewed results from the previous session.
5. Ask the user which workflow to follow, or accept their instruction directly.

---

## Workflow Convention

Files in `workflows/` describe what to build, step by step.

**Naming:** `workflows/[verb]-[subject].md`
Examples: `workflows/build-backend.md`, `workflows/build-frontend.md`, `workflows/deploy.md`

**Format:**
```markdown
# [Workflow Name]

## Purpose
One sentence: what this accomplishes.

## Inputs
- What Claude needs before starting

## Steps
1. Step one — action + expected outcome
2. Step two — ...

## Outputs
- What gets written to temp/outputs/ or returned to the user

## Tools Used
- List of tool scripts from tools/ this workflow calls
```

---

## Tool Convention

Files in `tools/` perform one discrete action each.

**Naming:** `tools/[action]-[target].[ext]`
Examples: `tools/scaffold-backend.sh`, `tools/deploy-trigger.sh`, `tools/test-qualify-api.ts`

**Required header:**
```
# Tool: [name]
# Does: [one sentence]
# Inputs: [env vars or args required]
# Outputs: [what it returns or writes]
# Usage: [example invocation]
```

---

## Core Agent Principles

**Follow workflows.** If a workflow file exists for the task, use it. Do not invent an alternate procedure.

**Ask before destructive actions.** Deleting files, overwriting outputs, force-pushing, or calling APIs that mutate data requires explicit user confirmation.

**Never expose secrets.** Never print `.env` values, never include them in output files, never let `TRIGGER_SECRET_KEY` appear in client-side code.

**Prefer editing over creating.** Before writing a new workflow or tool, check whether an existing one covers the need.

**Fail loudly.** If a step cannot be completed (missing input, missing env var, ambiguous instruction), stop and report the blocker rather than guessing.

**One task at a time.** Complete the active workflow before starting another unless the user explicitly switches context.

**Outputs belong in `temp/outputs/`.** Do not write generated content to the project root, `workflows/`, or `tools/`.
