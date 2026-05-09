# How to Write Workflow Files

Workflows are the source of truth for what to build. Each file in `workflows/` is a complete, self-contained procedure. Claude reads these files and follows them step by step — no improvisation.

---

## File Naming

```
workflows/[verb]-[subject].md
```

Examples:
- `workflows/build-backend.md`
- `workflows/build-frontend.md`
- `workflows/deploy-backend.md`
- `workflows/deploy-frontend.md`
- `workflows/test-qualify-flow.md`

---

## Required Format

```markdown
# [Workflow Name]

## Purpose
One sentence: what this workflow accomplishes and why.

## Inputs
- List everything Claude needs before starting (env vars, files, URLs, user decisions)

## Steps
1. Step one — description of action and expected outcome
2. Step two — ...
3. ...

## Outputs
- What gets written to temp/outputs/ or returned to the user

## Tools Used
- tools/script-name.sh — what it does in this workflow
```

---

## Rules

- Steps must be numbered and ordered — Claude follows them sequentially
- Each step must describe **what to do** and **what success looks like**
- If a step requires a tool script, name it explicitly under "Tools Used"
- If a step requires user input mid-workflow, write `[PAUSE — ask user: ...]`
- Never describe implementation details that belong in tool scripts; keep steps high-level
- One workflow file per distinct procedure — do not combine unrelated workflows

---

## Existing Workflows

| File | Purpose |
|------|---------|
| `deploy-backend.md` | Deploy the qualify-lead Trigger.dev task to Trigger.dev cloud |
