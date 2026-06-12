# Workflow: Qualify a Lead

**Purpose:** Run the AI Lead Qualifier against a prospect and produce a full qualification report.

**Trigger:** Tell Claude — _"Run the qualify-lead workflow"_ — or provide lead data directly.

---

## Inputs

Provide lead data in one of two ways:

**Option A — Inline (paste into chat):**
```
Company: Acme Corp
Industry: SaaS / HR Tech
Size: 50–200 employees
Revenue: $10–50M
Pain point: Manual onboarding process taking 3+ weeks, causing new hire drop-off
Budget: $10–50k
Timeline: 1–6 months
```

**Option B — File:**
Save a `.json` or `.md` file to `temp/resources/lead-<name>.md` and tell Claude to use it.

---

## Steps

### Step 1 — Collect lead data
If data was not provided inline, read it from `temp/resources/`. Confirm all required fields are present: `companyName`, `industry`, `painPoint`. If any are missing, ask the user before continuing.

### Step 2 — Trigger the qualification task
Call the Trigger.dev `qualify-lead` task with the lead data as payload.

- **Dev mode:** Use the Trigger.dev MCP tool `trigger_task` with `environment: dev`
- **Prod mode:** POST to the frontend `/api/qualify` endpoint, or use the MCP tool with `environment: prod`

### Step 3 — Wait for completion
Poll until the run status is `COMPLETED` or `FAILED`. If failed, report the error and stop.

### Step 4 — Save the report
Write the full output JSON to:
```
temp/outputs/lead-report-<companyName>-<YYYY-MM-DD>.json
```

### Step 5 — Summarize in terminal
Print a concise summary:
```
Lead: <companyName> (<industry>)
Verdict: <Qualified | Nurture | Disqualify>
Fit Score: <fitScore>/100

Executive Summary:
<executiveSummary>

Red Flags:
- <redFlag 1>
- <redFlag 2>

Next Steps:
1. <followUpAction 1>
2. <followUpAction 2>
3. <followUpAction 3>

Pitch Angle:
<pitchAngle>

Full report saved to temp/outputs/
```

---

## Output

| File | Description |
|------|-------------|
| `temp/outputs/lead-report-<name>-<date>.json` | Full structured report from the AI |

---

## Notes

- The Trigger.dev task calls OpenRouter (gpt-4o) to generate the report. Typical run time: 5–15 seconds.
- `fitScore` is 0–100. Guideline: ≥70 = Qualified, 40–69 = Nurture, <40 = Disqualify.
- To run multiple leads in batch, save each to `temp/resources/` and run this workflow once per file.
