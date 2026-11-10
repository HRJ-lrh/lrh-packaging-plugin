import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { verifyArchive, inspectEngine, skillRoot } from '../skills/lrh-packaging-plugin/scripts/runtime.mjs';
const cli=path.join(skillRoot,'scripts/runtime.mjs');
const run=(...args)=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8'});
test('CLI executes when reached through a filesystem alias', {skip:process.platform==='win32'},()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'lrh alias '));
 try{const alias=path.join(dir,'runtime.mjs');symlinkSync(cli,alias);const r=spawnSync(process.execPath,[alias,'--help'],{encoding:'utf8'});assert.equal(r.status,0);assert.match(r.stdout,/Usage:/);}finally{rmSync(dir,{recursive:true,force:true});}
});
test('missing engine cannot be called usable',()=>assert.throws(()=>inspectEngine(path.join(tmpdir(),'no-lrh-engine-123456')),/Incomplete/));
test('tampered archive is rejected',()=>assert.throws(()=>verifyArchive(Buffer.from('corrupt archive')),/checksum/));
test('existing target and its contents are never overwritten',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'lrh preserve '));
 try{writeFileSync(path.join(dir,'keep.txt'),'original');const r=run('fetch','--engine',dir);assert.notEqual(r.status,0);assert.match(r.stderr,/already exists/);assert.equal(readFileSync(path.join(dir,'keep.txt'),'utf8'),'original');}finally{rmSync(dir,{recursive:true,force:true});}
});
test('invalid archive leaves no engine or temporary extraction directory',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'lrh corrupt '));
 try{const archive=path.join(dir,'bad.tar.gz');writeFileSync(archive,'bad');const engine=path.join(dir,'engine');const r=run('fetch','--engine',engine,'--archive',archive);assert.notEqual(r.status,0);assert.match(r.stderr,/checksum/);assert.equal(existsSync(engine),false);assert.deepEqual(readdirSync(dir),['bad.tar.gz']);}finally{rmSync(dir,{recursive:true,force:true});}
});
test('missing path and unknown arguments fail before installation',()=>{
 assert.notEqual(run('setup').status,0);assert.notEqual(run('fetch','--engine','x','--unsafe','yes').status,0);assert.notEqual(run('check','--engine','x','--archive','z').status,0);
});
