#!/usr/bin/env node
/** Real HTTP fixtures and production asset handling in isolated Chrome. */
import { launchBrowser, wait } from './lib/browser.mjs';
import { startFixtureServer } from './lib/fixture-server.mjs';
const attention = process.argv.includes('--attention'), windowDrag = process.argv.includes('--window-drag'), server = await startFixtureServer();
const fixture = windowDrag ? 'window-drag' : attention ? 'attention' : 'client';
let browser;
try {
 browser = await launchBrowser();
 const page = await browser.page();
 await page.command('Page.navigate', {url:server.origin + '/tests/fixtures/' + fixture + '.html'});
 let report;
 for (let sample=0;sample<600;sample++) {
  const text = await page.evaluate("document.getElementById('RESULT')?.textContent");
  if (text && text !== 'not-run') {report=JSON.parse(text); break;}
  await wait(50);
 }
 if (!report) throw new Error('Browser fixture did not finish');
 for (const failure of report.failures) console.error(`✗ ${failure.name} ${failure.detail || ''}`);
 console.log(`${report.failed ? '✗' : '✓'} ${windowDrag ? '窗口拖动区域' : attention ? '角色提示音' : '客户端'}：${report.total} 项，${report.failed} 项失败`);
 process.exitCode = report.failed ? 1 : 0;
} catch (error) {console.error(error.message); process.exitCode=1;}
finally {await browser?.close(); await server.close();}
