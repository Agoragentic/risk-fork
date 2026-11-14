# Contributing

The repository keeps `risk-fork/` and the tiny `transaction-assurance/src/canonical.mjs` dependency at their original paths to preserve provenance and minimize migration churn. Work on a branch and keep changes reviewable.

Run the local checks in README.md. To exercise the optional real SDK against local test boundaries, use Node >=22.19:

```sh
npm --prefix risk-fork/sdk-qualification ci --ignore-scripts --no-audit --no-fund
npm --prefix risk-fork/sdk-qualification test
npm --prefix risk-fork audit
npm --prefix risk-fork/sdk-qualification audit
```

The local core suite may explicitly skip tests requiring PostgreSQL or another operating system. Such skips are not evidence that those paths pass. The core CI workflow adds mandatory disposable PostgreSQL role/race/TLS tests with `RISK_FORK_REQUIRE_POSTGRES_TESTS=1` and `RISK_FORK_REQUIRE_POSTGRES_TLS_TESTS=1`. It also runs the SDK suite on Linux, Windows and macOS, a pinned public SkillSpector source probe and separate exact-source external consumer tests. Never point the PostgreSQL tests at an existing or production database.

The CodeQL workflow and lockfile audits supply source/dependency checks. No workflow publishes a package, deploys a service or activates a provider. Before first publication, independently review the filtered history, attribution, packed artifact and source boundary. Preserve upstream scanner findings with explicit dispositions; do not describe an investigated false positive as a scanner that returned zero findings.

For an SDK or core change consumed by the hosted package, update and validate the owning integrations PR's generated bundle and source manifest as well. Passing the standalone tests does not establish downstream source binding. Consumer source acquisition and eventual mirror removal are separate reviewed migration steps.

Report what changed, reproduction, tests and real limitations. Keep production gates and owner-only steps visible in the existing completion issue. Do not close that issue merely because source code or a repository exists.
