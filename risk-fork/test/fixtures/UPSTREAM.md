# Public upstream test fixtures

Source: public Agoragentic/agoragentic-integrations commit `7063285e253f92ba18f71470878cef5653a82743`. `upstream-mcp/mcp-server.cjs` is byte-for-byte `mcp/mcp-server.js` (SHA-256 `9129eddad56f80e29b86f59c5968be007271f57b121ac754218c8820360bdd5e`); the extension and minimal version and CommonJS package manifest are adapted for this test fixture. The source imports Node built-ins and its adjacent manifest at module load; MCP server dependencies are required only when the CLI runs. It is public MIT-licensed source, not the private hosted bundle. The original MIT license is in `upstream-mcp/LICENSE`.

`skillspector.admission.example.json` is byte-for-byte `skillspector/skillspector.admission.example.json` (SHA-256 `56f36fa1ef35acefedb4d08c637767d7248ec77bfbf61c5d7e70fd3b73243edb`), from the same public MIT-licensed repository; the MIT notice in `upstream-mcp/LICENSE` applies.

`upstream-mcp/risk-forkd.js` is byte-for-byte `mcp/risk-forkd.js` from the same commit (SHA-256 `7add1f82a164693fec07b9aecb97c25a5505ac0ff516d47d8603a975126f4de8`); the adjacent minimal manifest keeps the fixture CommonJS.
