# Get started with Risk Fork

Agoragentic Risk Fork is an Apache-2.0 experimental protocol and reference
implementation created by Jeremy Borden / Agoragentic. Choose the demonstration
path to see it work, or the host integration path to develop an adapter.

## Run the local reference

The standalone core includes an offline local reference and framework examples.
The locked development graph requires Node >=20.18.1. Run the local reference on
a POSIX host with a private state root; native Windows local-reference storage
is unavailable pending ACL/reparse qualification.

```sh
export TMPDIR="$(cd "${TMPDIR:-/tmp}" && pwd -P)"
export TMP="$TMPDIR" TEMP="$TMPDIR"
export XDG_STATE_HOME="$(cd "$(mktemp -d)" && pwd -P)"
chmod 700 "$XDG_STATE_HOME"
npm --prefix risk-fork ci --ignore-scripts --no-audit --no-fund
npm --prefix risk-fork run self-test
npm --prefix risk-fork run demo:frameworks
```

Retain that task-specific temporary directory while inspecting output, then
remove it when finished. Do not relax the adapter's ownership/mode checks or
change an existing user state directory to make a fixture pass.

These examples grant no external-action authority and provide no live isolation
or traffic protection. The separate visual demo is outside this core export;
use its [exact upstream quickstart](https://github.com/Agoragentic/agoragentic-integrations/blob/7063285e253f92ba18f71470878cef5653a82743/risk-fork/hackathon/docs/QUICKSTART.md)
in that upstream checkout. Do not run demo paths inside this standalone repository.

## Install a local package candidate

The candidate package is `@agoragentic/risk-fork@0.1.0-alpha.1`, ESM, Node 20+.
The optional E2B 2.64.0 adapter requires Node >=22.19.0 and a separately
installed exact SDK; it fails closed on older runtimes before loading the SDK.
Core imports, local execution and offline demonstrations remain Node 20+.
See [E2B migration and qualification](./E2B_SDK_MIGRATION.md).
Registry publication must be confirmed on the official release before using an
npm registry installation command. You can test the real package today:

```powershell
npm --prefix risk-fork ci --ignore-scripts --no-audit --no-fund
npm --prefix risk-fork run test:package
```

That check packs the actual tarball, installs it into a fresh consumer using
the source lockfile's exact dependency graph and local npm cache, imports package exports, runs the local lifecycle, MCP
host example, and provider-free framework-adapter demo, and checks verified cleanup. It removes its temporary consumer.
It does not publish the package, test unlocked registry resolution, or contact a sandbox provider.

To retain a tarball for your own project, run `npm pack --ignore-scripts` in the
`risk-fork` directory, then `npm install --ignore-scripts <absolute-tarball-path>`
in your project. Dependencies may be fetched during this ordinary installation.
The packed `examples/local-reference.mjs` and
`examples/framework-adapters.mjs` are runnable with local Node.

## Integrate at the host boundary

Read [MCP_HOST_ADAPTER.md](./MCP_HOST_ADAPTER.md) and run its complete example.
The trusted application owns the controller, descriptor resolver, provider,
policy and operation builders. It presents an opaque session interface to the
agent and validates each operation before executing it.

For the targeted MCP `2026-07-28` source compatibility boundary, read
[MCP_2026_07_28_READINESS.md](./MCP_2026_07_28_READINESS.md). The source accepts
`x-mcp-header` only on `string`, `integer`, or `boolean` inputs, uses JSON
Schema 2020-12 for typed results unless draft-07 is explicitly declared,
permits an MCP `structuredContent` member to use any JSON type when the exact
bound result schema allows it, subject to taint and size, depth, and node
bounds, and preserves local result schema references. The package exposes
those validation contracts through its MCP transport and taint-gate exports;
importing them does not install hosted interception or activate provider
execution.

A model prompt or MCP tool description is discovery, not enforcement. Every
instruction-bearing read and consequential tool path must pass through the
host. An agent retaining an independent shell, network client or direct MCP
transport can bypass a wrapper. The host must remove or intercept those paths.

For native OpenAI Agents JS function tools, LangChain JS tool handlers, or
LangGraph JS nodes, read [FRAMEWORK_ADAPTERS.md](./FRAMEWORK_ADAPTERS.md). Those
shims are default-off and require exact branded boundary, plan-source, and
executor capabilities. They do not bundle the external frameworks, a provider,
hosted activation, or Python equivalents.

The source adapter is for local protocol integration. Production remains
blocked by real provider qualification, mandatory host installation and durable
production authorization. E2B allocation remains disabled in source. See
[SECURITY_MODEL.md](./SECURITY_MODEL.md) and the current status in [README.md](./README.md).

## Contribute and cite

Report a reproducible issue with the exact commit, Node/client versions,
synthetic scenario, sanitized receipt and expected result. Do not attach raw
credentials, private workspaces or customer data. Useful contributions include
adversarial test cases, provider conformance, client onboarding and framework
adapters. Cite [CITATION.cff](./CITATION.cff); preserve [NOTICE](./NOTICE) in
applicable redistributions.
