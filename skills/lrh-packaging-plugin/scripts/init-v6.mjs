#!/usr/bin/env node
// MIT © 2026 HRJ-lrh. Creates a new project; never edits the reference project.
import {mkdir,cp,writeFile,readFile,readdir} from 'node:fs/promises';
import {realpathSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {inspectEngine,skillRoot,run} from './runtime.mjs';
import {modules,validateConfig} from '../assets/v6-modules/config.mjs';
export async function createProject({engine,name,module,input,start=0,mask,configFile}) {
 engine=path.resolve(engine);inspectEngine(engine);
 if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(name||''))throw Error('Use a simple new project name (letters, numbers, hyphen, underscore).');
 if(!Object.hasOwn(modules,module))throw Error('Unknown V6 module.');
 if(!Number.isFinite(start)||start<0)throw Error('start must be nonnegative seconds.');
 if(mask&&!input)throw Error('A mask requires input video.');
 const range=modules[module],duration=range.end-range.start,count=Math.ceil(duration*60-1e-8);
 let custom=configFile?JSON.parse(await readFile(path.resolve(configFile),'utf8')):{};
 for(const key of Object.keys(custom))if(!['text','captions','framing'].includes(key))throw Error('Custom JSON only accepts text, captions and framing.');
 const config=validateConfig({schema:1,module,media:input?{type:'sequence',frames:'media/frames',fps:60,count,...(mask?{masks:'media/masks',maskCount:count}:{})}:{type:'fixture'},...custom});
 const {mediaPath}=await import(pathToFileURL(path.join(engine,'scripts/media-tools.mjs')).href);
 const probe=filename=>JSON.parse(run(mediaPath('ffprobe'),['-v','error','-show_streams','-show_format','-of','json',filename],undefined,true));
 const ensureDuration=filename=>{const p=probe(filename),v=p.streams.find(s=>s.codec_type==='video');if(!v||!Number.isFinite(Number(v.duration||p.format.duration))||Number(v.duration||p.format.duration)+.001<start+duration)throw Error('Input is shorter than start + module duration: '+filename);};
 if(input){input=path.resolve(input);ensureDuration(input)}if(mask){mask=path.resolve(mask);ensureDuration(mask)}
 await mkdir(path.join(engine,'work'),{recursive:true});const project=path.join(engine,'work',name);await mkdir(project);
 await cp(path.join(skillRoot,'assets','v6-modules'),project,{recursive:true});
 if(input){
  await mkdir(path.join(project,'media','frames'),{recursive:true});
  const target=path.join(project,'media','frames','%06d.jpg');
  run(mediaPath('ffmpeg'),['-hide_banner','-loglevel','error','-ss',String(start),'-i',input,'-an','-vf','fps=60,scale=3840:2160:force_original_aspect_ratio=decrease,pad=3840:2160:(ow-iw)/2:(oh-ih)/2','-frames:v',String(count),'-q:v','2',target]);
  if((await readdir(path.dirname(target))).length!==count)throw Error('Incomplete extracted source frames. Project retained for diagnosis.');
 }
 if(mask){
  await mkdir(path.join(project,'media','masks'),{recursive:true});
  const target=path.join(project,'media','masks','%06d.png');
  // Grayscale video: white protects original tone; black allows background grading.
  run(mediaPath('ffmpeg'),['-hide_banner','-loglevel','error','-ss',String(start),'-i',mask,'-an','-filter_complex','fps=60,scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2,format=gray,split[a][b];[a][b]alphamerge','-frames:v',String(count),target]);
  if((await readdir(path.dirname(target))).length!==count)throw Error('Incomplete extracted mask frames. Project retained for diagnosis.');
 }
 delete config.duration;
 await writeFile(path.join(project,'config.json'),JSON.stringify(config,null,2)+'\n');
 await writeFile(path.join(project,'INPUT-NOTES.txt'),`V6 module: ${module}\nNative duration: ${duration.toFixed(2)} s, 60 fps, 16:9.\n${input?'Source normalized to 3840x2160 with letterboxing. Upscaling does not add detail.':'Synthetic fixture only; no real presenter.'}\n${mask?'Grayscale protection mask converted to alpha.':'No protection mask: original tone retained everywhere; no matting claimed.'}\nAudio is not copied or exported. Match your own aligned voice/BGM downstream.\nDo not publish this generated project without checking media rights.\n`);
 return project;
}
async function main(){
 const args=process.argv.slice(2);if(args.includes('--help')){console.log('node scripts/init-v6.mjs --engine PATH --name NEW_NAME --module presenter-reframe|workflow-merge|result-takeover [--input VIDEO --start SECONDS] [--mask GRAYSCALE_VIDEO] [--config TEXT_AND_CAPTIONS.json]\nOmit --input for a synthetic fixture. Native timing, 16:9, silent. Existing projects are rejected.');return}
 const opt={};for(let i=0;i<args.length;i+=2){if(!['--engine','--name','--module','--input','--start','--mask','--config'].includes(args[i])||!args[i+1]||opt[args[i]])throw Error('Invalid options. Use --help.');opt[args[i]]=args[i+1]}
 if(!opt['--engine']||!opt['--name']||!opt['--module'])throw Error('Specify --engine, --name and --module.');
 console.log(await createProject({engine:opt['--engine'],name:opt['--name'],module:opt['--module'],input:opt['--input'],start:Number(opt['--start']||0),mask:opt['--mask'],configFile:opt['--config']}));
}
if(process.argv[1]&&realpathSync(process.argv[1])===realpathSync(fileURLToPath(import.meta.url)))main().catch(e=>{console.error(e.stack);process.exitCode=1});
