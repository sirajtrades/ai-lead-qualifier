# Tools

Scripts in this folder perform one discrete action each. They are invoked by Claude as directed by a workflow step.

---

## File Naming

```
tools/[action]-[target].[ext]
```

Examples:
- `tools/scaffold-backend.sh`
- `tools/deploy-trigger.sh`
- `tools/test-qualify-api.ts`
- `tools/seed-lead-data.ts`

---

## Required Header

Every tool file must begin with this comment block:

```
# Tool: [name]
# Does: [one sentence describing what it does]
# Inputs: [env vars or positional args it needs]
# Outputs: [what it returns, prints, or writes]
# Usage: [example invocation]
```

---

## Rules

- One action per script — do not combine unrelated operations
- Scripts must be idempotent where possible (safe to run twice)
- Never hardcode secrets — read from environment variables
- Print clear success/failure output so Claude can confirm the result
- Add every new tool to the registry table below

---

## Tool Registry

| File | Does |
|------|------|
| *(none yet — add entries here as tools are created)* | |
