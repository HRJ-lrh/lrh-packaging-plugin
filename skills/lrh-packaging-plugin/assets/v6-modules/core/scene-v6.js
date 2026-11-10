// Ported from the author's V6 project; see ../provenance.json.
import * as THREE from '/node_modules/three/build/three.module.js';
import {fitObjectsToFrame} from '/.agents/skills/motion-craft/scripts/three-frame.mjs';

// The source, captions and UI semantics are inherited; staging is a real 3D scene.
const renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(1920*S,1080*S,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#e7f2fa');scene.fog=new THREE.Fog('#e7f2fa',2400,6500);
const camera=new THREE.PerspectiveCamera(35,16/9,10,12000);
scene.add(new THREE.HemisphereLight('#ffffff','#91adc6',3.4));
const key=new THREE.DirectionalLight('#ffffff',1.15);key.position.set(-700,1300,1600);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-2400,right:2400,top:1800,bottom:-1800,near:10,far:7000});key.shadow.bias=-.001;key.shadow.normalBias=3;key.shadow.radius=5;scene.add(key);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(12000,12000),new THREE.MeshStandardMaterial({color:'#cbddeb',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-540;floor.receiveShadow=true;scene.add(floor);
// A back wall and a narrow floor joint provide coherent perspective, not decorative orbiters.
const wall=new THREE.Mesh(new THREE.PlaneGeometry(12000,5000),new THREE.MeshStandardMaterial({color:'#e7f2fa',roughness:1}));wall.position.set(0,1900,-1100);wall.receiveShadow=true;scene.add(wall);
const slotCanvases=new Map(),slotMeshes=new Map();
let layoutOnly=false, cameraTracks=[];
const transitionStarts=[19.7,29.46,40.62,59.78,67.68,77.56,85.8];
const outgoing=new Map();
function ease6(t,a,d){const x=clamp((t-a)/d);return x*x*x*(x*(x*6-15)+10)}

function canvasFor(id,w,h){let c=slotCanvases.get(id);if(!c){c=document.createElement('canvas');slotCanvases.set(id,c)}if(c.width!==Math.round(w*S)||c.height!==Math.round(h*S)){c.width=Math.round(w*S);c.height=Math.round(h*S)}return c}
function paintTexture(id,w,h,paint,ox=0,oy=0){if(layoutOnly)return canvasFor(id,2,2);g.setTransform(S,0,0,S,0,0);g.globalAlpha=1;g.clearRect(0,0,1920,1080);ctx=g;g.save();g.translate(-ox,-oy);paint();g.restore();const c=canvasFor(id,w,h),q=c.getContext('2d');q.clearRect(0,0,c.width,c.height);q.drawImage(C,0,0,w*S,h*S,0,0,c.width,c.height);return c}
function roundedShape(w,h,r){const p=new THREE.Shape();p.moveTo(-w/2+r,-h/2);p.lineTo(w/2-r,-h/2);p.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);p.lineTo(w/2,h/2-r);p.quadraticCurveTo(w/2,h/2,w/2-r,h/2);p.lineTo(-w/2+r,h/2);p.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);p.lineTo(-w/2,-h/2+r);p.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return p}
function meshFor(id,c,solid=false){let o=slotMeshes.get(id);if(!o){const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;tex.generateMipmaps=false;
 const material=new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.03,side:THREE.DoubleSide,toneMapped:false});const front=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);front.position.z=4;front.castShadow=true;front.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:tex,alphaTest:.03});
 const group=new THREE.Group();group.add(front);let edge=null;if(solid){edge=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#b3cbe1',roughness:.62,metalness:.1}));edge.castShadow=true;group.add(edge)}scene.add(group);o={group,front,edge,tex};slotMeshes.set(id,o)}
 if(o.tex.image!==c)o.tex.image=c;o.tex.needsUpdate=true;o.group.visible=true;return o}
function place(id,c,p,{solid=false,alpha=1,rx=0,ry=0,rz=0,thickness=14}={}){const o=meshFor(id,c,solid),[x,y,w,h,z]=p;o.group.position.set(x-960,540-y,z);o.group.rotation.set(rx,ry,rz);o.front.position.z=solid?thickness/2+1:4;o.front.scale.set(w,h,1);o.front.material.opacity=alpha;o.front.castShadow=alpha>.1;if(o.edge)o.edge.castShadow=alpha>.1;if(o.edge){o.edge.scale.set(w*.995,h*.995,thickness);o.edge.material.transparent=alpha<1;o.edge.material.opacity=alpha}return o.group}
const personCanvas=canvasFor('person',1000,1200);
function personTexture(w,h,round){if(layoutOnly)return canvasFor('person',2,2);const c=canvasFor('person',1200,1200),q=c.getContext('2d');q.clearRect(0,0,c.width,c.height);q.save();let r=Math.min(w,h)*mix(.045,.5,round);q.beginPath();q.roundRect(0,0,c.width,c.height,{x:r/w*c.width,y:r/h*c.height});q.clip();let sw=mix(1800,2800,clamp((.95-h/w)/.35)),sh=sw*h/w;if(sh>2160){sh=2160;sw=sh*w/h}let sy=LRH.cropY(sh);q.drawImage(tone,LRH.cropX(sw),sy,sw,sh,0,0,c.width,c.height);q.restore();return c}

const poses=[
 [11.1,330,530,500,620,150,0,1,1260,540,1140,720,-80],
 [17.26,270,735,340,390,240,0,1,1180,510,1240,783,160],
 [19.7,1590,500,450,610,180,0,1,690,525,1120,707,-40],
 [24.04,1660,735,330,330,220,1,1,735,520,1220,770,120],
 [29.46,1650,740,360,360,170,1,1,790,520,1180,745,0],
 [40.62,960,500,610,700,200,0,1,960,520,1500,720,-100],
 [44.5,330,530,470,630,200,0,1,1230,530,1100,695,40],
 [51.22,1640,330,340,340,240,1,1,800,550,1200,758,-80],
 [54.34,1690,330,270,270,-400,1,.0,960,530,1450,916,180],
 [59.78,270,300,360,360,180,1,1,1210,540,1170,739,20],
 [65,1650,730,280,320,180,0,1,800,520,1260,796,130],
 [67.68,1640,510,380,530,180,0,1,760,530,1180,745,-80],
 [71.28,1670,700,240,260,-450,0,0,960,530,1460,922,160],
 [77.56,960,270,520,285,160,0,1,960,650,1500,650,-70],
 [85.8,1600,530,500,660,200,0,1,690,530,1150,726,30],
 [89.44,1490,510,650,740,230,0,1,580,535,1000,632,40]
];
function stageAt(t){let i=0;for(let j=0;j<poses.length;j++)if(t>=poses[j][0])i=j;const b=poses[i],a=poses[Math.max(0,i-1)],distance=Math.hypot(b[1]-a[1],b[2]-a[2]),duration=Math.min(1.18,.72+distance/2800),q=ease6(t,b[0],duration);const v=b.slice(1).map((x,k)=>mix(a[k+1],x,q));if(distance>650){v[1]-=85*Math.sin(Math.PI*q)**2;v[4]+=85*Math.sin(Math.PI*q)**2}return v}
function cameraAngle(t){const events=[[19.7,.12,.04,1.1],[29.46,-.18,.1,1.2],[35.96,.16,-.09,1.25],[51.22,.12,.08,1.2],[67.68,.12,.08,1.2],[71.28,-.14,.1,1.3],[77.56,-.16,.12,1.2],[85.8,.1,.05,1.1]];for(const [a,y,p,d] of events){if(t>=a&&t<a+d){const q=Math.sin(Math.PI*(t-a)/d)**2;return [y*q,.012+p*q]}}return [0,.012]}

function uiTexture(i,t){return paintTexture('ui',1140,720,()=>[searchScene,correctionScene,workflowScene,proactiveScene,chartScene,writingScene,slideScene,filesScene,recapScene][i](t),0,150)}
function slideLayers(t,ui){const out=[],k=ui[2]/1140;
 const c=paintTexture('slidebase',1140,720,()=>{slideScene(t);g.clearRect(35,215,1050,125)},0,150);
 out.push(place('slidebase',c,ui,{rx:.025}));
 const layer=paintTexture('slidetitle',1050,125,()=>{rect(0,0,1050,125,t>=74.12?'#dce3fa':'#d7e9ff',5);body('项目汇报',45,90,69,INK,650);if(t>=72.36){g.strokeStyle=BLUE;g.lineWidth=3;g.strokeRect(30,21,315,92);for(const x of [30,345])for(const y of [21,113])rect(x-6,y-6,12,12,BLUE,0);if(t<74.12)cursorV4(340,112,t,72.36)}});
 const lift=ss(t,71.28,.55)*(1-ss(t,72.15,.55));
 out.push(place('slidetitle',layer,[ui[0]-10*k,ui[1]-232.5*k,1050*k,125*k,ui[4]+10+210*lift+30*ss(t,72.36,.4)],{rx:-.2*lift,ry:.12*lift}));return out;
}
function workflow3D(t){const groups=[],merge=ss(t,35.96,.76);for(let j=0;j<3;j++){const c=paintTexture('step'+j,390,320,()=>{rect(0,0,390,320,PAPER,18);body('0'+(j+1),28,67,42,BLUE,650);body(['收集记录','整理重点','生成周报'][j],28,155,58,INK,650);body([['本周事项','进展记录'],['按主题归纳','提炼下一步'],['结论与行动项','输出文档']][j][0],28,223,32,MUTED);body([['本周事项','进展记录'],['按主题归纳','提炼下一步'],['结论与行动项','输出文档']][j][1],28,273,32,MUTED);if(t>=[31.76,32.52,34.3][j]){body('✓',310,65,44,BLUE);under(28,297,320,t,[31.76,32.52,34.3][j],1.2)}});let a=ss(t,29.65+j*.18,.5)*(1-ss(t,36.5,.22));if(t<36.72)groups.push(place('step'+j,c,[mix(320+j*460,800+j*18,merge),mix(440+j*80,535,merge),390,320,mix(-260+j*230,180+j*18,merge)],{solid:true,alpha:a,ry:mix([.15,0,-.12][j],-.5,merge),rx:.06*(1-merge)}))}
 if(t>=36.3){const c=paintTexture('skill',900,570,()=>{rect(0,0,900,570,PAPER,20);title('周报助手',48,155,105,BLUE);body('流程  ·  规则  ·  输出',48,239,45);body('技能已生成 ✓',48,315,38,MUTED);if(t>=38.12){button('“帮我写周报”',40,390,570,false);if(t>=39.24)button('调用 ✓',640,390,220,true)}under(48,522,800,t,36.72,3.5)});const q=ss(t,36.3,.65);groups.push(place('skill',c,[800,535,900,570,mix(-650,190,q)],{solid:true,alpha:q,ry:-.62*(1-q),rx:.32*(1-q)}))}return groups}
function files3D(t){const out=[],labs=['PDF','Word','Excel'],actions=['合并文件','整理文档','清洗表格'],times=[80.84,82.54,81.72];for(let j=0;j<3;j++){const c=paintTexture('file'+j,350,520,()=>{paperPath(0,0,340,450);body(labs[j],25,100,60,BLUE,650);if(j===2){for(let r=0;r<4;r++)for(let k=0;k<3;k++)rect(25+k*94,160+r*52,82,38,t<81.72&&r===2?'#ddc8e6':'#d4e4f5',3)}else for(let r=0;r<5;r++)rect(25,165+r*46,230-(r%2)*60,r===0&&j===1?18:9,'#a0b9cf',3);if(t>=times[j]){body('✓',255,105,48,BLUE);body(actions[j],10,505,39,INK,600)}});const a=ss(t,77.8+j*.18,.45),pulse=ss(t,times[j],.25)*(1-ss(t,times[j]+.45,.35));out.push(place('file'+j,c,[400+j*550,650,350,520,-120+j*90+160*pulse],{alpha:a,ry:[.12,0,-.12][j]*(1-pulse),rx:-.03}));}return out}
function centeredChat(t){const out=[];const a=paintTexture('ask',500,180,()=>{softbox(0,0,500,175,'#d7e9ff',32);body('你问一句',65,112,66)});out.push(place('ask',a,[270,470,500,180,-70],{ry:.12}));{const b=paintTexture('answer',500,180,()=>{softbox(0,0,500,175,PAPER,32);body('它答一句',65,112,66)});out.push(place('answer',b,[1650,590,500,180,10],{ry:-.12,alpha:ease6(t,43.86,.3)}))}return out}
function stageHeader(i,t){g.setTransform(S,0,0,S,0,0);g.globalAlpha=1;ctx=g;body(i===8?'汇总':String(i+1).padStart(2,'0'),75,98,32,BLUE,700);title(names[i]||'8个Skills',155,104,66);body('功能流程示意',1510,98,29,MUTED);under(75,135,1770,t,starts[i],(starts[i+1]||92.46)-starts[i])}
let lastObjects=[],lastPersonRect=null;
async function renderV6(t,bypass=false){
 if(!layoutOnly&&!bypass){
  if(t>=10.3&&t<12)return renderBridge(t,12.001,10.3,1.35,false,'intro');
  if(t>=48.75&&t<49.45)return renderBridge(t,48.749,48.75,.7,true,'chapter');
  if(t>=50.8&&t<52.35)return renderBridge(t,52.351,50.8,1.2,false,'chart');
  if(t>=92.46&&t<93.35)return renderBridge(t,92.459,92.6,.75,true,'end');
 }

 if(t<11.1||t>=93.35){await renderV4(t);return}
 if(t>=92.46){
   await renderV6(92.45);const box=lastPersonRect;
   for(const o of slotMeshes.values())o.group.visible=false;renderer.render(scene,camera);
   if(!layoutOnly){ frameImage.src=LRH.frameURL(t);toneMask.src=LRH.maskURL(t);await Promise.all([frameImage.decode(),toneMask.decode()]);prepareTone();}
   g.setTransform(1,0,0,1,0,0);g.drawImage(renderer.domElement,0,0);g.setTransform(S,0,0,S,0,0);ctx=g;const q=ss(t,92.68,.67),p=box.map((v,j)=>mix(v,[0,0,1920,1080][j],q));softbox(...p,'#b5cce3',22*(1-q));original(...p,1-q,1);heroWord('关注西子',95,735,107,'#fff',t,93.2,98);captionV4(t);return;
 }
 if(!layoutOnly){ frameImage.src=LRH.frameURL(t);toneMask.src=LRH.maskURL(t);await Promise.all([frameImage.decode(),toneMask.decode()]);prepareTone();}
 if(t>=48.94&&t<51.22){g.setTransform(S,0,0,S,0,0);ctx=g;g.clearRect(0,0,1920,1080);original(0,0,1920,1080,0,1.02);heroWord('再装4个',80,430,132,'#fff',t,48.94,51.22,-.2);heroWord('让AI帮你干活',85,585,76,'#b9d6ff',t,49.74,51.22);captionV4(t,true);return}
 for(const o of slotMeshes.values()){o.group.visible=false;if(o.back)o.back.visible=false}
 let i=0;for(let j=0;j<starts.length;j++)if(t>=starts[j])i=j;
 let p=stageAt(t),objects=[],ui=p.slice(7),alpha=p[6];
 if(i===2)objects.push(...workflow3D(t));else if(i===7)objects.push(...files3D(t));else if(i===6)objects.push(...slideLayers(t,ui));else if(i===3&&t<44.5)objects.push(...centeredChat(t));else{
   const c=uiTexture(i,t);objects.push(place('ui',c,ui,{ry:i===1?Math.PI*(1-ss(t,19.7,.65))+.025:0}));
   if(!layoutOnly&&i===1&&t<20.4){const u=slotMeshes.get('ui');if(!u.back){const cover=paintTexture('notebookcover',1140,720,()=>{rect(0,0,1140,720,BLUE,20);title('纠正本',90,340,140,'#fff');body('Self-Improving',95,445,60,'#d7e9ff',600)}),tex=new THREE.CanvasTexture(cover);tex.colorSpace=THREE.SRGBColorSpace;u.back=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:tex,side:THREE.FrontSide,toneMapped:false}));u.back.rotation.y=Math.PI;u.back.position.z=-6;u.group.add(u.back)}u.back.visible=true;u.back.material.opacity=1;u.back.scale.set(ui[2],ui[3],1)}
   // Corrected rule is a closer physical layer, revealed only when it has been saved.
   if(i===1&&t>=25.2){const c=paintTexture('saved',510,110,()=>{button('已保存这次纠正 ✓',0,0,510,true)});objects.push(place('saved',c,[720,760,510,110,200],{ry:0}))}
 }
 const pc=personTexture(p[2],p[3],p[5]);const person=place('person',pc,p.slice(0,5),{alpha,ry:-.045*Math.max(-1,Math.min(1,(p[0]-960)/600))});
 // Independent rounded/circular geometry follows the video-window shape, never outlines the person.
 const po=slotMeshes.get('person');if(!po.frame){po.frame=new THREE.Mesh(new THREE.ShapeGeometry(roundedShape(1,1,.05)),new THREE.MeshStandardMaterial({color:'#a8c3dc',roughness:.6,metalness:.08}));po.frame.castShadow=true;po.frame.position.z=-8;person.add(po.frame)}
 // Keep the source portrait in the foreground during the brief crossing flip.
 const protect=transitionStarts.some(a=>t>=a&&t<a+1.3);po.front.material.depthTest=!protect;po.front.renderOrder=protect?100:0;
 po.frame.geometry.dispose();po.frame.geometry=new THREE.ShapeGeometry(roundedShape(p[2],p[3],Math.min(p[2],p[3])*mix(.045,.5,p[5])));po.frame.material.transparent=alpha<1;po.frame.material.opacity=alpha;
 person.visible=alpha>.02;
 if(alpha>.02)objects.push(person);
 const [yaw,pitch]=cameraAngle(t);let rectFrame={x:.045,y:.18,w:.91,h:.67};
 if(layoutOnly){fitObjectsToFrame({THREE,camera,objects,rect:rectFrame,viewFrom:[Math.sin(yaw),Math.sin(pitch),Math.cos(yaw)]});return {t,p:camera.position.clone(),q:camera.quaternion.clone()}}
 applyCameraTrack(t);
 // Previous semantic objects hand over while the portrait remains live.
 for(const group of outgoing.values())group.visible=false;
 const entry=transitionStarts.find(a=>t>=a&&t<a+.56);
 if(entry!==undefined){const q=ease6(t,entry,.48);for(const o of slotMeshes.values())if(o.group.visible&&o!==po){o.group.position.z-=90*(1-q);o.group.position.y+=22*(1-q);o.front.material.opacity*=ease6(t,entry+.08,.4);if(o.edge)o.edge.material.opacity*=ease6(t,entry+.08,.4);if(o.back){o.back.material.transparent=true;o.back.material.opacity=ease6(t,entry+.08,.4)}}
 const prev=outgoing.get(entry);if(prev){prev.visible=true;prev.position.z=-90*q;prev.position.y=30*q;prev.traverse(o=>{if(o.isMesh){o.material.opacity=o.userData.baseOpacity*(1-ease6(t,entry,.36));o.castShadow=false}})}}
 scene.updateMatrixWorld(true);

 const points=[[-.5,-.5,0],[.5,-.5,0],[.5,.5,0],[-.5,.5,0]].map(v=>new THREE.Vector3(...v).applyMatrix4(po.front.matrixWorld).project(camera));let xx=points.map(v=>(v.x+1)*960),yy=points.map(v=>(1-v.y)*540);lastPersonRect=[Math.min(...xx),Math.min(...yy),Math.max(...xx)-Math.min(...xx),Math.max(...yy)-Math.min(...yy)];
 renderer.render(scene,camera);g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.clearRect(0,0,C.width,C.height);g.drawImage(renderer.domElement,0,0);g.setTransform(S,0,0,S,0,0);ctx=g;stageHeader(i,t);captionV4(t);
 lastObjects=objects;
}
async function renderBridge(t,anchor,a,d,expand,kind){
 await renderV6(anchor,true);const box=lastPersonRect.slice(),pose=stageAt(anchor),q=ease6(t,a,d),k=expand?1-q:q;
 slotMeshes.get('person').group.visible=false;
 for(const o of slotMeshes.values())if(o.group.visible)o.group.traverse(m=>{if(m.isMesh){m.material.transparent=true;m.material.opacity*=expand?1-ease6(t,a,.32):ease6(t,kind==='intro'?11.15:51.3,.65);m.castShadow=false}});
 for(const o of outgoing.values())o.visible=false;
 renderer.render(scene,camera);
 frameImage.src=LRH.frameURL(t);toneMask.src=LRH.maskURL(t);await Promise.all([frameImage.decode(),toneMask.decode()]);prepareTone();
 g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(renderer.domElement,0,0);g.setTransform(S,0,0,S,0,0);ctx=g;
 const dest=[0,0,1920,1080].map((v,j)=>mix(v,box[j],k));let sw=mix(1800,2800,clamp((.95-pose[3]/pose[2])/.35)),sh=sw*pose[3]/pose[2];if(sh>2160){sh=2160;sw=sh*pose[2]/pose[3]}
 const crop=[LRH.cropX(sw),LRH.cropY(sh),sw,sh],src=[0,0,3840,2160].map((v,j)=>mix(v,crop[j],k)),r=Math.min(dest[2],dest[3])*mix(.045,.5,pose[5])*k;
 g.save();g.beginPath();g.roundRect(...dest,r);g.clip();g.drawImage(tone,...src,...dest);g.restore();
 if(!expand&&t>=(kind==='intro'?11.32:51.22)){g.save();g.globalAlpha=ease6(t,kind==='intro'?11.32:51.22,.35);stageHeader(kind==='intro'?0:4,t);g.restore()}
 if(kind==='end')heroWord('关注西子',95,735,107,'#fff',t,93.2,98);
 captionV4(t,k<.2);
}
async function prepareCameraTrack(){
 layoutOnly=true;
 for(const [a,b] of [[11.1,48.939],[51.22,92.459]]){const raw=[];for(let t=a;t<=b+1/30;t+=1/30)raw.push(await renderV6(Math.min(t,b)));const smoothed=raw.map((r,i)=>{const p=new THREE.Vector3();let q=new THREE.Quaternion(),sum=0;for(let j=Math.max(0,i-18);j<=Math.min(raw.length-1,i+18);j++){const w=Math.exp(-.5*((j-i)/7.5)**2);p.addScaledVector(raw[j].p,w);if(!sum)q.copy(raw[j].q);else q.slerp(raw[j].q,w/(sum+w));sum+=w}return {t:r.t,p:p.divideScalar(sum),q}});cameraTracks.push(smoothed)}
 layoutOnly=false;
}
function applyCameraTrack(t){const track=cameraTracks.find(x=>t>=x[0].t&&t<=x.at(-1).t)||cameraTracks[t<50?0:1];let n=Math.min(track.length-2,Math.max(0,Math.floor((t-track[0].t)*30)));const a=track[n],b=track[n+1],q=clamp((t-a.t)/(b.t-a.t||1));camera.position.copy(a.p).lerp(b.p,q);camera.quaternion.copy(a.q).slerp(b.q,q);camera.updateMatrixWorld(true)}
async function prepareHandoffs(){for(const t of transitionStarts){await renderV6(t-1/60);const group=new THREE.Group();for(const [id,o] of slotMeshes){if(id==='person'||!o.group.visible)continue;const clone=o.group.clone();clone.traverse(m=>{if(!m.isMesh)return;m.material=m.material.clone();if(m.material.map){const c=document.createElement('canvas'),src=m.material.map.image;c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);m.material.map=new THREE.CanvasTexture(c);m.material.map.colorSpace=THREE.SRGBColorSpace}m.userData.baseOpacity=m.material.opacity;m.material.transparent=true;m.castShadow=false});group.add(clone)}group.visible=false;scene.add(group);outgoing.set(t,group)}}
await window.v4Ready;
await prepareCameraTrack();await prepareHandoffs();await renderV6(0);
window.v6Core={renderAt:renderV6};window.resolveV6(true);
