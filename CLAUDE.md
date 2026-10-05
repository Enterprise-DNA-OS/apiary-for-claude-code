# Apiary for Claude Code

Read records before answering. This database holds apiary work, site snapshots and documentary evidence. Demo records are fictional.

## Operation

Use `node scripts/apiary.mjs help` for allowed entities and fields. Reads return aligned text or `--json`. Case-insensitive names, codes and partial IDs work interactively. Ambiguous names list candidates and exit 1. Imports require exact names or codes.

| Job | Procedure |
|---|---|
| /sites | List sites, latest counts and observation dates. |
| /landowners | Review landowner contact and billing records. |
| /visit-round | Plan this week’s site visits from recorded visit intervals. |
| /attention | Find stale observations, late jobs and treatment follow-ups. |
| /job-board | Review due jobs and the assigned team. |
| /disease-watch | Review disease observations and notification evidence. |
| /treatment-watch | Review removal dates and operator-supplied clearance instructions. |
| /harvest-ready | Check missing evidence before planning harvest. This is not clearance to harvest or sell. |
| /harvest-trace | Reconcile harvest quantities, allocations and declaration evidence. |
| /site-performance | Compare recorded harvest kilograms and costs, with overdue work. |
| /consumables | Review feed and other consumables by site. |
| /stock-review | Review latest hive numbers, losses, strength and queen notes. |
| /agreements-due | Review site access agreements ending within 60 days. |
| /filings-due | Review official return and certificate receipts. |
| /compliance | Review NZ evidence checks with cited sources. Read docs/compliance.md first. |
| /site | Read the full site history before writing about it. |
| /batch | Trace a batch back to its harvests and apiaries. |
| /add | Read help for the entity fields. Read matching records before adding. Require the operator’s facts and a unique stable code. |
| /set | Read the record first. Update only the fields the operator supplied. NULL clears an optional field. Codes stay stable. |
| /log | Read the site first and record the operator note verbatim. |
| /weekly-review | Read visit-round, job-board and compliance. Write a Monday plan with owners, due dates and unresolved evidence. |
| /draft-landowner | Read the site history and access agreement. Draft the site update into drafts/. A person reviews and sends. |
| /import | Read docs/replace-myapiary.md. Check source headers and retain originals. Run dry-run, reconcile counts, then repeat without dry-run when the operator asked for the import. |
| /export | Export all business records. This snapshot is not a tested database restore. Keep and test normal database backups too. |
| /documents | Read the records and docs/compliance.md. Render private preparation documents, then review them before use. Never call them official filings. |
| /new-view | Read views.json. Add a read-only query using existing views. Keep money units and dates explicit, run npm test, then render. No server or editing interface. |
| /customise | Clarify the requested field or rule. Inspect existing migrations and reports. Write a new numbered SQL migration, apply it, update entity metadata, imports and commands, run npm test and show the result. Do not rewrite applied migrations or invent legal rules. |

## Rules

- Never send, publish, delete or submit to an authority. Drafts stay in drafts/.
- Never invent an inspection, treatment interval, dose, DECA exemption, receipt or harvest declaration.
- Read docs/compliance.md before compliance work. Missing evidence is not proof of safety or compliance.
- Hive numbers are dated observations. A harvest does not change current hive count. Record every new count as a new status.
- Use new numbered migrations for changes. Never edit applied migrations.
- Treatment product, batch, instructions and clearance dates must come from the operator’s approved product information.
- No customer data in git. Keep exports, drafts, databases and generated paperwork private.
- Demo refuses DATABASE_URL and uses .data/demo. Tests use temporary storage. Run npm test before committing to main.
- PGlite is single-process storage. A shared database needs access controls and backups configured before real records.

Omni by Enterprise DNA installs and operates a customised version: https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=myapiary
