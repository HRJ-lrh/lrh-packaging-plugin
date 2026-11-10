// Original synthetic verification scene. MIT © 2026 HRJ-lrh.
import * as THREE from '/node_modules/three/build/three.module.js';
await document.fonts.load('600 48px Noto');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setClearColor(0x10272d); document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, innerWidth/innerHeight, .1, 100);
scene.add(new THREE.HemisphereLight(0xffffff, 0x345653, 2.7));
const light = new THREE.DirectionalLight(0xffffff, 3);light.position.set(-4,6,8);scene.add(light);
light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-10,right:10,top:8,bottom:-8});light.shadow.bias=-.001;
const group = new THREE.Group();scene.add(group);
const clamp = x => Math.max(0,Math.min(1,x));
const ease = x => {x=clamp(x);return x*x*(3-2*x);};
const phase = (t,a,b) => ease((t-a)/(b-a));
const mix = (a,b,p) => a+(b-a)*p;
function texture(kind, title, body, active=false) {
 const c=document.createElement('canvas');c.width=960;c.height=720;const ctx=c.getContext('2d');
 ctx.fillStyle=active?'#e9b35a':'#ebf3ec';ctx.fillRect(0,0,960,720);
 ctx.fillStyle='#40615a';ctx.font='500 30px Noto';ctx.fillText(kind,64,76);
 ctx.fillStyle='#153e38';ctx.font='700 76px Noto';ctx.fillText(title,64,184);
 ctx.fillStyle='#507268';ctx.font='400 40px Noto';ctx.fillText(body,64,250);
 if(kind==='RESULT / 03') {
  [130,210,290].forEach((h,i)=>{ctx.fillStyle=i===2?'#e4a641':'#3f887c';ctx.fillRect(85+i*260,610-h,170,h);ctx.fillStyle='#153e38';ctx.font='600 32px Noto';ctx.fillText(['收集','整理','交付'][i],130+i*260,660);});
 } else {
  ctx.strokeStyle='#b6d0c2';ctx.lineWidth=4;ctx.strokeRect(64,324,832,300);
  ['输入可见','状态推进','结果明确'].forEach((s,i)=>{ctx.fillStyle=i===1&&active?'#153e38':'#456d60';ctx.font='500 42px Noto';ctx.fillText('0'+(i+1)+'   '+s,110,395+i*82);});
 }
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
function card(width,height,map) {
 const frame=new THREE.Group();
 const body=new THREE.Mesh(new THREE.BoxGeometry(width,height,.16),new THREE.MeshStandardMaterial({color:0x32665b,roughness:.42,metalness:.08}));
 body.castShadow=true;
 const face=new THREE.Mesh(new THREE.PlaneGeometry(width-.035,height-.035),new THREE.MeshBasicMaterial({map}));face.position.z=.086;
 frame.add(body,face);group.add(frame);return {frame,face};
}
const idle=['收集记录','整理重点','生成周报'].map((s,i)=>texture('WORKFLOW / 0'+(i+1),s,['原始输入','提炼结构','可读成果'][i]));
const selected=['收集记录','整理重点','生成周报'].map((s,i)=>texture('WORKFLOW / 0'+(i+1),s,'当前步骤',true));
const tool=texture('TOOL / 02','周报助手','三个步骤 · 一个入口',true);
const result=texture('RESULT / 03','结果接管画面','示意图表 · 不代表实测数据');
const cards=idle.map(tex=>card(2.8,2.2,tex));
const presenter=card(2.4,3.6,texture('PRESENTER','人物窗口','此处为占位示意'));
// Geometric stand-in: no face generation, footage or private likeness in the release.
const avatar=new THREE.Group();
const head=new THREE.Mesh(new THREE.SphereGeometry(.34,24,16),new THREE.MeshStandardMaterial({color:0x598d7d,roughness:.7}));head.position.set(0,-.08,.4);
const shoulders=new THREE.Mesh(new THREE.SphereGeometry(.65,32,20),new THREE.MeshStandardMaterial({color:0x598d7d,roughness:.7}));shoulders.scale.set(1,.68,.45);shoulders.position.set(0,-.85,.3);avatar.add(head,shoulders);presenter.frame.add(avatar);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x10272d,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.6;floor.receiveShadow=true;scene.add(floor);
const caption=document.querySelector('#caption');
const heading=document.querySelector('#heading');
function renderAt(seconds){
 const t=Math.max(0,Math.min(8,seconds));const merge=phase(t,3,4);const expand=phase(t,4.5,5.6);
 camera.position.set(mix(.6,0,expand),mix(.15,0,expand),11.8);camera.lookAt(0,0,0);
 group.rotation.y=mix(-.12,0,expand);
 presenter.frame.position.set(mix(-4.2,-8,expand),-.1,-.25);presenter.frame.rotation.y=.09*(1-expand);
 presenter.frame.visible=expand<.999;
 cards.forEach((c,i)=>{
  const enter=phase(t,.15+i*.18,.9+i*.18);
  c.frame.position.set(mix(-.9+i*2.95,2,merge)*(1-expand),mix(-2.5,.05,enter),mix(i*.12,.9,merge)*(1-expand));
  c.frame.rotation.y=mix(-.07+i*.055,0,merge);
  c.frame.rotation.z=(1-enter)*.05;
  const s=i===1?mix(1,2.65,expand):mix(1,.001,merge);
  c.frame.scale.set(s,s,1);c.frame.visible=i===1||merge<.999;
  c.face.material.map=t>=4.5?result:t>=3.65?tool:t>=1.3+i*.52?selected[i]:idle[i];
 });
 heading.textContent=t<3?'步骤依次激活':t<4.5?'同一对象 · 汇成工具':'全幅结果 · 停稳阅读';
 caption.textContent=t<3?'先让观众看清：输入 → 变化 → 输出':t<4.5?'合并关系延续，避免整页消失后重新寻找':'字幕保持屏幕位置，重要信息回正停稳';
 renderer.render(scene,camera);
 return {time:t,stage:t<3?'steps':t<4.5?'tool':'result',presenterVisible:presenter.frame.visible};
}
window.film={ready:true,duration:8,renderAt};renderAt(0);
// A normal browser previews continuously. Automated export disables this via ?capture=1.
if(!new URLSearchParams(location.search).has('capture')) {const start=performance.now();function tick(now){renderAt(((now-start)/1000)%8);requestAnimationFrame(tick);}requestAnimationFrame(tick);}
