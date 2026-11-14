// Explicit upstream integration: run only with the exact public source checkout.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const checkout = process.env.RISK_FORK_UPSTREAM_CHECKOUT;
if (!checkout || !path.isAbsolute(checkout)) throw new Error('Set RISK_FORK_UPSTREAM_CHECKOUT to an exact upstream 7063285e253f92ba18f71470878cef5653a82743 checkout');
assert.equal(execFileSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), '7063285e253f92ba18f71470878cef5653a82743', 'exact upstream checkout required');
execFileSync('git', ['-C', checkout, 'diff', '--quiet', 'HEAD', '--', 'risk-fork/src', 'risk-fork/hackathon/src/security.mjs']);
const source = path.join(checkout, 'risk-fork/hackathon/src/security.mjs');
assert.equal(createHash('sha256').update(await readFile(source)).digest('hex'), 'f17d610c83428cfa1411576465c5be499de9eae866318d4432bd70e043a9c933');
const { validateDemoOperation } = await import(pathToFileURL(source).href);

test('hackathon operation gate folds demo-only secret field names', () => {
  assert.throws(
    () => validateDemoOperation({
      kind: 'bounded_file_batch',
      actions: [{
        type: 'read',
        path: 'workspace/result.txt',
        ['cook\u0456e']: 'opaque',
      }],
      commit_candidate: null,
    }),
    /secret|credential/i,
  );
});

