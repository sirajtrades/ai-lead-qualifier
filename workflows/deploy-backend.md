# Deploy Backend to Trigger.dev

## Purpose
Deploy the `qualify-lead` Trigger.dev task to Trigger.dev cloud so the frontend API route can invoke it.

## Inputs
- A Trigger.dev account with a project created at https://cloud.trigger.dev
- `TRIGGER_PROJECT_ID` — from the Trigger.dev dashboard (Project Settings → Project ID)
- `TRIGGER_SECRET_KEY` — from the Trigger.dev dashboard (API Keys → Secret key, `tr_...`)
- `ANTHROPIC_API_KEY` — from https://console.anthropic.com
- Node.js installed (v18+)

## Steps

1. **Confirm Trigger.dev project exists** — Log in to https://cloud.trigger.dev and verify a project exists. If not, create one. Copy the Project ID from Project Settings.

2. **Update trigger.config.ts** — Replace `proj_YOUR_PROJECT_ID` in `backend/trigger.config.ts` with the real Project ID.

3. **Create backend/.env** — Create `backend/.env` with the following values:
   ```
   TRIGGER_SECRET_KEY=tr_...        ← secret key from Trigger.dev dashboard
   ANTHROPIC_API_KEY=sk-ant-...     ← Anthropic API key
   ```
   [PAUSE — ask user to confirm both keys are in place before proceeding]

4. **Install backend dependencies** — Run `npm install` inside `backend/`. Success: no errors, `node_modules/` created.

5. **Deploy to Trigger.dev** — Run `tools/deploy-trigger.sh` from the project root. Success: CLI prints `Deploy complete` and the task `qualify-lead` appears in the Trigger.dev dashboard under Tasks.

6. **Verify in dashboard** — Open https://cloud.trigger.dev, navigate to the project → Tasks, confirm `qualify-lead` is listed and shows status Active.

7. **Add TRIGGER_SECRET_KEY to frontend** — Create `frontend/.env.local` with:
   ```
   TRIGGER_SECRET_KEY=tr_...        ← same secret key
   ```
   This allows the Next.js API route to trigger the task server-side.

## Outputs
- `qualify-lead` task deployed and visible in Trigger.dev dashboard
- `backend/.env` created (local only — never committed)
- `frontend/.env.local` created (local only — never committed)

## Tools Used
- `tools/deploy-trigger.sh` — installs backend deps and runs `trigger.dev deploy`
