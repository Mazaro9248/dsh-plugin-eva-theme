#!/usr/bin/env node
/** Local build, verification and packaging; never publishes or changes Git state. */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { verifyPackage } from '../tests/verify-package.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const npm = process.env.npm_execpath;
const command = npm ? process.execPath : process.platform === 'win32' ? 'npm.cmd' : 'npm';
const run = (args, capture = false) => new Promise((resolve, reject) => {
 const child = spawn(command, npm ? [npm, ...args] : args, {cwd:root, stdio:['ignore', capture ? 'pipe' : 'inherit', 'inherit']});
 let output = ''; if (capture) child.stdout.on('data', chunk => output += chunk);
 child.on('error', reject); child.on('close', code => code === 0 ? resolve(output) : reject(new Error(`npm ${args.join(' ')} exited ${code}`)));
});
await run(['run', 'build']);
await run(['run', 'check']);
await run(['test']);
const output = join(root, 'dist'); mkdirSync(output, {recursive:true});
const cache = mkdtempSync(join(tmpdir(), 'eva-pack-'));
try {
 const result = JSON.parse(await run(['pack', '--ignore-scripts', '--offline', '--json', '--pack-destination', output, '--cache', cache], true));
 if (result.length !== 1) throw new Error('Expected one package');
 const filename = result[0].filename, path = join(output, filename), verified = verifyPackage(path);
 const bytes = readFileSync(path), sha256 = createHash('sha256').update(bytes).digest('hex');
 writeFileSync(join(output, 'SHA256SUMS.txt'), `${sha256}  ${filename}\n`);
 const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
 writeFileSync(join(output, 'release-manifest.json'), JSON.stringify({name:pkg.name, version:pkg.version, filename, bytes:bytes.length, sha256, ...verified}, null, 2) + '\n');
 console.log(`✓ 可发布文件：${path}\n  ${(bytes.length / 1024 / 1024).toFixed(2)} MiB · SHA-256 ${sha256}`);
} finally {rmSync(cache, {recursive:true, force:true});}
