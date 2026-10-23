#!/usr/bin/env node
/** Inspect the actual npm tarball, including hashes of all runtime resources. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export function verifyPackage(filename) {
 const tar = gunzipSync(readFileSync(filename)), files = new Map();
 const string = (block, start, length) => block.subarray(start, start + length).toString('utf8').replace(/\0.*$/s, '');
 for (let pos = 0; pos + 512 <= tar.length;) {
  const block = tar.subarray(pos, pos + 512); if (block.every(byte => byte === 0)) break;
  const prefix = string(block, 345, 155), name = (prefix ? prefix + '/' : '') + string(block, 0, 100);
  const size = parseInt(string(block, 124, 12).trim() || '0', 8), type = string(block, 156, 1);
  assert(Number.isSafeInteger(size) && size >= 0 && pos + 512 + size <= tar.length, 'Invalid tar entry');
  assert(name.startsWith('package/') && !name.includes('\\') && !name.split('/').includes('..'), `Unsafe path: ${name}`);
  if (type === '' || type === '0') {
   const path = name.slice(8); assert(!files.has(path), `Duplicate entry: ${path}`);
   files.set(path, tar.subarray(pos + 512, pos + 512 + size));
  } else assert(type === '5', `Unexpected tar entry type: ${type} (${name})`);
  pos += 512 + Math.ceil(size / 512) * 512;
 }
 const pkg = JSON.parse(files.get('package.json')?.toString() || 'null'); assert(pkg, 'Missing package.json');
 const expected = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
 assert.deepEqual(pkg, expected, 'Packed manifest differs from source');
 const allowed = path => path === 'package.json' || pkg.files.some(entry => path === entry || path.startsWith(entry + '/'));
 for (const [path, bytes] of files) {
  assert(allowed(path), `Unexpected package file: ${path}`);
  assert(!/(?:^|\/)(?:\.DS_Store|\.git|node_modules|tests|tools|screenshots|reference|source)(?:\/|$)/.test(path), `Development file in package: ${path}`);
  assert.equal(digest(bytes), digest(readFileSync(join(root, path))), `Packed file differs: ${path}`);
 }
 const required = path => statSync(join(root, path)).isDirectory() ? readdirSync(join(root, path)).flatMap(name => required(path + '/' + name)) : [path];
 for (const path of ['package.json', ...pkg.files.flatMap(required)]) assert(files.has(path), `Missing file: ${path}`);
 const manifest = JSON.parse(files.get('assets/manifest.json'));
 for (const asset of Object.values(manifest.assets)) {
  const bytes = files.get('assets/' + asset.file); assert(bytes, `Missing asset: ${asset.file}`);
  assert.equal(bytes.length, asset.bytes); assert.equal(digest(bytes), asset.sha256);
 }
 for (const entry of [pkg.main, pkg.exports['./client'], pkg.dsh.bundle.patch]) assert(files.has(entry.replace(/^\.\//, '')), `Missing entry: ${entry}`);
 console.log(`✓ 实际安装包：${files.size} 个文件，${Object.keys(manifest.assets).length} 项资源摘要与大小一致，无开发缓存／参考稿`);
 return {files:files.size, assets:Object.keys(manifest.assets).length};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
 assert(process.argv[2], 'Usage: node tests/verify-package.mjs <package.tgz>'); verifyPackage(resolve(process.argv[2]));
}
