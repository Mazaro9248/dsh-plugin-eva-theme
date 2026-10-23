#!/usr/bin/env node
/** CSS viewport / DPR / actual media and layout regression in isolated Chrome. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { launchBrowser, wait } from './lib/browser.mjs';
import { startFixtureServer } from './lib/fixture-server.mjs';
const fixtureServer = await startFixtureServer();
let browser;
try {browser = await launchBrowser();} catch (error) {await fixtureServer.close(); throw error;}
const send = browser.send;
const bootMode=process.argv.includes("--boot");
const harness=fixtureServer.origin + '/tests/fixtures/' + (bootMode ? 'boot' : 'layout') + '.html';
const cases=bootMode?[[1920,1080,1],[1280,800,1],[800,600,1],[360,640,1],[640,320,1],[1280,800,1,true]]:[[1600,1000,1],[1280,800,1],[1024,640,1],[800,600,1],[640,480,1],[480,640,1],[360,640,1],[640,320,1],[1280,720,1.25],[1067,600,1.5],[800,450,2],[534,300,3]];
const screenshotDir=process.argv.find(arg=>arg.startsWith("--screenshots="))?.slice("--screenshots=".length) || process.env.EVA_SCREENSHOTS;
let total=0,failed=0;
try{
	for(const [width,height,dpr,reducedMode] of cases){
		const {targetId}=await send("Target.createTarget",{url:"about:blank"});
		const {sessionId}=await send("Target.attachToTarget",{targetId,flatten:true});
		const command=(method,params)=>send(method,params,sessionId);
		try{
			await command("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:dpr,mobile:false});
			if(reducedMode)await command("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
			await command("Page.enable");await command("Page.navigate",{url:harness});
			let report;
			for(let i=0;i<240;i++){
				const {result,exceptionDetails}=await command("Runtime.evaluate",{expression:"document.getElementById('RESULT')?.textContent",returnByValue:true});
				if(exceptionDetails)throw new Error(JSON.stringify(exceptionDetails));
				if(result.value && result.value!=="not-run"){report=JSON.parse(result.value);break;}
				await wait(50);
			}
			if(!report)throw new Error("布局页面没有完成测试");
			if(bootMode){
				if(width===1280&&!reducedMode){
					for(const pilot of ["asuka","rei"]){
						await command("Runtime.evaluate",{expression:`window.previewPilot(${JSON.stringify(pilot)},true)`,awaitPromise:true});
						await command("Runtime.evaluate",{expression:"window.dragEvents=[];for(const type of ['pointerdown','pointermove','pointerup','pointercancel','gotpointercapture','lostpointercapture'])document.addEventListener(type,event=>window.dragEvents.push({type:event.type,target:event.target.className,pointer:event.pointerId,buttons:event.buttons,x:event.clientX,y:event.clientY,over:document.querySelector('.eva-entry-bay')?.dataset.over}),{capture:true})"});
						const pilotBox=await command("Runtime.evaluate",{returnByValue:true,expression:`(()=>{const r=document.querySelector('.eva-pilot-card[data-pilot="${pilot}"]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`});
						await command("Input.dispatchMouseEvent",{type:"mousePressed",button:"left",clickCount:1,...pilotBox.result.value});
						let releaseAt=pilotBox.result.value;
						if(pilot==="asuka"){
							const dropBox=await command("Runtime.evaluate",{returnByValue:true,expression:"(()=>{const r=document.querySelector('.eva-entry-bay').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()"});
							for(let step=1;step<=5;step++)await command("Input.dispatchMouseEvent",{type:"mouseMoved",buttons:1,x:pilotBox.result.value.x+(dropBox.result.value.x-pilotBox.result.value.x)*step/5,y:pilotBox.result.value.y+(dropBox.result.value.y-pilotBox.result.value.y)*step/5});
							releaseAt=dropBox.result.value;
						}
						await command("Input.dispatchMouseEvent",{type:"mouseReleased",button:"left",clickCount:1,...releaseAt});
						const selection=await command("Runtime.evaluate",{returnByValue:true,expression:"document.querySelector('.eva-boot')?.dataset.phase"});
						report.total++;if(selection.result.value!=="loading"){
							const events=await command("Runtime.evaluate",{returnByValue:true,expression:"({events:window.dragEvents,ghost:!!document.querySelector('.eva-pilot-ghost'),over:document.querySelector('.eva-entry-bay')?.dataset.over})"});
							report.failed++;report.failures.push({name:pilot+"：真实鼠标"+(pilot==="asuka"?"拖放":"点击")+"装载后开始语音",detail:JSON.stringify(events.result.value)});continue;
						}
						let sawProgress=false,accurate=true,realRun,lastSnapshot;
						for(let sample=0;sample<120;sample++){
							const {result}=await command("Runtime.evaluate",{returnByValue:true,expression:"(()=>{const boot=document.querySelector('.eva-boot'),audio=boot?.querySelector('.eva-boot-voice'),bgm=boot?.querySelector('.eva-boot-bgm');if(bgm&&!bgm.paused&&bgm.volume<.09&&audio?.currentTime>1)window.productionRun.bgmDucked=true;return {run:window.productionRun,phase:boot?.dataset.phase,value:Number(boot?.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow')),position:audio?.currentTime,duration:audio?.duration,paused:audio?.paused,readyState:audio?.readyState,status:boot?.querySelector('.eva-boot-status')?.textContent}})()"});
							const snapshot=result.value;realRun=snapshot.run;lastSnapshot={...snapshot,run:undefined};
							if(snapshot.phase==="loading"&&snapshot.value>0&&snapshot.value<100){sawProgress=true;accurate&&=Math.abs(snapshot.value-snapshot.position/snapshot.duration*100)<3;}
							if(realRun.enteredAt)break;
							await wait(100);
						}
						for(const [name,ok]of [
							["真实选择应答完整播放一次后才启动长语音且无叠音",realRun.pickStartedAt>0&&realRun.pickEndedAt>=realRun.pickStartedAt&&realRun.pickPlays===1&&realRun.pickDuration>1&&realRun.pickDuration<2&&realRun.voiceStartedAt>=realRun.pickEndedAt&&!realRun.overlap],
							["真实 MP3 完整播放至 ended 才开始衔接",realRun.endedAt>0&&realRun.phaseAtEnd==="handoff"],
							["完整语音后舱门交接约 1.6 秒进入聊天",realRun.enteredAt-realRun.endedAt>=1450&&realRun.enteredAt-realRun.endedAt<2200],
							["真实音频时钟持续推进且进度同步",sawProgress&&accurate],
							["播放的真实语音时长约 6.6 秒",realRun.duration>6&&realRun.duration<7],
							["真实背景音乐播放并为语音降音，进入聊天后停止",realRun.bgmStarted&&realRun.bgmDucked&&realRun.bgmStopped],
						]){report.total++;if(!ok){report.failed++;report.failures.push({name:pilot+"："+name,detail:JSON.stringify({run:realRun,last:lastSnapshot})});}}
					}
				}
				total+=report.total;failed+=report.failed;
				for(const failure of report.failures)console.error(`✗ 启动 ${width}×${height}${reducedMode?" 减少动态效果":""}: ${failure.name} ${failure.detail}`);
				if(!report.failed)console.log(`✓ 启动 ${width}×${height}${reducedMode?" 减少动态效果":""}（${report.total} 项）`);
				if(screenshotDir&&!reducedMode&&[1920,1280,640,360].includes(width)){
					mkdirSync(screenshotDir,{recursive:true});
					for(const position of [1350,1800]){
						await command("Runtime.evaluate",{expression:`window.previewEmergency(${position})`,awaitPromise:true});
						const shot=await command("Page.captureScreenshot",{format:"png"});
						writeFileSync(join(screenshotDir,`emergency-${width}-${position}.png`),Buffer.from(shot.data,"base64"));
					}
					for(const pilot of [null,"asuka","rei"]){
						await command("Runtime.evaluate",{expression:`window.previewPilot(${JSON.stringify(pilot)})`,awaitPromise:true});
						if(pilot)await command("Runtime.evaluate",{expression:"(()=>{const audio=document.querySelector('.eva-boot audio');audio.currentTime=audio.duration/2;audio.dispatchEvent(new Event('timeupdate'))})()"});
						await wait(pilot?750:450);
						const shot=await command("Page.captureScreenshot",{format:"png"});
						writeFileSync(join(screenshotDir,`pilot-${pilot||"selection"}-${width}.png`),Buffer.from(shot.data,"base64"));
					}
					for(const locale of ["ja","en"]){
						await command("Runtime.evaluate",{expression:`(async()=>{await window.previewPilot(null);document.querySelector('[data-boot-language="${locale}"]').click()})()`,awaitPromise:true});
						await wait(450);
						const shot=await command("Page.captureScreenshot",{format:"png"});
						writeFileSync(join(screenshotDir,`pilot-selection-${locale}-${width}.png`),Buffer.from(shot.data,"base64"));
					}
					await command("Runtime.evaluate",{expression:"document.querySelector('[data-boot-language=\"zh-CN\"]').click()"});
					if(width===1280)for(const pilot of ["asuka","rei"])for(const position of [350,800,1250]){
						await command("Runtime.evaluate",{expression:`window.previewHandoff(${JSON.stringify(pilot)},${position})`,awaitPromise:true});
						const shot=await command("Page.captureScreenshot",{format:"png"});
						writeFileSync(join(screenshotDir,`handoff-${pilot}-${position}.png`),Buffer.from(shot.data,"base64"));
					}
				}
				continue;
			}
			await command("Runtime.evaluate",{expression:"window.renderPreview()"});
			await command("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
			await wait(50);
			const reduced=await command("Runtime.evaluate",{returnByValue:true,expression:"(()=>{document.querySelector('.eva-replay-boot').click();const boot=document.querySelector('.eva-boot'),ok=boot?.dataset.phase==='select'&&!boot.querySelector('img').hasAttribute('src')&&!document.querySelector('.eva-replay-boot').disabled&&[...document.querySelectorAll('.eva-mp-ring,.eva-mp-eq i')].every(el=>getComputedStyle(el).animationName==='none');boot?.querySelector('.eva-boot-exit').click();return ok})()"});
			report.total++;
			if(!reduced.result.value){report.failed++;report.failures.push({name:"减少动态效果时停止播放器动画并直接显示静态驾驶员选择"});}
			const reducedMusic=await command("Runtime.evaluate",{awaitPromise:true,returnByValue:true,expression:"(async()=>{await window.previewMusic(true,true);return !document.querySelector('.eva-mp').hasAttribute('data-entering')&&getComputedStyle(document.querySelector('.eva-mp-loading')).display==='none'})()"});
			report.total++;
			if(!reducedMusic.result.value){report.failed++;report.failures.push({name:"系统减少动态效果时跳过音源连接动画并直接显示播放器"});}

			const beforeZoom=await command("Runtime.evaluate",{returnByValue:true,expression:"document.querySelector('.eva-clockpanel').getBoundingClientRect().width"});
			await command("Emulation.setPageScaleFactor",{pageScaleFactor:1.5});
			await wait(150);
			const pinch=await command("Runtime.evaluate",{returnByValue:true,expression:`(()=>{
				const v=visualViewport;
				const items=[...document.querySelectorAll('.eva-clockpanel,.eva-mp,.eva-corner-stack,.eva-tps')].filter(el=>getComputedStyle(el).display!=='none');
				const boxes=items.map(el=>{const r=el.getBoundingClientRect();return {name:el.className,left:r.left,top:r.top,right:r.right,bottom:r.bottom}});
				return {ok:v.scale>1.2&&Math.abs(document.querySelector('.eva-clockpanel').getBoundingClientRect().width-${beforeZoom.result.value})<1,scale:v.scale,width:v.width,height:v.height,boxes};
			})()`});
			report.total++;
			if(!pinch.result.value?.ok){report.failed++;report.failures.push({name:"页面放大 150% 时组件不反向缩小",detail:JSON.stringify(pinch.result.value)});}

			total+=report.total;failed+=report.failed;
			for(const failure of report.failures)console.error(`✗ ${width}×${height} @${dpr}: ${failure.name} ${failure.detail}`);
			if(!report.failed)console.log(`✓ ${report.viewport.width}×${report.viewport.height} @${dpr}（${report.total} 项）`);
			if(screenshotDir && [1600,800,360].includes(width)){
				mkdirSync(screenshotDir,{recursive:true});
				await command("Emulation.setPageScaleFactor",{pageScaleFactor:1});await wait(150);
				const shot=await command("Page.captureScreenshot",{format:"png"});
				writeFileSync(join(screenshotDir,`${width}-${height}-${dpr}.png`),Buffer.from(shot.data,"base64"));
				if(width===1600){
					for(const dark of [true,false]){
						await command("Runtime.evaluate",{expression:`window.setPreviewMode(${dark})`,awaitPromise:true});
						await command("Runtime.evaluate",{expression:"window.previewMusic(true)",awaitPromise:true});
						await command("Runtime.evaluate",{expression:"window.__EVA_MAGI_THEME__.set('wallpaper',true);window.__EVA_MAGI_THEME__.set('clockScale',1.5)"});
						const character=await command("Page.captureScreenshot",{format:"png"});
						writeFileSync(join(screenshotDir,`character-${dark?'asuka':'rei'}.png`),Buffer.from(character.data,"base64"));
						await command("Runtime.evaluate",{expression:"document.querySelector('.eva-hud').click()"});
						const settings=await command("Page.captureScreenshot",{format:"png"});
						writeFileSync(join(screenshotDir,`settings-${dark?'asuka':'rei'}.png`),Buffer.from(settings.data,"base64"));
						await command("Runtime.evaluate",{expression:"document.querySelector('.eva-panel-close').click()"});


					}
					await command("Runtime.evaluate",{expression:"window.setPreviewMode(true)",awaitPromise:true});

					const clockClip=await command("Runtime.evaluate",{returnByValue:true,expression:"(()=>{const r=document.querySelector('.eva-clockpanel').getBoundingClientRect();return {x:r.left-5,y:r.top-5,width:r.width+10,height:r.height+10,scale:2}})()"});
					const clockShot=await command("Page.captureScreenshot",{format:"png",clip:clockClip.result.value});
					writeFileSync(join(screenshotDir,"clock.png"),Buffer.from(clockShot.data,"base64"));
					for(const playing of [true,false]){
						await command("Runtime.evaluate",{expression:`window.previewMusic(${playing})`,awaitPromise:true});
						const {result}=await command("Runtime.evaluate",{returnByValue:true,expression:"(()=>{const r=document.querySelector('.eva-mp').getBoundingClientRect();return {x:r.left-5,y:r.top-5,width:r.width+10,height:r.height+10,scale:2}})()"});
						const mediaShot=await command("Page.captureScreenshot",{format:"png",clip:result.value});
						writeFileSync(join(screenshotDir,`player-${playing?'playing':'paused'}.png`),Buffer.from(mediaShot.data,"base64"));
					}
					await command("Emulation.setEmulatedMedia",{features:[]});
					for(const dark of [true,false]){
						await command("Runtime.evaluate",{expression:`window.setPreviewMode(${dark})`,awaitPromise:true});
						await command("Runtime.evaluate",{expression:"window.previewMusic(true,true)",awaitPromise:true});
						const loadingClip=await command("Runtime.evaluate",{returnByValue:true,expression:"(()=>{const r=document.querySelector('.eva-mp').getBoundingClientRect();return {x:r.left-5,y:r.top-5,width:r.width+10,height:r.height+10,scale:2}})()"});
						const loadingShot=await command("Page.captureScreenshot",{format:"png",clip:loadingClip.result.value});
						writeFileSync(join(screenshotDir,`player-loading-${dark?'asuka':'rei'}.png`),Buffer.from(loadingShot.data,"base64"));
					}
					for(const dark of [true,false]){
						await command("Runtime.evaluate",{expression:`window.setPreviewMode(${dark})`,awaitPromise:true});
						await command("Runtime.evaluate",{expression:"document.querySelector('.eva-replay-boot').click()"});
						await wait(800);
						const bootShot=await command("Page.captureScreenshot",{format:"png"});
						writeFileSync(join(screenshotDir,`boot-${dark?'asuka':'rei'}.png`),Buffer.from(bootShot.data,"base64"));
						await command("Runtime.evaluate",{expression:"window.__EVA_MAGI_THEME__.set('boot',false)"});
					}
				}
			}
		} catch(error){failed++;console.error(`✗ ${width}×${height} @${dpr}: ${error.message}`);}
		finally{await send("Target.closeTarget",{targetId});}
	}
} catch(error){failed++;console.error(error.message);}
finally{
	await browser.close(); await fixtureServer.close();
}
console.log(`${bootMode?"启动":"布局"}回归：${cases.length} 组，${total} 项断言，${failed} 项失败`);
process.exitCode=failed?1:0;
