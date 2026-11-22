// Provider-free compatibility proof; this does not switch or activate consumers.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { constants as fsConstants } from 'node:fs';
import { copyFile, lstat, mkdir, mkdtemp, open, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const standalone = fileURLToPath(new URL('../../../', import.meta.url));
const checkout = process.env.RISK_FORK_UPSTREAM_CHECKOUT;
const revision = '74e186539222c3e6ee84590e067c8784fcbddd94';
const manifestPath = 'risk-fork-hosted-mcp/integrity-manifest.json';
const manifestDigest = '644386e95878db45b03ff9e010b3f284ed350c9c647673f32b4fcea855a1835e';
const gatewayDigest = 'sha256:7add1f82a164693fec07b9aecb97c25a5505ac0ff516d47d8603a975126f4de8';
// Reviewed 2.64.0 migration retains the package file allowlist and optional
// peer boundary. Demo and managed-runtime implementation remain checkout-only.
const standalonePackageDigest = '6494c125594a72c1d097b445a2d8b84c21f1d5bce402d5f877ba0363e637d0eb';
const standaloneLockDigest = '3c9e859312d7dbe8552469fb9c40131d492a32df3f2ac900fd79e08bd48a86b1';
const recursiveRoots = ['risk-fork/src', 'risk-fork/e2b-template', 'risk-fork/ops/postgres', 'transaction-assurance/src'];
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

// Match the hosted manifest's documented normalization, without normalizing lone CR.
function canonical(bytes) {
  new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  return Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'));
}

async function exactFile(root, relative) {
  const filename = path.join(root, relative);
  const handle = await open(filename, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0) | (fsConstants.O_NONBLOCK ?? 0));
  try {
    const before = await handle.stat({ bigint: true });
    assert.ok(before.isFile(), `non-regular source: ${relative}`);
    assert.ok(before.size > 0n && before.size <= 2n * 1024n * 1024n, `unbounded source: ${relative}`);
    // Read only the opened file and at most its bounded size plus one byte.
    // Replacing the pathname cannot redirect this read to a different inode.
    const buffer = Buffer.alloc(Number(before.size) + 1);
    let length = 0;
    while (length < buffer.length) {
      const { bytesRead } = await handle.read(buffer, length, buffer.length - length, length);
      if (bytesRead === 0) break;
      length += bytesRead;
    }
    assert.equal(BigInt(length), before.size, `source changed while reading: ${relative}`);
    const after = await handle.stat({ bigint: true });
    const currentPath = await lstat(filename, { bigint: true });
    assert.ok(currentPath.isFile() && !currentPath.isSymbolicLink(), `non-regular source: ${relative}`);
    for (const field of ['dev', 'ino', 'mode', 'nlink', 'size', 'mtimeNs', 'ctimeNs']) {
      assert.equal(after[field], before[field], `source changed while reading: ${relative}`);
      assert.equal(currentPath[field], before[field], `source path changed while reading: ${relative}`);
    }
    assert.equal(await realpath(filename), filename, `non-canonical source: ${relative}`);
    return canonical(buffer.subarray(0, length));
  } finally {
    await handle.close();
  }
}

async function pinnedManifest(root) {
  const bytes = await exactFile(root, manifestPath);
  assert.equal(hash(bytes), manifestDigest, 'exact upstream manifest required');
  return JSON.parse(bytes);
}

assert.ok(checkout && path.isAbsolute(checkout), 'Set RISK_FORK_UPSTREAM_CHECKOUT to the exact public compatibility checkout');
assert.equal(await realpath(checkout), checkout, 'upstream checkout must be canonical');
assert.equal(execFileSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], { encoding: 'utf8', timeout: 10_000 }).trim(), revision);
const manifest = await pinnedManifest(checkout);
const shared = manifest.reviewed_sources.filter(({ path: name }) => (
  (name.startsWith('risk-fork/') && name !== 'risk-fork/package.json')
  || name === 'transaction-assurance/src/canonical.mjs'
));
assert.equal(shared.length, 54, 'closed shared-source inventory');

async function filesBelow(root, relative) {
  const filename = path.join(root, relative);
  assert.equal(await realpath(filename), filename, `non-canonical source: ${relative}`);
  const entries = await readdir(filename, { withFileTypes: true });
  const names = [];
  for (const entry of entries) {
    const name = `${relative}/${entry.name}`;
    assert.ok(!entry.isSymbolicLink(), `non-regular source: ${name}`);
    if (entry.isDirectory()) names.push(...await filesBelow(root, name));
    else {
      assert.ok(entry.isFile(), `non-regular source: ${name}`);
      names.push(name);
    }
  }
  return names.sort();
}

async function verifySharedSource(root) {
  for (const directory of recursiveRoots) {
    assert.deepEqual(await filesBelow(root, directory), shared.map(({ path: name }) => name).filter((name) => name.startsWith(`${directory}/`)).sort(), `shared inventory changed: ${directory}`);
  }
  for (const record of shared) {
    const bytes = await exactFile(root, record.path);
    assert.equal(bytes.length, record.bytes, `shared bytes changed: ${record.path}`);
    assert.equal(`sha256:${hash(bytes)}`, record.sha256, `shared digest changed: ${record.path}`);
  }
}

async function temporary(t) {
  const root = await mkdtemp(path.join(await realpath(os.tmpdir()), 'risk-fork-compatibility-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function sourceCopy(t) {
  const root = await temporary(t);
  for (const record of shared) {
    const target = path.join(root, record.path);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(standalone, record.path), target);
  }
  return root;
}

async function verifyStandalonePackage(root) {
  const bytes = await exactFile(root, 'risk-fork/package.json');
  assert.equal(hash(bytes), standalonePackageDigest, 'standalone package change needs explicit compatibility review');
  const lockBytes = await exactFile(root, 'risk-fork/package-lock.json');
  assert.equal(hash(lockBytes), standaloneLockDigest, 'standalone lock change needs explicit compatibility review');
  const pkg = JSON.parse(bytes);
  const lock = JSON.parse(lockBytes);
  assert.deepEqual(lock.packages[''].dependencies, pkg.dependencies);
  assert.equal(pkg.dependencies.pg, '8.23.1');
  assert.equal(pkg.peerDependencies.e2b, '2.64.0');
  assert.deepEqual(pkg.peerDependenciesMeta.e2b, { optional: true });
  assert.deepEqual(lock.packages[''].peerDependencies, pkg.peerDependencies);
  assert.deepEqual(lock.packages[''].peerDependenciesMeta, pkg.peerDependenciesMeta);
  assert.equal(lock.packages['node_modules/pg'].version, '8.23.1');
  const upstreamPackage = manifest.reviewed_sources.find((record) => record.path === 'risk-fork/package.json');
  assert.notEqual(`sha256:${hash(bytes)}`, upstreamPackage.sha256);
}

test('standalone shared sources match the pinned consumer; package closure remains divergent', async (t) => {
  await verifySharedSource(standalone);
  await verifyStandalonePackage(standalone);
  t.diagnostic('54 shared files match. The standalone package/pg graph differs; full hosted closure, cutover and runtime qualification remain unproven.');
});

test('historical E2B schema bytes retain their original qualification identities', async () => {
  for (const [name, digest] of [
    ['e2b-qualification-evidence.v1.json', 'd7b32b5799be9e0fd9ade54b88cbfd3f6b7e7bfcba2c464150d1642583b6a77f'],
    ['e2b-qualification-evidence.v2.json', '37f018d1ad7f0226fb49da7d429a461feb25d1107eed487040d1f7280c92c332'],
  ]) {
    const bytes = await exactFile(standalone, `risk-fork/schema/${name}`);
    assert.equal(hash(bytes), digest, `historical schema changed: ${name}`);
  }
});

test('a lock-only dependency change requires renewed compatibility review', async (t) => {
  const root = await temporary(t);
  await mkdir(path.join(root, 'risk-fork'));
  for (const name of ['package.json', 'package-lock.json']) {
    await copyFile(path.join(standalone, 'risk-fork', name), path.join(root, 'risk-fork', name));
  }
  await verifyStandalonePackage(root);
  const target = path.join(root, 'risk-fork/package-lock.json');
  const lock = JSON.parse(await readFile(target, 'utf8'));
  lock.packages['node_modules/pg'].version = '8.16.3';
  await writeFile(target, `${JSON.stringify(lock, null, 2)}\n`);
  await assert.rejects(verifyStandalonePackage(root), /standalone lock change/);
});

test('a package file-allowlist change requires renewed compatibility review', async (t) => {
  const root = await temporary(t);
  await mkdir(path.join(root, 'risk-fork'));
  for (const name of ['package.json', 'package-lock.json']) {
    await copyFile(path.join(standalone, 'risk-fork', name), path.join(root, 'risk-fork', name));
  }
  await verifyStandalonePackage(root);
  const target = path.join(root, 'risk-fork/package.json');
  const pkg = JSON.parse(await readFile(target, 'utf8'));
  pkg.files.push('managed-service/src/');
  await writeFile(target, `${JSON.stringify(pkg, null, 2)}\n`);
  await assert.rejects(verifyStandalonePackage(root), /standalone package change/);
});

test('shared-source proof rejects altered, missing, extra and redirected runtime files', async (t) => {
  for (const mode of ['altered', 'missing', 'extra', 'redirected']) {
    await t.test(mode, async (t) => {
      const root = await sourceCopy(t);
      const target = path.join(root, 'risk-fork/src/e2b-node-runtime.mjs');
      if (mode === 'altered') await writeFile(target, `${await readFile(target, 'utf8')}\n// standalone drift\n`);
      if (mode === 'missing') await rm(target);
      if (mode === 'extra') await writeFile(path.join(root, 'risk-fork/src/unreviewed.mjs'), 'export const unreviewed = true;\n');
      if (mode === 'redirected') {
        await rm(target);
        await symlink(path.join(standalone, 'risk-fork/src/e2b-node-runtime.mjs'), target);
      }
      await assert.rejects(verifySharedSource(root), /changed|non-regular|non-canonical|ENOENT/);
    });
  }
});

test('rewriting the compatibility manifest cannot reauthorize changed source', async (t) => {
  const root = await temporary(t);
  await mkdir(path.dirname(path.join(root, manifestPath)), { recursive: true });
  await writeFile(path.join(root, manifestPath), JSON.stringify({ ...manifest, reviewed_sources: [] }));
  await assert.rejects(pinnedManifest(root), /exact upstream manifest required/);
});

test('source normalization retains BOM and lone CR while rejecting invalid UTF-8', () => {
  const bytes = Buffer.from('\uFEFFfirst\r\nsecond\rlast\n', 'utf8');
  assert.deepEqual(canonical(bytes), Buffer.from('\uFEFFfirst\nsecond\rlast\n', 'utf8'));
  assert.throws(() => canonical(Buffer.from([0xc3, 0x28])), /encoded data/);
});

test('current standalone CLI produces and verifies disabled packets for the real pinned gateway', async (t) => {
  const root = await temporary(t);
  const gateway = path.join(checkout, 'mcp/risk-forkd.js');
  assert.equal(`sha256:${hash(await readFile(gateway))}`, gatewayDigest, 'exact gateway bytes required');
  const binding = ['--gateway', gateway, '--gateway-sha256', gatewayDigest];
  function cli(args) {
    const result = spawnSync(process.execPath, [path.join(standalone, 'risk-fork/scripts/client-adoption.mjs'), ...args], {
      cwd: root, encoding: 'utf8', timeout: 15_000, maxBuffer: 1024 * 1024,
    });
    assert.equal(result.error, undefined);
    return result;
  }
  const output = path.join(root, 'review');
  const written = cli(['write-review', '--client', 'all', '--output', output, '--yes', ...binding]);
  assert.equal(written.status, 0, written.stderr);
  const result = JSON.parse(written.stdout);
  assert.equal(result.manifest.files.length, 5);
  assert.equal(result.manifest.gateway.gateway_entrypoint, gateway);
  assert.equal(result.manifest.controls.client_enabled, false);
  assert.equal(result.manifest.controls.provider_calls, 0);
  assert.equal(result.manifest.controls.active_client_paths_written, false);
  assert.deepEqual((await readdir(root)).sort(), ['review']);
  const verifyArgs = ['verify-review', '--manifest', path.join(output, 'manifest.json'), ...binding];
  const verified = cli(verifyArgs);
  assert.equal(verified.status, 0, verified.stderr);
  assert.equal(JSON.parse(verified.stdout).files_verified, 5);

  const wrongBinding = cli(['plan', '--client', 'all', '--gateway', gateway, '--gateway-sha256', `sha256:${'0'.repeat(64)}`]);
  assert.equal(wrongBinding.status, 64);
  assert.match(wrongBinding.stderr, /reviewed SHA-256/);
  const config = path.join(output, 'codex-risk-fork.disabled.toml');
  await writeFile(config, (await readFile(config, 'utf8')).replace('enabled = false', 'enabled = true'));
  const changed = cli(verifyArgs);
  assert.equal(changed.status, 64);
  assert.match(changed.stderr, /does not match current source/);
});
