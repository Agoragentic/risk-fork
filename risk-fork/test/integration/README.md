# Separately supplied upstream integrations

With `RISK_FORK_UPSTREAM_CHECKOUT` set to the canonical absolute checkout of
`74e186539222c3e6ee84590e067c8784fcbddd94`, run from the repository root:

```sh
node --test risk-fork/test/integration/compatibility-source.test.mjs
```

This mandatory consumer-CI check binds 54 shared standalone files to the exact
upstream hosted manifest, rejects changed/missing/extra/redirected runtime
sources, and rejects a rewritten manifest. It uses the hosted builder's UTF-8
CRLF-to-LF normalization, preserving lone CR and BOM bytes. The complete pinned
manifest contains additional MCP/Transaction Assurance source outside this
export; the shared-file comparison is not a complete hosted closure assertion.

The standalone package metadata and PostgreSQL runtime dependency intentionally
differ from that old consumer (`pg` 8.23.1 versus 8.16.3). The check pins the
reviewed standalone package and lockfile bytes, binds declared/resolved `pg`, and
explicitly reports that divergence. A lock-only change also requires review. It
does not permit arbitrary package changes or qualify a consumer cutover. A
future package/source change must reconcile these pins through review and
validate the owning hosted build before claiming full compatibility.

The same check runs the current standalone client-adoption CLI against the
actual separately supplied gateway's independently pinned bytes. It writes and
verifies all five disabled review files in a disposable directory, rejects a
wrong gateway hash and a tampered Codex packet, and never starts the gateway or
writes an active client configuration. The standalone gateway default remains
absent; this is evidence for the explicit-gateway review workflow, not an
installation, host isolation or activation proof.

The standalone core test suite excludes demo and hosted code. To run the demo-only security assertion, set `RISK_FORK_UPSTREAM_CHECKOUT` to an absolute checkout of public upstream commit `74e186539222c3e6ee84590e067c8784fcbddd94` and run `npm run test:integration:demo`. The test verifies the exact security-module SHA-256 before import; It also checks the checkout commit and requires the imported core source and demo module to match HEAD.

To run the hosted-consumer regression, provide the absolute `RISK_FORK_HOSTED_BUNDLE` artifact from the same commit and run `npm run test:integration:hosted`. The test verifies the exact artifact SHA-256 before import. Hosted source and bundles are not included in this candidate. These explicit commands fail if their inputs are unavailable; neither test is counted as a standalone core test. No provider call is needed.

The demo and hosted regressions below exercise historical pinned upstream code;
they do not by themselves validate the current standalone implementation. The
shared-source and real-gateway review check above supplies the bounded additional
proof. The repository URLs in package metadata target `Agoragentic/risk-fork`.
Source availability does not establish an npm package release or replace the
exact upstream consumer bindings above.

The current fixture follows the already merged E2B 2.64.0 owning-source migration
in Integrations PR #571. Its existing generator reproduced artifact
`sha256:076fc71e98e9357f535e3adb261c68a41811256c8564c67209f88a2bd71226ae`
without `--refresh-reviewed-sources`; all hosted artifact/tamper tests passed.
The manifest digest is
`644386e95878db45b03ff9e010b3f284ed350c9c647673f32b4fcea855a1835e`.
The extra shared file is the new v3 evidence schema. Historical v1/v2 schemas
retain their exact bytes and profile-specific interpretation. Changed, missing,
extra and redirected runtime inputs and rewritten manifests still fail. No
owning manifest or bundle was regenerated with new source pins for this change,
and the hosted consumer continues to use Integrations rather than standalone.
