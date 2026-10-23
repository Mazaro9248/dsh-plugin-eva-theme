#!/usr/bin/env node
/** Repeatable real-pointer drop profile in an isolated fixture, not the live DSH app. */
import { writeFileSync, statSync } from 'node:fs';
import { startFixtureServer } from './lib/fixture-server.mjs';
import { launchBrowser, wait } from './lib/browser.mjs';
const server = await startFixtureServer();
let browser;
try {browser = await launchBrowser();} catch (error) {await server.close(); throw error;}
const out = process.argv.find(arg => arg.startsWith('--output='))?.slice(9);
const fixture = process.argv.find(arg => arg.startsWith('--fixture='))?.slice(10) || 'tests/fixtures/boot.html';
const url = server.origin + '/' + fixture;
const samples = [];
try {
 for (const [width,height] of [[1280,800],[1920,1080]]) {
  const page = await browser.page(width,height);
  try {
   await page.command('Page.navigate', {url});
   for (let i=0;i<500;i++) { if (await page.evaluate("document.getElementById('RESULT')?.textContent !== 'not-run' && !!window.previewPilot")) break; await wait(50); }
   for (let run=0;run<3;run++) {
    await page.evaluate('window.previewPilot(null)',true);
    await page.evaluate(`(()=>{
     window.dropProfile={frames:[],longTasks:[],started:0,handlerMs:0,firstFrameMs:0};
     const p=window.dropProfile;let last=0;
     p.observer=new PerformanceObserver(list=>{for(const task of list.getEntries())if(task.startTime>=p.started&&p.started)p.longTasks.push(task.duration)});p.observer.observe({type:'longtask'});
     const tick=now=>{if(p.started){if(last)p.frames.push(now-last);last=now}p.frame=requestAnimationFrame(tick)};p.frame=requestAnimationFrame(tick);
     window.addEventListener('pointerup',()=>p.started=performance.now(),{once:true,capture:true});
     document.addEventListener('pointerup',()=>{p.handlerMs=performance.now()-p.started;requestAnimationFrame(()=>p.firstFrameMs=performance.now()-p.started)},{once:true});
    })()`);
    const boxes=await page.evaluate(`(()=>{const a=document.querySelector('.eva-pilot-card[data-pilot=rei]').getBoundingClientRect(),b=document.querySelector('.eva-entry-bay').getBoundingClientRect();return {a:{x:a.x+a.width/2,y:a.y+a.height/2},b:{x:b.x+b.width/2,y:b.y+b.height/2}}})()`);
    await page.command('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...boxes.a});
    for(let step=1;step<=5;step++)await page.command('Input.dispatchMouseEvent',{type:'mouseMoved',buttons:1,x:boxes.a.x+(boxes.b.x-boxes.a.x)*step/5,y:boxes.a.y+(boxes.b.y-boxes.a.y)*step/5});
    await page.command('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...boxes.b});
    await wait(1250);
    const sample=await page.evaluate(`(()=>{const p=window.dropProfile;cancelAnimationFrame(p.frame);p.observer.disconnect();const frames=p.frames.sort((a,b)=>a-b);return {phase:document.querySelector('.eva-boot')?.dataset.phase,renderer:document.querySelector('.eva-boot-contours')?.dataset.renderer,handlerMs:p.handlerMs,firstFrameMs:p.firstFrameMs,p95FrameMs:frames[Math.floor(frames.length*.95)]||0,maxFrameMs:Math.max(0,...frames),longTaskCount:p.longTasks.length,maxLongTaskMs:Math.max(0,...p.longTasks)}})()`);
    samples.push({width,height,run,...sample});
   }
  } finally {await page.close();}
 }
} finally {await browser.close(); await server.close();}
const report={clientBytes:statSync(new URL('../lib/client.js',import.meta.url)).size,samples};
if(out)writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(samples.some(sample=>sample.phase!=='loading'))process.exitCode=1;
