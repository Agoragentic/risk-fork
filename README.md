# Risk Fork

Risk Fork provides deterministic contracts and host controls for agents that need to inspect an operation before allowing consequential effects. It keeps classification, authority, evidence and execution outcomes separate. Model judgments cannot grant permission.

This standalone core source export targets [`Agoragentic/risk-fork`](https://github.com/Agoragentic/risk-fork) and was prepared from public upstream commit [`7063285e253f92ba18f71470878cef5653a82743`](https://github.com/Agoragentic/agoragentic-integrations/commit/7063285e253f92ba18f71470878cef5653a82743). That commit contains unmerged upstream PR work. Source availability does not establish a package release, installation into an owner's environment, or production qualification. The existing [integrations source](https://github.com/Agoragentic/agoragentic-integrations/tree/main/risk-fork) remains the compatibility source while consumer lineage and migration gates are open.

## Try the local reference

Core production imports support Node 20 or later; the locked development graph requires Node >=20.18.1. Optional E2B SDK qualification requires Node 22.19 or later. These commands install locked development dependencies and run local fixtures; they do not create a provider sandbox:

For the local reference example, use a POSIX host with a private state root. A fresh temporary directory avoids changing the permissions of an existing user directory. Native Windows local-reference storage remains unavailable pending ACL/reparse qualification; this does not prevent the separately tested cross-platform SDK checks.

```sh
export TMPDIR="$(cd "${TMPDIR:-/tmp}" && pwd -P)"
export TMP="$TMPDIR" TEMP="$TMPDIR"
export XDG_STATE_HOME="$(cd "$(mktemp -d)" && pwd -P)"
chmod 700 "$XDG_STATE_HOME"
npm --prefix risk-fork ci --ignore-scripts --no-audit --no-fund
npm --prefix risk-fork run check
npm --prefix risk-fork test
npm --prefix risk-fork run self-test
npm --prefix risk-fork run test:package -- --offline
```

Keep the temporary state directory while inspecting the local output, then remove that task-specific directory when finished. The adapter refuses unsafe ownership or permissions; do not relax that check to make the example run.

The reference adapter demonstrates host-controlled allow, approval-required and deny behavior. It is not evidence of production isolation. See [the core guide](risk-fork/GETTING_STARTED.md), [security model](risk-fork/SECURITY_MODEL.md), and [framework adapters](risk-fork/FRAMEWORK_ADAPTERS.md).

## What is included

- Core contracts, classifier, controller, taint and clean-commit boundaries, receipts, framework adapters and PostgreSQL authority adapters.
- Schemas, migrations, local examples and offline/package tests, plus separately installed provider-free SDK qualification.
- Public operational documentation and SQL templates. Their presence does not mean a managed service is included or deployed.

The managed-service runtime, hosted MCP package, demo application and private host wiring remain in their owning locations. No provider credentials or live activation are supplied. A small shared canonicalization module remains at its upstream path so template inputs keep their source identity.

## Host integration is explicit

The standalone package does not include the production MCP gateway. The client-adoption CLI's inherited default points to the integrations sibling `mcp/risk-forkd.js`; that path is absent here and fails closed. Supply a separately reviewed gateway with `--gateway <absolute-path>` and `--gateway-sha256 <exact-sha256>` when planning a host integration. Test fixtures are for tests, not installation targets. See [client adoption](risk-fork/CLIENT_ADOPTION.md).

The hosted builder still binds repository-relative source hashes in the integrations repository. This export does not switch that consumer to a new URL or package. [Pinned external consumer tests](risk-fork/test/integration/README.md) remain separate from the core suite and fail when their required inputs are missing.

## Status, provenance and license

[Provenance](PROVENANCE.md) records the source boundary and history transformation. [Contribution instructions](CONTRIBUTING.md) separate local tests, mandatory hosted PostgreSQL tests and provider qualification. The [upstream completion record](https://github.com/Agoragentic/agoragentic-integrations/issues/375) retains the operational acceptance gates; an open-source repository is not completion of those gates.

The current core is Apache-2.0; retain [LICENSE](LICENSE), [NOTICE](NOTICE), the Unicode notice, upstream MIT attribution and file-specific notices. Historical commits retain the terms and notices applicable to them. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
