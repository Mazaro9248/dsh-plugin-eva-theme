/** Versioned package assets: exact allowlist, streaming audio, byte ranges and HTTP cache. */
import { readFileSync, createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

const root = new URL('../assets/', import.meta.url);
export const ASSET_BASE = '/dsh-eva-magi/assets/';

export function assetRoutes() {
 const manifest = JSON.parse(readFileSync(new URL('manifest.json', root), 'utf8'));
 return Object.values(manifest.assets).map(asset => {
  if (!/^(animations|audio|images|svg|workers)\/[a-z0-9-]+\.(gif|mp3|png|svg|js)$/.test(asset.file) || !/^[a-f0-9]{64}$/.test(asset.sha256) || !Number.isSafeInteger(asset.bytes)) throw new Error('Invalid theme asset manifest');
  return {path: ASSET_BASE + asset.file, asset, handler: (req, res) => serveAsset(req, res, asset)};
 });
}

export async function serveAsset(req, res, asset) {
 const etag = '"' + asset.sha256 + '"';
 const version = new URL(req.url, 'http://localhost').searchParams.get('v');
 const headers = {
  'content-type': asset.type,
  'cache-control': version === asset.sha256.slice(0, 12) ? 'public, max-age=31536000, immutable' : 'no-cache',
  'etag': etag, 'accept-ranges': 'bytes', 'x-content-type-options': 'nosniff',
 };
 if (!['GET', 'HEAD'].includes(req.method)) {res.writeHead(405, {...headers, allow:'GET, HEAD'}); res.end(); return;}
 if (req.headers['if-none-match']?.split(/\s*,\s*/).some(value => value === etag || value === 'W/' + etag || value === '*')) {res.writeHead(304, headers); res.end(); return;}
 let start = 0, end = asset.bytes - 1, status = 200;
 const range = req.headers.range;
 if (range && (!req.headers['if-range'] || req.headers['if-range'] === etag)) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (match && (match[1] || match[2])) {
   start = match[1] ? Number(match[1]) : Math.max(0, asset.bytes - Number(match[2]));
   end = match[1] && match[2] ? Math.min(end, Number(match[2])) : end;
  }
  if (!match || !(match[1] || match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= asset.bytes || (!match[1] && Number(match[2]) === 0)) {
   res.writeHead(416, {...headers, 'content-range':'bytes */' + asset.bytes, 'content-length':0}); res.end(); return;
  }
  status = 206; headers['content-range'] = `bytes ${start}-${end}/${asset.bytes}`;
 }
 headers['content-length'] = end - start + 1;
 res.writeHead(status, headers);
 if (req.method === 'HEAD') {res.end(); return;}
 try {await pipeline(createReadStream(new URL(asset.file, root), {start, end}), res);}
 catch (error) {if (!res.destroyed) res.destroy(error);}
}
