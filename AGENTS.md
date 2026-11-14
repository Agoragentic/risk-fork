# Risk Fork contribution boundaries

Read README.md, PROVENANCE.md, CONTRIBUTING.md, risk-fork/SECURITY_MODEL.md and risk-fork/REPOSITORY_SPLIT_PLAN.md before editing.

- Preserve deterministic authority and default-off live provider controls. Source tests and synthetic fixtures never establish runtime qualification.
- Keep core, private host wiring, hosted consumer and managed runtime boundaries explicit. Do not copy credentials, raw operator evidence, environment files, databases or dependency directories into commits.
- Preserve the integrations compatibility mirror and exact source/bundle bindings until a separately reviewed migration proves all consumers. Do not replace hashes with moving URLs.
- Use isolated branches; preserve other workers' changes. At most two workers, with disjoint file ownership. Agent source review does not constitute a GitHub protected-branch approval.
- Test behavior through existing contracts and real local persistence. Doubles belong at external boundaries. Retain denial, expiry, replay, cancellation, restart and cleanup coverage. Missing integrations must fail an explicit integration command, not appear as a successful test.
- Run the focused suite and required checks for changes. Report exact revisions, pass/fail/skip counts and unrun service/platform tests. Never weaken tests or suppress a finding to obtain green CI.
- Source work does not authorize package release, installation into an owner's normal environment, provider spending, production deployment or activation. Normal protected merges and publication require the applicable owner authorization.
- Record source and runtime status separately in the existing upstream completion record; do not create another task or evidence database.
