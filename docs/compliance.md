# NZ beekeeping record checks

Sources checked 2026-10-05. This tool finds missing evidence. It does not diagnose disease, approve treatments, certify honey or submit official documents. Australian operations need their own jurisdiction rules before relying on these checks.

| Check | Rule and scope | Source |
|---|---|---|
| REG | Active sites missing an apiary registration are flagged. A filled code is not verification of official registration. | https://afb.org.nz/beekeeping-and-the-law/ |
| AFB | Suspected or confirmed findings without a notification date and reference are flagged immediately, with an overdue label after seven days. The Management Agency requires notification of AFB within seven days; use the agency’s process immediately when disease is suspected. This tool does not prescribe destruction or movement. | https://afb.org.nz/beekeeping-and-the-law/ |
| ADR | All beekeepers must provide an Annual Disease Return by 1 June. Enter a filing each year and record the official receipt. Even no-hive operators have obligations. | https://afb.org.nz/goal-of-the-afb-npmp/annual-disease-return/ |
| COI | Operators without a current DECA need all hives inspected and their Certificate of Inspection completed in the 1 August to 30 November window. Add the annual filing only after checking exemption status. Local inspections are not proof of approved-inspector status or all-hive coverage. | https://afb.org.nz/goal-of-the-afb-npmp/certificate-of-inspection/ |
| TRACE | Flag harvest records missing site registration, declaration reference, tutin option or evidence reference. Export traceability records for each apiary must be retained four years. No automatic deletion exists. Maintain backups and original documents; the CLI cannot prove retention. | https://www.mpi.govt.nz/agriculture/beekeeping-loss-survey-tutin-contamination-regulations/beekeeper-requirements-honey-exports |
| TUTIN | Store the operator’s selected option and evidence, never derive safety from a location or lab reference alone. Eligibility for the five options and actual test reports need qualified review. | https://www.mpi.govt.nz/food-business/honey-bee-products-processing-requirements/managing-tutin-contamination-in-honey |
| TREAT | Missing batch, instructions or clearance date, overdue removals and future clearance dates are review flags. Intervals are operator-supplied, not inferred. | https://www.mpi.govt.nz/dmsdocument/1021/direct |

`filings-due` checks filings actually entered; it cannot discover an omitted year or an invalid exemption. The seed includes fictional ADR and COI entries for the current calendar year. Create real annual tasks and verify current rules separately.

`harvest-ready` is a review list, never a release decision. It counts unresolved disease notes and treatment reviews. A zero count means no flag in recorded data, not that honey is safe. `npm run docs` creates a preparation pack for the current MPI declaration, not a substitute statutory form. Complete the official form for each delivery and arrange any destination-specific evidence: https://www.mpi.govt.nz/food-business/honey-bee-products-processing-requirements/honey-and-bee-product-forms-templates-and-requirements .

Harvest-to-batch allocation cannot exceed the recorded harvested weight, and extraction cannot predate harvest. Allocated input weights do not represent packed weight, final yield, inventory available for sale or a manuka grading result.
