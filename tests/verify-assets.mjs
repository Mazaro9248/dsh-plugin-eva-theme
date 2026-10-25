/** Check the shipping allowlist, original media, paths, cache validators and audio ranges. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { assetRoutes, ASSET_BASE } from '../lib/host-assets.mjs';
const root = new URL('../assets/', import.meta.url), manifest = JSON.parse(readFileSync(new URL('manifest.json',root),'utf8'));
const routes = new Map(assetRoutes().map(route=>[route.path,route])), files = new Set(), hashes = new Set();let checks=0;
for (const [key,asset] of Object.entries(manifest.assets)) {
 assert(!files.has(asset.file));files.add(asset.file);assert(!hashes.has(asset.sha256));hashes.add(asset.sha256);
 const bytes=readFileSync(new URL(asset.file,root));assert.equal(bytes.length,asset.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);checks+=4;
 assert.match(asset.file,/^[a-z-]+\/[a-z0-9-]+\.[a-z0-9]+$/);checks++;
 const client=readFileSync(new URL('../lib/client.js',import.meta.url),'utf8');
 if (key==='asukaVoice'||key==='reiVoice') {assert(asset.durationSeconds>6&&asset.durationSeconds<7);assert(client.includes(key+'Duration: '+asset.durationSeconds+','));checks+=2;}
 if (!asset.inline) assert(client.includes(ASSET_BASE+asset.file+'?v='+asset.sha256.slice(0,12)),key+' is not referenced');
 else assert(client.includes(JSON.stringify(bytes.toString('utf8'))),key+' inline markup differs');checks++;
}
for (const folder of ['animations','audio','images','svg','workers']) for (const file of readdirSync(new URL(folder+'/',root))) {assert(files.has(folder+'/'+file),'Unreferenced runtime asset '+file);checks++;}
assert(readFileSync(new URL('../lib/client.js',import.meta.url)).length<300000,'Do not embed large binary media into client.js');checks++;
const server=createServer((req,res)=>{const path=new URL(req.url,'http://localhost').pathname;if(routes.has(path))void routes.get(path).handler(req,res);else{res.writeHead(404);res.end();}});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const base='http://127.0.0.1:'+server.address().port;
try {
 const asset=manifest.assets.bootBgm,url=base+ASSET_BASE+asset.file+'?v='+asset.sha256.slice(0,12),raw=readFileSync(new URL(asset.file,root));
 const head=await fetch(url,{method:'HEAD'});assert.equal(head.status,200);assert.equal(head.headers.get('content-length'),String(raw.length));assert.equal(head.headers.get('content-type'),'audio/mpeg');assert.match(head.headers.get('cache-control'),/immutable/);checks+=4;
 const range=await fetch(url,{headers:{range:'bytes=10-99'}});assert.equal(range.status,206);assert.equal(range.headers.get('content-range'),`bytes 10-99/${raw.length}`);assert.deepEqual(Buffer.from(await range.arrayBuffer()),raw.subarray(10,100));checks+=3;
 const tail=await fetch(url,{headers:{range:'bytes=-32'}});assert.deepEqual(Buffer.from(await tail.arrayBuffer()),raw.subarray(-32));checks++;
 for (const value of ['bytes=999999999-','bytes=90-5','bytes=-0','bytes=0-2,7-8','invalid']) {const res=await fetch(url,{headers:{range:value}});assert.equal(res.status,416);assert.equal(res.headers.get('content-range'),'bytes */'+raw.length);checks+=2;}
 const cached=await fetch(url,{headers:{'if-none-match':head.headers.get('etag')}});assert.equal(cached.status,304);assert.equal((await cached.arrayBuffer()).byteLength,0);checks+=2;
 const stale=await fetch(url,{headers:{range:'bytes=0-9','if-range':'"old"'}});assert.equal(stale.status,200);assert.equal((await stale.arrayBuffer()).byteLength,raw.length);checks+=2;
 assert.equal((await fetch(base+ASSET_BASE+asset.file,{method:'HEAD'})).headers.get('cache-control'),'no-cache');checks++;
 assert.equal((await fetch(url,{method:'POST'})).status,405);checks++;
 for(const path of ['../package.json','%2e%2e/package.json','audio/missing.mp3','source/nerv-boot-original.gif']){assert.equal((await fetch(base+ASSET_BASE+path)).status,404);checks++;}
} finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
console.log(`✓ 资源完整性／命名／缓存／Range／路径隔离：${checks} 项`);
