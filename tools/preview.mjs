#!/usr/bin/env node
import { startFixtureServer } from './lib/fixture-server.mjs';
const server = await startFixtureServer();
console.log('EVA fixtures (simulated conversations, real package media):');
for (const fixture of ['layout','boot','client','attention']) console.log(server.origin + '/tests/fixtures/' + fixture + '.html');
console.log('Press Ctrl+C to stop.');
for (const signal of ['SIGINT','SIGTERM']) process.once(signal, async()=>{await server.close();process.exit();});
