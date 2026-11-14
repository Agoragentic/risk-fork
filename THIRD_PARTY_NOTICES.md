# Source and third-party notices

- Current Risk Fork core: Apache-2.0, with the original `risk-fork/LICENSE`, `risk-fork/NOTICE`, authors and citation retained. Root LICENSE mirrors the core license.
- Unicode security data: Unicode License V3 and the reviewed data provenance remain in `risk-fork/NOTICE` and `risk-fork/src/util.mjs`; the root NOTICE retains them.
- Original integrations repository material and copied public MCP/SkillSpector test fixtures: original MIT notice retained in `LICENSE-MIT-UPSTREAM` and `risk-fork/test/fixtures/upstream-mcp/LICENSE`. Exact fixture paths/hashes are documented in `risk-fork/test/fixtures/UPSTREAM.md`.
- Shared `transaction-assurance/src/canonical.mjs`: its own upstream Apache-2.0 LICENSE remains at `transaction-assurance/LICENSE`.
- Historical Risk Fork commits originally used MIT before the upstream license change. The filtered history retains those original notices. The root Apache license does not erase historical or third-party obligations.

Dependencies are obtained from the committed lockfiles and keep their own licenses. Generated dependency trees and the separately owned hosted bundle are not included in this source export.
