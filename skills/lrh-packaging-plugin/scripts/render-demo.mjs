#!/usr/bin/env node
// MIT © 2026 HRJ-lrh. Uses the user's separately licensed Agent Motion runtime.
import assert from 'node:assert/strict';
import { mkdir, cp, mkdtemp, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { inspectEngine, skillRoot, run } from './runtime.mjs';
const args=process.argv.slice(2);
if(args.includes('--help')) {console.log('node scripts/render-demo.mjs --engine PATH --out NEW_DIRECTORY [--fps 60] [--width 1280]\n8-second silent synthetic Three.js sample. Does not validate real people, matting, speech or final-film quality.');process.exit(0);}
let browser,service;
try {
 const opt={};for(let i=0;i<args.length;i+=2){if(!['--engine','--out','--fps','--width'].includes(args[i])||!args[i+1]||opt[args[i]])throw new Error('Invalid options. Use --help.');opt[args[i]]=args[i+1];}
 if(!opt['--engine']||!opt['--out'])throw new Error('Specify --engine and a new --out directory.');
 const engine=path.resolve(opt['--engine']),out=path.resolve(opt['--out']);inspectEngine(engine);
 const fps=Number(opt['--fps']||60),width=Number(opt['--width']||1280),height=width*9/16;
 assert.ok(Number.isInteger(fps)&&fps>=1&&fps<=60,'fps must be 1–60');
 assert.ok(Number.isInteger(width)&&width>=320&&width<=3840&&Number.isInteger(height)&&width%2===0&&height%2===0,'width must yield even 16:9 dimensions (e.g. 1280 or 3840)');
 await mkdir(out,{recursive:false});await mkdir(path.join(engine,'work'),{recursive:true});
 const stage=await mkdtemp(path.join(engine,'work','lrh-check-'));
 await cp(path.join(skillRoot,'assets','quality-demo'),stage,{recursive:true});
 const load=p=>import(pathToFileURL(path.join(engine,p)).href);
 const {startServer}=await load('serve.mjs');const {launchBrowser}=await load('scripts/browser.mjs');const {mediaPath}=await load('scripts/media-tools.mjs');
 service=await startServer({port:0});browser=await launchBrowser();
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${service.url}/work/${path.basename(stage)}/?capture=1`);
 await page.waitForFunction(()=>window.film?.ready,null,{timeout:30000});
 const frame=async t=>{await page.evaluate(t=>window.film.renderAt(t),t);return page.screenshot();};
 const first=await frame(.5),changed=await frame(6);
 assert.notDeepEqual(first,changed,'Scene must change');assert.deepEqual(first,await frame(.5),'Backward seek must be deterministic');
 const frames=path.join(out,'frames');await mkdir(frames);
 for(let i=0;i<8*fps;i++) {
  await writeFile(path.join(frames,`${String(i).padStart(5,'0')}.png`),await frame(i/fps));
  if(i%fps===0)console.log(`Rendered ${i/fps}/8 seconds`);
 }
 assert.deepEqual(errors,[],'Browser errors');
 const video=path.join(out,'quality-demo.mp4');
 run(mediaPath('ffmpeg'),['-hide_banner','-loglevel','error','-framerate',String(fps),'-i',path.join(frames,'%05d.png'),'-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-movflags','+faststart',video]);
 const probe=JSON.parse(run(mediaPath('ffprobe'),['-v','error','-show_streams','-show_format','-of','json',video],undefined,true));
 const stream=probe.streams.find(s=>s.codec_type==='video');
 assert.equal(stream.width,width);assert.equal(stream.height,height);assert.equal(Number(stream.nb_frames),8*fps);assert.equal(stream.r_frame_rate,`${fps}/1`);
 run(mediaPath('ffmpeg'),['-v','error','-i',video,'-f','null','-']);
 await writeFile(path.join(out,'verification.json'),JSON.stringify({technical:'pass',width,height,fps,frames:8*fps,duration:8,deterministicSeek:true,browserErrors:errors,engine:inspectEngine(engine),source:stage,visualReview:'pending',audioReview:'not-applicable-silent-synthetic-fixture',userAcceptance:'not-requested',scope:'Synthetic environment/continuity check only. No real person, matting, speech synchronization or V6 equivalence is certified.'},null,2)+'\n');
 console.log(`PASS: ${video}\nInspect the whole clip and key transitions; technical pass is not visual approval.\nEditable source: ${stage}`);
} catch(error){console.error(error.stack);process.exitCode=1;}
finally{await browser?.close();if(service)await new Promise(resolve=>service.server.close(resolve));}
