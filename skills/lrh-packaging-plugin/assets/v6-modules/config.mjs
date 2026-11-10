// MIT © 2026 HRJ-lrh. Native V6 timing is intentional; do not stretch speech to fit it.
export const modules = Object.freeze({
  'presenter-reframe': {start:10.3,end:12.8,label:'人物全屏收为小窗'},
  'workflow-merge': {start:29.46,end:40.62,label:'三步流程汇聚为工具'},
  'result-takeover': {start:70.8,end:76.8,label:'人物退场与结果分层接管'},
});
export const textLimits = Object.freeze({
  'Find Skills':20,'Skill Creator':20,'PPT Master':20,'功能流程示意':10,
  '收集记录':5,'整理重点':5,'生成周报':5,
  '本周事项':8,'进展记录':8,'按主题归纳':8,'提炼下一步':8,'结论与行动项':8,'输出文档':8,
  '周报助手':6,'流程  ·  规则  ·  输出':18,'技能已生成 ✓':12,
  '“帮我写周报”':12,'调用 ✓':6,'项目汇报':4,
  '描述你想完成的任务':16,'工作总结':8,'资料整理':8,'自动化流程':8,
});
const finite = x => typeof x==='number' && Number.isFinite(x);
const safeURL = x => typeof x==='string' && /^(?:\/?[A-Za-z0-9_.%-]+\/)*[A-Za-z0-9_.%-]+$/.test(x) && !x.split('/').includes('..');
export function validateConfig(c) {
  if (!c || c.schema!==1 || !Object.hasOwn(modules,c.module)) throw Error('Unknown module or config schema.');
  const m=modules[c.module],duration=m.end-m.start;
  if (!c.media || !['fixture','sequence','reference-sequence'].includes(c.media.type)) throw Error('Invalid media type.');
  if(c.media.type!=='fixture') {
    for(const key of ['frames','masks']) if(c.media[key]!==undefined && !safeURL(c.media[key])) throw Error('Media paths must be local HTTP paths without traversal.');
    if(!c.media.frames || c.media.fps!==60 || !Number.isInteger(c.media.count) || c.media.count<1) throw Error('Expected a 60 fps frame sequence and positive count.');
    if(c.media.type==='sequence' && c.media.count<Math.ceil(duration*60-1e-8)) throw Error('Source sequence is shorter than the native module.');
    if(c.media.type==='reference-sequence' && c.media.count<Math.floor(m.end*60)) throw Error('Reference sequence must cover the original absolute timeline.');
    if(c.media.masks && (!Number.isInteger(c.media.maskCount) || c.media.maskCount<c.media.count)) throw Error('Mask count must cover all source frames.');
  }
  if(c.framing!==undefined){
    if(!c.framing||typeof c.framing!=='object'||Array.isArray(c.framing))throw Error('framing must be an object.');
    for(const [key,value] of Object.entries(c.framing))if(!['centerX','centerY'].includes(key)||!finite(value)||value<0||value>(key==='centerX'?3840:2160))throw Error('Invalid framing center in normalized 3840x2160 source pixels.');
  }
  if(c.text!==undefined && (!c.text || typeof c.text!=='object' || Array.isArray(c.text))) throw Error('text must be a mapping.');
  for(const [key,value] of Object.entries(c.text||{})) {
    if(!Object.hasOwn(textLimits,key)) throw Error(`Unsupported text field: ${key}`);
    if(typeof value!=='string'||!value.trim()||/[\r\n]/.test(value)||[...value].length>textLimits[key]) throw Error(`Text exceeds the slot limit: ${key}`);
  }
  if(c.captions!==undefined && !Array.isArray(c.captions)) throw Error('captions must be an array.');
  let end=0;
  for(const cue of c.captions||[]) {
    if(!finite(cue.start)||!finite(cue.end)||cue.start<end||cue.end<=cue.start||cue.end>duration+1e-8||typeof cue.text!=='string'||!cue.text.trim()||[...cue.text].length>30||/[\r\n]/.test(cue.text)) throw Error('Captions must be ordered, nonoverlapping local seconds, at most 30 characters, within the module.');
    end=cue.end;
  }
  return {...c,duration};
}
export function canonicalTime(c,t) {
  if(!finite(t)||t<0||t>c.duration+1e-8) throw Error('Module time out of range.');
  return modules[c.module].start+Math.min(t,c.duration-1e-8);
}
export function sequenceIndex(c,t,mask=false) {
  const local=c.media.type==='reference-sequence'?t:t-modules[c.module].start;
  // Prewarm outside the exported module uses a boundary frame; no such frames are exported.
  return Math.max(1,Math.min(mask?c.media.maskCount:c.media.count,Math.floor(local*60+(c.media.type==='reference-sequence'?0:1e-7))+1));
}
