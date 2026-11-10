// Ported from the author's V6 project; see ../provenance.json.
const C=document.querySelector('canvas'),g=C.getContext('2d'),V=document.querySelector('#src'),M=document.querySelector('#mask'),S=+(new URLSearchParams(location.search).get('scale')||1);C.width=1920*S;C.height=1080*S;
const panel=document.createElement('canvas');panel.width=3030;panel.height=1920;const pg=panel.getContext('2d');let ctx=g;
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-(1-clamp(x))**3,step=(t,a,d=.5)=>ease((t-a)/d),mix=(a,b,t)=>a+(b-a)*t;
function text(s,x,y,size=40,col='#fff',body=false){s=LRH.text(s);ctx.fillStyle=col;ctx.font=`${body?'500 ':''}${size}px ${body?'Body':'Title'}`;ctx.fillText(s,x,y)}
function rect(x,y,w,h,col,r=20){ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x,y,Math.max(.01,w),Math.max(.01,h),r);ctx.fill()}
function line(x,y,X,Y,col='#45dce1',w=4){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.stroke()}
function surface(x,y,w,h,col='#e7f1f4'){ctx.save();ctx.shadowColor='#0009';ctx.shadowBlur=45;ctx.shadowOffsetY=30;rect(x,y+15,w,h,'#38516a');ctx.restore();rect(x,y,w,h,col);line(x+25,y+2,x+w-25,y+2,'#ffffff66',2)}
function badge(s,x,y,w=210,col='#38d7d9'){rect(x,y,w,62,col,15);text(s,x+22,y+43,29,'#102f45')}
function oldCursor(x,y,t){ctx.save();ctx.translate(x,y);ctx.fillStyle='#10283e';ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(2,38);ctx.lineTo(12,29);ctx.lineTo(23,46);ctx.lineTo(33,40);ctx.lineTo(22,24);ctx.lineTo(36,22);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();ctx.strokeStyle=`rgba(40,190,210,${.6*(1-(t%1))})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,10+30*(t%1),0,Math.PI*2);ctx.stroke()}
function project(source,x,y,w,h,angle){if(Math.abs(angle)<.0001){g.drawImage(source,x,y,w,h);return}const focal=source.width===3030?4200:1500;const co=Math.cos(angle),si=Math.sin(angle);for(let i=0;i<160;i++){const a=i/160,b=(i+1)/160;const u=(a-.5)*w,v=(b-.5)*w;const za=1+u*si/focal,zb=1+v*si/focal;const xa=x+w/2+u*co/za,xb=x+w/2+v*co/zb;const hh=h/za;g.drawImage(source,a*source.width,0,source.width/160+1,source.height,Math.min(xa,xb),y+h/2-hh/2,Math.max(1,Math.abs(xb-xa)+1),hh)}}
function heading(s,x,y,t,a,size=66){if(t<a)return;const q=step(t,a,.38);g.save();g.globalAlpha=q;g.translate(x,y+30*(1-q));text(s,0,0,size);g.restore()}
const frameImage=new Image();let caps=[];const starts=[11.32,19.7,29.46,40.62,51.22,59.78,67.68,77.56,85.8];const names=['Find Skills','Self-Improving','Skill Creator','Proactive Agent','Smart Charts','Humanizer','PPT Master','办公三件套'];const titles=['告诉它需求，找到合适技能','纠正一次，留下改进记录','把重复流程，封装成技能','从等你提问，到主动提醒','把数据，变成可交互看板','让文字，读起来更自然','不止能看，还能编辑','重复办公，交给AI'];
function content(i,t){ctx=pg;pg.setTransform(3,0,0,3,0,0);pg.clearRect(0,0,1010,640);const a=starts[i],u=t-a;surface(8,8,990,610);text(names[i]||'8个Skills · 使用教程',48,80,49,'#17344a');text('功能流程示意',770,72,23,'#5c7382',true);line(48,112,955,112,'#b7cfd6',2);
if(i===0){rect(48,150,910,87,'#d3e4ea');const s='我想自动整理每周工作总结';text(s.slice(0,Math.floor(step(t,15.98,1.3)*s.length)),76,208,38,'#193c52');rect(48,280,910,235,'#f8fcfd');text(t<17.26?'先描述任务':'匹配你的需求',76,332,32,'#567386');if(t>17.26){badge('周报整理',78,365,240);text('输入：本周工作记录',350,405,30,'#284758',true);text('输出：重点、进展、下周安排',78,478,30,'#284758',true)}cursor(880+12*Math.sin(u),204,t);line(75,548,75+850*((u*.18)%1),548,'#27bdc6',6)}
if(i===1){const p=step(t,24.04);text('纠正记录',55,167,35,'#355469');rect(55,200,890,88,'#f5dbe8');text('原规则：把所有内容堆成一段',80,256,34,'#a4446c');if(p>0){line(80,240,80+680*p,240,'#b73770',4);rect(55,320,890,104,'#cff0ed');text('修正规则：先结论，再列行动项',80,382,34,'#174d54')}if(t>25.2)badge('已保存纠正',55,455,260);if(t>26.08){text('下次遇到类似任务',390,493,30,'#536d7e');text(t>28.24?'调用修正规则 ✓':'读取纠正记录…',390,551,33,'#156f7d')}cursor(900,465+9*Math.sin(u*2),t)}
if(i===2){const merge=step(t,35.96,1.0);['收集记录','整理重点','生成周报'].forEach((s,j)=>{const x=mix(55+j*300,310+j*16,merge),y=mix(205,205+j*24,merge);surface(x,y,265,160,['#d8ebf0','#c9e5e9','#a7dce2'][j]);text(s,x+36,y+95,37,'#20465e')});if(t>35.96){rect(310,205,365,265,'#193f58');text('SKILL',350,300,76,'#4fe2df');text('周报助手',350,364,42);text('流程 · 规则 · 输出',350,424,27,'#a9d2df',true)}if(t>38.12){badge('“帮我写周报”',55,520,380);line(450,552,560+220*step(t,39.24),552);text('调用',800,565,32,'#183f54')}else cursor(700,470,t)}
if(i===3){text('以前',55,173,33,'#63798b');rect(55,205,350,105,'#d4e2e9');text('你问一句',85,272,40,'#28495c');rect(570,205,350,105,'#d4e2e9');text('它答一句',610,272,40,'#28495c');line(425,260,545,260);if(t>44.5){surface(55,355,865,205,'#173c52');text('接下来的任务',90,414,32,'#66e4de');if(t>45.56)text('分析待办 → 梳理下一步',90,470,38);if(t>47.02){badge('提醒',675,396,190,'#ed82c1');text('该做什么了？',90,530,38)}}cursor(870,510+10*Math.sin(u),t)}
if(i===4){const q=step(t,54.34,1.5);badge('全部季度 ▾',55,150,240,'#b4dfe7');if(t>56)badge('柱状图',320,150,180);[42,58,51,73].forEach((n,j)=>{let x=75+j*220;rect(x,mix(260+j*55,510-n*3,q),150,mix(42,n*3,q),j===3?'#cf43a6':'#28acb8',8);text('Q'+(j+1),x+40,mix(290+j*55,559,q),29,'#23495b',true);text(String(Math.round(n*step(t,53+.13*j,.8))),x+42,mix(290+j*55,490-n*3,q),33,q<.5?'#fff':'#173d52')});cursor(850,200+12*Math.sin(u),t);if(t>57.26){line(55,585,55+850*((u*.15)%1),585,'#2ba7b5',5)}}
if(i===5){text('示例文案',55,168,28,'#627a88');rect(55,195,890,128,'#eadce6');text('赋能协同，全面提升工作效能',85,267,39,'#80506f');const q=step(t,65.34,1);rect(55,355,890,135,'#c9ece6');text('一起把工作做得更快、更好'.slice(0,Math.floor(q*14)),85,435,42,'#17565b');['公众号','小红书','工作周报'].forEach((s,j)=>{if(t>[62.3,63.78,64.5][j])badge(s,55+j*300,525,265,j===Math.floor(u)%3?'#ed83c0':'#d4e3e8')});cursor(895,445,t)}
if(i===6){let q=step(t,72.36);surface(60,150,870,380,'#f9fcfd');rect(90,182,800,85,'#cbe4e9');text('项目汇报',125,242,46,'#1e4c62');[0,1,2].forEach(j=>rect(120+j*240,320-j*25,145,135+j*25,['#1f9cae','#4cccd0','#d252a8'][j]));if(q){pg.strokeStyle='#dc42a4';pg.lineWidth=3;pg.strokeRect(110,195,310,66);for(const x of [110,420])for(const y of [195,261])rect(x-5,y-5,10,10,'#d442a0',0);text('PPTX · 可编辑文字 / 图形',75,582,33,'#214c61')}if(t>74.12){['#1f9cae','#d252a8','#285a9b'].forEach((col,j)=>rect(710+j*65,545,45,45,col,12))}cursor(t>74.12?795:410, t>74.12?565:235,t)}
if(i===7){['PDF','Word','Excel'].forEach((s,j)=>{surface(60+j*305,155,270,315,['#fae5ed','#deebff','#d8f0e9'][j]);text(s,90+j*305,225,43,'#23445b');for(let k=0;k<4;k++)rect(90+j*305,265+k*36,190-(k%2)*40,12,'#8ba8b7',4);if(t>[80.84,82.54,81.72][j])badge(['合并文件','整理文档','清洗表格'][j],75+j*305,490,240)});cursor(800+20*Math.sin(u),550,t)}
if(i===8){names.forEach((s,j)=>{const x=55+(j%2)*455,y=155+Math.floor(j/2)*92;rect(x,y,425,73,j<4?'#d2e9ed':'#e7d8e7');text(`${j+1}  ${s}`,x+20,y+48,31,'#25465d')});}
ctx=g;}
// V3: one absolute timeline, original footage, face-safe type, continuous handoffs.
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)},ss=(t,a,d=.6)=>smooth((t-a)/d);
const pop=x=>{x=clamp(x);return 1+2.2*(x-1)**3+1.2*(x-1)**2};
function cursor(){} // Superseded by event-linked cursor below; no unrelated looping clicks.
const copy=document.createElement('canvas');copy.width=3030;copy.height=1920;const cg=copy.getContext('2d');
const typeCache=new Map();
function typeImage(s,size,col){s=LRH.text(s);const key=[s,size,col].join('|');if(typeCache.has(key))return typeCache.get(key);const c=document.createElement('canvas'),q=c.getContext('2d');q.font=`${size*2}px Title`;c.width=Math.ceil(q.measureText(s).width+80);c.height=size*3;q.font=`${size*2}px Title`;q.shadowColor='#00111daa';q.shadowBlur=14;q.shadowOffsetY=5;q.fillStyle=col;q.fillText(s,30,size*2.2);typeCache.set(key,c);return c}
function heroWord(s,x,y,size,col,t,a,b,perspective=0){if(t<a||t>b+.3)return;const q=pop((t-a)/.43),out=ss(t,b,.08);g.save();g.globalAlpha=(1-out)*clamp((t-a)/.1);const img=typeImage(s,size,col),w=img.width/2,h=img.height/2;const k=.84+.16*q;g.translate(x+80*out,y+26*(1-q));g.scale(k,k);project(img,0,-h,w,h,perspective*(1+.65*(1-clamp((t-a)/.5))));g.restore()}
function original(x,y,w,h,crop=0,zoom=1){g.save();g.beginPath();g.roundRect(x,y,w,h,26*crop);g.clip();let sw=mix(3840,1800,crop)/zoom,sh=sw*h/w;let sx=mix(1920,1920,crop)-sw/2,sy=mix(1080,985,crop)-sh/2;sy=Math.max(0,sy);g.drawImage(frameImage,sx,sy,sw,sh,x,y,w,h);g.restore()}
function opening(t){
 // No matte or full-screen tint touches the face; side-local contrast only.
 const gr=g.createLinearGradient(0,0,780,0);gr.addColorStop(0,'#031522cc');gr.addColorStop(.72,'#06152277');gr.addColorStop(1,'#03152200');g.fillStyle=gr;g.fillRect(0,0,780,1080);
 if(t<2.65){heroWord('WorkBuddy',100,252,55,'#66e7e2',t,0,2.22);heroWord('8个',85,535,205,'#fff',t,.06,2.22);heroWord('Skills',95,725,154,'#62e4df',t,.35,2.22);for(let j=0;j<8;j++){let q=step(t,.55+j*.1,.25);rect(110+j*64,790,44*q,7,'#ef85c6',3)}}
 heroWord('你装了',85,465,110,'#fff',t,2.46,3.4,-.58);heroWord('几个？',85,640,146,'#62e4df',t,2.63,3.4,-.58);
 heroWord('不知道',95,470,116,'#fff',t,3.54,5.2);heroWord('该装什么？',95,645,116,'#62e4df',t,3.79,5.2);
 if(t>=5.28&&t<8.62){heroWord('这条视频',95,420,98,'#fff',t,5.28,8.35);const q=step(t,5.45,.45),click=step(t,6.78,.18),bx=95,by=485;g.save();g.translate(bx,by+40*(1-q));g.globalAlpha=q;surface(0,0,490,160,click>.5?'#56e3dd':'#173e55');text(click>.5?'已收藏':'收藏',143,105,68,click>.5?'#103b4c':'#fff');g.strokeStyle=click>.5?'#12374a':'#63e5e0';g.lineWidth=7;g.beginPath();g.moveTo(57,39);g.lineTo(103,39);g.lineTo(103,118);g.lineTo(80,100);g.lineTo(57,118);g.closePath();g.stroke();g.restore();if(t>=6.95){const q=clamp((t-6.95)/1.5);line(112,675,112+450*q,675,'#56e3dd',5)}if(t>=6.48){g.save();g.translate(440,590);oldCursor(0,0,Math.min(.98,Math.max(0,t-6.78)));g.restore()}}
 heroWord('先装4个',90,465,137,'#fff',t,8.6,10.45,-.38);heroWord('让AI自己变强',95,610,73,'#62e4df',t,9.05,10.45);
 if(t>=8.9&&t<10.8)for(let j=0;j<4;j++){const q=step(t,8.95+j*.1,.3);g.save();g.globalAlpha=q*(1-ss(t,10.3,.45));surface(100+j*132,690+40*(1-q),110,95,j===0?'#4fdfdc':'#214559');text(String(j+1),138+j*132,755+40*(1-q),45,j===0?'#14354b':'#c1dde6');g.restore()}
}
const poses=[
 {a:10.3,p:[85,220,620,660],ui:[770,270,1060,672]},
 {a:19.7,p:[95,230,610,650],ui:[770,270,1060,672]},
 {a:29.46,p:[100,260,585,640],ui:[740,270,1100,697]},
 {a:40.62,p:[100,210,630,690],ui:[790,270,1035,656]},
 {a:51.22,p:[100,240,585,650],ui:[735,270,1100,697]},
 {a:59.78,p:[100,210,620,680],ui:[770,270,1060,672]},
 {a:67.68,p:[85,260,590,640],ui:[730,270,1100,697]},
 {a:77.56,p:[85,230,600,670],ui:[740,270,1100,697]},
 {a:85.8,p:[95,235,610,665],ui:[760,270,1070,678]}];
function poseAt(t){let z=0;for(let j=0;j<poses.length;j++)if(t>=poses[j].a)z=j;const cur=poses[z],prev=poses[Math.max(0,z-1)],q=ss(t,cur.a,.7);return {p:cur.p.map((v,j)=>mix(prev.p[j],v,q)),ui:cur.ui.map((v,j)=>mix(prev.ui[j],v,q))}}
const cueTimes=[[12.56,13.48,15.98,17.26,18.6],[21.8,24.04,25.2,26.08,28.24],[31.76,32.52,34.3,35.96,38.12,39.24],[42.78,43.86,44.5,45.56,47.02],[52.88,54.34,57.26],[61.14,62.3,63.78,64.5,65.34],[69.34,71.28,72.36,74.12,75.78],[78.22,80.84,81.72,82.54,83.42,84.58],[88.34,89.44,91.2]];
function point(t,keys){let a=keys[0],b=a;for(let j=1;j<keys.length;j++){if(t>=keys[j][0])a=keys[j];else{b=keys[j];break}b=a}const q=b[0]===a[0]?1:ss(t,a[0],Math.min(.55,b[0]-a[0]));return [mix(a[1],b[1],q),mix(a[2],b[2],q)]}
function interaction(i,t){ctx=pg;const a=starts[i],u=t-a,keys=[
 [[a,870,205],[15.5,530,205],[17.1,290,393],[18.3,730,475]],
 [[a,890,265],[23.7,640,367],[25,220,480],[26,550,540],[28,800,540]],
 [[a,230,285],[32.3,520,285],[34.1,800,285],[35.7,510,330],[38,270,550],[39.1,830,550]],
 [[a,200,260],[43.65,700,260],[44.4,790,400],[45.4,430,465],[46.8,760,425]],
 [[a,200,180],[54.1,840,180],[56.8,800,280],[58,550,350]],
 [[a,720,255],[62.1,190,550],[63.6,490,550],[64.3,790,550],[65.1,660,430]],
 [[a,790,475],[71.9,410,235],[73.9,795,565],[75.5,825,485]],
 [[a,810,220],[80.6,200,390],[81.5,810,390],[82.3,510,390],[84.3,800,550]],
 [[a,150,190],[88.1,820,470],[89.2,700,550]]][i];const [px,py]=point(t,keys);
 // semantic highlighting, not a decorative orbit. Reading copy stays stable.
 if(i===0&&t<15.98){text('输入你想完成的任务…',76,208,34,'#698795',true);let q=ss(t,12.56,.7);rect(62,270,885,235,'#f6fafb');text('描述任务 → 匹配技能',85,330,35,'#34566a');['工作总结','资料整理','自动化流程'].forEach((s,j)=>{let e=step(t,12.56+j*.55,.4);pg.save();pg.globalAlpha=e;badge(s,85+j*280,375+30*(1-e),250,j===Math.floor((t-12.56)*.8)%3?'#a1e5e4':'#dce9ed');pg.restore()});line(85,480,85+790*q,480,'#2cb8c1',5)}
 if(i===1&&t>25.2){let q=step(t,25.2,.4);line(82,490,95,503,'#145760',5);line(95,503,95+30*q,503-35*q,'#145760',5)}
 if(i===2&&t<35.96){const q=ss(t,34.3,.7);for(let j=0;j<2;j++){const xx=330+j*300;line(xx,285,xx+20+20*q,285,'#2aa9b6',5)}if(t>32.52){const d=((t-32.52)/2)%1;pg.save();pg.strokeStyle='#d64ca6';pg.lineWidth=4;pg.setLineDash([10,8]);pg.lineDashOffset=-t*28;pg.strokeRect(45,193,890,184);pg.restore()}}
 if(i===2&&t>=35.96&&t<38.12){const q=clamp((t-35.96)/2.1);pg.save();pg.strokeStyle='#55e0d9';pg.lineWidth=7;pg.beginPath();pg.arc(610,270,23,-Math.PI/2,-Math.PI/2+Math.PI*2*q);pg.stroke();pg.restore();text(q<.99?'正在封装流程…':'技能已生成 ✓',328,515,30,'#327181',true)}
 if(i===3&&t>47.02){let r=(t-47.02)%1.35;pg.save();pg.globalAlpha=.7*(1-r/1.35);pg.strokeStyle='#ed82c1';pg.lineWidth=4;pg.strokeRect(670-r*9,390-r*9,200+r*18,74+r*18);pg.restore()}
 if(i===4&&t>54.34){const v=ss(t,57.26,1.0);pg.save();pg.strokeStyle='#f6faff';pg.lineWidth=3;pg.setLineDash([8,7]);pg.lineDashOffset=-t*24;pg.strokeRect(65+660*v,260-30*v,170,260+30*v);pg.restore()}
 if(i===5&&t>65.34){const q=step(t,65.34,1);line(85,460,85+700*q,460,'#2e9d9b',4)}
 if(i===6&&t>72.36){const q=ss(t,74.12,.45);if(q>0){rect(570,182,320,85,mix(0,1,q)>.5?'#ddbfda':'#cbe4e9');text('项目汇报',125,242,46,'#1e4c62')}pg.save();pg.strokeStyle='#dc42a4';pg.setLineDash([8,6]);pg.lineDashOffset=-t*18;pg.strokeRect(110,195,310,66);pg.restore()}
 if(i===7){for(const [j,on]of [[0,80.84],[2,81.72],[1,82.54]]){if(t<on)continue;const q=ss(t,on,.55);const x=90+j*305;rect(x,265,190,12,'#2bb8a4');line(x,422,x+170*q,422,'#279f93',5);if(t>on+.6){text('✓',x+175,260,35,'#158672')}}}
 if(i===8){const progress=step(t,88.34,.65);for(let j=0;j<8;j++)if(t>88.34+j*.07){text('✓',420+(j%2)*455,203+Math.floor(j/2)*92,26,'#169d9b')}}
 // Gliding actual interaction cursor. Ripple only around an action cue.
 pg.save();pg.translate(px,py);pg.fillStyle='#122e44';pg.strokeStyle='#fff';pg.lineWidth=2;pg.beginPath();pg.moveTo(0,0);pg.lineTo(0,30);pg.lineTo(9,22);pg.lineTo(20,37);pg.lineTo(27,32);pg.lineTo(17,18);pg.lineTo(29,17);pg.closePath();pg.fill();pg.stroke();pg.restore();for(const at of cueTimes[i]){const d=t-at;if(d>=0&&d<.45){pg.save();pg.globalAlpha=.75*(1-d/.45);pg.strokeStyle='#ce4ba7';pg.lineWidth=4;pg.beginPath();pg.arc(px,py,12+d*65,0,Math.PI*2);pg.stroke();pg.restore()}}
 ctx=g;
}
function buildPanel(i,t){content(i,t);interaction(i,t)}
function panelHandoff(i,t,box){let [x,y,w,h]=box;const a=starts[i],u=t-a;const q=ss(t,a,.64);
 if(i>0&&i!==4&&u<.64){buildPanel(i-1,a-.002);cg.clearRect(0,0,3030,1920);cg.drawImage(panel,0,0);buildPanel(i,t);
 if(i===1||i===6){let ang=Math.PI*q;if(q<.5)project(copy,x,y,w,h,ang);else project(panel,x,y,w,h,ang-Math.PI);return}
 // The same work surface scrolls or reveals; faces never crossed.
 g.save();g.beginPath();g.roundRect(x,y,w,h,22);g.clip();if(i===2||i===7){g.drawImage(copy,x,y-h*q,w,h);g.drawImage(panel,x,y+h*(1-q),w,h)}else{g.drawImage(copy,x-w*q,y,w,h);g.drawImage(panel,x+w*(1-q),y,w,h)}g.restore();return}
 buildPanel(i,t);project(panel,x,y,w,h,0)
}
async function render(t){frameImage.src=LRH.frameURL(t);await frameImage.decode();g.setTransform(S,0,0,S,0,0);g.clearRect(0,0,1920,1080);ctx=g;
 let bg=g.createLinearGradient(0,0,1920,1080);bg.addColorStop(0,'#071420');bg.addColorStop(.65,'#15384d');bg.addColorStop(1,'#311a3b');g.fillStyle=bg;g.fillRect(0,0,1920,1080);
 const end=ss(t,92.78,.75),shrink=ss(t,10.3,.82)*(1-end),pose=poseAt(t);let [px,py,pw,ph]=pose.p;px=mix(0,px,shrink);py=mix(0,py,shrink);pw=mix(1920,pw,shrink);ph=mix(1080,ph,shrink);
 let full=ss(t,35.75,.65)*(1-ss(t,39.8,.65))+ss(t,71.6,.65)*(1-ss(t,76.75,.65))+ss(t,80.45,.6)*(1-ss(t,85.0,.65));full=Math.min(1,full);
 // Source framing follows semantic emphasis, never an oscillating whole-frame zoom.
 let zoom=1;
 const zoomKeys=[[0,1],[1.4,1.035],[2.4,1.035],[3,1.06],[5.3,1.075],[6,1.035],[8.6,1.035],[9.1,1.055],[10.3,1.055],[11.2,1],[92.68,1],[94.1,1.035],[97.3,1.045]];
 for(let j=0;j<zoomKeys.length-1;j++){const a=zoomKeys[j],b=zoomKeys[j+1];if(t>=a[0]&&t<b[0])zoom=mix(a[1],b[1],ss(t,a[0],b[0]-a[0]))}

 if(shrink>.001)surface(px,py,pw,ph,'#294a5f');original(px,py,pw,ph,shrink,zoom);
 if(t<11){g.save();g.globalAlpha=1-ss(t,10.3,.55);opening(t);g.restore()}
 if(t>=10.3&&t<93.26){let i=0;for(let j=0;j<starts.length;j++)if(t>=starts[j])i=j;let box=pose.ui.slice();const aSeg=starts[i],bSeg=starts[i+1]||92.46;
 const track=.035*clamp((t-aSeg)/(bSeg-aSeg))*(1-ss(t,bSeg-.3,.3));box[0]-=box[2]*track/2;box[1]-=box[3]*track/2;box[2]*=1+track;box[3]*=1+track;
 const enter=ss(t,10.3,.8);box=box.map((v,j)=>mix([1210,690,530,336][j],v,enter));const focusStart=t<60?35.75:t<79?71.6:80.45;const focusPush=.025*clamp((t-focusStart)/4.5);const focusBox=[250-710*focusPush,55-450*focusPush,1420*(1+focusPush),900*(1+focusPush)];box=box.map((v,j)=>mix(v,focusBox[j],full));
 // During full-screen demonstration the person yields the stage continuously.
 if(full>0){g.fillStyle=`rgba(7,20,32,${full})`;g.fillRect(0,0,1920,980)}
 g.save();const retreat=ss(t,92.46,.34);box[0]+=1200*retreat;g.globalAlpha=enter;panelHandoff(i,t,box);g.restore();
 // Titles use a bounded rail with a serial handoff, not overlapping text layers.
 if(full<.98){const a=starts[i],q=ss(t,a,.45);g.save();g.globalAlpha=(1-full)*(1-ss(t,92.46,.25))*enter;g.beginPath();g.rect(755,90,1090,115);g.clip();if(i>0&&i!==4&&q<1){g.save();g.translate(0,-130*q);text(titles[i-1],770,157,62);g.restore()}g.save();g.translate(0,130*(1-q));text(i<8?titles[i]:'8个Skills · 安装与使用教程',770,157,62);g.restore();g.restore()}
 if(t>=48.94&&t<51.8){let q=ss(t,48.94,.4),o=ss(t,51.22,.55);g.save();g.globalAlpha=q;g.translate(1200*o,0);rect(760,90+70*(1-q),1085,850,'#171d35');heroWord('再装4个',815,400,132,'#ef88c9',t,48.94,51.22,-.2);heroWord('让AI帮你干活',815,560,93,'#fff',t,49.74,51.22);['图表','文字','PPT','文档'].forEach((s,j)=>{let p=step(t,49.8+j*.08,.3);badge(s,815+j*244,680+60*(1-p),220,j===0?'#65dfdd':'#d1deeb')});g.restore()}
 if(t>=89.44&&t<92.7){let q=ss(t,89.44,.35)*(1-ss(t,92.46,.24));g.save();g.globalAlpha=q;rect(760,780,1070,160,'#173e53');text('评论区',800,880,52);if(t>=91.2){heroWord('工具包',1080,908,100,'#62e6df',t,91.2,92.46,-.40)}else{line(1080,900,1620,900,'#70c6cb',4);rect(1090,822,4,61,Math.floor(t*3)%2?'#72e5e2':'#173e53',0)}g.restore()}}
 if(t>=92.68){heroWord('关注西子',95,735,107,'#fff',t,92.68,98);heroWord('解锁更多AI玩法',100,850,67,'#64e5de',t,93.36,95.55);heroWord('1000个AI知识',100,865,79,'#64e5de',t,95.9,98,-.15)}
 const cap=caps.find(r=>t>=r.start&&t<r.end);if(cap){g.save();const s=cap.text.replace(/[，。,.?？]$/,'');g.font='48px Title';const tw=g.measureText(s).width;g.shadowColor='#000';g.shadowBlur=14;g.shadowOffsetY=4;text(s,(1920-tw)/2,1020,48);g.restore()}
}
window.film={duration:97.22,fps:60,renderAt:render,ready:Promise.all([Promise.resolve(LRH.captions).then(r=>caps=r),document.fonts.load('70px Title'),document.fonts.load('500 30px Body')]).then(()=>render(0))};
