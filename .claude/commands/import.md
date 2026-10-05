# Import

Read docs/replace-myapiary.md. Check source headers and retain originals. Run dry-run, reconcile counts, then repeat without dry-run when the operator asked for the import.

`node scripts/apiary.mjs import myapiary --landowners=owners.csv --sites=sites.csv --statuses=status.csv --dry-run`
