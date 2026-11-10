import {modules,validateConfig,canonicalTime,sequenceIndex} from './config.mjs';
const status=document.querySelector('#status'),slider=document.querySelector('#seek'),button=document.querySelector('#play');
const svgURL=s=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
const opaque=svgURL('<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="2160"><path fill="white" d="M0 0H3840V2160H0Z"/></svg>');
// Original neutral geometric fixture; not a generated or reconstructed human face.
const fixture=svgURL('<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="2160" viewBox="0 0 3840 2160"><rect width="3840" height="2160" fill="#d2dee7"/><path d="M0 1700H3840V2160H0Z" fill="#93aabd"/><path d="M100 200H800V1500H100ZM3040 200H3740V1500H3040Z" fill="#b5c8d8"/><circle cx="1920" cy="730" r="280" fill="#ebc7a2"/><path d="M1320 2160V1350Q1320 1020 1920 1020Q2520 1020 2520 1350V2160Z" fill="#315b87"/><path d="M1700 700H1820M2020 700H2140" stroke="#315b87" stroke-width="25"/><text x="1920" y="1700" text-anchor="middle" fill="white" font-family="sans-serif" font-size="76">SYNTHETIC FIXTURE</text></svg>');
const loadScript=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('Cannot load '+src));document.head.append(s)});
try {
 const response=await fetch('config.json');if(!response.ok)throw Error('Missing config.json');
 const config=validateConfig(await response.json()),range=modules[config.module];
 const file=(t,mask)=>{
   const m=config.media;if(m.type==='fixture')return mask?opaque:fixture;
   if(mask&&!m.masks)return opaque;
   return (mask?m.masks:m.frames)+'/'+String(sequenceIndex(config,t,mask)).padStart(6,'0')+(mask?'.png':'.jpg');
 };
 window.LRH={config,cropX:w=>Math.max(0,Math.min(3840-w,(config.framing?.centerX??1920)-w/2)),cropY:h=>Math.max(0,Math.min(2160-h,(config.framing?.centerY??985)-h/2)),frameURL:t=>file(t,false),maskURL:t=>file(t,true),text:s=>Object.hasOwn(config.text||{},String(s))?config.text[s]:s,
  captions:(config.captions||[]).map(c=>({...c,start:c.start+range.start,end:c.end+range.start}))};
 await loadScript('core/scene-v3.js');await loadScript('core/scene-v4.js');
 window.v4Ready=window.film.ready;window.v6Ready=new Promise(resolve=>window.resolveV6=resolve);
 await import('./core/scene-v6.js');await window.v6Ready;
 let busy=false,playing=false,clock=0;
 const render=async t=>{if(busy)throw Error('Concurrent render is not supported.');busy=true;try{await window.v6Core.renderAt(canonicalTime(config,t));}finally{busy=false}};
 await render(0);
 window.film={duration:config.duration,fps:60,renderAt:render,ready:Promise.resolve(true),module:config.module};
 window.moduleReady=true;slider.max=config.duration;slider.disabled=false;button.disabled=false;
 status.textContent=`${range.label} · ${config.duration.toFixed(2)} 秒 · ${config.media.type==='fixture'?'几何占位演示，无原片与音轨':'自有素材预览，无音轨'}`;
 async function loop(){if(!playing)return;const t=Math.min(config.duration,(performance.now()-clock)/1000);try{await render(t);slider.value=t;if(t<config.duration)requestAnimationFrame(loop);else playing=false}catch(e){playing=false;status.textContent=e.message}}
 button.onclick=()=>{playing=!playing;if(playing){clock=performance.now()-Number(slider.value)*1000;loop()}};
 slider.oninput=async()=>{playing=false;if(!busy)await render(Number(slider.value))};
} catch(e){window.moduleError=e.stack||e.message;status.textContent=window.moduleError;console.error(e)}
