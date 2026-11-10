#!/usr/bin/env python3
"""Recreate a runtime source archive from the public locked Git commit.
Run only when intentionally updating a release: output must be reviewed, hashed,
and coordinated with runtime.lock.json. Never packages working-tree files.
"""
import argparse, subprocess, tarfile, io, json, hashlib
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--output',required=True);a=p.parse_args()
root=Path(__file__).resolve().parents[1]
lock=json.loads((root/'skills/lrh-packaging-plugin/runtime.lock.json').read_text())
out=Path(a.output)
if out.exists():raise SystemExit('Output exists; select a new path.')
raw=subprocess.check_output(['git','archive','--format=tar',lock['commit']],cwd=a.source)
files=[]
with tarfile.open(fileobj=io.BytesIO(raw),mode='r:') as src,tarfile.open(out,'w:gz') as dst:
 for item in src:
  if item.name.startswith('docs/media/'):continue
  if not(item.isfile() or item.isdir()):raise SystemExit('Unsupported member: '+item.name)
  if item.isfile():
   data=src.extractfile(item).read();files.append({'path':item.name,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
   item.name='agent-motion/'+item.name;dst.addfile(item,io.BytesIO(data))
  else:item.name='agent-motion/'+item.name;dst.addfile(item)
 data=(json.dumps({'upstream':lock['upstream'],'commit':lock['commit'],'source':'git archive of public commit; no code changes','excluded':['docs/media (upstream demo footage excluded)'],'files':files},ensure_ascii=False,indent=2)+'\n').encode()
 item=tarfile.TarInfo('agent-motion/LRH-SOURCE.json');item.size=len(data);item.mode=0o644;dst.addfile(item,io.BytesIO(data))
print(json.dumps({'files':len(files),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()},indent=2))
print('gzip metadata may change the archive hash; update the release lock deliberately after review. Do not replace an existing release asset.')
