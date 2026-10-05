# Bring MyApiary records across

Checked 2026-10-05. MyApiary documents CSV downloads under Reports > Exports for Sites, Landowners and latest Site Status: https://support.myapiary.com/en/article/exports . Select whether deleted sites and landowners are included. Keep the originals outside this repository.

The help page confirms the export types, but does not publish a full CSV header contract. The fixtures here are synthetic mapping examples, not exports from a paid account. Check your actual headers and map them to the fields below. Unknown columns fail the import so data is never silently discarded. No direct integration or account access is needed.

```bash
npm run migrate
node scripts/apiary.mjs import myapiary --landowners=owners.csv --sites=sites.csv --statuses=status.csv --dry-run
node scripts/apiary.mjs import myapiary --landowners=owners.csv --sites=sites.csv --statuses=status.csv
node scripts/apiary.mjs sites --json
```

One invocation imports all supplied files in a transaction, landowners first, then sites and statuses. A failed row rolls back the entire import. Dry run validates with the database and rolls back. Repeat imports update the same stable codes; blank cells preserve previous values and NULL clears optional values. Changing a name-derived code creates a different record: supply stable codes before renaming anything.

| Export | Accepted headers and meaning |
|---|---|
| Landowners | Landowner ID -> code; Landowner Name -> name; Primary Contact -> contact; Billing Address -> billing_address |
| Sites | Site ID -> code; Site Name -> name; Landowner -> exact landowner code or name; Site Group -> site_group; Site Type -> site_type; Apiary Registration -> registration; Address -> location; Active -> true/false |
| Site Status | Site -> exact site code or name; Date -> recorded_on; Hives -> hives; Supers -> supers; Hive Strength -> strength; Dead Hives -> dead_hives; Diseases -> disease; Queen Notes -> queen_notes |

Native field names from `help` also work. Dates must be YYYY-MM-DD; convert locale dates explicitly. Numbers cannot contain currency signs or thousands separators. Set active=false for deleted sites retained for history. Missing site/landowner IDs use MYA- plus the exact name; status codes use site and date. Duplicate names are rejected when referenced. Latest status is a snapshot, not all visit history.

Other entities accept mapped CSVs with native field names and stable codes through --jobs, --inspections, --treatments, --consumables, --harvests, --batches, --batch_inputs, --agreements, --filings and --notes. The vendor’s export article does not promise these datasets. Obtain additional reports or an agreed data extract from MyApiary, map them, then reconcile totals. Photos, signatures, attachments, task templates, permissions, deleted history and hardware settings do not transfer through this importer. Keep source documents and account access until reconciliation is complete.

A sites export plus latest status gets the site register running in one import after header mapping. Complete historical migration is a separate reconciliation job. Enterprise DNA can do that mapping as part of a customised installation.

`export --out=exports/apiary.json` writes every business entity with IDs. It is a portable snapshot, not an automatic restore command. Use database backups and test recovery before retiring the old account.
