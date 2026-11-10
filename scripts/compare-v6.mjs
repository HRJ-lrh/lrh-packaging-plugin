#!/usr/bin/env node
// Optional same-source regression. Requires the author's private V6 project locally.
// Never downloads or publishes reference footage, captions, masks or audio.
import {readFile,writeFile,mkdir,mkdtemp,cp,realpath} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {modules} from '../skills/lrh-packaging-plugin/assets/v6-modules/config.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const asset=path.join(root,'skills/lrh-packaging-plugin/assets/v6-modules');
const args=process.argv.slice(2),opt={};
for(let i=0;i<args.length;i+=2){if(!['--engine','--reference','--out','--width','--stride'].includes(args[i])||!args[i+1]||opt[args[i]])throw Error('Usage: --engine PATH --reference PATH --out NEW_DIR [--width 640] [--stride 1]');opt[args[i]]=args[i+1]}
const engine=await realpath(opt['--engine']),reference=await realpath(opt['--reference']);
assert.ok(reference.startsWith(engine+path.sep),'Reference must be served by this engine');
const out=path.resolve(opt['--out']),width=Number(opt['--width']||640),stride=Number(opt['--stride']||1),height=width*9/16;
assert.ok(Number.isInteger(stride)&&stride>0&&Number.isInteger(height)&&width>=640&&width<=3840);
await mkdir(path.dirname(out),{recursive:true});await mkdir(out);
const provenance=JSON.parse(await readFile(path.join(asset,'provenance.json'),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const [file,hash] of Object.entries(provenance.sourceFiles))assert.equal(sha(await readFile(path.join(reference,file))),hash,'Reference source changed: '+file);
const captions=JSON.parse(await readFile(path.join(reference,'captions.json'),'utf8'));
const refURL='/'+path.relative(engine,reference).split(path.sep).map(encodeURIComponent).join('/');
const load=p=>import(pathToFileURL(path.join(engine,p)).href);
const {startServer}=await load('serve.mjs'),{launchBrowser}=await load('scripts/browser.mjs');
const service=await startServer({port:0}),browser=await launchBrowser(),results=[];
try{
 for(const [id,range] of Object.entries(modules)){
  const stage=await mkdtemp(path.join(engine,'work','lrh-v6-regression-'));await cp(asset,stage,{recursive:true});
  const duration=range.end-range.start;
  await writeFile(path.join(stage,'config.json'),JSON.stringify({schema:1,module:id,media:{type:'reference-sequence',frames:refURL+'/assets/frames',masks:refURL+'/assets/tone-mask',count:5830,maskCount:5834,fps:60},captions:captions.filter(c=>c.end>range.start&&c.start<range.end).map(c=>({start:Math.max(0,c.start-range.start),end:Math.min(duration,c.end-range.start),text:c.text}))},null,2));
  const baseline=await browser.newPage({viewport:{width,height}}),ported=await browser.newPage({viewport:{width,height}}),errors=[];
  for(const p of [baseline,ported])p.on('pageerror',e=>errors.push(e.message));
  await baseline.goto(service.url+refURL+`/v6.html?scale=${width/1920}`);
  await baseline.evaluate(()=>window.v6Ready);
  await ported.goto(service.url+`/work/${path.basename(stage)}/?scale=${width/1920}`);
  await ported.waitForFunction(()=>window.moduleReady||window.moduleError,null,{timeout:180000});
  assert.equal(await ported.evaluate(()=>window.moduleError),undefined);
  // Match the adapter's initial render so stateful legacy prewarming is identical.
  await baseline.evaluate(t=>film.renderAt(t),range.start);
  const capture=async(p,t)=>Buffer.from(await p.evaluate(async t=>{await film.renderAt(t);return document.querySelector('#film').toDataURL('image/png').split(',')[1]},t),'base64');
  const count=Math.ceil(duration*60-1e-8),indices=new Set();
  for(let n=0;n<count;n+=stride)indices.add(n);indices.add(count-1);
  let matches=0;const failures=[];
  for(const n of [...indices].sort((a,b)=>a-b)){
   const a=await capture(baseline,range.start+n/60),b=await capture(ported,n/60);
   if(a.equals(b))matches++;else{failures.push({frame:n,referenceTime:range.start+n/60,baselineSHA256:sha(a),portSHA256:sha(b)});if(failures.length<=3){await writeFile(path.join(out,`${id}-${n}-before.png`),a);await writeFile(path.join(out,`${id}-${n}-after.png`),b)}}
   if(n%(60*Math.max(1,stride))===0)console.log(`${id}: ${n}/${count}, matches ${matches}, differences ${failures.length}`);
  }
  assert.deepEqual(errors,[]);results.push({module:id,range,width,height,fps:60,outputFrames:count,comparedFrames:indices.size,pixelIdenticalPNG:matches,failures});
  await baseline.close();await ported.close();
 }
 await writeFile(path.join(out,'comparison.json'),JSON.stringify({source:provenance.sourceFiles,environment:process.platform,width,height,stride,results,scope:'Same input frames, protection masks, captions, fonts, runtime and browser. No audio or cross-platform equivalence claimed.'},null,2)+'\n');
 assert.ok(results.every(r=>r.failures.length===0),'A/B pixel differences found; inspect local evidence.');
 console.log('PASS: all compared frames are identical.');
}finally{await browser.close();await new Promise(r=>service.server.close(r))}
