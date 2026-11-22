# E2B 2.64.0 source migration

Core Risk Fork and the hosted bundle continue to support Node >=20. The optional
E2B adapter now requires Node >=22.19.0 and exact `e2b@2.64.0`, matching upstream's
runtime requirement. Node 20 and Node 22.0–22.18 cannot load the SDK, construct its
process boundary, or enter build/live harnesses. Runtime checks precede option
reads and SDK imports, including inside the separately spawned SDK process.
Offline injected simulators remain available on Node 20 and cannot carry trusted
qualification or grant provider authority.

The SDK's upstream glob 14 dependency removes the affected glob/minimatch path
tracked by GHSA-3g3m-2fjr-6pw4 and GHSA-g3hv-75wg-m249. Development qualification
has its own private, engine-strict package and lockfile in `sdk-qualification/`.
There are no E2B dependency overrides or audit exceptions. The core install does
not install the optional peer automatically. Hosts choosing E2B must install the
exact SDK on a supported runtime, audit their actual full dependency graph, and
establish their own signed exact-byte closure binding.

The provider-free HTTP-refusal tests explicitly pin `undici@7.30.1` as a
development-only dependency rather than relying on the removed E2B transitive
dependency. Running this development test graph requires Node >=20.18.1; the
core production runtime remains Node >=20 and does not install Undici.

## Exact 2.64.0 dependency closure

The qualification lock contains the same 24 installed packages as 2.63.0.
Only `e2b` (2.63.0 to 2.64.0) and `@e2b/dockerfile-utils` (0.1.1 to 0.1.2)
change package bytes. The raised connect/connect-web/glob dependency floors
already match the existing locked resolutions; no package is added or removed.
The new SDK exposes Authorization-header authentication, custom command shells,
and resizable/template APIs. These are not admitted by the adapter's closed
creation contract: caller-supplied `apiHeaders`, `shell` and `cpuCount` remain
rejected. Wire fixtures continue to require empty authority maps and deny-all
network settings. Source tests and loopback observations cannot establish live
containment or authorize these new provider capabilities.

## Evidence and historical cleanup

Current evidence uses `agoragentic.risk-fork.e2b-qualification-evidence.v3`, bound
to SDK 2.64.0. The unchanged v1 (2.39.0) and v2 (2.63.0) JSON schemas remain
in the core package for historical inspection. The current verifier rejects
both historical profiles even if their SDK fields are rewritten; existing
signatures and hashes cannot be migrated by editing fields. Observer and trust envelopes retain their versions because they already
bind the entire evidence hash, including its profile and SDK closure. Their
signatures must be established again for new evidence.

The current adapter refuses historical v1/v2 evidence for new effects or provider
cleanup. Explicit `*Historical*V2` helpers retain genuine signed 2.63.0 observation
and trust verification for audit/cleanup provenance only. They preserve the v2
schema and original evidence bytes, require distinct profile-bound verifier
objects, return `grants_new_effects: false`, and cannot load the old SDK or enable
the current adapter. An operator with an old-profile journal must retain its
exact original reviewed runtime,
signed artifacts and independent cleanup policy, or use separately authorized
provider-side reconciliation. Do not reinterpret an old journal as v3, silently
upgrade its SDK, or claim absence without observation. This source change neither
executes cleanup nor changes production credentials or installations.

## Qualification limits

Upstream SDK 2.51+ creates sandboxes through `/v2/sandboxes`; that endpoint always
uses secure envd access and no longer sends the deprecated `secure` option. The
adapter still requires `secure: true`. The real-SDK loopback test verifies the
exact v2 route, returned envd token on subsequent file access, exclusion of the
provider API key from that request, and the existing deny-all network, empty
authority and lifecycle bindings. This is wire-contract evidence, not a live
provider containment test.

The historical hackathon fake SDK and August canary records remain labelled
2.39.0. They are not renamed or used as evidence for 2.64.0. Current metadata,
schema, exact-binding tests and SDK tests are separate. Core tests run on Node
20/22/24; SDK tests run on Linux at the minimum Node 22.19.0 and current Node
22/24, plus Windows/macOS on Node 22 to retain the previous platform coverage.
All qualification is provider-free. The hard-false live activation gate,
detached pinned signatures, dependency closure, read-only custody, cancellation,
cleanup and cost gates remain mandatory. No production qualification, package
publication, deployment or live-provider authorization is established here.

Upstream references: [SDK 2.64.0 metadata](https://registry.npmjs.org/e2b/2.64.0),
[SDK changelog](https://github.com/e2b-dev/E2B/blob/e2b%402.64.0/packages/js-sdk/CHANGELOG.md),
[glob migration](https://github.com/e2b-dev/E2B/pull/2069).

## Reviewed owning-source alignment

The standalone runtime uses the exact shared source already reviewed and merged
in Integrations PR #571 at `74e186539222c3e6ee84590e067c8784fcbddd94`.
The hosted generator reproduces its existing bundle without refreshing reviewed
source pins. The standalone consumer fixture advances only to that immutable
owning revision after exact source, generated artifact, tamper refusal and
historical schema checks. Integrations remains the hosted compatibility source;
this alignment does not redirect a consumer to the standalone repository or
establish a release, deployment or live-provider qualification.
