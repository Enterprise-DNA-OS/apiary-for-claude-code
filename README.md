# Apiary for Claude Code

Sites, hive counts, inspections, treatment follow-ups, honey harvests and extraction batches in a database you own. Built by Enterprise DNA. MIT licence. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Install the free base and keep your records. | Your fields, rules, MyApiary mapping, screens and preferred stack. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Discuss your version](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=myapiary&utm_medium=readme-custom) | [Book a call](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=myapiary&utm_medium=readme-managed) |

## Scope

MyApiary’s US pricing lists Sideliner at US$699 annually, Commercial at US$999 per user annually and Professional at US$1,399 per user annually, excluding taxes. Extraction is a separate product. This is an ownership and customisation option, not proof of a five-figure annual saving. [Vendor pricing](https://www.myapiary.com/pricing/), checked 2026-10-05.

The base handles office records and review routines. It does not replace field tablets, mapping, offline sync, barcode readers, extraction equipment, HiveHub or official harvest declarations. Ten questions below demonstrate shipped reports; MyApiary also provides reporting and CSV exports for custom analysis, so they are not claims of exclusive capability.

## Quick start

Node 20 or newer:

```bash
git clone https://github.com/Enterprise-DNA-OS/apiary-for-claude-code.git
cd apiary-for-claude-code
npm install
npm test
npm run demo
```

Demo uses fictional records in .data/demo and refuses DATABASE_URL. Set DATA_DIR=.data/demo to query that demo. For work, leave DATA_DIR unset and run npm run migrate to create an empty local PGlite database. DATABASE_URL selects PostgreSQL. Keep one process at a time on PGlite. Set business_name, colours and logo_path in brand.json before rendering documents.

```bash
node scripts/apiary.mjs help
node scripts/apiary.mjs import myapiary --landowners=examples/myapiary/landowners.csv --sites=examples/myapiary/sites.csv --statuses=examples/myapiary/statuses.csv --dry-run
node scripts/apiary.mjs add sites --code=YOUR-SITE --name="Your site"
node scripts/apiary.mjs visit-round --json
```

## Recurring commands

| Command | Job |
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

## Ten questions to ask of your records

1. Which sites have missed their visit interval? (`visit-round`)
2. Which teams have overdue site jobs? (`job-board`)
3. Which treatments still need removal? (`treatment-watch`)
4. Which harvests lack declaration and tutin evidence? (`harvest-trace`)
5. Which sites have both overdue jobs and harvest evidence gaps? (`site-performance`)
6. Which suspected disease findings lack notification evidence? (`disease-watch`)
7. Which access agreements need renewal within 60 days? (`agreements-due`)
8. Which sites have stale hive counts or queen notes? (`stock-review`)
9. Which harvests supplied one extraction batch? (`batch B-SPRING`)
10. Which official returns still lack receipt references? (`filings-due`)

## Your first hour: ten things to ask for

1. Show stale site visits.
2. Find this week’s unfinished jobcards.
3. Check treatment removals.
4. List missing harvest evidence.
5. Trace the demo extraction batch.
6. Draft a landowner update.
7. Show site access renewals.
8. Add a gate code field with /customise.
9. Change the business name and colours.
10. Add a private regional view with /new-view.

## Records, documents and imports

Every entity has a UUID, stable code and creation/update timestamps. Dates are YYYY-MM-DD. Reads default to aligned text; --json returns machine-readable results. Interactive lookups accept names, codes or partial IDs, reject ambiguity and exit 1 with candidates. Add and set use only documented fields. NULL clears optional fields. No delete command exists.

`npm run docs` creates harvest declaration preparation packs, batch trace records, site records and filing checklists. `npm run view` creates private week and harvest snapshots. These are read-only HTML files with no server. Neither documents nor record checks approve honey for sale or submit to authorities.

[Switching guide](docs/replace-myapiary.md) covers the documented MyApiary CSV exports, explicit header mapping and a transactional dry run. Latest site status is not complete history. Unsupported export columns fail clearly. [Compliance checks](docs/compliance.md) cite NZ sources and state their limits. [Why no front end](docs/why-no-front-end.md) covers field work and production controls.

`node scripts/apiary.mjs export --out=exports/apiary.json` includes all business entities. It is a portable snapshot, not a tested restore command. Establish database backups and test recovery before real use. The base has no login, permissions or immutable audit trail.

## Verification

npm test creates temporary storage, migrates, seeds twice, exercises every command, verifies imports and rollback, validates dates and names, checks batch allocations and renders private documents. CI covers Windows and Linux with PGlite and Linux with PostgreSQL. A local Linux PASS does not establish the other environments until their jobs pass.

MyApiary belongs to its owner. This independent project is not affiliated with MyApiary, MPI or the AFB Management Agency.
