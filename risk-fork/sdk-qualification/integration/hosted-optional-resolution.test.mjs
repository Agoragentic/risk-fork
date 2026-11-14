// Explicit separately supplied upstream bundle; no hosted code is included here.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const bundle = process.env.RISK_FORK_HOSTED_BUNDLE;
if (!bundle || !path.isAbsolute(bundle)) throw new Error('Set RISK_FORK_HOSTED_BUNDLE to the exact artifact from upstream commit 7063285e253f92ba18f71470878cef5653a82743');
assert.equal(createHash('sha256').update(await readFile(bundle)).digest('hex'), 'bc94b1150b653dd32059fb6652d72d3be1b3d8112f5118fa82f93286e878ae57', 'upstream artifact pin');
const hosted = await import(pathToFileURL(bundle).href);
test('hosted bundle rejects unbound ancestor optional before evaluation', async (t) => {
  const root = await mkdtemp(path.join(await realpath(os.tmpdir()), 'risk-fork-hosted-consumer-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const marker = Symbol.for(path.basename(root));
  t.after(() => { delete globalThis[marker]; });
  const sdk = path.join(root, 'inner', 'node_modules', 'e2b');
  const name = 'risk-fork-synthetic-optional';
  const outer = path.join(root, 'node_modules', name);
  await mkdir(path.join(sdk, 'dist'), { recursive: true });
  await mkdir(outer, { recursive: true });
  await writeFile(path.join(sdk, 'package.json'), JSON.stringify({ name: 'e2b', version: '2.63.0', main: 'dist/index.js', optionalDependencies: { [name]: '1.0.0' } }));
  await writeFile(path.join(sdk, 'dist/index.js'), `module.exports = require(${JSON.stringify(name)});\n`);
  await writeFile(path.join(outer, 'package.json'), JSON.stringify({ name, version: '1.0.0', main: 'index.js' }));
  await writeFile(path.join(outer, 'index.js'), `globalThis[Symbol.for(${JSON.stringify(path.basename(root))})] = true; module.exports = {};\n`);
  const verifier = hosted.createE2BRuntimeSdkIntegrityVerifier({ packageDirectory: sdk });
  await assert.rejects(async () => { const pin = await verifier.inspect(); await hosted.loadVerifiedE2BRuntimeSdk(pin, verifier); }, /outside|closure|absent optional/i);
  assert.equal(globalThis[marker], undefined);
});
