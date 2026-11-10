#!/usr/bin/env node
// MIT © 2026 HRJ-lrh. Render the actual migrated V6 core, at native timing.
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {inspectEngine,run} from './runtime.mjs';
import {validateConfig} from '../assets/v6-modules/config.mjs';
const args=process.argv.slice(2);let browser,service,encoder;
try{
 if(args.includes('--help')){console.log('node scripts/render-v6.mjs --engine PATH --project NAME --out NEW_DIRECTORY [--width 1280]\nNative module duration, 60 fps, silent. Width 3840 re-renders graphics at 4K; source quality remains unchanged.');process.exit(0)}
 const opt={};for(let i=0;i<args.length;i+=2){if(!['--engine','--project','--out','--width'].includes(args[i])||!args[i+1]||opt[args[i]])throw Error('Invalid options. Use --help.');opt[args[i]]=args[i+1]}
 if(!opt['--engine']||!opt['--project']||!opt['--out'])throw Error('Specify --engine, --project and --out.');
 const engine=await realpath(path.resolve(opt['--engine']));inspectEngine(engine);
 if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(opt['--project']))throw Error('Invalid project name.');
 const project=await realpath(path.join(engine,'work',opt['--project']));
 assert.equal(path.dirname(project),path.join(engine,'work'),'Project must be inside engine/work.');
 const config=validateConfig(JSON.parse(await readFile(path.join(project,'config.json'),'utf8')));
 const width=Number(opt['--width']||1280),height=width*9/16;
 assert.ok(Number.isInteger(width)&&width>=640&&width<=3840&&width%2===0&&Number.isInteger(height)&&height%2===0,'Use even 16:9 dimensions (1280,1920,3840).');
 const out=path.resolve(opt['--out']);await mkdir(path.dirname(out),{recursive:true});await mkdir(out,{recursive:false});
 const load=p=>import(pathToFileURL(path.join(engine,p)).href);
 const {startServer}=await load('serve.mjs'),{launchBrowser}=await load('scripts/browser.mjs'),{mediaPath}=await load('scripts/media-tools.mjs');
 service=await startServer({port:0});browser=await launchBrowser();
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${service.url}/work/${opt['--project']}/?scale=${width/1920}&capture=1`);
 await page.waitForFunction(()=>window.moduleReady||window.moduleError,null,{timeout:180000});
 const error=await page.evaluate(()=>window.moduleError);if(error)throw Error(error);
 const capture=async t=>Buffer.from(await page.evaluate(async t=>{await film.renderAt(t);return document.querySelector('#film').toDataURL('image/png').split(',')[1]},t),'base64');
 const first=await capture(0);await capture(config.duration/2);assert.deepEqual(first,await capture(0),'Backward seek changed the initial frame');
 const frames=Math.ceil(config.duration*60-1e-8),video=path.join(out,config.module+'.mp4');
 encoder=spawn(mediaPath('ffmpeg'),['-hide_banner','-loglevel','error','-f','image2pipe','-framerate','60','-vcodec','png','-i','pipe:0','-an','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-movflags','+faststart',video],{stdio:['pipe','ignore','pipe']});
 let stderr='';encoder.stderr.on('data',b=>stderr=(stderr+b).slice(-16000));
 let encodeError;encoder.on('error',e=>{encodeError=e});encoder.stdin.on('error',e=>{encodeError=e});
 const closed=new Promise(resolve=>encoder.on('close',resolve));
 const saved=new Set([0,Math.floor(frames/2),frames-1]);
 for(let i=0;i<frames;i++){
  if(encodeError||encoder.exitCode!==null)throw encodeError||Error('Encoder stopped: '+stderr);
  const png=await capture(i/60);
  if(saved.has(i))await writeFile(path.join(out,`frame-${String(i).padStart(4,'0')}.png`),png);
  if(!encoder.stdin.write(png))await Promise.race([once(encoder.stdin,'drain'),closed.then(()=>{throw Error('Encoder stopped: '+stderr)})]);
  if(i%60===0)console.log(`Rendered ${i/60}/${config.duration.toFixed(2)} s`);
 }
 encoder.stdin.end();assert.equal(await closed,0,stderr);assert.deepEqual(errors,[],'Browser errors');
 const probe=JSON.parse(run(mediaPath('ffprobe'),['-v','error','-show_streams','-show_format','-of','json',video],undefined,true)),v=probe.streams.find(s=>s.codec_type==='video');
 assert.equal(v.width,width);assert.equal(v.height,height);assert.equal(Number(v.nb_frames),frames);assert.equal(v.r_frame_rate,'60/1');
 run(mediaPath('ffmpeg'),['-v','error','-i',video,'-f','null','-']);
 await writeFile(path.join(out,'verification.json'),JSON.stringify({technical:'pass',module:config.module,width,height,fps:60,frames,duration:frames/60,media:config.media.type,audio:'not-included',initialFrameBackwardSeek:'pass',browserErrors:errors,visualReview:'pending',userAcceptance:'not-requested',scope:'Migrated V6 mechanism. New text, source framing, mask and audio require separate review.'},null,2)+'\n');
 console.log('PASS: '+video);
}catch(e){console.error(e.stack);process.exitCode=1;encoder?.kill()}
finally{await browser?.close();if(service)await new Promise(r=>service.server.close(r))}
