/** Local fixtures use the same asset HTTP handler as DSH; no file:// media shortcuts. */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { assetRoutes } from '../../lib/host-assets.mjs';

export async function startFixtureServer() {
 const root = new URL('../../', import.meta.url), routes = new Map(assetRoutes().map(route => [route.path, route]));
 const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (routes.has(path)) {void routes.get(path).handler(req, res); return;}
  if (!/^\/(?:tests\/fixtures\/[a-z-]+\.html|lib\/client\.js)$/.test(path)) {res.writeHead(404); res.end(); return;}
  try {
   const data = readFileSync(new URL('.' + path, root));
   res.writeHead(200, {'content-type': path.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8', 'cache-control':'no-store', 'content-length':data.length});
   res.end(req.method === 'HEAD' ? undefined : data);
  } catch {res.writeHead(404); res.end();}
 });
 await new Promise((resolve, reject) => {server.once('error', reject); server.listen(0, '127.0.0.1', resolve);});
 return {origin:'http://127.0.0.1:' + server.address().port, async close() {server.closeAllConnections(); await new Promise(resolve => server.close(resolve));}};
}
