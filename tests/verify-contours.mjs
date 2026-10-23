/** These geometry hashes were captured before moving the existing algorithm to a worker. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
let definition;
runInNewContext(readFileSync(new URL('../lib/client.js', import.meta.url),'utf8'), {window:{__ModuleLoader__:{load(value){definition=value;}}}});
const render = definition.factory(()=>{}).createContourRenderer();
const frames = [
 [0,'17f646d50467182cc0ff59c21fb9d3a9ed1d3ee125234fb23416858e2984c691'],
 [.5,'f5ba6099bffaf9c6ebcabfddb07939e8d57c5137ad172a898e63e3e0a916aa2e'],
 [4,'70ebbc10be6c30ada765bfc27f0dcf76ba7fa27d79ec1f02009cf404649acdf8'],
 [19.25,'d7eecdac168e4f22c5d77ac60de6c9767325df06b1b14e0b32b592ff2ecc07e8'],
];
for (const [time, digest] of frames) assert.equal(createHash('sha256').update(JSON.stringify(render(time))).digest('hex'),digest,'Contour geometry changed at '+time);
console.log('✓ 等高线四个时间点的全部 24 层路径与优化前逐字一致');
