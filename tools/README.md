# Tools

Scripts and integrations that Claude invokes during workflow execution.

## Conventions

- Naming: function-first, e.g. `fetch-lead.sh`, `batch-qualify.ts`
- First line: a comment describing usage, inputs, and outputs
- Tools should be single-purpose and composable

## Planned Tools

| Script | Purpose | Status |
|--------|---------|--------|
| `batch-qualify.ts` | Run the qualifier against a folder of lead files in `temp/resources/` | Planned |
| `export-report.ts` | Convert a report JSON to a formatted PDF or CSV | Planned |

Add scripts here as the project grows.
