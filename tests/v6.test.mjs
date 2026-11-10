import test from 'node:test';
import assert from 'node:assert/strict';
import {modules,validateConfig,canonicalTime,sequenceIndex} from '../skills/lrh-packaging-plugin/assets/v6-modules/config.mjs';
const fixture=module=>validateConfig({schema:1,module,media:{type:'fixture'}});
test('each module uses original absolute timing, with exclusive final boundary',()=>{
 for(const [id,m]of Object.entries(modules)){const c=fixture(id);assert.equal(canonicalTime(c,0),m.start);assert.ok(canonicalTime(c,c.duration)<m.end);assert.throws(()=>canonicalTime(c,-.1));assert.throws(()=>canonicalTime(c,c.duration+.1))}
});
test('frame mapping preserves local clip sync and clamps only prewarm requests',()=>{
 const c=validateConfig({schema:1,module:'workflow-merge',media:{type:'sequence',frames:'media/frames',fps:60,count:670}});
 assert.equal(sequenceIndex(c,29.46),1);assert.equal(sequenceIndex(c,29.46+1/60),2);assert.equal(sequenceIndex(c,0),1);assert.equal(sequenceIndex(c,95),670);
});
test('short inputs, incomplete masks and external/traversing paths are rejected',()=>{
 const c={schema:1,module:'workflow-merge',media:{type:'sequence',frames:'media/frames',fps:60,count:670}};
 for(const media of [{...c.media,count:100},{...c.media,masks:'media/masks',maskCount:669},{...c.media,frames:'../private'},{...c.media,frames:'https://example.com/frames'}])assert.throws(()=>validateConfig({...c,media}));
});
test('caption overlap, excess duration and oversized or unknown text fields fail',()=>{
 const c=fixture('presenter-reframe');
 for(const captions of [[{start:0,end:3,text:'too long'}],[{start:0,end:1.5,text:'one'},{start:1,end:2,text:'two'}]])assert.throws(()=>validateConfig({...c,captions}));
 assert.throws(()=>validateConfig({...c,text:{'项目汇报':'这个标题已经超出'}}));assert.throws(()=>validateConfig({...c,text:{arbitrary:'unsupported'}}));
 assert.throws(()=>validateConfig({...c,framing:{centerX:4000}}));
});
